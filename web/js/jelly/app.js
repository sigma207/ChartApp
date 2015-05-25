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
            for (var code in config.boardGoods) {
                bg = new BoardGoods(code, config.boardGoods[code], client.boardDataTotal);
                bg.boardRequestData = config.getBoardRequest(bg.code, bg.boardMid);
                bg.boardRegisterRequestData = config.getBoardRegisterRequest(bg.code, bg.boardMid);
                bg.boardUnRegisterRequestData = config.getBoardUnRegisterRequest(bg.code, bg.boardMid);
                client.boardGoodsMap[bg.code] = bg;
                client.boardDataTotal++;
            }

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
            client.quoteWsm.connect();
            client.kChartWsm.connect();
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
            log("onBoardData");
            var temp = JSON.parse(data);
            var obj, bg, code;
            if (temp.tp == "p") {//push
                obj = client.quoteFormat(JSON.parse(temp.c).data);
                bg = client.boardGoodsMap[obj.code];//with out mid
                //bg = client.getBoardGoodsByMid(temp.mid);
                bg.boardPushData = data;
                JsonTool.copy(client.boardDataList[bg.index], obj);
                config.calculateBoardData(client.boardDataList[bg.index]);
                client.boardDataManager.updateRowData(bg.index, obj);
            } else if (temp.tp == "s") {
                if (temp.tr == "5003") {
                    obj = client.quoteFormat(JSON.parse(temp.c).data);
                    //bg = client.boardGoodsMap[obj.code];
                    bg = client.getBoardGoodsByMid(temp.mid);
                    bg.boardObj = obj;
                    obj.name = bg.name;
                    bg.boardResponseData = data;
                    //if(error)//錯誤還沒處理
                    client.addBoardData(obj);
                } else if (temp.tr == "5001") {
                    obj = JSON.parse(temp.c);
                    //code = client.goodsCodeFormat(obj.es);
                    //bg = client.boardGoodsMap[code];
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
                    //config.unGZip.apply(bg,[temp, client.onKChartDataLoaded]);
                    config.unZip(temp, client.onKChartDataLoaded);
                }
            }
        };

        client.addBoardData = function (data) {
            //log(data);
            client.boardDataLoaded++;
            config.calculateBoardData(data);
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

            bg.kChartRequestData = config.getKChartRequest(bg.code, bg.boardMid, bg.boardObj.quoteDate, config.kChartMin1);
            client.kChartWsm.send(bg.kChartRequestData);
        };

        client.onKChartDataLoaded = function (temp) {
            log("onKChartDataLoaded mid=%s", temp.mid);
            var bg = client.getBoardGoodsByMid(temp.mid);
            bg.kChartData = [];
            config.formatKChartData(temp.c,bg.kChartData);
            client.showRunChart(bg.index);
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

        client.showRunChart = function (index) {

        };

        client.init();
        return client;
    }
};

function BoardGoods(code, name, i) {
    this.index = i;
    this.code = code;
    this.name = name;
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
    this.kChartData = [];
    this.boardPushData = undefined;
    this.boardObj = undefined;
}
