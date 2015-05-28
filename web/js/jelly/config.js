/**
 * Created by user on 2015/5/21.
 */
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
    formatKChartData: function (c, kChartData) {
        var list = c.split("\r\n");
        var listCount = list.length;
        var propertyCount = config.kChartProperties.length;
        var row = [];
        var obj = {};
        for (var i = 0; i < listCount; i++) {
            if (list[i].length > 0) {
                row = list[i].split(",");
                obj = {};
                for (var j = 0; j < propertyCount; j++) {
                    obj[config.kChartProperties[j]] = row[j];
                }
                kChartData.push(obj);
            }
        }
    },
    kChartProperties: ["code", "date", "time", "open", "high", "low", "close", "volume"],
    futureList: [
        new Future("6ECC", "歐元期", 1.22,"060000","050000"),
        new Future("CLCC", "輕油期", 0.4,"060000","040000"),
        new Future("GCCC", "黃金期", 0.31,"060000","040000"),
        new Future("HSICC", "桓生期", 2.46,"091500","161500"),
        //new Future("IFCC", "滬深期", 0.26),
        new Future("NKCC", "日經期", 0.26,"074500","134500"),
        new Future("NQCC", "那斯達", 0.26,"060000","040000"),
        //new Future("SICC", "白銀期", 1.22),
        new Future("TECC", "電子期", 1.13,"084500","134500"),
        new Future("TFCC", "金融期", 1.74,"084500","134500"),
        new Future("TWCC", "摩台期", 1.2,"084500","134500"),
        //new Future("TWICC", "加權指", 1.22),
        new Future("TXCC", "台指期", 1.06,"084500","134500"),
        new Future("YMCC", "道瓊期", 0.25,"060000","050000")
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
    quoteBateCode: [
        [",", "bid6", "委買價6"],
        ["-", "bid7", "委買價7"],
        [".", "bid8", "委買價8"],
        ["/", "bid9", "委買價9"],
        ["0", "bid10", "委買價10"],
        ["1", "bidVolume6", "委買量6"],
        ["2", "bidVolume7", "委買量7"],
        ["3", "bidVolume8", "委買量8"],
        ["4", "bidVolume9", "委買量9"],
        ["5", "bidVolume10", "委買量10"],
        ["6", "ask6", "委賣價6"],
        ["7", "ask7", "委賣價7"],
        ["8", "ask8", "委賣價8"],
        ["9", "ask9", "委賣價9"],
        [":", "ask10", "委賣價10"],
        [";", "askVolume6", "委賣量6"],
        ["<", "askVolume7", "委賣量7"],
        [">", "askVolume8", "委賣量8"],
        ["?", "askVolume9", "委賣量9"],
        ["@", "askVolume10", "委賣量10"],
        ["A", "tickTime", "成交時間"],
        ["B", "scale", "小數點"],
        ["C", "last", "成交價"],
        ["D", "bid", "委買價"],
        ["E", "ask", "委賣價"],
        ["F", "totalVolume", "總量"],
        ["G", "high", "最高價"],
        ["H", "low", "最低價"],
        ["I", "open", "開盤價"],
        ["J", "close", "收價價"],
        ["K", "netChange", "於上一價漲跌"],
        ["L", "preClose", "昨收"],
        ["M", "oi", "未平倉量"],
        ["N", "upDown", "漲跌"],
        ["O", "upDownPercentage", "漲跌幅"],
        ["P", "volume", "單量"],
        ["Q", "quoteIndex", "報價索引"],
        ["R", "", ""],
        ["S", "type", "E=股票;W=權證;F=期貨;X=外匯;O=選擇權"],
        ["T", "status", "T=正常交易; P=暫停交易; O=零股交易; U=已下市; A=盤後交易;  R=盤前交易"],
        ["U", "settlementPrice", "結算價"],
        ["V", "highLimit", "漲停價"],
        ["W", "lowLimit", "跌停價"],
        ["X", "preDayVolume", "昨量"],
        ["Y", "volumePreW", "成交價量"],
        ["Z", "bidVolume", "委買量"],
        ["[", "askVolume", "委賣量"],
        ["\\", "tradeDate", "本交易日"],
        ["]", "expireDate", "期貨到期日"],
        ["^", "strikePrice", "履約價"],
        ["_", "chineseName", "中文名"],
        ["`", "quoteDate", "報價日期"],
        ["a", "bid2", "委買價2"],
        ["b", "bid3", "委買價3"],
        ["c", "bid4", "委買價4"],
        ["d", "bid5", "委買價5"],
        ["e", "bidVolume2", "委買量2"],
        ["f", "bidVolume3", "委買量3"],
        ["g", "bidVolume4", "委買量4"],
        ["h", "bidVolume5", "委買量5"],
        ["i", "ask2", "委賣價2"],
        ["j", "ask3", "委賣價3"],
        ["k", "ask4", "委賣價4"],
        ["l", "ask5", "委賣價5"],
        ["m", "askVolume2", "委賣量2"],
        ["n", "askVolume3", "委賣量3"],
        ["o", "askVolume4", "委賣量4"],
        ["p", "askVolume5", "委賣量4"],
        ["q", "monthCode", "月份碼"],
        ["r", "settlementDay", "結算日"]
    ],
    quoteBateCodeMap: {
        "key,": "bid6",
        "key-": "bid7",
        "key.": "bid8",
        "key/": "bid9",
        "key0": "bid10",
        "key1": "bidVolume6",
        "key2": "bidVolume7",
        "key3": "bidVolume8",
        "key4": "bidVolume9",
        "key5": "bidVolume10",
        "key6": "ask6",
        "key7": "ask7",
        "key8": "ask8",
        "key9": "ask9",
        "key:": "ask10",
        "key;": "askVolume6",
        "key<": "askVolume7",
        "key>": "askVolume8",
        "key?": "askVolume9",
        "key@": "askVolume10",
        "keyA": "tickTime",
        "keyB": "scale",
        "keyC": "last",
        "keyD": "bid",
        "keyE": "ask",
        "keyF": "totalVolume",
        "keyG": "high",
        "keyH": "low",
        "keyI": "open",
        "keyJ": "close",
        "keyK": "netChange",
        "keyL": "preClose",
        "keyM": "oi",
        "keyN": "upDown",
        "keyO": "upDownPercentage",
        "keyP": "volume",
        "keyQ": "quoteIndex",
        "keyR": "",
        "keyS": "type",
        "keyT": "status",
        "keyU": "settlementPrice",
        "keyV": "highLimit",
        "keyW": "lowLimit",
        "keyX": "preDayVolume",
        "keyY": "volumePreW",
        "keyZ": "bidVolume",
        "key[": "askVolume",
        "key\\": "tradeDate",
        "key]": "expireDate",
        "key^": "strikePrice",
        "key_": "chineseName",
        "key`": "quoteDate",
        "keya": "bid2",
        "keyb": "bid3",
        "keyc": "bid4",
        "keyd": "bid5",
        "keye": "bidVolume2",
        "keyf": "bidVolume3",
        "keyg": "bidVolume4",
        "keyh": "bidVolume5",
        "keyi": "ask2",
        "keyj": "ask3",
        "keyk": "ask4",
        "keyl": "ask5",
        "keym": "askVolume2",
        "keyn": "askVolume3",
        "keyo": "askVolume4",
        "keyp": "askVolume5",
        "keyq": "monthCode",
        "keyr": "settlementDay"
    }
};

function Future(code, name, limitPercentage, startTime, endTime) {
    this.code = code;
    this.name = name;
    this.limitPercentage = limitPercentage;
    this.startTime = startTime;
    this.endTime = endTime;
}