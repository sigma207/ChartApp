/**
 * Created by user on 2015/5/26.
 */
var DrawStyle = {
    TICK_COLOR: "#A9A9A9",
    TICK_LINE_WIDTH: 0.5,
    createNew: function (runChart) {
        var ds = {};
        ds.drawBackground = function (ctx) {
            var chart = this;
            ctx.save();
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.lineWidth = DrawStyle.TICK_LINE_WIDTH;
            ctx.strokeStyle = DrawStyle.TICK_COLOR;
            ctx.rect(chart.area.x, chart.area.y - chart.area.height, chart.area.width, chart.area.height);
            ctx.stroke();
            ctx.restore();
        };

        ds.drawValueAxis = function (ctx) {
            var axis = this;
            ctx.save();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = DrawStyle.TICK_COLOR;
            if (axis.column == "close") {
                ctx.drawHorizontalLine(axis.x, axis.y, runChart.area.right);
            } else if (axis.column == "volume") {
                ctx.drawHorizontalLine(axis.x, axis.y - axis.height, runChart.area.right);
            }
            ctx.restore();
        };

        ds.drawValueAxisData = function (ctx) {

        };

        ds.drawPeriodAxisTicks = function (ctx) {
            var axis = this;
            ctx.save();
            ctx.fillStyle = DrawStyle.TICK_COLOR;
            ctx.strokeStyle = DrawStyle.TICK_COLOR;
            ctx.lineWidth = DrawStyle.TICK_LINE_WIDTH;
            ctx.textAlign = "center";
            var y = runChart.area.y + 10;
            var x;
            var valueAxis;
            var tickList = axis.timeTick.tickList;
            var valueAxisCount = axis.valueAxisList.length;
            for (var i = axis.tickStartIndex; i < axis.tickEndIndex; i += axis.timeTick.tickType) {
                x = axis.convertX(i);
                ctx.fillText(tickList[i].format("HH:mm"), x, y);
                for (var j = 0; j < valueAxisCount && i > 0; j++) {
                    valueAxis = axis.valueAxisList[j];
                    ctx.drawVerticalLine(x, valueAxis.y, valueAxis.top);
                }
            }
            ctx.fillText(axis.timeTick.endTime.format("HH:mm"), axis.convertX(i), y);

            ctx.restore();
        };

        ds.drawValueAxisTicks = function (ctx) {
            var axis = this;
            axis.ticks = ds.createValueAxisTicks(axis);
            ctx.save();
            ctx.textBaseline = "bottom";
            ctx.textAlign = "right";
            var valueFormat;
            if (axis.column == "close") {
                ctx.font = "10px Helvetica";
                valueFormat = "0,0.00";
            } else if (axis.column == "volume") {
                ctx.font = "8px Helvetica";
                valueFormat = "0,0";
            }
            var x = axis.x - 5;
            var y = axis.y;
            var tick;
            for (var i = 0; i < axis.ticks.tickList.length; i++) {
                tick = axis.ticks.tickList[i];
                ctx.fillStyle = tick.color;
                //log("value=%s,color=%s", tick.value, tick.color);
                y = axis.y - axis.convertY(tick.value);
                ctx.fillText(numeral(tick.value).format(valueFormat), x, y);
                if (i > 0)ctx.drawDashLine(axis.x, y, runChart.area.right, y, 2);//在軸線上不用劃
            }
            ctx.restore();
        };

        ds.createValueAxisTicks = function (axis) {
            var ticks;
            if (axis.column == "close") {
                ticks = axis.createTicks(6);
                var top = axis.valueMin;
                var i;
                for (i = 0; i < ticks.count / 2; i++) {
                    ticks.addTick(top, "green");
                    top = JsonTool.formatFloat(top + ticks.distance, 2);
                }
                top = axis.source.preClose;
                for (i = 0; i < ticks.count / 2; i++) {
                    if (i == 0) {
                        ticks.addTick(top, "white");
                    } else {
                        ticks.addTick(top, "red");
                    }
                    top = JsonTool.formatFloat(top + ticks.distance, 2);
                }
                ticks.addTick(axis.valueMax, "red");
            } else if (axis.column == "volume") {
                ticks = axis.createTicks(3);
                ticks.addTick(0, "blue");
                ticks.addTick(axis.valueMax / 2, "blue");
                ticks.addTick(axis.valueMax, "blue");
            }
            return ticks;
        };
        return ds;
    }
};