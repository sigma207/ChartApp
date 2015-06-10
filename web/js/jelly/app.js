/**
 * Created by user on 2015/5/21.
 */
var Client = {
    createNew: function () {
        var client = {};
        client.futureGoodsMap = {};
        client.quoteWsm = WebSocketManager.createNew(config.quoteWsUrl, "board");
        client.kChartWsm = WebSocketManager.createNew(config.kChartWsUrl, "kChart");
        client.columnMap = {};
        client.canvasTable = undefined;
        client.futureDataManager = undefined;
        client.futureTable = undefined;
        client.futureDataTotal = 0;
        client.futureDataLoaded = 0;
        client.futureDataList = [];
        client.runChartIndex = -1;

        client.init = function () {
            var i;
            var count = config.futureColumnList.length;
            var futureColumn = undefined;
            for (i = 0; i < count; i++) {
                futureColumn = config.futureColumnList[i];
                client.columnMap["key" + futureColumn.key] = futureColumn;
            }
            //log(client.columnMap);
            var bg = undefined;
            client.futureDataTotal = 0;
            for (i = 0; i < config.futureList.length; i++) {
                bg = new FutureGoods(config.futureList[i], client.futureDataTotal);
                bg.futureTelegram.setWebSocketManager( client.quoteWsm);
                bg.futureRegisterTelegram.setWebSocketManager( client.quoteWsm);
                bg.futureUnRegisterTelegram.setWebSocketManager( client.quoteWsm);
                bg.kChartTelegram.setWebSocketManager(client.kChartWsm);
                bg.futureTelegram.setRequest(config.getBoardRequest(bg.code, bg.boardMid));
                bg.futureRegisterTelegram.setRequest(config.getBoardRegisterRequest(bg.code, bg.boardMid));
                bg.futureUnRegisterTelegram.setRequest(config.getBoardUnRegisterRequest(bg.code, bg.boardMid));
                //bg.boardUnRegisterRequestData = config.getBoardUnRegisterRequest(bg.code, bg.boardMid);
                client.futureGoodsMap[bg.code] = bg;
                client.futureDataTotal++;
            }

            client.runChartManager = runChartManager.createNew();

            client.futureTable = ReportTable.createNew("futureTable");
            client.futureTable.addTdClassRenderer("upDown", client.getFutureUpDownClass);
            client.futureDataManager = ReportDataManager.createNew(false);
            client.futureDataManager.addTable(client.futureTable);

            //client.initCanvasTable();

            $(document).on("rowClick", client.onBoardRowClick);
            $(window).on("beforeunload", function () {
                client.stop();
            });
        };

        client.initCanvasTable = function () {
            client.canvasTable = CanvasTable.createNew(document.getElementById("tableCanvas"));
            client.canvasTable.addColumn(CanvasColumn.createNew("code","代號",{textFillStyle:FutureTableDrawStyle.CODE_COLOR}));
            client.canvasTable.addColumn(CanvasColumn.createNew("name","商品",{textFillStyle:FutureTableDrawStyle.DEFAULT_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("bid","委買價",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("ask","委賣價",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("last","成交價",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("volume","單量",{textFillStyle:FutureTableDrawStyle.VOLUME_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("totalVolume","成交量",{textFillStyle:FutureTableDrawStyle.VOLUME_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("upDown","漲跌",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("upDownPercentage","漲跌幅",{decimal:2}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("high","最高價",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("low","最低價",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("open","開盤價",{decimal:"scale"}));
            client.canvasTable.addColumn(CanvasDateColumn.createNew("tradeDate","交易日",{textFillStyle:FutureTableDrawStyle.DEFAULT_COLOR}));
            client.canvasTable.addColumn(CanvasTimeColumn.createNew("tickTime","更新時間",{textFillStyle:FutureTableDrawStyle.DEFAULT_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("preClose","昨結價",{decimal:"scale"}));
            var tableDrawStyle = FutureTableDrawStyle.createNew(client.canvasTable);
            client.canvasTable.renderHeadRowBackground = tableDrawStyle.headBackground;
            client.canvasTable.renderBodyRowBackground = tableDrawStyle.bodyRowBackground;
            client.canvasTable.setColumnHeadContentRender(tableDrawStyle.headContent);
            client.canvasTable.setColumnCellContentRender(tableDrawStyle.cellContent);
        };

        client.connect = function () {
            client.quoteWsm.onState(client.onFutureState);
            client.quoteWsm.onData(client.onFutureData);
            client.kChartWsm.onState(client.onKChartState);
            client.kChartWsm.onData(client.onKChartData);

            client.kChartWsm.connect();
            client.quoteWsm.connect();
        };

        client.stop = function () {
            var bg = undefined;
            for (var code in client.futureGoodsMap) {
                bg = client.futureGoodsMap[code];
                bg.futureUnRegisterTelegram.sendRequest();
                //client.quoteWsm.send(bg.futureUnRegisterTelegram.requestText);
            }
            client.quoteWsm.close();
            client.kChartWsm.close();
        };

        client.onFutureState = function (evt, readyState) {
            log("board state=%s", readyState);
            if (readyState == 1) {
                client.requestFuture();
            }
        };

        client.onKChartState = function (evt, readyState) {
            log("kChart state=%s", readyState);
        };

        client.onFutureData = function (evt, data) {
            //log("onBoardData");
            var temp = JSON.parse(data);
            var obj, bg, code;
            if (temp.tp == "p") {//push
                obj = config.boardDataFormat(client.columnMap, JSON.parse(temp.c).data);
                bg = client.futureGoodsMap[obj.code];//with out mid
                bg.boardPushData = data;
                //log(obj);
                if (client.runChartIndex == bg.index) {
                    bg.updateTick(obj);
                    client.runChartManager.refresh();
                }
                bg.updateBoardObj(obj);

                client.futureDataManager.updateRowData(bg.index, obj);
            } else if (temp.tp == "s") {
                if (temp.tr == "5003") {
                    obj = config.boardDataFormat(client.columnMap, JSON.parse(temp.c).data);
                    bg = client.getFutureGoodsByMid(temp.mid);
                    bg.setBoardObj(obj);
                    bg.futureTelegram.setResponse(data,temp);
                    //if(error)//錯誤還沒處理
                    client.addFutureData(bg.boardObj);
                } else if (temp.tr == "5001") {
                    obj = JSON.parse(temp.c);
                    bg = client.getFutureGoodsByMid(temp.mid);
                    bg.futureRegisterTelegram.setResponse(data,temp);
                }
            }
        };

        client.onKChartData = function (evt, data) {
            log("onKChartData");
            var temp = JSON.parse(data);
            if (temp.tp == "s") {
                if (temp.tr == "1002") {
                    var bg = client.getFutureGoodsByMid(temp.mid);
                    bg.kChartTelegram.setResponse(data,temp);
                    if (temp.error == "1") {
                        var c = JSON.parse(temp.c);
                        if (typeof c !== typeof undefined && c.hasOwnProperty("ec")) {
                            alert(c.ec);
                        }
                    } else {
                        config.unZip(temp, client.onKChartDataLoaded);
                    }
                }
            }
        };

        client.addFutureData = function (data) {
            //log(data);
            client.futureDataLoaded++;
            client.futureDataList.push(data);
            if (client.futureDataLoaded == client.futureDataTotal) {
                client.futureDataManager.setDataSource(client.futureDataList);
                //client.canvasTable.setDataSource(client.futureDataList);
                client.requestRegisterBoard();
                client.requestKChart(0);

                //client.canvasTable.render();
            }
        };

        client.onBoardRowClick = function (e, tableClass, rowIndex, rowData) {
            for (var i = 0; i < client.futureDataList.length; i++) {
                if (client.futureDataList[i].code == rowData.code) {
                    client.requestKChart(i);
                }
            }
        };

        client.requestFuture = function () {
            for (var key in client.futureGoodsMap) {
                client.futureGoodsMap[key].futureTelegram.sendRequest();
            }
        };

        client.requestRegisterBoard = function () {
            for (var key in client.futureGoodsMap) {
                client.futureGoodsMap[key].futureRegisterTelegram.sendRequest();
            }
        };

        client.requestKChart = function (index) {
            log("requestKChart:%s", index);
            var bg;
            for (var key in client.futureGoodsMap) {
                bg = client.futureGoodsMap[key];
                if (bg.index == index) {
                    break;
                }
            }

            bg.kChartTelegram.setRequest(config.getKChartRequest(bg.code, bg.boardMid, bg.boardObj.quoteDate, config.kChartMin1));
            bg.kChartTelegram.sendRequest();
        };

        client.onKChartDataLoaded = function (temp) {
            log("onKChartDataLoaded mid=%s", temp.mid);
            var bg = client.getFutureGoodsByMid(temp.mid);
            //進來的資料,時間近的在前面
            //而且不是每秒都有
            //20150527 資料只有1360筆 時間筆數06:00~05:00為1380筆 差了20筆
            config.calculateKChartData(temp.c, bg.boardObj);
            client.runChartIndex = bg.index;
            client.runChartManager.show(bg.boardObj);
        };

        client.getFutureGoodsByMid = function (mid) {
            var bg = undefined;
            for (var key in client.futureGoodsMap) {
                bg = client.futureGoodsMap[key];
                if (bg.boardMid == mid) {
                    return bg;
                }
            }
            return undefined;
        };

        client.getFutureUpDownClass = function (rowData) {
            if (rowData.upDown > 0) {
                return "futureUpColor";
            } else {
                return "futureDownColor";
            }
        };

        client.init();
        return client;
    }
};

var runChartManager = {
    createNew: function () {

        var cm = {};
        var chart = RunChart.createNew(document.getElementById("runChartCanvas"));
        cm.chart = chart;

        cm.show = function (boardObj) {
            if (typeof chart.dataDriven === typeof undefined) {
                var dataDriven = DataDriven.createNew(chart);
                dataDriven.setSource(boardObj, "kChartDataList");
                chart.setDataDriven(dataDriven);
                chart.dataDriven.generate();
            } else {
                chart.dataDriven.setSource(boardObj, "kChartDataList");
                chart.dataDriven.generate();
            }

            var startTime = moment(boardObj.quoteDate + boardObj.startTime, "YYYYMMDDHHmmss");
            var endTime = moment(boardObj.quoteDate + boardObj.endTime, "YYYYMMDDHHmmss");
            if (startTime.isAfter(endTime)) {
                endTime.add(1, "day");
            }

            if (typeof chart.periodAxis.timeTick === typeof undefined) {
                var timeTick = TimeTick.createNew();
                timeTick.changeType(TickType.MINUTE);
                timeTick.changeTime(startTime, endTime);
                chart.periodAxis.setTimeTick(timeTick);
                chart.periodAxis.timeTick.generateTick();
            } else {
                chart.periodAxis.timeTick.changeTime(startTime, endTime);
                chart.periodAxis.timeTick.generateTick();
            }
            chart.draw();
        };

        cm.refresh = function () {
            chart.dataDriven.generate();
            chart.draw();
        };

        cm.init = function () {

            chart.padding(100, 20, 100, 40);
            chart.init();
            var area = chart.area;

            var spaceHeight = area.height / 20;
            var volumeAxisHeight = area.height / 2;
            var valueAxisHeight = area.height - volumeAxisHeight - spaceHeight;

            var periodAxis = chart.createPeriodAxis("time", config.getKChartDataDataTime);
            var volumeAxis = periodAxis.createValueAxis("volume", "volumeMin", "volumeMax", "scale", area.x, area.y, volumeAxisHeight);
            var valueAxis = periodAxis.createValueAxis("close", "lowLimit", "highLimit", "scale", area.x, volumeAxis.y - volumeAxis.height - spaceHeight, valueAxisHeight);
            var mouse = chart.createMouse(chart.layerManager.getLayerById("mouseLayer"));

            var drawStyle = DrawStyle.createNew(chart);

            chart.addLayerDrawFunction(0, drawStyle.drawBackground);

            valueAxis.addLayerDrawFunction(0, drawStyle.drawValueAxis);
            valueAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisTicks);
            volumeAxis.addLayerDrawFunction(0, drawStyle.drawValueAxis);
            volumeAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisTicks);
            valueAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisData);
            volumeAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisData);

            periodAxis.addLayerDrawFunction(1, drawStyle.drawPeriodAxisTicks);

            mouse.addLayerDrawFunction(2, drawStyle.drawMouseLayerMove);
        };

        cm.init();

        return cm;
    }
};

function Telegram(){
    this.requestText = undefined;
    this.responseText = undefined;
    this.responseObj = undefined;
    var t = this;

    this.setWebSocketManager = function (wsm) {
        t.wsm = wsm;
    };

    this.sendRequest = function () {
        t.wsm.send(t.requestText);
    };

    this.setRequest = function (text) {
        t.requestText = text;
    };

    this.setResponse = function (text,obj) {
        t.responseText = text;
        t.responseObj = obj;
    };
}

function FutureGoods(future, i) {
    this.index = i;
    this.code = future.code;
    this.name = future.name;
    this.limitPercentage = future.limitPercentage;
    this.startTime = future.startTime;
    this.endTime = future.endTime;
    this.boardMid = "boardGoods" + i;
    this.futureTelegram = new Telegram();
    this.futureRegisterTelegram = new Telegram();
    this.futureUnRegisterTelegram = new Telegram();
    this.kChartTelegram = new Telegram();
    this.boardPushData = undefined;
    this.boardObj = undefined;
    var bg = this;
    this.setBoardObj = function (boardObj) {
        bg.boardObj = boardObj;
        bg.boardObj.name = bg.name;
        bg.boardObj.volumeMax = 0;
        bg.boardObj.volumeMin = 0;
        bg.boardObj.startTime = bg.startTime;
        bg.boardObj.endTime = bg.endTime;
        bg.boardObj.lowLimit = JsonTool.formatFloat(bg.boardObj.preClose * 0.99, bg.boardObj.scale);
        bg.boardObj.highLimit = JsonTool.formatFloat(bg.boardObj.preClose * 1.01, bg.boardObj.scale);
        //log(bg.boardObj.tradeDate);
        //console.log(moment("20150528060000","YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss"));
        bg.calculate();
    };

    this.updateBoardObj = function (obj) {
        JsonTool.copy(bg.boardObj, obj);
        //log("last=%s,preClose=%s,upDown=%s,upDownPercentage=%s",data.last,data.preClose,data.upDown,data.upDownPercentage);
        bg.calculate();
        //log("upDown=%s,upDownPercentage=%s",data.upDown,data.upDownPercentage);
    };

    this.updateTick = function (obj) {
        var list = bg.boardObj.kChartDataList;
        var tickData = list[list.length - 1];
        if (obj.volume > bg.boardObj.volumeMax) {
            bg.boardObj.volumeMax = obj.volume;
        }
        if (tickData.time == obj.tickTime.substr(0, 5)) {
            tickData.high = obj.high;
            tickData.low = obj.low;
            tickData.close = obj.last;
            tickData.volume += obj.volume;
            log("updateTick close=%s,volume=%s,time=%s", tickData.close, tickData.volume, obj.tickTime);
        } else {
            var newTickData = new TickData(obj.code, obj.quoteDate, obj.tickTime.substr(0, 5), obj.open, obj.high, obj.low, obj.last, obj.volume);
            list.push(newTickData);
            log("addTick close=%s,volume=%s,time=%s", newTickData.close, newTickData.volume, newTickData.time);
        }
    };

    this.calculate = function () {
        var data = bg.boardObj;
        data.upDown = data.last - data.preClose;
        data.upDownPercentage = data.upDown / data.preClose * 100;
        //1.2 * Math.max(this.priceHigh_ - this.prevClose_, this.prevClose_ - this.priceLow_);
        var a = JsonTool.formatFloat(1.2 * Math.max(data.high - data.preClose, data.preClose - data.low), data.scale);
        //log("a=%s",a);
        data.highLimit = data.preClose + a;
        data.lowLimit = data.preClose - a;
    }

}
