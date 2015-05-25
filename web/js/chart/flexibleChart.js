/**
 * Created by user on 2015/4/25.
 */
var Chart = {
    createNew: function (canvasDom) {
        var chart = {};
        chart.canvas = canvasDom;
        //chart.ctx = chart.canvas.getContext("2d");//不需要知道ctx的存在
        chart.baseLayer = chart.canvas;
        chart.layers = [];
        chart.layerIndex = 0;
        chart.PADDING_BOTTOM = 0;
        chart.PADDING_TOP = 0;
        chart.PADDING_LEFT = 0;
        chart.PADDING_RIGHT = 0;
        chart.drawStyle = undefined;
        chart.mouse = {};
        chart.mouseLast = {};
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

        chart.setDrawStyle = function (drawStyle) {
            chart.drawStyle = drawStyle;
        };

        chart.setDataSource = function (source, listName) {
            chart.dataDriven = DataDriven.createNew(chart, source, listName);
            return chart.dataDriven;
        };

        chart.initLayer = function () {
            $(chart.baseLayer).css("position", "absolute");
            chart.layers.push(chart.baseLayer);
            chart.layerIndex = 0;
        };

        chart.addLayer = function (id) {
            var canvas = document.createElement('canvas');
            chart.layers.push(canvas);
            var baseLayer = $(chart.baseLayer);
            var newLayer = $(canvas);
            //newLayer.css("backgroundColor","transparent");
            //$(chart.baseLayer).parent().prepend(newLayer);
            $(chart.baseLayer).parent().append(newLayer);
            //baseLayer.css("position", "relative");
            newLayer.attr("id", id);
            newLayer.attr("width", baseLayer.attr("width"));
            newLayer.attr("height", baseLayer.attr("height"));
            newLayer.css("position", "absolute");
            newLayer.css("opacity", "1");
            return canvas;
        };

        chart.addMouseLayer = function (id) {
            var canvas = $(chart.addLayer(id));
            canvas.mousemove(chart.onMouseMove);
            canvas.mousedown(chart.onMouseDown);
            canvas.mouseout(chart.onMouseOut);
            canvas.mouseup(chart.onMouseUp);
            canvas.mousewheel(chart.onMouseWheel);
            return canvas.eq(0);
        };

        chart.getLayer = function (index) {
            return chart.layers[index];
        };

        chart.clearLayer = function (ctx) {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        };

        chart.onMouseMove = function (e) {
            e.preventDefault();
            var temp = chart.windowToCanvas(e.clientX, e.clientY);
            chart.mouse.x = temp.x;
            chart.mouse.y = temp.y;

            //if(typeof chart.layerMouseMouse !== typeof undefined){
            chart.mouseLayerMove();
            chart.mouseLast.x = chart.mouse.x;
            chart.mouseLast.y = chart.mouse.y;
            //}
        };

        chart.onMouseDown = function (e) {
            e.preventDefault();
            chart.mouseLayerDown();
        };

        chart.onMouseOut = function (e) {
            chart.mouseLayerOut();
        };

        chart.onMouseUp = function (e) {
            chart.mouseLayerUp();
        };

        chart.onMouseWheel = function (e, delta) {
            e.preventDefault();
            if (delta > 1) {//有可能大於1或小於-1,要強迫修正
                delta = 1;
            } else if (delta < -1) {
                delta = -1;
            }
            chart.mouseLayerWheel(delta);
        };

        chart.mouseLayerMove = function () {
            console.log("Chart:mouseLayerMove");
        };

        chart.mouseLayerDown = function () {

        };

        chart.mouseLayerUp = function () {

        };

        chart.mouseLayerOut = function () {

        };

        chart.mouseLayerWheel = function (delta) {

        };


        chart.windowToCanvas = function (x, y) {
            var bbox = canvas.getBoundingClientRect();
            return {
                x: x - bbox.left,
                y: y - bbox.top
            };
        };

        chart.initLayer();
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

var Axis = {
    createNew: function (x, y, length) {
        var axis = {};
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
        axis.source = axis.period.chart.dataDriven.source;
        axis.column = column;
        axis.minColumn = minColumn;
        axis.maxColumn = maxColumn;

        axis.valueMin = JsonTool.formatFloat(axis.source[axis.minColumn], 2);
        axis.valueMax = JsonTool.formatFloat(axis.source[axis.maxColumn], 2);
        axis.valueDistance = JsonTool.formatFloat(axis.valueMax - axis.valueMin, 2);
        axis.valueScale = axis.height / axis.valueDistance;
        axis.drawValueAxis = period.chart.drawStyle.drawValueAxis;
        axis.drawValueAxisTicks = period.chart.drawStyle.drawValueAxisTicks;
        axis.drawValueAxisData = period.chart.drawStyle.drawValueAxisData;

        axis.convertY = function (value) {
            return Math.round((value - axis.valueMin) * axis.valueScale);
        };

        axis.createTicks = function (count) {
            return AxisTicks.createNew(axis, count);
        };
        axis.ticks = period.chart.drawStyle.createValueAxisTicks(axis);
        //period.chart.drawStyle.createValueAxisTicks(axis);
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
        axis.startIndex = runChart.dataDriven.count - axis.displayRange;
        axis.endIndex = axis.startIndex + axis.displayRange - 1;
        axis.scale = runChart.area.width / (axis.displayRange + 1);
        axis.drawPeriodAxisTicks = axis.chart.drawStyle.drawPeriodAxisTicks;
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
            console.log("newRange="+newRange);
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
        //var valueCanvas = chart.addLayer("valueLayer");
        chart.valueCanvas = chart.addLayer("valueLayer");
        chart.mouseCanvas = chart.addMouseLayer("mouseLayer");

        //var chartArea = chart.area;
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

        chart.createPeriodAxis = function (column, displayRange, displayRangeMin) {
            chart.periodAxis = PeriodAxis.createNew(chart, displayRange, displayRangeMin);
            chart.periodAxis.column = column;
            return chart.periodAxis;
        };

        chart.draw = function (initFunction) {
            if (typeof initFunction == "function") {
                initFunction.call(this);//this = chart
            }
            //chart.periodAxis.generateDataLoc();
            chart.drawAxis();
            chart.drawPeriod();
        };

        chart.drawPeriod = function () {
            var periodAxis = chart.periodAxis;
            periodAxis.generateDataLoc();
            chart.clearLayer(chart.valueCanvas.getContext("2d"));
            periodAxis.drawPeriodAxisTicks.call(chart, periodAxis);
            var valueAxis;
            for (var i = 0; i < periodAxis.valueAxisList.length; i++) {
                valueAxis = periodAxis.valueAxisList[i];
                valueAxis.drawValueAxisData.call(chart, valueAxis);
            }
        };

        chart.drawAxis = function () {
            var periodAxis = chart.periodAxis;
            //periodAxis.drawPeriodAxisTicks.call(chart, periodAxis);
            var valueAxis;
            for (var i = 0; i < periodAxis.valueAxisList.length; i++) {
                valueAxis = periodAxis.valueAxisList[i];
                valueAxis.drawValueAxis.call(chart, valueAxis);
                valueAxis.drawValueAxisTicks.call(chart, valueAxis);
                //valueAxis.drawValueAxisData.call(chart, valueAxis);
            }
        };

        chart.changePeriodRange = function (startIndex) {
            chart.periodAxis.changeDisplayRange(startIndex);
            chart.drawPeriod();
        };

        //var superLayerMouseMove = chart.layerMouseMove;
        chart.mouseLayerMove = function () {
            //console.log("RunChart:mouseLayerMove");
            var periodAxis = chart.periodAxis;
            chart.mouse.index = periodAxis.convertIndex(chart.mouse.x);
            chart.mouse.inChartArea = (chart.mouse.x >= chart.area.x + periodAxis.scale && chart.mouse.x <= chart.area.right - periodAxis.scale);

            chart.drawStyle.drawMouseLayerMove.call(chart);
            chart.mouseLast.index = chart.mouse.index;
            //superLayerMouseMove.call(chart);
        };

        chart.mouseLayerDown = function () {
            if (chart.mouse.inChartArea) {
                chart.mouse.dragging = true;
            }
        };

        chart.mouseLayerUp = function () {
            chart.mouse.dragging = false;
        };

        chart.mouseLayerOut = function () {
            chart.mouse.dragging = false;
        };

        chart.mouseLayerWheel = function (delta) {
            var periodAxis = chart.periodAxis;
            var start = periodAxis.addDisplayRange(delta);
            if(start!=-1){
                chart.drawPeriod();
            }
        };

        return chart;
    }
};