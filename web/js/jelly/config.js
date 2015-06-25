/**
 * Created by user on 2015/5/21.
 */
FutureColumn.prototype.STR_TYPE = "str";
FutureColumn.prototype.INT_TYPE = "int";
FutureColumn.prototype.FLOAT_TYPE = "float";
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
    getQuoteDetailsRequest: function (code, mid, date, index) {
        return '{"srv":"TICK","tr":"1012","tp":"r","zip":"0","encrypt":"0","mid":' + mid + ',"c":{"ex":"G","id":"'+code+'","td":"'+date+'","idx":"'+index+'","nt":"100"}}';
    },
    unZip: function (temp, callbackFun) {
        var objContentBase64EncodedCompressedBytesInStr = temp['c'].replace('\r\n', '');
        //DOM Exception 5 INVALID CHARACTER error on valid base64 image string in javascript
        //http://stackoverflow.com/questions/14695988/dom-exception-5-invalid-character-error-on-valid-base64-image-string-in-javascri
        //ie 要加下面這行才不會出錯 by sigma
        objContentBase64EncodedCompressedBytesInStr = objContentBase64EncodedCompressedBytesInStr.replace(/\s/g, '');
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
    calculateQuoteDetailsData: function (c, boardObj) {
        boardObj.quoteDetailList = [];
        var list = c.split("\r\n");
        var listCount = list.length;
        var propertyCount = config.quoteDetailProperties.length;
        var row = [];
        var property = "";
        var obj = {};
        var data;
        for (var i = 0; i < listCount-1; i++) {
            if (list[i].length > 0) {
                row = list[i].split(",");
                obj = {};
                for (var j = 0; j < propertyCount; j++) {
                    property = config.quoteDetailProperties[j];
                    obj[property] = row[j];
                }
                data = new QuoteDetail(obj.code, obj.date, obj.time, obj.last, obj.volume, obj.totalVolume, obj.index, obj.last-boardObj.preClose);
                boardObj.quoteDetailList.push(data);
            }
        }
        //log(boardObj.quoteDetailList);
    },
    boardDataFormat: function (columnMap,data) {
        var obj = {};
        var firstCommaIndex = data.indexOf(",");
        var code = data.substring(0, firstCommaIndex);
        obj.code = code.replace("G|", "");
        var str = data.substring(firstCommaIndex + 1);
        var key = null;
        //time("quoteFormat");
        var count = 0;
        var futureColumn = undefined;
        while (str.length > 0) {
            key = str.substr(0, 1);
            if (columnMap.hasOwnProperty("key" + key)) {
                futureColumn = columnMap["key" + key];
                firstCommaIndex = str.indexOf(",", 1);
                switch (futureColumn.type) {
                    case FutureColumn.prototype.STR_TYPE:
                        obj[futureColumn.name] = str.substring(1, firstCommaIndex);
                        break;
                    case FutureColumn.prototype.INT_TYPE:
                        obj[futureColumn.name] = parseInt(str.substring(1, firstCommaIndex));
                        break;
                    case FutureColumn.prototype.FLOAT_TYPE:
                        obj[futureColumn.name] = parseFloat(str.substring(1, firstCommaIndex));
                        break;
                }
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
        //console.log(obj);
        return obj;
    },
    kChartProperties: ["code", "date", "time", "open", "high", "low", "close", "volume"],
    quoteDetailProperties: ["code", "date", "time", "last", "volume", "totalVolume", "index"],
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
    futureColumnList: [
        new FutureColumn(",", "bid6", "委買價6", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("-", "bid7", "委買價7", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn(".", "bid8", "委買價8", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("/", "bid9", "委買價9", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("0", "bid10", "委買價10", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("1", "bidVolume6", "委買量6", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("2", "bidVolume7", "委買量7", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("3", "bidVolume8", "委買量8", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("4", "bidVolume9", "委買量9", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("5", "bidVolume10", "委買量10", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("6", "ask6", "委賣價6", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("7", "ask7", "委賣價7", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("8", "ask8", "委賣價8", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("9", "ask9", "委賣價9", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn(":", "ask10", "委賣價10", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn(";", "askVolume6", "委賣量6", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("<", "askVolume7", "委賣量7", FutureColumn.prototype.INT_TYPE),
        new FutureColumn(">", "askVolume8", "委賣量8", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("?", "askVolume9", "委賣量9", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("@", "askVolume10", "委賣量10", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("A", "tickTime", "成交時間", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("B", "scale", "小數點", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("C", "last", "成交價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("D", "bid", "委買價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("E", "ask", "委賣價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("F", "totalVolume", "總量", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("G", "high", "最高價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("H", "low", "最低價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("I", "open", "開盤價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("J", "close", "收盤價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("K", "netChange", "於上一價漲跌", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("L", "preClose", "昨收", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("M", "oi", "未平倉量", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("N", "upDown", "漲跌", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("O", "upDownPercentage", "漲跌幅", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("P", "volume", "單量", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("Q", "quoteIndex", "報價索引", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("R", "", "", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("S", "type", "E=股票;W=權證;F=期貨;X=外匯;O=選擇權", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("T", "status", "T=正常交易; P=暫停交易; O=零股交易; U=已下市; A=盤後交易;  R=盤前交易", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("U", "settlementPrice", "結算價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("V", "highLimit", "漲停價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("W", "lowLimit", "跌停價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("X", "preDayVolume", "昨量", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("Y", "volumePreW", "成交價量", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("Z", "bidVolume", "委買量", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("[", "askVolume", "委賣量", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("\\", "tradeDate", "本交易日", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("]", "expireDate", "期貨到期日", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("^", "strikePrice", "履約價", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("_", "chineseName", "中文名", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("`", "quoteDate", "報價日期", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("a", "bid2", "委買價2", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("b", "bid3", "委買價3", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("c", "bid4", "委買價4", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("d", "bid5", "委買價5", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("e", "bidVolume2", "委買量2", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("f", "bidVolume3", "委買量3", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("g", "bidVolume4", "委買量4", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("h", "bidVolume5", "委買量5", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("i", "ask2", "委賣價2", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("j", "ask3", "委賣價3", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("k", "ask4", "委賣價4", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("l", "ask5", "委賣價5", FutureColumn.prototype.FLOAT_TYPE),
        new FutureColumn("m", "askVolume2", "委賣量2", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("n", "askVolume3", "委賣量3", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("o", "askVolume4", "委賣量4", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("p", "askVolume5", "委賣量5", FutureColumn.prototype.INT_TYPE),
        new FutureColumn("q", "monthCode", "月份碼", FutureColumn.prototype.STR_TYPE),
        new FutureColumn("r", "settlementDay", "結算日", FutureColumn.prototype.STR_TYPE)
    ]
};

function FutureColumn(key, name, describe, type) {
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

function QuoteDetail(code,date,time,last,volume,totalVolume,index,upDown){
    this.code = code;
    this.date = date;
    this.time = time;
    this.last = parseFloat(last);
    this.volume = parseInt(volume);
    this.totalVolume = parseInt(totalVolume);
    this.index = parseInt(index);
    this.upDown = parseFloat(upDown);
}