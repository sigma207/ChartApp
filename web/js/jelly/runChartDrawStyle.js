/**
 * Created by user on 2015/5/26.
 */
var DrawStyle = {
    TICK_COLOR: "#A9A9A9",
    TICK_LINE_WIDTH: 0.5,
    VOLUME_TEXT_COLOR: "#00FFF7",
    PRE_CLOSE_COLOR: "#FF1FC7",
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
            var valueAxis = this;
            //console.log("drawValueAxisData:%s",valueAxis.column);
            var periodAxis = valueAxis.period;
            var list = runChart.dataDriven.list;
            var data, i;
            ctx.save();
            if (valueAxis.column == "close") {
                var oldValue, newValue, x, y, oldX, oldY;
                for (i = periodAxis.dataStartIndex; i <= periodAxis.dataEndIndex; i++) {
                    data = list[i];
                    log(data.time);
                    newValue = data[valueAxis.column];
                    //log(newValue);
                    x = data.x;
                    y = data[valueAxis.column + "Y"];
                    if (i == 0) {
                    } else {
                        if (newValue > oldValue) {
                            ctx.strokeStyle = "red";
                        } else {
                            ctx.strokeStyle = "green";
                        }
                        ctx.beginPath();
                        ctx.moveTo(oldX, oldY);
                        ctx.lineTo(x, y);
                        ctx.stroke();
                    }
                    oldX = x;
                    oldY = y;
                    oldValue = newValue;
                }
                log("i=%s",i);
            } else if (valueAxis.column == "volume") {
                //ctx.strokeStyle = "blue";
                //ctx.fillStyle = "#3E92FF";
                //var startX, endX, quarterScale = periodAxis.scale / 4;
                //ctx.beginPath();
                //for (i = periodAxis.startIndex; i <= periodAxis.endIndex; i++) {
                //    data = list[i];
                //    startX = data.x - quarterScale;
                //    endX = data.x + quarterScale;
                //    ctx.moveTo(startX, valueAxis.y);
                //    ctx.lineTo(startX, data[valueAxis.column + "Y"]);
                //    ctx.lineTo(endX, data[valueAxis.column + "Y"]);
                //    ctx.lineTo(endX, valueAxis.y);
                //}
                //ctx.stroke();
                //ctx.fill();
            }
            ctx.restore();
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
            //ctx.textBaseline = "bottom";
            ctx.textAlign = "right";
            ctx.strokeStyle = DrawStyle.TICK_COLOR;
            ctx.lineWidth = DrawStyle.TICK_LINE_WIDTH;
            var valueFormat;
            if (axis.column == "close") {
                ctx.font = "14px Helvetica";
                valueFormat = JsonTool.numeralFormat(axis.getValueDecimal());
            } else if (axis.column == "volume") {
                ctx.font = "14px Helvetica";
                valueFormat = "0,0";
            }
            var x = axis.x - 5;
            var y = axis.y;
            var tick;
            var tickList = axis.ticks.tickList;
            var tickCount = tickList.length;
            for (var i = 0; i < tickCount; i++) {
                tick = tickList[i];
                ctx.fillStyle = tick.color;
                y = axis.y - axis.convertY(tick.value);
                ctx.fillText(numeral(tick.value).format(valueFormat), x, y);
                if (i > 0 && i < tickCount - 1) {
                    if(i==3){
                        ctx.strokeStyle = DrawStyle.PRE_CLOSE_COLOR;
                    }else{
                        ctx.strokeStyle = DrawStyle.TICK_COLOR;
                    }
                    ctx.drawHorizontalLine(axis.x, y, runChart.area.right);
                    //ctx.drawDashLine(axis.x, y, runChart.area.right, y, 2);
                }//在軸線上不用劃
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
                top = JsonTool.formatFloat(axis.source.preClose, 2);
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
                ticks.addTick(0, DrawStyle.VOLUME_TEXT_COLOR);
                ticks.addTick(axis.valueMax / 2, DrawStyle.VOLUME_TEXT_COLOR);
                ticks.addTick(axis.valueMax, DrawStyle.VOLUME_TEXT_COLOR);
            }
            return ticks;
        };
        return ds;
    }
};