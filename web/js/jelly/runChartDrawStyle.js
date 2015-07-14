/**
 * Created by user on 2015/5/26.
 */
var DrawStyle = {
    FONT_FAMILY: "Helvetica",
    TICK_COLOR: "#A9A9A9",
    TICK_LINE_WIDTH: 0.5,
    VOLUME_TEXT_COLOR: "#00FFF7",
    PRE_CLOSE_COLOR: "#FF1FC7",
    GUIDE_WIRE_COLOR: "gray",
    UP_DOWN_BLOCK_BACKGROUND_COLOR: "rgba(176,170,104,0.5)",
    RISE_COLOR: "#F20000",
    FALL_COLOR: "#00EB00",
    createNew: function (runChart) {
        var ds = {};

        ds.init = function () {
            var chartArea = runChart.area;
            ds.upDownBlockWidth = 50;
            ds.upDownRightX = chartArea.right;
            ds.upDownLeftX = chartArea.x;
            ds.upDownY = chartArea.top;
            ds.upDonwTextStartY = ds.upDownY + 5;
            ds.upDownLeftPadding = 5;
            ds.upDownBlockPerDataHeight = 20;
        };

        ds.drawBackground = function (ctx) {
            log("drawBackground");
            var chart = this;
            ctx.save();
            ctx.fillStyle = "#1c1c1c";
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            ctx.lineWidth = DrawStyle.TICK_LINE_WIDTH;
            ctx.strokeStyle = DrawStyle.TICK_COLOR;
            ctx.rect(chart.area.x, chart.area.y - chart.area.height, chart.area.width, chart.area.height);
            ctx.stroke();
            ctx.fillStyle = "white";
            ctx.textBaseline = "bottom";
            ctx.font = "18px " + DrawStyle.FONT_FAMILY;
            ctx.fillText(runChart.dataDriven.source.name, ctx.canvas.width / 2, chart.area.top - 5);
            ctx.restore();
        };

        ds.drawMouseLayerMove = function (ctx) {
            //mouseCtx
            var chartMouse = runChart.chartMouse;
            var periodAxis = runChart.periodAxis;
            var chartArea = runChart.area;
            //var data = runChart.dataDriven.list[chartMouse.index];
            //inAxisArea== true
            //index!=-1

            if (chartMouse.dragging) {
            } else {
                mouseGuideWires();
                upDownBlock();
            }

            function mouseGuideWires() {
                ctx.save();
                ctx.strokeStyle = DrawStyle.GUIDE_WIRE_COLOR;
                ctx.drawHorizontalLine(chartArea.x, runChart.chartMouse.mouse.y, chartArea.right);
                ctx.drawVerticalLine(runChart.chartMouse.mouse.x, chartArea.top, chartArea.y);
                ctx.restore();
            }

            function upDownBlock() {

                var showListLength = 0;
                if (typeof periodAxis.currentMouseHangList !== typeof undefined) {
                    showListLength = periodAxis.currentMouseHangList.length;
                } else if (typeof periodAxis.currentMouseData !== typeof undefined) {
                    showListLength = 4;
                }

                if (showListLength > 0) {
                    var source = runChart.dataDriven.source;
                    var valueFormat = JsonTool.numeralFormat(source.scale);
                    var formLeft = (chartMouse.mouse.x >= runChart.area.middle);

                    var dataY = ds.upDonwTextStartY;
                    var maxWidth = 0, i;
                    var text = "", data;
                    ctx.save();
                    ctx.font = "14px " + DrawStyle.FONT_FAMILY;
                    var blockHeight = 0;
                    var textList = [];
                    if (typeof periodAxis.currentMouseHangList !== typeof undefined) {

                        for (i = 0; i < showListLength; i++) {
                            data = runChart.periodAxis.currentMouseHangList[i];

                            text = numeral(data.last).format(valueFormat) + " - " + data.volume + " ";
                            maxWidth = ds.getMaxWidth(ctx, text, maxWidth);
                            textList.push({text: text, y: dataY});
                            dataY += ds.upDownBlockPerDataHeight;
                            blockHeight += ds.upDownBlockPerDataHeight;

                            text = data.time;
                            maxWidth = ds.getMaxWidth(ctx, text, maxWidth);
                            textList.push({text: text, y: dataY});
                            dataY += ds.upDownBlockPerDataHeight;

                            blockHeight += ds.upDownBlockPerDataHeight;

                            if(blockHeight+(ds.upDownBlockPerDataHeight*2)>runChart.area.height){
                                break;
                            }
                        }
                    } else if (typeof periodAxis.currentMouseData !== typeof undefined) {
                        data = periodAxis.currentMouseData;
                        text = numeral(data.high).format(valueFormat);
                        maxWidth = ds.getMaxWidth(ctx, text, maxWidth);
                        textList.push({text: text, y: dataY});
                        dataY += ds.upDownBlockPerDataHeight;

                        text = data.time;
                        maxWidth = ds.getMaxWidth(ctx, text, maxWidth);
                        textList.push({text: text, y: dataY});
                        dataY += ds.upDownBlockPerDataHeight;

                        text = numeral(data.low).format(valueFormat);
                        maxWidth = ds.getMaxWidth(ctx, text, maxWidth);
                        textList.push({text: text, y: dataY});
                        dataY += ds.upDownBlockPerDataHeight;

                        text = data.time;
                        maxWidth = ds.getMaxWidth(ctx, text, maxWidth);
                        textList.push({text: text, y: dataY});
                        dataY += ds.upDownBlockPerDataHeight;

                        blockHeight = ds.upDownBlockPerDataHeight*showListLength;
                    }

                    var x = (formLeft) ? ds.upDownLeftX : ds.upDownRightX - maxWidth;
                    ctx.fillStyle = DrawStyle.UP_DOWN_BLOCK_BACKGROUND_COLOR;

                    if (formLeft) {
                        ctx.fillRect(x-ds.upDownLeftPadding, ds.upDownY, maxWidth+ds.upDownLeftPadding, blockHeight);
                    } else {
                        ctx.fillRect(x-ds.upDownLeftPadding, ds.upDownY, maxWidth+ds.upDownLeftPadding, blockHeight);
                    }

                    ctx.textBaseline = "top";
                    ctx.fillStyle = "white";

                    for (i = 0; i < textList.length; i++) {
                        if(i%2==0){
                            ctx.font = "14px " + DrawStyle.FONT_FAMILY;
                        }else{
                            ctx.font = "12px " + DrawStyle.FONT_FAMILY;
                        }
                        ctx.fillText(textList[i].text, x, textList[i].y);
                    }

                    ctx.restore();
                }
            }
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
            var dataDriven = runChart.dataDriven;
            var list = dataDriven.list;
            var data, i;
            ctx.save();
            if (valueAxis.column == "close") {
                var riseLine = ChartLine.createNew(ctx,DrawStyle.RISE_COLOR);
                var fallLine = ChartLine.createNew(ctx,DrawStyle.FALL_COLOR);
                var oldValue, newValue, x, y, oldX, oldY;
                for (i = dataDriven.dataStartIndex; i <= dataDriven.dataEndIndex; i++) {
                    data = list[i];
                    newValue = data[valueAxis.column];
                    x = data.x;
                    y = data[valueAxis.column + "Y"];
                    if (i == 0) {
                    } else {
                        if (newValue > oldValue) {
                            riseLine.addLine(oldX,oldY,x,y);
                        } else {
                            fallLine.addLine(oldX,oldY,x,y);
                        }
                    }
                    oldX = x;
                    oldY = y;
                    oldValue = newValue;
                }
                riseLine.draw();
                fallLine.draw();
                //log("i=%s,time=%s,close=%s,volume=%s", i,data.time,data.close,data.volume);
            } else if (valueAxis.column == "volume") {
                //#5f8cb6   #1f5b97 #2a3a4a
                //ctx.strokeStyle = DrawStyle.VOLUME_TEXT_COLOR;
                //ctx.strokeStyle = "#1f5b97";
                //ctx.fillStyle = DrawStyle.VOLUME_TEXT_COLOR;
                ctx.fillStyle = "#5f8cb6";
                var borderFixWidth = periodAxis.scale / 3;
                var contentFixWidth = periodAxis.scale / 5;
                var startX, endX;
                ctx.beginPath();
                for (i = dataDriven.dataStartIndex; i <= dataDriven.dataEndIndex; i++) {
                    data = list[i];
                    startX = data.x - borderFixWidth;
                    endX = data.x + borderFixWidth;
                    ctx.moveTo(startX, valueAxis.y);
                    ctx.lineTo(startX, data[valueAxis.column + "Y"]);
                    ctx.lineTo(endX, data[valueAxis.column + "Y"]);
                    ctx.lineTo(endX, valueAxis.y);
                }
                //ctx.stroke();
                ctx.fill();

                ctx.fillStyle = "#1f5b97";
                ctx.beginPath();
                for (i = dataDriven.dataStartIndex; i <= dataDriven.dataEndIndex; i++) {
                    data = list[i];
                    startX = data.x - contentFixWidth;
                    endX = data.x + contentFixWidth;
                    ctx.moveTo(startX, valueAxis.y);
                    ctx.lineTo(startX, data[valueAxis.column + "Y"] + 1);
                    ctx.lineTo(endX, data[valueAxis.column + "Y"] + 1);
                    ctx.lineTo(endX, valueAxis.y);
                }
                ctx.fill();

                ctx.fillStyle = "#2a3a4a";
                ctx.beginPath();
                for (i = dataDriven.dataStartIndex; i <= dataDriven.dataEndIndex; i++) {
                    data = list[i];
                    startX = data.x + contentFixWidth;
                    endX = data.x + borderFixWidth;
                    ctx.moveTo(startX, valueAxis.y);
                    ctx.lineTo(startX, data[valueAxis.column + "Y"] + 1);
                    ctx.lineTo(endX, data[valueAxis.column + "Y"] + 1);
                    ctx.lineTo(endX, valueAxis.y);
                }
                ctx.fill();
            }
            ctx.restore();
        };

        ds.drawPeriodAxisTicks = function (ctx) {
            var axis = this;
            ctx.save();
            ctx.fillStyle = DrawStyle.TICK_COLOR;
            ctx.lineWidth = DrawStyle.TICK_LINE_WIDTH;
            ctx.textAlign = "center";
            var y = runChart.area.y + 10;
            var x;
            var valueAxis;
            var tickList = axis.timeTick.tickList;
            var valueAxisCount = axis.valueAxisList.length;
            var tickLine = ChartLine.createNew(ctx,DrawStyle.TICK_COLOR);
            for (var i = axis.timeTick.tickStartIndex; i < axis.timeTick.tickEndIndex; i += axis.timeTick.tickType) {
                x = axis.convertX(i);
                ctx.fillText(tickList[i].format("HH:mm"), x, y);
                for (var j = 0; j < valueAxisCount && i > 0; j++) {
                    valueAxis = axis.valueAxisList[j];
                    tickLine.addLine(x,valueAxis.y,x,valueAxis.top);
                }
            }
            tickLine.draw();
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
                    if (i == 3) {
                        ctx.strokeStyle = DrawStyle.PRE_CLOSE_COLOR;
                    } else {
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
            var decimal = axis.getValueDecimal();
            if (axis.column == "close") {
                ticks = axis.createTicks(6);
                var top = axis.valueMin;
                var i;
                for (i = 0; i < ticks.count / 2; i++) {
                    ticks.addTick(top, "green");
                    top = JsonTool.formatFloat(top + ticks.distance, decimal);
                }
                top = JsonTool.formatFloat(axis.source.preClose, decimal);
                for (i = 0; i < ticks.count / 2; i++) {
                    if (i == 0) {
                        ticks.addTick(top, "white");
                    } else {
                        ticks.addTick(top, "red");
                    }
                    top = JsonTool.formatFloat(top + ticks.distance, decimal);
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

        ds.getMaxWidth = function (ctx, text, maxWidth) {
            return Math.max(maxWidth, ctx.measureText(text).width);
        };

        ds.init();
        return ds;
    }
};