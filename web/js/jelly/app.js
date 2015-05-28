/**
 * Created by user on 2015/5/21.
 */
var Client = {
    createNew: function () {
        var client = {};
        client.boardGoodsMap = {};
        client.quoteWsm = WebSocketManager.createNew(config.quoteWsUrl, "board");
        client.kChartWsm = WebSocketManager.createNew(config.kChartWsUrl, "kChart");
        client.boardDataManager = undefined;
        client.boardTable = undefined;
        client.boardDataTotal = 0;
        client.boardDataLoaded = 0;
        client.boardDataList = [];

        client.init = function () {
            var bg = undefined;
            client.boardDataTotal = 0;
            for (var i = 0; i < config.futureList.length; i++) {
                bg = new BoardGoods(config.futureList[i], client.boardDataTotal);
                bg.boardRequestData = config.getBoardRequest(bg.code, bg.boardMid);
                bg.boardRegisterRequestData = config.getBoardRegisterRequest(bg.code, bg.boardMid);
                bg.boardUnRegisterRequestData = config.getBoardUnRegisterRequest(bg.code, bg.boardMid);
                client.boardGoodsMap[bg.code] = bg;
                client.boardDataTotal++;
            }

            client.runChartManager = runChartManager.createNew();

            client.boardTable = ReportTable.createNew("boardTable");
            client.boardTable.addTdClassRenderer("upDown", client.getBoardUpDownClass);
            client.boardDataManager = ReportDataManager.createNew(false);
            client.boardDataManager.addTable(client.boardTable);
            $(window).on("beforeunload", function () {
                client.stop();
            });
        };

        client.connect = function () {
            client.quoteWsm.onState(client.onBoardState);
            client.quoteWsm.onData(client.onBoardData);
            client.kChartWsm.onState(client.onKChartState);
            client.kChartWsm.onData(client.onKChartData);

            client.kChartWsm.connect();
            client.quoteWsm.connect();
        };

        client.stop = function () {
            var bg = undefined;
            for (var code in client.boardGoodsMap) {
                bg = client.boardGoodsMap[code];
                client.quoteWsm.send(bg.boardUnRegisterRequestData);
            }
            client.quoteWsm.close();
            client.kChartWsm.close();
        };

        client.onBoardState = function (evt, readyState) {
            log("board state=%s", readyState);
            if (readyState == 1) {
                client.requestBoard();
            }
        };

        client.onKChartState = function (evt, readyState) {
            log("kChart state=%s", readyState);
        };

        client.onBoardData = function (evt, data) {
            //log("onBoardData");
            var temp = JSON.parse(data);
            var obj, bg, code;
            if (temp.tp == "p") {//push
                obj = client.quoteFormat(JSON.parse(temp.c).data);
                bg = client.boardGoodsMap[obj.code];//with out mid
                bg.boardPushData = data;
                bg.updateBoardObj(obj);
                client.boardDataManager.updateRowData(bg.index, obj);
            } else if (temp.tp == "s") {
                if (temp.tr == "5003") {
                    obj = client.quoteFormat(JSON.parse(temp.c).data);
                    bg = client.getBoardGoodsByMid(temp.mid);
                    bg.setBoardObj(obj);
                    bg.boardResponseData = data;
                    //if(error)//錯誤還沒處理
                    client.addBoardData(bg.boardObj);
                } else if (temp.tr == "5001") {
                    obj = JSON.parse(temp.c);
                    bg = client.getBoardGoodsByMid(temp.mid);
                    bg.boardRegisterResponseData = data;
                }
            }
        };

        client.onKChartData = function (evt, data) {
            log("onKChartData");
            var temp = JSON.parse(data);
            if (temp.tp == "s") {
                if (temp.tr == "1002") {
                    var bg = client.getBoardGoodsByMid(temp.mid);
                    bg.kChartResponseData = data;
                    bg.kChartResponseObject = temp;
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

        client.addBoardData = function (data) {
            //log(data);
            client.boardDataLoaded++;
            client.boardDataList.push(data);
            if (client.boardDataLoaded == client.boardDataTotal) {
                client.boardDataManager.setDataSource(client.boardDataList);
                client.requestRegisterBoard();
                client.requestKChart(0);
            }
        };

        client.requestBoard = function () {
            for (var key in client.boardGoodsMap) {
                client.quoteWsm.send(client.boardGoodsMap[key].boardRequestData);
            }
        };

        client.requestRegisterBoard = function () {
            for (var key in client.boardGoodsMap) {
                client.quoteWsm.send(client.boardGoodsMap[key].boardRegisterRequestData);
            }
        };

        client.requestKChart = function (index) {
            log("requestKChart:%s", index);
            var bg;
            for (var key in client.boardGoodsMap) {
                bg = client.boardGoodsMap[key];
                if (bg.index == index) {
                    break;
                }
            }

            //bg.kChartRequestData = config.getKChartRequest(bg.code, bg.boardMid, bg.boardObj.quoteDate, config.kChartMin1);
            bg.kChartRequestData = config.getKChartRequest(bg.code, bg.boardMid, "20150527", config.kChartMin1);
            client.kChartWsm.send(bg.kChartRequestData);
        };

        client.onKChartDataLoaded = function (temp) {
            log("onKChartDataLoaded mid=%s", temp.mid);
            var bg = client.getBoardGoodsByMid(temp.mid);
            bg.boardObj.kChartDataList = [];
            config.formatKChartData(temp.c, bg.boardObj.kChartDataList);
            client.runChartManager.show(bg.boardObj);
        };

        client.goodsCodeFormat = function (data) {
            return data.replace("G|", "");
        };

        client.quoteFormat = function (data) {
            var obj = {};
            var firstCommaIndex = data.indexOf(",");
            var code = data.substring(0, firstCommaIndex);
            obj.code = code.replace("G|", "");
            var str = data.substring(firstCommaIndex + 1);
            var key = null;
            //time("quoteFormat");
            var count = 0;
            while (str.length > 0) {
                key = str.substr(0, 1);
                if (config.quoteBateCodeMap.hasOwnProperty("key" + key)) {
                    firstCommaIndex = str.indexOf(",", 1);
                    obj[config.quoteBateCodeMap["key" + key]] = str.substring(1, firstCommaIndex);
                    if (firstCommaIndex != -1) {
                        str = str.substring(firstCommaIndex + 1);
                    } else {
                        str = "";
                    }
                } else {
                    firstCommaIndex = str.indexOf(",", 1);
                    if (firstCommaIndex != -1) {
                        str = str.substring(firstCommaIndex + 1);
                    } else {
                        break;
                    }
                }
                count++;
                if (count > 100) {//for prevent infinite loop...
                    break;
                }
                //log("%s=%s",count,str);
            }
            //timeEnd("quoteFormat");
            return obj;
        };

        client.getBoardGoodsByMid = function (mid) {
            var bg = undefined;
            for (var key in client.boardGoodsMap) {
                bg = client.boardGoodsMap[key];
                if (bg.boardMid == mid) {
                    return bg;
                }
            }
            return undefined;
        };

        client.getBoardUpDownClass = function (rowData) {
            if (rowData.upDown > 0) {
                return "boardUpColor";
            } else {
                return "boardDownColor";
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
            var dataDriven = DataDriven.createNew(chart, boardObj, "kChartDataList");
            chart.setDataDriven(dataDriven);
            var today = moment().subtract(1, 'day').format('YYYYMMDD');

            var startTime = moment(today + boardObj.startTime, "YYYYMMDDHHmmss");
            var endTime = moment(today + boardObj.endTime, "YYYYMMDDHHmmss");
            if (startTime.isAfter(endTime)) {
                endTime.add(1, "day");
            }

            var timeTick = TimeTick.createNew(startTime, endTime, TickType.MINUTE);
            chart.periodAxis.setTimeTick(timeTick);

            chart.draw();
        };

        cm.init = function () {

            chart.padding(100, 20, 100, 40);
            chart.init();
            var area = chart.area;
            var spaceHeight = area.height / 20;

            var periodAxis = chart.createPeriodAxis("time");
            var volumeAxis = periodAxis.createValueAxis("volume", "volumeMin", "totalVolume", "scale", area.x, area.y, area.height / 5);
            var valueAxis = periodAxis.createValueAxis("close", "lowLimit", "highLimit", "scale", area.x, volumeAxis.y - volumeAxis.height - spaceHeight, area.height - volumeAxis.height - spaceHeight);

            var drawStyle = DrawStyle.createNew(chart);

            chart.addLayerDrawFunction(0, drawStyle.drawBackground);

            valueAxis.addLayerDrawFunction(0, drawStyle.drawValueAxis);
            valueAxis.addLayerDrawFunction(0, drawStyle.drawValueAxisTicks);
            volumeAxis.addLayerDrawFunction(0, drawStyle.drawValueAxis);
            volumeAxis.addLayerDrawFunction(0, drawStyle.drawValueAxisTicks);
            valueAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisData);
            volumeAxis.addLayerDrawFunction(1, drawStyle.drawValueAxisData);

            periodAxis.addLayerDrawFunction(1, drawStyle.drawPeriodAxisTicks);
        };

        cm.init();

        return cm;
    }
};

function BoardGoods(future, i) {
    this.index = i;
    this.code = future.code;
    this.name = future.name;
    this.limitPercentage = future.limitPercentage;
    this.startTime = future.startTime;
    this.endTime = future.endTime;
    this.boardMid = "boardGoods" + i;
    this.boardRegisterMid = "boardGoodsRegister" + i;
    this.boardRequestData = undefined;
    this.boardRegisterRequestData = undefined;
    this.boardUnRegisterRequestData = undefined;
    this.kChartRequestData = undefined;
    this.boardResponseData = undefined;
    this.boardRegisterResponseData = undefined;
    this.boardUnRegisterResponseData = undefined;
    this.kChartResponseData = undefined;
    this.kChartResponseObject = undefined;
    this.boardPushData = undefined;
    this.boardObj = undefined;
    var bg = this;
    this.setBoardObj = function (boardObj) {
        bg.boardObj = boardObj;
        bg.boardObj.name = bg.name;
        bg.boardObj.volumeMin = 0;
        bg.boardObj.startTime = bg.startTime;
        bg.boardObj.endTime = bg.endTime;
        log(bg.boardObj.tradeDate);
        //console.log(moment("20150528060000","YYYYMMDDHHmmss").format("YYYY-MM-DD HH:mm:ss"));
        bg.calculate();
    };
    this.updateBoardObj = function (obj) {
        JsonTool.copy(bg.boardObj, obj);
        //log("last=%s,preClose=%s,upDown=%s,upDownPercentage=%s",data.last,data.preClose,data.upDown,data.upDownPercentage);
        bg.calculate();
        //log("upDown=%s,upDownPercentage=%s",data.upDown,data.upDownPercentage);
        bg.boardObj.lowLimit = JsonTool.formatFloat(bg.boardObj.preClose * 0.9, bg.boardObj.scale);
        bg.boardObj.highLimit = JsonTool.formatFloat(bg.boardObj.preClose * 1.1, bg.boardObj.scale);
    };
    this.calculate = function () {
        var data = bg.boardObj;
        data.upDown = data.last - data.preClose;
        data.upDownPercentage = data.upDown / data.preClose * 100;
    }

}
