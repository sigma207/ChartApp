/**
 * Created by user on 2015/6/26.
 */
var Chart = {
    createNew: function (canvasDom) {
        var chart = CanvasComponent.createNew();
        chart.canvas = canvasDom;
        chart.animationId = undefined;
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

        chart.layerManager.addBaseLayer(canvasDom);
        return chart;
    }
};


var CanvasComponent = {
    createNew: function () {
        var cc = {};
        cc.layerManager = undefined;
        cc.drawContextList = [];
        cc.addLayerDrawFunction = function (index, drawFunction) {
            if (typeof cc.drawContextList[index] === typeof undefined) {
                cc.drawContextList[index] = [];
            }
            cc.drawContextList[index].push(drawFunction);
        };
        cc.drawChartLayer = function (index) {
            var context = cc.layerManager.getLayer(index).ctx;
            var drawFunctionList = cc.drawContextList[index];
            if (typeof drawFunctionList !== typeof undefined) {
                for (var i = 0; i < drawFunctionList.length; i++) {
                    drawFunctionList[i].call(cc, context);
                }
            }
        };
        return cc;
    }
};

var ChartMouse = {
    createNew: function (mouseLayer) {
        var chartMouse = CanvasComponent.createNew();
        chartMouse.mouse = CanvasMouse.createNew(mouseLayer.canvas);
        return chartMouse;
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
    createNew: function (period, column, minColumn, maxColumn, decimalColumn, x, y, height) {
        var axis = AxisY.createNew(x, y, height);
        axis.layerManager = period.layerManager;
        axis.period = period;
        axis.column = column;
        axis.minColumn = minColumn;
        axis.maxColumn = maxColumn;
        axis.decimalColumn = decimalColumn;

        axis.calculate = function () {
            axis.source = axis.period.chart.dataDriven.source;
            axis.valueMin = axis.source[axis.minColumn];
            axis.valueMax = axis.source[axis.maxColumn];
            axis.valueDistance = axis.valueMax - axis.valueMin;
            axis.valueScale = axis.height / axis.valueDistance;
        };

        axis.convertY = function (value) {
            return Math.round((value - axis.valueMin) * axis.valueScale);
        };

        axis.createTicks = function (count) {
            return AxisTicks.createNew(axis, count);
        };

        axis.getValueDecimal = function () {
            return parseInt(axis.source[axis.decimalColumn]);
        };
        return axis;
    }
};
var TickType = {
    SECOND: 1,
    MINUTE: 60
};

var DataDriven = {
    createNew: function (chart) {
        var dataDriven = {};
        dataDriven.chart = chart;
        dataDriven.changeCallbackList = [];

        dataDriven.setSource = function (source, listName) {
            dataDriven.source = source;
            dataDriven.list = source[listName];
            dataDriven.calculate();
        };

        dataDriven.calculate = function () {
            dataDriven.count = dataDriven.list.length;
            dataDriven.dataStartIndex = 0;
            dataDriven.dataEndIndex = dataDriven.count - 1;
            dataDriven.chart.dataDrivenChange = true;
        };

        return dataDriven;
    }
};

var TimeTick = {
    createNew: function (periodAxis) {
        var tt = {};
        tt.changeCallbackList = [];

        tt.changeType = function (tickType) {
            tt.tickType = tickType;
        };

        tt.changeTime = function (startTime, endTime) {
            if (startTime != tt.startTime && endTime != tt.endTime) {
                periodAxis.chart.timePeriodChange = true;
            }
            tt.startTime = startTime;
            tt.endTime = endTime;
        };

        tt.calculate = function () {
            tt.timeSeconds = tt.endTime.diff(tt.startTime, "second");
            tt.count = tt.timeSeconds / tt.tickType;
            tt.tickStartIndex = 0;
            tt.tickEndIndex = tt.count - 1;
            tt.tickDisplayCount = tt.tickEndIndex - tt.tickStartIndex + 1;
            tt.tickList = [];
            tt.tickMap = {};
            var i;
            var time = moment(tt.startTime);
            logTime("timeTick");
            for (i = 0; i < tt.count; i++) {
                tt.tickList.push(time);
                tt.tickMap[time.format("YYYYMMDDHHmm")] = i;
                time = moment(time).add(1, "minute");
            }
            logTimeEnd("timeTick");
            log(tt.tickMap);
        };

        tt.getTimeTickIndex = function (time) {
            return tt.tickMap[time];
        };

        return tt;
    }
};

var PeriodAxis = {
    createNew: function (runChart, dataTimeFunction) {
        var axis = AxisX.createNew(runChart.area.x, runChart.area.y, runChart.area.width);
        axis.chart = runChart;
        axis.layerManager = runChart.layerManager;
        axis.dataTimeFunction = dataTimeFunction;
        axis.valueAxisList = [];
        axis.axisYList = [];
        axis.height = 0;
        axis.createTimeTick = function () {
            axis.timeTick = TimeTick.createNew(axis);
            return axis.timeTick;
        };

        axis.calculate = function () {
            axis.timeTick.calculate();
            axis.scale = runChart.area.width / (axis.timeTick.tickDisplayCount );
        };

        axis.createValueAxis = function (column, minColumn, maxColumn, decimalColumn, x, y, height) {
            var valueAxis = ValueAxis.createNew(axis, column, minColumn, maxColumn, decimalColumn, x, y, height);
            axis.valueAxisList.push(valueAxis);
            axis.addAxisY(valueAxis);
            return valueAxis;
        };

        axis.createAxisY = function (x, y, height) {
            var axisY = AxisY.createNew(x, y, height);
            axis.addAxisY(axisY);
            return axisY;
        };

        axis.addAxisY = function (axisY) {
            axis.height += axisY.height;
            axis.axisYList.push(axisY);
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
            var dataDriven = axis.chart.dataDriven;
            var list = dataDriven.list;
            var data;
            var valueAxis;
            var valueAxisCount = axis.valueAxisList.length;
            var y;
            var timeTick = axis.timeTick;
            var dataTime;
            for (var dataIndex = dataDriven.dataStartIndex; dataIndex <= dataDriven.dataEndIndex; dataIndex++) {
                data = list[dataIndex];
                dataTime = axis.dataTimeFunction.call(axis, data);
                data.x = axis.convertX(timeTick.getTimeTickIndex(dataTime));
                for (var v = 0; v < valueAxisCount; v++) {
                    valueAxis = axis.valueAxisList[v];
                    data[valueAxis.column + "Y"] = valueAxis.y - valueAxis.convertY(data[valueAxis.column]);
                }
            }
        };

        axis.changeDisplayRange = function (startIndex) {
            //axis.startIndex = startIndex;
            //axis.endIndex = axis.startIndex + axis.displayRange - 1;
            //axis.scale = axis.chart.area.width / (axis.displayRange + 1);
        };

        axis.addDisplayRange = function (addValue) {
            //var newRange = axis.displayRange + (addValue * 2);
            //var start, end;
            //if (newRange <= axis.chart.dataDriven.count) {
            //    if (newRange <= axis.displayRangeMin) {
            //        newRange = axis.displayRangeMin;//最小
            //    } else {
            //        //範圍內隨便你
            //    }
            //} else {
            //    newRange = axis.chart.dataDriven.count;//最大
            //}
            //console.log("newRange=" + newRange);
            //if (newRange != axis.displayRange) {
            //    if (addValue > 0) {//addValue=1
            //        start = axis.startIndex - addValue;//30->29
            //        end = axis.endIndex + addValue;//39->40
            //    } else {//addValue=-1
            //        start = axis.startIndex - addValue;//30->31
            //        end = axis.endIndex + addValue;//39->38
            //    }
            //}
            //
            //if (start >= 0 && end < axis.chart.dataDriven.count) {
            //    axis.displayRange = newRange;
            //    axis.changeDisplayRange(start);
            //    return start;
            //}
            //return -1;
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
        chart.renderBackground = false;
        chart.renderPeriodTick = false;
        chart.dataDrivenChange = false;
        chart.timePeriodChange = false;

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

        chart.start = function () {
            if (typeof chart.animationId !== typeof undefined) {
                chart.stop();
            }
            log("chart.start");
            chart.renderBackground = true;
            chart.renderPeriodTick = true;
            chart.animationId = requestAnimationFrame(chart.render);
        };

        chart.stop = function () {
            cancelAnimationFrame(chart.animationId);
        };

        chart.calculate = function () {
            var periodAxis = chart.periodAxis;
            var valueAxis, i;

            if(chart.timePeriodChange){
                periodAxis.calculate();
                chart.timePeriodChange = false;
            }
            for (i = 0; i < periodAxis.valueAxisList.length; i++) {
                valueAxis = periodAxis.valueAxisList[i];
                valueAxis.calculate();
            }
            chart.renderPeriodTick = true;
        };

        chart.render = function () {
            var periodAxis = chart.periodAxis;
            var valueAxis, i;
            if (chart.dataDrivenChange) {
                chart.calculate();
                chart.dataDrivenChange = false;
            }

            if (chart.renderBackground) {
                chart.layerManager.clearLayer(0);
                chart.drawChartLayer(0);//背景色,area框線,指數標題
                for (i = 0; i < periodAxis.valueAxisList.length; i++) {
                    valueAxis = periodAxis.valueAxisList[i];
                    valueAxis.drawChartLayer(0);
                }
                chart.renderBackground = false;
            }

            if (chart.renderPeriodTick) {
                logTime("renderPeriodTick");

                logTime("generateDataLoc");
                periodAxis.generateDataLoc();
                logTimeEnd("generateDataLoc");

                chart.layerManager.clearLayer(1);

                logTime(" periodAxis.drawChartLayer(1)");
                periodAxis.drawChartLayer(1);
                logTimeEnd(" periodAxis.drawChartLayer(1)");

                logTime("valueAxis.drawChartLayer(1)");
                for (i = 0; i < periodAxis.valueAxisList.length; i++) {
                    valueAxis = periodAxis.valueAxisList[i];
                    valueAxis.drawChartLayer(1);
                }
                logTimeEnd("valueAxis.drawChartLayer(1)");

                chart.renderPeriodTick = false;
                logTimeEnd("renderPeriodTick");
            }

            chart.animationId = requestAnimationFrame(chart.render);
        };

        chart.createPeriodAxis = function (column, dataTimeFunction) {
            chart.periodAxis = PeriodAxis.createNew(chart, dataTimeFunction);
            chart.periodAxis.column = column;
            return chart.periodAxis;
        };

        chart.setDataDriven = function (dataDriven) {
            chart.dataDriven = dataDriven;
        };

        return chart;
    }
};