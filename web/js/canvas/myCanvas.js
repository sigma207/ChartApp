/**
 * Created by user on 2015/6/10.
 */

var CanvasLayer = {
    createNew: function (id, canvas) {
        var layer = {};
        layer.id = id;
        layer.canvas = canvas;
        layer.ctx = canvas.getContext("2d");
        layer.font = undefined;
        layer.clear = function () {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        };
        layer.assignFont = function (font) {
            layer.font = font;
            layer.updateFont();
        };
        layer.updateFont = function () {
            layer.ctx.font = layer.font;
        };
        return layer;
    }
};

var LayerManager = {
    list: [],
    timeId:undefined,
    add: function (cm) {
        LayerManager.list.push(cm);
        if (LayerManager.list.length == 1) {
            $(window).on("resize", LayerManager.onWindowResize);
        }
    },
    resizeCanvas: function () {
        for (var i = 0; i < LayerManager.list.length; i++) {
            var cm = LayerManager.list[i];
            var parent = $(cm.baseLayer.canvas).parent();
            for (var j = 0; j < cm.layerList.length; j++) {
                var c = $(cm.layerList[j].canvas);
                c.attr("width", parent.css("width"));
                c.attr("height", parent.css("height"));
                cm.layerList[j].updateFont();
            }
            if (typeof cm.resizeCall !== typeof undefined) {
                cm.resizeCall();
            }
        }
    },
    onWindowResize: function (e) {
        if(typeof LayerManager.timeId !== typeof undefined){
            clearTimeout(LayerManager.timeId);
        }
        LayerManager.timeId = setTimeout(LayerManager.resizeCanvas,500);
    },
    createNew: function () {
        var cm = {};
        cm.layerList = [];
        cm.baseLayer = undefined;
        cm.resizeCall = undefined;
        cm.addBaseLayer = function (canvas) {
            cm.baseLayer = CanvasLayer.createNew(canvas.id, canvas);
            var parent = $(cm.baseLayer.canvas).parent();
            var baseCanvas = $(cm.baseLayer.canvas);
            baseCanvas.css("position", "absolute");
            baseCanvas.attr("width", parent.css("width"));
            baseCanvas.attr("height", parent.css("height"));
            cm.layerList.push(cm.baseLayer);
        };
        cm.addLayer = function (id, opacity) {
            var canvas = document.createElement('canvas');
            var layer = CanvasLayer.createNew(id, canvas);
            var layerCanvas = $(layer.canvas);
            var baseLayer = $(cm.baseLayer.canvas);
            baseLayer.parent().append(layerCanvas);
            layerCanvas.attr("id", id);
            layerCanvas.attr("width", baseLayer.attr("width"));
            layerCanvas.attr("height", baseLayer.attr("height"));
            layerCanvas.css("position", "absolute");
            layerCanvas.css("opacity", opacity || "1");

            cm.layerList.push(layer);
            return layer;
        };

        cm.getLayer = function (index) {
            return cm.layerList[index];
        };
        cm.getLayerById = function (id) {
            for (var i = 0; i < cm.layerList.length; i++) {
                if (cm.layerList[i].id == id) {
                    return cm.layerList[i];
                }
            }
        };
        cm.clearAllLayer = function () {
            for (var i = 0; i < cm.layerList.length; i++) {
                cm.getLayer(i).clear();
            }
        };

        cm.clearLayer = function (index) {
            cm.getLayer(index).clear();
        };

        LayerManager.add(cm);
        return cm;
    }
};

var CanvasMouse = {
    createNew: function (canvas) {
        var mouse = {};
        mouse.x = undefined;
        mouse.y = undefined;
        mouse.lastX = undefined;
        mouse.lastY = undefined;
        mouse.onOverCall = undefined;
        mouse.onMoveCall = undefined;
        mouse.onDownCall = undefined;
        mouse.onOutCall = undefined;
        mouse.onUpCall = undefined;
        mouse.onWheelCall = undefined;
        mouse.registerMouseEvent = function () {
            var $canvas = $(canvas);
            $canvas.mouseover(mouse.onMouseOver);
            $canvas.mousemove(mouse.onMouseMove);
            $canvas.mousedown(mouse.onMouseDown);
            $canvas.mouseout(mouse.onMouseOut);
            $canvas.mouseup(mouse.onMouseUp);
            $canvas.mousewheel(mouse.onMouseWheel);
        };

        mouse.windowToCanvas = function (x, y) {
            var bbox = canvas.getBoundingClientRect();
            return {
                x: x - bbox.left,
                y: y - bbox.top
            };
        };

        mouse.onMouseOver = function (e) {
            e.preventDefault();
            if (typeof mouse.onOverCall !== typeof undefined) {
                mouse.onOverCall.call(mouse);
            }
        };

        mouse.onMouseMove = function (e) {
            e.preventDefault();
            var temp = mouse.windowToCanvas(e.clientX, e.clientY);
            mouse.x = temp.x;
            mouse.y = temp.y;
            if (typeof mouse.onMoveCall !== typeof undefined) {
                mouse.onMoveCall.call(mouse);
            }
            mouse.lastX = mouse.x;
            mouse.lastY = mouse.y;
        };

        mouse.onMouseDown = function (e) {
            e.preventDefault();
            if (typeof mouse.onDownCall !== typeof undefined) {
                mouse.onDownCall.call(mouse);
            }
        };

        mouse.onMouseOut = function (e) {
            if (typeof mouse.onOutCall !== typeof undefined) {
                mouse.onOutCall.call(mouse);
            }
        };

        mouse.onMouseUp = function (e) {
            if (typeof mouse.onUpCall !== typeof undefined) {
                mouse.onUpCall.call(mouse);
            }
        };

        mouse.onMouseWheel = function (e, delta) {
            e.preventDefault();
            if (delta > 1) {//有可能大於1或小於-1,要強迫修正
                delta = 1;
            } else if (delta < -1) {
                delta = -1;
            }
            if (typeof mouse.onWheelCall !== typeof undefined) {
                mouse.onWheelCall.call(mouse, delta);
            }
        };

        mouse.registerMouseEvent();
        return mouse;
    }
};

var ChartLine = {
    createNew: function (ctx, strokeStyle) {
        var cl = {};
        cl.lineList = [];

        cl.addLine = function (moveToX, moveToY, lineToX, lineToY) {
            cl.lineList.push({
                moveToX: moveToX,
                moveToY: moveToY,
                lineToX: lineToX,
                lineToY: lineToY
            });
        };

        cl.draw = function () {
            var count = cl.lineList.length;
            var line = undefined;
            ctx.strokeStyle = strokeStyle;
            ctx.beginPath();
            for (var i = 0; i < count; i++) {
                line = cl.lineList[i];
                //log("line.moveToX=%s, line.moveToX=%s",line.moveToX, line.moveToX);
                ctx.moveTo(line.moveToX, line.moveToY);
                ctx.lineTo(line.lineToX, line.lineToY);
            }
            ctx.stroke();
        };

        return cl;
    }
};

