/**
 * Created by user on 2015/6/10.
 */

var CanvasLayer = {
    createNew: function (id, canvas) {
        var layer = {};
        layer.id = id;
        layer.canvas = canvas;
        layer.ctx = canvas.getContext("2d");
        layer.clear = function () {
            layer.ctx.clearRect(0, 0, layer.canvas.width, layer.canvas.height);
        };
        return layer;
    }
};

var LayerManager = {
    createNew: function () {
        var cm = {};
        cm.layerList = [];
        cm.baseLayer = undefined;
        cm.addBaseLayer = function (canvas) {
            cm.baseLayer = CanvasLayer.createNew(canvas.id, canvas);
            var parent = $(cm.baseLayer.canvas).parent();
            $(cm.baseLayer.canvas).css("position", "absolute");
            $(cm.baseLayer.canvas).attr("width", parent.css("width"));
            $(cm.baseLayer.canvas).attr("height", parent.css("height"));
            cm.layerList.push(cm.baseLayer);
        };
        cm.addLayer = function (id) {
            var canvas = document.createElement('canvas');
            var layer = CanvasLayer.createNew(id, canvas);
            var layerCanvas = $(layer.canvas);
            var baseLayer = $(cm.baseLayer.canvas);
            baseLayer.parent().append(layerCanvas);
            layerCanvas.attr("id", id);
            layerCanvas.attr("width", baseLayer.attr("width"));
            layerCanvas.attr("height", baseLayer.attr("height"));
            layerCanvas.css("position", "absolute");
            layerCanvas.css("opacity", "1");

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

        return cm;
    }
};