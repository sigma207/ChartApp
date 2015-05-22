/**
 * Created by user on 2015/5/21.
 */
var Client = {
    createNew: function () {
        var client = {};
        client.boardGoodsMap = {};
        client.quoteWsm = WebSocketManager.createNew(config.quoteWsUrl);
        client.boardDataManager= undefined;
        client.boardTable = undefined;
        client.boardDataTotal = 0;
        client.boardDataLoaded = 0;
        client.boardDataList = [];

        client.init = function () {
            var test = [1,2,3,4,5,6];
            log(test);
            log(test.splice(2,1,9));
            log(test);
            var bg = undefined;
            client.boardDataTotal = 0;
            for(var code in config.boardGoods){
                bg = new BoardGoods(code, config.boardGoods[code], client.boardDataTotal);
                bg.boardRequestData = config.getBoardRequest(bg.code, bg.boardMid);
                bg.boardRegisterRequestData = config.getBoardRegisterRequest(bg.code, bg.boardRegisterMid);
                bg.boardUnRegisterRequestData = config.getBoardUnRegisterRequest(bg.code, bg.boardRegisterMid);
                client.boardGoodsMap[bg.code] = bg;
                client.boardDataTotal++;
            }

            client.boardTable = ReportTable.createNew("boardTable");
            client.boardTable.addTdClassRenderer("upDown",client.getBoardUpDownClass);
            client.boardDataManager = ReportDataManager.createNew(false);
            client.boardDataManager.addTable(client.boardTable);
            $(window).on("beforeunload",function () {
                client.stop();
            });
        };

        client.connect = function () {
            $(document).on("WebSocketStateEvent", client.onState);
            $(document).on("WebSocketDataEvent", client.onData);
            client.quoteWsm.connect();
        };

        client.stop = function () {
            var bg = undefined;
            for(var code in client.boardGoodsMap){
                bg = client.boardGoodsMap[code];
                client.quoteWsm.send(bg.boardRegisterResponseData);
            }
            client.quoteWsm.close();
        };

        client.onState = function (evt, readyState) {
            if (readyState == 1) {
                client.requestBoard();
            }
        };

        client.onData = function (evt, data) {
            var temp = JSON.parse(data);
            var obj,bg,code;
            if (temp.tr == "5003") {
                obj = client.quoteFormat(JSON.parse(temp.c).data);
                bg = client.boardGoodsMap[obj.code];
                obj.name = bg.name;
                bg.boardResponseData = data;
                //if(error)//錯誤還沒處理
                client.addBoardData(obj);
            }else if(temp.tr =="5001"){
                obj = JSON.parse(temp.c);
                code = client.goodsCodeFormat(obj.es);
                bg = client.boardGoodsMap[code];
                bg.boardRegisterResponseData = data;
            }else if(temp.tr==""){
                if(temp.tp=="p"){//push
                    obj = client.quoteFormat(JSON.parse(temp.c).data);
                    bg = client.boardGoodsMap[obj.code];
                    bg.boardPushData = data;
                    client.boardDataManager.updateRowData(bg.index,obj);
                }
            }
        };

        client.addBoardData = function (data) {
            //log(data);
            client.boardDataLoaded++;
            client.boardDataList.push(data);
            if(client.boardDataLoaded==client.boardDataTotal){
                client.boardDataManager.setDataSource(client.boardDataList);
                client.requestRegisterBoard();
            }
        };

        client.requestBoard = function () {
            for(var key in client.boardGoodsMap){
                client.quoteWsm.send(client.boardGoodsMap[key].boardRequestData);
            }
        };

        client.requestRegisterBoard = function () {
            for(var key in client.boardGoodsMap){
                client.quoteWsm.send(client.boardGoodsMap[key].boardRegisterRequestData);
            }
        };

        client.goodsCodeFormat = function (data) {
            return data.replace("G|","");
        };

        client.quoteFormat = function (data) {
            var obj = {};
            var firstCommaIndex = data.indexOf(",");
            var code = data.substring(0, firstCommaIndex);
            obj.code = code.replace("G|","");
            var str = data.substring(firstCommaIndex + 1);
            var key = null;
            time("quoteFormat");
            var count = 0;
            while(str.length>0){
                key = str.substr(0,1);
                if(config.quoteBateCodeMap.hasOwnProperty("key"+key)){
                    firstCommaIndex = str.indexOf(",",1);
                    obj[config.quoteBateCodeMap["key"+key]] = str.substring(1, firstCommaIndex);
                    if(firstCommaIndex!=-1){
                        str = str.substring(firstCommaIndex+1);
                    }else{
                        str = "";
                    }
                }else{
                    firstCommaIndex = str.indexOf(",",1);
                    if(firstCommaIndex!=-1){
                        str = str.substring(firstCommaIndex+1);
                    }else{
                        break;
                    }
                }
                count ++;
                if(count>100){//for prevent infinite loop...
                    break;
                }
                //log("%s=%s",count,str);
            }
            timeEnd("quoteFormat");
            //log("count%s",count);
            //log(obj);
            return obj;
        };

        client.getBoardUpDownClass = function (rowData) {
            if(rowData.upDown>0){
                return "boardUpColor";
            } else {
                return "boardDownColor";
            }
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
    this.boardResponseData = undefined;
    this.boardRegisterResponseData = undefined;
    this.boardUnRegisterResponseData = undefined;
    this.boardPushData = undefined;
}