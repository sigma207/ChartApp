/**
 * Created by user on 2015/5/21.
 */
QuoteColumn.prototype.STR_TYPE = "str";
QuoteColumn.prototype.INT_TYPE = "int";
QuoteColumn.prototype.FLOAT_TYPE = "float";
var config = {
    quoteWsUrl: "ws://122.152.162.81:10890/websocket",
    kChartWsUrl: "ws://122.152.162.81:10891/websocket",
    kChartMin1: "min1",
    getBoardRequest: function (code, mid) {
        return '{"srv":"QUOTE","tr":"5003","tp":"r","zip":"0","encrypt":"0","mid":' + mid + ',"c":{"es":"G|' + code + '"}}';
    },
    getBoardRegisterRequest: function (code, mid) {
        return '{"srv":"QUOTE","tr":"5001","tp":"r","zip":"0","encrypt":"0","mid":' + mid + ',"c":{"tp":"RT,RQ","es":"G|' + code + '"}}';
    },
    getBoardUnRegisterRequest: function (code, mid) {
        return '{"srv":"QUOTE","tr":"5002","tp":"r","zip":"0","encrypt":"0","mid":' + mid + ',"c":{"tp":"RT,RQ","es":"G|' + code + '"}}';
    },
    getKChartRequest: function (code, mid, date, type) {
        return '{"srv":"TICK","tr":"1002","tp":"r","zip":"0","encrypt":"0","mid":' + mid + ',"c":{"ex":"G","id":"' + code + '","tp":"' + type + '","td":"' + date + '","nt":5}}';
    },
    unZip: function (temp, callbackFun) {
        var objContentBase64EncodedCompressedBytesInStr = temp['c'].replace('\r\n', '');
        var objContentCompressedBytesInStr = atob(objContentBase64EncodedCompressedBytesInStr);
        var decompressedBytes = pako.ungzip(objContentCompressedBytesInStr); // Ungzip it.

        var blob = new Blob([new Uint8Array(decompressedBytes)]); // Store it to blob for FileReader.
        var fileReader = new FileReader();
        var L_this = this;
        fileReader.onload = function (IN_event) {
            temp['zip'] = '0';
            temp['c'] = JSON.parse(IN_event.target.result);
            temp['c'] = temp['c'].replace(/\u0003/g, '\r\n');
            callbackFun.call(this, temp);
            //console.log(temp);
        };
        fileReader.readAsText(blob);
    },
    getKChartDataDataTime: function (kChartData) {
        return kChartData.date + kChartData.time.replace(":", "");
    },
    calculateKChartData: function (c, boardObj) {
        boardObj.kChartDataList = [];
        var list = c.split("\r\n");
        var listCount = list.length;
        var propertyCount = config.kChartProperties.length;
        var row = [];
        var property = "";
        var obj = {};
        var tickData;
        var maxVolume = 0;
        for (var i = listCount - 1; i >= 0; i--) {
            if (list[i].length > 0) {
                row = list[i].split(",");
                obj = {};
                for (var j = 0; j < propertyCount; j++) {
                    property = config.kChartProperties[j];
                    obj[property] = row[j];
                }
                tickData = new TickData(obj.code, obj.date, obj.time, obj.open, obj.high, obj.low, obj.close, obj.volume);
                if (tickData.volume > boardObj.volumeMax) {
                    boardObj.volumeMax = tickData.volume;
                }

                boardObj.kChartDataList.push(tickData);
            }
        }
        log(boardObj.kChartDataList);
        log("maxVolume=%s", boardObj.volumeMax);
    },
    kChartProperties: ["code", "date", "time", "open", "high", "low", "close", "volume"],
    futureList: [
        new Future("6ECC", "歐元期", 1.22, "060000", "050000"),
        new Future("CLCC", "輕油期", 0.4, "060000", "040000"),
        new Future("GCCC", "黃金期", 0.31, "060000", "040000"),
        new Future("HSICC", "桓生期", 2.46, "091500", "161500"),
        //new Future("IFCC", "滬深期", 0.26),
        new Future("NKCC", "日經期", 0.26, "074500", "134500"),
        new Future("NQCC", "那斯達", 0.26, "060000", "040000"),
        //new Future("SICC", "白銀期", 1.22),
        new Future("TECC", "電子期", 1.13, "084500", "134500"),
        new Future("TFCC", "金融期", 1.74, "084500", "134500"),
        new Future("TWCC", "摩台期", 1.2, "084500", "134500"),
        //new Future("TWICC", "加權指", 1.22),
        new Future("TXCC", "台指期", 1.06, "084500", "134500"),
        new Future("YMCC", "道瓊期", 0.25, "060000", "050000")
    ],
    boardGoods: {
        "6ECC": "歐元期",
        "CLCC": "輕油期",
        "GCCC": "黃金期",
        "HSICC": "桓生期",
        "IFCC": "滬深期",
        "NKCC": "日經期",
        "NQCC": "那斯達",
        "SICC": "白銀期",
        "TECC": "電子期",
        "TFCC": "金融期",
        "TWCC": "摩台期",
        "TWICC": "加權指",
        "TXCC": "台指期",
        "YMCC": "道瓊期"
    },
    quoteColumnList:[
        new QuoteColumn(",","bid6","委買價6",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("-","bid7","委買價7",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn(".","bid8","委買價8",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("/","bid9","委買價9",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("0","bid10","委買價10",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("1","bidVolume6","委買量6",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("2","bidVolume7","委買量7",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("3","bidVolume8","委買量8",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("4","bidVolume9","委買量9",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("5","bidVolume10","委買量10",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("6","ask6","委賣價6",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("7","ask7","委賣價7",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("8","ask8","委賣價8",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("9","ask9","委賣價9",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn(":","ask10","委賣價10",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn(";","askVolume6","委賣量6",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("<","askVolume7","委賣量7",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn(">","askVolume8","委賣量8",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("?","askVolume9","委賣量9",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("@","askVolume10","委賣量10",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("A","tickTime","成交時間",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("B","scale","小數點",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("C","last","成交價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("D","bid","委買價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("E","ask","委賣價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("F","totalVolume","總量",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("G","high","最高價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("H","low","最低價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("I","open","開盤價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("J","close","收盤價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("K","netChange","於上一價漲跌",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("L","preClose","昨收",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("M","oi","未平倉量",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("N","upDown","漲跌",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("O","upDownPercentage","漲跌幅",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("P","volume","單量",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("Q","quoteIndex","報價索引",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("R","","",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("S","type","E=股票;W=權證;F=期貨;X=外匯;O=選擇權",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("T","status","T=正常交易; P=暫停交易; O=零股交易; U=已下市; A=盤後交易;  R=盤前交易",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("U","settlementPrice","結算價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("V","highLimit","漲停價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("W","lowLimit","跌停價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("X","preDayVolume","昨量",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("Y","volumePreW","成交價量",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("Z","bidVolume","委買量",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("[","askVolume","委賣量",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("\\","tradeDate","本交易日",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("]","expireDate","期貨到期日",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("^","strikePrice","履約價",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("_","chineseName","中文名",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("`","quoteDate","報價日期",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("a","bid2","委買價2",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("b","bid3","委買價3",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("c","bid4","委買價4",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("d","bid5","委買價5",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("e","bidVolume2","委買量2",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("f","bidVolume3","委買量3",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("g","bidVolume4","委買量4",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("h","bidVolume5","委買量5",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("i","ask2","委賣價2",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("j","ask3","委賣價3",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("k","ask4","委賣價4",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("l","ask5","委賣價5",QuoteColumn.prototype.FLOAT_TYPE),
        new QuoteColumn("m","askVolume2","委賣量2",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("n","askVolume3","委賣量3",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("o","askVolume4","委賣量4",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("p","askVolume5","委賣量5",QuoteColumn.prototype.INT_TYPE),
        new QuoteColumn("q","monthCode","月份碼",QuoteColumn.prototype.STR_TYPE),
        new QuoteColumn("r","settlementDay","結算日",QuoteColumn.prototype.STR_TYPE)
    ]
};

function QuoteColumn(key,name,describe,type){
    this.key = key;
    this.name = name;
    this.describe = describe;
    this.type = type;
}
function Future(code, name, limitPercentage, startTime, endTime) {
    this.code = code;
    this.name = name;
    this.limitPercentage = limitPercentage;
    this.startTime = startTime;
    this.endTime = endTime;
}
//kChartProperties: ["code", "date", "time", "open", "high", "low", "close", "volume"],
function TickData(code, date, time, open, high, low, close, volume) {
    this.code = code;
    this.date = date;
    this.time = time;
    this.open = parseFloat(open);
    this.high = parseFloat(high);
    this.low = parseFloat(low);
    this.close = parseFloat(close);
    this.volume = parseInt(volume);
}