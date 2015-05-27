/**
 * Created by user on 2015/4/25.
 */
var Chart = {
    createNew: function (canvasDom) {
        var chart = {};
        chart.canvas = canvasDom;
        //chart.ctx = chart.canvas.getContext("2d");//不需要知道ctx的存在
        chart.PADDING_BOTTOM = 0;
        chart.PADDING_TOP = 0;
        chart.PADDING_LEFT = 0;
        chart.PADDING_RIGHT = 0;
        chart.layerManager = LayerManager.createNew();
        chart.padding = function () {
            if (arguments.length == 1) {
                var padding = arguments[0];
                chart.PADDING = padding;
                chart.PADDING_LEFT = padding;
                chart.PADDING_BOTTOM = padding;
                chart.PADDING_RIGHT = padding;
                chart.PADDING_TOP = padding;
            } else if (arguments.length == 4) {
                chart.PADDING_LEFT = arguments[0];
                chart.PADDING_BOTTOM = arguments[1];
                chart.PADDING_RIGHT = arguments[2];
                chart.PADDING_TOP = arguments[3];
            }
        };

        chart.windowToCanvas = function (x, y) {
            var bbox = canvas.getBoundingClientRect();
            return {
                x: x - bbox.left,
                y: y - bbox.top
            };
        };

        chart.layerManager.addBaseLayer(canvasDom);
        return chart;
    }
};

var DataDriven = {
    createNew: function (chart, source, listName) {
        var dataDriven = {};
        dataDriven.chart = chart;
        dataDriven.listName = listName;
        dataDriven.reset = function (newData) {
            dataDriven.source = newData;
            dataDriven.list = source[listName];
            dataDriven.count = dataDriven.list.length;
        };
        dataDriven.reset(source);
        return dataDriven;
    }
};

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
            cm.baseLayer = CanvasLayer.createNew("baseLayer", canvas);
            $(cm.baseLayer.canvas).css("position", "absolute");
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
        cm.clearLayer = function (index) {
            cm.getLayer(index).clear();
        };

        return cm;
    }
};

var CanvasComponent = {
    createNew: function () {
        var cc = {};
        cc.drawContextList = [];
        cc.addLayerDrawFunction = function (index, drawFunction) {
            if (typeof cc.drawContextList[index] === typeof undefined) {
                cc.drawContextList[index] = [];
            }
            cc.drawContextList[index].push(drawFunction);
        };
        cc.drawChartLayer = function (chart, index) {
            var context = chart.layerManager.getLayer(index).ctx;
            var drawFunctionList = cc.drawContextList[index];
            for (var i = 0; i < drawFunctionList.length; i++) {
                drawFunctionList[i].call(cc, context);
            }
        };
        return cc;
    }
};

