/**
 * Created by user on 2015/5/21.
 */
var Client = {
    createNew: function () {
        var client = {};
        client.futureGoodsMap = {};
        client.quoteWsm = WebSocketManager.createNew(config.quoteWsUrl, "quote");
        client.chartWsm = WebSocketManager.createNew(config.chartWsUrl, "kChart");
        client.columnMap = {};
        client.quoteSecondTickTable = undefined;
        client.quoteSecondTickUpDownColumn = undefined;
        client.quoteSecondTickLastColumn = undefined;
        client.canvasTable = undefined;
        client.futureDataManager = undefined;
        client.quoteDetailDataManager = undefined;
        client.futureTable = undefined;
        client.futureDataTotal = 0;
        client.futureDataLoaded = 0;
        client.futureDataList = [];
        client.runChartCode = "";
        client.testPushData = true;
        //client.testPushData = false;

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
                bg.futureTelegram.setWebSocketManager(client.quoteWsm);
                bg.futureRegisterTelegram.setWebSocketManager(client.quoteWsm);
                bg.futureUnRegisterTelegram.setWebSocketManager(client.quoteWsm);
                bg.kChartTelegram.setWebSocketManager(client.chartWsm);
                bg.quoteIndexTickTelegram.setWebSocketManager(client.chartWsm);
                bg.quoteMinuteTickTelegram.setWebSocketManager(client.chartWsm);
                bg.futureTelegram.setRequest(config.getBoardRequest(bg.code, bg.boardMid));
                bg.futureRegisterTelegram.setRequest(config.getBoardRegisterRequest(bg.code, bg.boardMid));
                bg.futureUnRegisterTelegram.setRequest(config.getBoardUnRegisterRequest(bg.code, bg.boardMid));

                //bg.boardUnRegisterRequestData = config.getBoardUnRegisterRequest(bg.code, bg.boardMid);
                client.futureGoodsMap[bg.code] = bg;
                client.futureDataTotal++;
            }

            client.runChartManager = runChartManager.createNew();
            client.runChartManager.assign(client);

            //client.futureTable = ReportTable.createNew("futureTable");
            //client.futureTable.addTdClassRenderer("upDown", client.getFutureUpDownClass);
            client.futureDataManager = DataSourceManager.createNew(false);
            client.quoteDetailDataManager = DataSourceManager.createNew(false);
            //client.futureDataManager.addRenderer(client.futureTable);

            client.initCanvasTable();
            client.initQuoteDetailsTable();

            $(document).on("rowClick", client.onBoardRowClick);
            $(window).on("beforeunload", function () {
                client.stop();
            });
        };

        client.initQuoteDetailsTable = function () {
            client.quoteSecondTickTable = CanvasTable.createNew(document.getElementById("quoteSecondTickCanvas"));
            client.quoteSecondTickTable.updateTableRowHeight(15);
            client.quoteSecondTickTable.sortable = false;
            client.quoteSecondTickTable.addColumn(CanvasColumn.createNew("time", "時間", {textFillStyle: QuoteDetailStyle.DEFAULT_COLOR}));
            client.quoteSecondTickTable.addColumn(CanvasNumberColumn.createNew("volume", "單量", {
                decimal: 0,
                textFillStyle: QuoteDetailStyle.DEFAULT_COLOR
            }));
            client.quoteSecondTickUpDownColumn = client.quoteSecondTickTable.addColumn(CanvasNumberColumn.createNew("upDown", "漲跌", {
                decimal: 0,
                textFillStyleFunction: QuoteDetailStyle.upDownColor
            }));
            client.quoteSecondTickLastColumn = client.quoteSecondTickTable.addColumn(CanvasNumberColumn.createNew("last", "成交價", {
                decimal: 0,
                textFillStyleFunction: QuoteDetailStyle.upDownColor
            }));
            client.quoteSecondTickTable.addLayer();
            client.quoteDetailDataManager.addRenderer(client.quoteSecondTickTable);

            var quoteDetailStyle = QuoteDetailStyle.createNew(client.quoteSecondTickTable);
            client.quoteSecondTickTable.renderHeadRowBackground = quoteDetailStyle.headBackground;
            client.quoteSecondTickTable.renderBodyRowBackground = quoteDetailStyle.bodyRowBackground;
            client.quoteSecondTickTable.setColumnHeadContentRender(quoteDetailStyle.headContent);
            client.quoteSecondTickTable.setColumnCellContentRender(quoteDetailStyle.cellContent);
        };

        client.initCanvasTable = function () {

            client.canvasTable = CanvasTable.createNew(document.getElementById("tableCanvas"));

            client.canvasTable.addColumn(CanvasColumn.createNew("code", "代號", {textFillStyle: FutureTableStyle.CODE_COLOR}));
            client.canvasTable.addColumn(CanvasColumn.createNew("name", "商品", {textFillStyle: FutureTableStyle.DEFAULT_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("bid", "委買價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("ask", "委賣價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("last", "成交價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("volume", "單量", {textFillStyle: FutureTableStyle.VOLUME_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("totalVolume", "成交量", {textFillStyle: FutureTableStyle.VOLUME_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("upDown", "漲跌", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("upDownPercentage", "漲跌幅", {
                decimal: 2,
                percent: true,
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("high", "最高價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("low", "最低價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("open", "開盤價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.addColumn(CanvasDateColumn.createNew("tradeDate", "交易日", {
                orgFormat: "YYYYMMDD",
                displayFormat: "YYYY-MM-DD",
                textFillStyle: FutureTableStyle.DEFAULT_COLOR
            }));
            client.canvasTable.addColumn(CanvasTimeColumn.createNew("tickTime", "更新時間", {textFillStyle: FutureTableStyle.DEFAULT_COLOR}));
            client.canvasTable.addColumn(CanvasNumberColumn.createNew("preClose", "昨結價", {
                decimal: "scale",
                textFillStyleFunction: FutureTableStyle.upDownColor
            }));
            client.canvasTable.updateLockColumnCount(2);
            client.canvasTable.addLayer();
            client.futureDataManager.addRenderer(client.canvasTable);

            var tableDrawStyle = FutureTableStyle.createNew(client.canvasTable);
            client.canvasTable.renderHeadRowBackground = tableDrawStyle.headBackground;
            client.canvasTable.renderBodyRowBackground = tableDrawStyle.bodyRowBackground;
            client.canvasTable.setColumnHeadContentRender(tableDrawStyle.headContent);
            client.canvasTable.setColumnCellContentRender(tableDrawStyle.cellContent);
        };

        client.connect = function () {
            client.quoteWsm.onState(client.onFutureState);
            client.quoteWsm.onData(client.onFutureData);
            client.chartWsm.onState(client.onChartState);
            client.chartWsm.onData(client.onChartData);

            client.chartWsm.connect();
            client.quoteWsm.connect();
        };

        client.stop = function () {
            var bg = undefined;
            for (var code in client.futureGoodsMap) {
                bg = client.futureGoodsMap[code];
                bg.futureUnRegisterTelegram.sendRequest();
                //client.quoteWsm.send(bg.futureUnRegisterTelegram.requestText);
            }
            //client.canvasTable.stop();
            client.quoteWsm.close();
            client.chartWsm.close();
        };

        client.onFutureState = function (evt, readyState) {
            log("board state=%s", readyState);
            if (readyState == 1) {
                client.requestFuture();
            } else if (readyState==3){
                alert( client.quoteWsm.closeMsg());
            }
        };

        client.onChartState = function (evt, readyState) {
            log("chart state=%s", readyState);
            if (readyState==3){
                alert( client.chartWsm.closeMsg());
            }
        };

        client.onFutureData = function (evt, data) {
            //log("onBoardData");
            var temp = JSON.parse(data);
            var obj, bg, code;
            if (temp.tp == "p") {//push
                //log("push data onFutureData");
                obj = config.boardDataFormat(client.columnMap, JSON.parse(temp.c).data);
                bg = client.futureGoodsMap[obj.code];//with out mid
                bg.futureRegisterTelegram.setPush(data,obj);
                if (client.runChartCode == bg.code) {
                    bg.updateMinuteTick(obj);
                    client.runChartManager.refresh();
                    var secondTick = bg.addQuoteSecondTick(obj);
                    client.quoteSecondTickTable.updateDataSize();
                    if(typeof client.runChartManager.chart.periodAxis.currentMouseHangList !== typeof undefined){
                        var currentMouseData = client.runChartManager.chart.getCurrentMouseData();
                        if(secondTick.time.substr(0,5)==currentMouseData.time.substr(0,5)){
                            client.runChartManager.chart.periodAxis.currentMouseHangList.unshift(secondTick);
                        }
                    }
                }
                bg.updateBoardObj(obj);
                //log(client.futureDataList.indexOf(bg.boardObj));
                //client.futureDataManager.updateRowData( client.futureDataList.indexOf(bg.boardObj), obj);
                client.canvasTable.renderRow(client.futureDataList.indexOf(bg.boardObj));
            } else if (temp.tp == "s") {
                if (temp.tr == "5003") {
                    obj = config.boardDataFormat(client.columnMap, JSON.parse(temp.c).data);
                    bg = client.getFutureGoodsByMid(temp.mid);
                    bg.setBoardObj(obj);
                    bg.futureTelegram.setResponse(data, temp);
                    //log(obj);
                    //if(error)//錯誤還沒處理
                    client.addFutureData(bg.boardObj);
                } else if (temp.tr == "5001") {
                    obj = JSON.parse(temp.c);
                    bg = client.getFutureGoodsByMid(temp.mid);
                    bg.futureRegisterTelegram.setResponse(data, temp);
                }
            }
        };

        client.onChartData = function (evt, data) {
            log("onChartData");
            var temp = JSON.parse(data);
            if (temp.tp == "s") {
                var bg = client.getFutureGoodsByMid(temp.mid);
                if (temp.error == "1") {
                    var c = JSON.parse(temp.c);
                    if (typeof c !== typeof undefined && c.hasOwnProperty("ec")) {
                        if(c.ec=="0001"){
                            alert(bg.name+" temp.tr="+temp.tr+"error:此商品無資料");
                        }else{
                            alert("temp.tr="+temp.tr+"error code="+e.ec);
                        }
                    }
                }else{
                    if (temp.tr == "1002") {
                        bg.kChartTelegram.setResponse(data, temp);
                        config.unZip(temp, client.onKChartDataLoaded);
                    } else if (temp.tr == "1012") {
                        bg.quoteIndexTickTelegram.setResponse(data, temp);
                        config.unZip(temp, client.onQuoteDetailsLoaded);
                    } else if( temp.tr="1001"){
                        bg.quoteMinuteTickTelegram.setResponse(data, temp);
                        config.unZip(temp, client.onQuoteMinuteTickLoaded);
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

                if (client.testPushData)client.requestRegisterBoard();
                var bg = client.futureDataList[0];
                client.futureDetails(bg.code);
            }
        };

        client.futureDetails = function (code) {
            client.requestKChart(code);
            client.requestQuoteIndexTick(code);
        };

        client.onBoardRowClick = function (e, id,rowData) {
            if(id=="tableCanvas"){
                log("rowData.code=%s", rowData.code);
                client.futureDetails(rowData.code);
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

        client.requestQuoteIndexTick = function (code) {
            var bg = client.futureGoodsMap[code];
            bg.quoteIndexTickTelegram.setRequest(config.getQuoteDetailsRequest(bg.code, bg.boardMid, bg.boardObj.quoteDate, bg.boardObj.quoteIndex));
            bg.quoteIndexTickTelegram.sendRequest();
        };

        client.requestKChart = function (code) {
            var bg = client.futureGoodsMap[code];
            bg.kChartTelegram.setRequest(config.getKChartRequest(bg.code, bg.boardMid, bg.boardObj.quoteDate, config.kChartMin1));
            bg.kChartTelegram.sendRequest();
        };

        client.requestQuoteMinuteTick = function (data) {
            var code = data.code.replace("G|", "");
            var bg = client.futureGoodsMap[code];
            var startTime = moment(bg.boardObj.quoteDate + data.time+":00", "YYYYMMDDHHmmss");
            var endTime = moment(bg.boardObj.quoteDate + data.time+":00", "YYYYMMDDHHmmss");
            endTime.add(1, "minutes");
            //log("startTime=%s,endTime=%s",startTime.format("HH:mm:ss"),endTime.format("HH:mm:ss"));
            bg.quoteMinuteTickTelegram.setRequest(config.getQuoteMinuteTickRequest(bg.code,bg.boardMid,bg.boardObj.quoteDate,startTime.format("HH:mm:ss"),endTime.format("HH:mm:ss")));
            bg.quoteMinuteTickTelegram.sendRequest();
        };

        client.onKChartDataLoaded = function (temp) {
            log("onKChartDataLoaded mid=%s", temp.mid);
            var bg = client.getFutureGoodsByMid(temp.mid);
            //進來的資料,時間近的在前面
            //而且不是每秒都有
            //20150527 資料只有1360筆 時間筆數06:00~05:00為1380筆 差了20筆
            config.calculateKChartData(temp.c, bg.boardObj);
            client.runChartCode = bg.code;
            client.runChartManager.show(bg.boardObj);

        };

        client.onQuoteDetailsLoaded = function (temp) {
            log("onQuoteDetailsLoaded mid=%s", temp.mid);
            var bg = client.getFutureGoodsByMid(temp.mid);

            config.calculateQuoteDetailsData(temp.c, bg.boardObj);
            client.quoteSecondTickUpDownColumn.updateDecimal(bg.boardObj.scale);
            client.quoteSecondTickLastColumn.updateDecimal(bg.boardObj.scale);
            client.quoteDetailDataManager.setDataSource(bg.boardObj.quoteIndexTickList);
        };

        client.onQuoteMinuteTickLoaded = function (temp) {
            if(typeof client.runChartManager.chart.periodAxis.currentMouseHangList !== typeof undefined){
                var bg = client.getFutureGoodsByMid(temp.mid);
                config.calculateQuoteMinuteTickData(temp.c, bg.boardObj);
                var list = bg.boardObj.quoteMinuteTickList;
                for(var i=0;i<list.length;i++){
                    client.runChartManager.chart.periodAxis.currentMouseHangList.push(list[i]);
                }
            }
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
        var dataDriven = DataDriven.createNew(chart);
        cm.chart = chart;
        cm.init = function () {
            chart.padding(100, 20, 100, 40);

            chart.init();
            var area = chart.area;

            var spaceHeight = area.height / 20;
            var volumeAxisHeight = area.height / 4;
            var valueAxisHeight = area.height - volumeAxisHeight - spaceHeight;

            var periodAxis = chart.createPeriodAxis("time", config.getKChartDataDataTime);
            periodAxis.createTimeTick();
            var volumeAxis = periodAxis.createValueAxis("volume", "volumeMin", "volumeMax", "scale", 25);
            var emptyAxis = periodAxis.createEmptyAxisY(5);
            var valueAxis = periodAxis.createValueAxis("close", "lowLimit", "highLimit", "scale",70);
            var mouse = chart.createMouse(chart.layerManager.getLayerById("mouseLayer"));

            chart.setDataDriven(dataDriven);
            periodAxis.timeTick.changeType(TickType.MINUTE);

            var drawStyle = DrawStyle.createNew(chart);

            chart.addLayerDrawFunction(0, drawStyle.drawBackground);

            valueAxis.addLayerDrawFunction(0, drawStyle.drawValueAxis);//上方的底線
            valueAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisTicks);
            volumeAxis.addLayerDrawFunction(0, drawStyle.drawValueAxis);//下方的頂線
            volumeAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisTicks);
            valueAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisData);
            volumeAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisData);

            periodAxis.addLayerDrawFunction(1, drawStyle.drawPeriodAxisTicks);

            mouse.addLayerDrawFunction(2, drawStyle.drawMouseLayerMove);
        };

        cm.assign = function (client) {
            chart.mouseHangCall = client.requestQuoteMinuteTick;
        };

        cm.show = function (boardObj) {
            var startTime = moment(boardObj.quoteDate + boardObj.startTime, "YYYYMMDDHHmmss");
            var endTime = moment(boardObj.quoteDate + boardObj.endTime, "YYYYMMDDHHmmss");
            if (startTime.isAfter(endTime)) {
                endTime.add(1, "day");
            }
            chart.periodAxis.timeTick.changeTime(startTime, endTime);
            dataDriven.setSource(boardObj, "kChartDataList");
            chart.start();
        };

        cm.refresh = function () {
            dataDriven.calculate();
        };
        cm.init();
        return cm;
    }
};

function Telegram(describe) {
    this.describe = describe;
    this.requestText = undefined;
    this.responseText = undefined;
    this.responseObj = undefined;
    var t = this;

    this.setWebSocketManager = function (wsm) {
        t.wsm = wsm;
    };

    this.sendRequest = function () {
        //log(describe+" sendRequest:"+ t.requestText);
        t.wsm.send(t.requestText);
    };

    this.setRequest = function (text) {
        t.requestText = text;
    };

    this.setResponse = function (text, obj) {
        t.responseText = text;
        t.responseObj = obj;
    };

    this.setPush = function (text, obj) {
        //log(describe+" setPush:"+ text);
        t.pushText = text;
        t.pushObj = obj;
    }
}

function FutureGoods(future, i) {
    this.index = i;
    this.code = future.code;
    this.name = future.name;
    this.telegramName = "["+this.name+"]";
    this.limitPercentage = future.limitPercentage;
    this.startTime = future.startTime;
    this.endTime = future.endTime;
    this.boardMid = "boardGoods" + i;
    this.futureTelegram = new Telegram( this.telegramName+"盤面");
    this.futureRegisterTelegram = new Telegram(this.telegramName+"盤面註冊更新");
    this.futureUnRegisterTelegram = new Telegram(this.telegramName+"盤面反註冊更新");
    this.kChartTelegram = new Telegram(this.telegramName+"K線圖");
    this.quoteIndexTickTelegram = new Telegram(this.telegramName+"交易明細");
    this.quoteMinuteTickTelegram = new Telegram(this.telegramName+"分鐘明細");
    this.boardObj = undefined;
    var bg = this;
    this.setBoardObj = function (boardObj) {
        bg.boardObj = boardObj;
        bg.boardObj.quoteIndexTickList = [];
        bg.boardObj.quoteMinuteTickList = [];
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

    this.updateMinuteTick = function (obj) {
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
            //log("updateTick close=%s,volume=%s,time=%s", tickData.close, tickData.volume, obj.tickTime);
        } else {
            var newTickData = new MinuteTick(obj.code, obj.quoteDate, obj.tickTime.substr(0, 5), obj.open, obj.high, obj.low, obj.last, obj.volume);
            list.push(newTickData);
            //log("addTick close=%s,volume=%s,time=%s", newTickData.close, newTickData.volume, newTickData.time);
        }
    };

    this.addQuoteSecondTick = function (obj) {
        var secondTick = new SecondTick(obj.code, obj.quoteDate, obj.tickTime, obj.last, obj.volume, obj.totalVolume, obj.quoteIndex, obj.last - bg.boardObj.preClose);
        if(bg.boardObj.quoteIndexTickList.length==100){
            bg.boardObj.quoteIndexTickList.pop();
        }
        bg.boardObj.quoteIndexTickList.unshift(secondTick);
        return secondTick;
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
