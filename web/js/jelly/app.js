/**
 * Created by user on 2015/5/21.
 */
var Client = {
    QuoteWsUrl: "ws://122.152.162.81:10890/websocket",
    createNew: function () {
        var client = {};
        client.boardGoodsList = [];
        client.quoteWsm = WebSocketManager.createNew(config.quoteWsUrl);


        client.init = function () {
            var count = config.boardCodeList.length;
            var bg = undefined;
            for (var i = 0; i < count; i++) {
                bg = new BoardGoods(config.boardCodeList[i], i);
                bg.requestData = config.getBoardRequest(bg.code, bg.mid);
                client.boardGoodsList.push(bg);
                //client.boardGoodsList.push( config.getBoardRequest(config.quoteGoodsList[i]));
            }
        };

        client.connect = function () {
            $(document).on("WebSocketStateEvent", client.onState);
            $(document).on("WebSocketDataEvent", client.onData);
            client.quoteWsm.connect();
        };

        client.stop = function () {
            client.quoteWsm.close();
        };

        client.onState = function (evt, readyState) {
            if (readyState == 1) {
                client.requestBoard();
            }
        };

        client.onData = function (evt, data) {
            log(data);
            var temp = JSON.parse(data);
            if (temp.tr == "5003") {
                client.quoteFormat(JSON.parse(temp.c).data);
            }
        };

        client.requestBoard = function () {
            var count = client.boardGoodsList.length;
            var bg = undefined;
            for (var i = 0; i < count; i++) {
                bg = client.boardGoodsList[i];
                client.quoteWsm.send(bg.requestData);
            }
        };

        client.quoteFormat = function (data) {
            log(data);
            var firstCommaIndex = data.indexOf(",");
            var code = data.substring(0, firstCommaIndex);
            log("code=%s", code);
            var str = data.substring(firstCommaIndex + 1);
            var count = config.quoteBateCode.length;
            var obj = {};
            var bateCode = null;
            var keyIndex = -1;
            var endIndex = -1;
            var key = null;
            console.time("quoteFormat");
            for (var i = 0; i < count; i++) {
                bateCode = config.quoteBateCode[i];
                keyIndex = str.indexOf(bateCode[0]);
                if (keyIndex == 0) {
                    endIndex = str.indexOf(",");
                    obj[bateCode[1]] = str.substring(keyIndex + 1, endIndex);
                    str = str.substring(endIndex + 1);
                    //log(str);
                } else {

                }
                console.timeEnd("quoteFormat");
                //console.log(str);
            }
            log(obj);
        };
        client.init();
        return client;
    }
};

function BoardGoods(code, i) {
    this.code = code;
    this.mid = "boardGoods" + i;
    this.requestData = "";
}