var ChartMouse = {
    createNew: function (chart, mouseLayer) {
        var mouse = CanvasComponent.createNew();
        mouse.layer = mouseLayer;
        mouse.x = undefined;
        mouse.y = undefined;
        mouse.lastX = undefined;
        mouse.lastY = undefined;
        mouse.dragging = false;
        mouse.onMoveCall = undefined;
        mouse.onDownCall = undefined;
        mouse.onOutCall = undefined;
        mouse.onUpCall = undefined;
        mouse.onWheelCall = undefined;
        mouse.registerMouseEvent = function () {
            var canvas = $(mouse.layer.canvas);
            canvas.mousemove(mouse.onMouseMove);
            canvas.mousedown(mouse.onMouseDown);
            canvas.mouseout(mouse.onMouseOut);
            canvas.mouseup(mouse.onMouseUp);
            canvas.mousewheel(mouse.onMouseWheel);
        };

        mouse.onMouseMove = function (e) {
            e.preventDefault();
            var temp = chart.windowToCanvas(e.clientX, e.clientY);
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

var Axis = {
    createNew: function (x, y, length) {
        var axis = CanvasComponent.createNew();
        axis.x = x;
        axis.y = y;
        axis.length = length;
        axis.column = undefined;
        return axis;
    }
};

var AxisX = {
    createNew: function (x, y, width) {
        return Axis.createNew(x, y, width);
    }
};

//value volume
var AxisY = {
    createNew: function (x, y, height) {
        var axis = Axis.createNew(x, y, height);
        axis.height = height;
        axis.top = axis.y - axis.height;
        return axis;
    }
};

var ValueAxis = {
    createNew: function (period, column, minColumn, maxColumn, x, y, height) {
        var axis = AxisY.createNew(x, y, height);
        axis.period = period;
        axis.column = column;
        axis.minColumn = minColumn;
        axis.maxColumn = maxColumn;

        axis.onDataDriven = function () {
            axis.source = axis.period.chart.dataDriven.source;
            axis.valueMin = JsonTool.formatFloat(axis.source[axis.minColumn], 2);
            axis.valueMax = JsonTool.formatFloat(axis.source[axis.maxColumn], 2);
            axis.valueDistance = JsonTool.formatFloat(axis.valueMax - axis.valueMin, 2);
            axis.valueScale = axis.height / axis.valueDistance;
        };

        axis.convertY = function (value) {
            return Math.round((value - axis.valueMin) * axis.valueScale);
        };

        axis.createTicks = function (count) {
            return AxisTicks.createNew(axis, count);
        };
        return axis;
    }
};

var PeriodAxis = {
    createNew: function (runChart, displayRange, displayRangeMin) {
        var axis = AxisX.createNew(runChart.area.x, runChart.area.y, runChart.area.width);
        axis.chart = runChart;
        axis.valueAxisList = [];
        axis.displayRange = displayRange;
        axis.displayRangeMin = displayRangeMin;

        axis.onDataDriven = function () {
            axis.startIndex = runChart.dataDriven.count - axis.displayRange;
            axis.endIndex = axis.startIndex + axis.displayRange - 1;
            axis.scale = runChart.area.width / (axis.displayRange + 1);
        };

        axis.createValueAxis = function (column, minColumn, maxColumn, x, y, height) {
            var valueAxis = ValueAxis.createNew(axis, column, minColumn, maxColumn, x, y, height);
            axis.valueAxisList.push(valueAxis);
            return valueAxis;
        };

        axis.convertX = function (index) {
            return Math.round(axis.chart.area.x + axis.scale + (index * axis.scale));
        };

        axis.convertIndex = function (x) {
            if (x < axis.chart.area.x + axis.scale) {
                return -1;
            } else {
                return Math.round((x - (axis.chart.area.x + axis.scale)) / axis.scale);
            }
        };

        /**
         * 生成時間軸內資料的x,y
         */
        axis.generateDataLoc = function () {
            var list = axis.chart.dataDriven.list;
            var data;
            var valueAxis;
            var valueAxisCount = axis.valueAxisList.length;
            for (var i = 0, timeIndex = axis.startIndex; i < axis.displayRange; i++, timeIndex++) {
                data = list[timeIndex];
                data.x = axis.convertX(i);
                for (var v = 0; v < valueAxisCount; v++) {
                    valueAxis = axis.valueAxisList[v];
                    data[valueAxis.column + "Y"] = valueAxis.y - valueAxis.convertY(data[valueAxis.column]);
                }
            }
        };

        axis.changeDisplayRange = function (startIndex) {
            axis.startIndex = startIndex;
            axis.endIndex = axis.startIndex + axis.displayRange - 1;
            axis.scale = axis.chart.area.width / (axis.displayRange + 1);
        };

        axis.addDisplayRange = function (addValue) {
            var newRange = axis.displayRange + (addValue * 2);
            var start, end;
            if (newRange <= axis.chart.dataDriven.count) {
                if (newRange <= axis.displayRangeMin) {
                    newRange = axis.displayRangeMin;//最小
                } else {
                    //範圍內隨便你
                }
            } else {
                newRange = axis.chart.dataDriven.count;//最大
            }
            console.log("newRange=" + newRange);
            if (newRange != axis.displayRange) {
                if (addValue > 0) {//addValue=1
                    start = axis.startIndex - addValue;//30->29
                    end = axis.endIndex + addValue;//39->40
                } else {//addValue=-1
                    start = axis.startIndex - addValue;//30->31
                    end = axis.endIndex + addValue;//39->38
                }
            }

            if (start >= 0 && end < axis.chart.dataDriven.count) {
                axis.displayRange = newRange;
                axis.changeDisplayRange(start);
                return start;
            }
            return -1;
        };
        return axis;
    }
};

var AxisTicks = {
    createNew: function (axis, count) {
        var axisTick = {};
        axisTick.axis = axis;
        axisTick.count = count;
        axisTick.distance = axis.valueDistance / axisTick.count;
        axisTick.tickList = [];
        axisTick.addTick = function (value, color) {
            var tick = {};
            tick.value = value;
            tick.color = color || "black";
            axisTick.tickList.push(tick);
        };
        return axisTick;
    }
};

var RunChart = {
    createNew: function (canvasDom) {
        var chart = Chart.createNew(canvasDom);
        chart.area = {};

        chart.layerManager.addLayer("valueLayer");
        chart.layerManager.addLayer("mouseLayer");

        chart.init = function () {
            chart.setArea();
        };
        chart.setArea = function () {
            chart.area.x = chart.PADDING_LEFT;
            chart.area.y = chart.canvas.height - chart.PADDING_BOTTOM;
            chart.area.right = chart.canvas.width - chart.PADDING_RIGHT;
            chart.area.width = chart.area.right - chart.area.x;
            chart.area.top = chart.PADDING_TOP;
            chart.area.height = chart.area.y - chart.area.top;
        };

        chart.setDataDriven = function (dataDriven) {
            chart.dataDriven = dataDriven;
            var periodAxis = chart.periodAxis;
            periodAxis.onDataDriven();
            var valueAxis;
            for (var i = 0; i < periodAxis.valueAxisList.length; i++) {
                valueAxis = periodAxis.valueAxisList[i];
                valueAxis.onDataDriven();
            }
        };

        chart.createPeriodAxis = function (column, displayRange, displayRangeMin) {
            chart.periodAxis = PeriodAxis.createNew(chart, displayRange, displayRangeMin);
            chart.periodAxis.column = column;
            return chart.periodAxis;
        };

        chart.draw = function () {
            //chart.periodAxis.generateDataLoc();
            chart.drawAxis();
            chart.drawPeriod();
        };

        chart.drawAxis = function () {
            chart.layerManager.clearLayer(0);
            var periodAxis = chart.periodAxis;
            var valueAxis;
            for (var i = 0; i < periodAxis.valueAxisList.length; i++) {
                valueAxis = periodAxis.valueAxisList[i];
                valueAxis.drawChartLayer(chart, 0);
            }
        };

        chart.drawPeriod = function () {
            var periodAxis = chart.periodAxis;
            periodAxis.generateDataLoc();
            chart.layerManager.clearLayer(1);
            periodAxis.drawChartLayer(chart, 1);
            var valueAxis;
            for (var i = 0; i < periodAxis.valueAxisList.length; i++) {
                valueAxis = periodAxis.valueAxisList[i];
                valueAxis.drawChartLayer(chart, 1);
            }
        };

        chart.changePeriodRange = function (startIndex) {
            chart.periodAxis.changeDisplayRange(startIndex);
            chart.drawPeriod();
        };

        chart.createMouse = function (mouseLayer) {
            chart.mouse = ChartMouse.createNew(chart, mouseLayer);
            chart.mouse.onMoveCall = chart.mouseMove;
            chart.mouse.onDownCall = chart.mouseDown;
            chart.mouse.onOutCall = chart.mouseOut;
            chart.mouse.onUpCall = chart.mouseUp;
            chart.mouse.onWheelCall = chart.mouseWheel;
            return chart.mouse;
        };

        chart.mouseMove = function () {
            var periodAxis = chart.periodAxis;
            chart.mouse.index = periodAxis.convertIndex(chart.mouse.x);
            chart.mouse.inChartArea = (chart.mouse.x >= chart.area.x + periodAxis.scale && chart.mouse.x <= chart.area.right - periodAxis.scale);

            chart.layerManager.clearLayer(2);
            chart.mouse.drawChartLayer(chart, 2);
        };

        chart.mouseDown = function () {
            if (chart.mouse.inChartArea) {
                chart.mouse.dragging = true;
            }
        };

        chart.mouseOut = function () {
            chart.mouse.dragging = false;
        };

        chart.mouseUp = function () {
            chart.mouse.dragging = false;
            if(chart.mouse.inChartArea){
                chart.mouseMove();
            }
        };

        chart.mouseWheel = function (delta) {
            var periodAxis = chart.periodAxis;
            var start = periodAxis.addDisplayRange(delta);
            if (start != -1) {
                chart.layerManager.clearLayer(2);
                chart.drawPeriod();
                chart.mouseMove();
            }
        };

        return chart;
    }
};