/**
 * Created by user on 2015/5/21
 */

var BrowserInfo = {
    createNew: function () {
        var bi = {};
        bi.param = {};
        bi.init = function () {
            bi.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
            bi.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
            bi.opera = /opera/.test(navigator.userAgent.toLowerCase());
            bi.msie = /msie/.test(navigator.userAgent.toLowerCase()) || !!navigator.userAgent.match(/Trident.*rv\:11\./);
            bi.lang = window.navigator.userLanguage || window.navigator.language;
            bi.initUrlParameter();
        };

        bi.initUrlParameter = function () {
            var sPageURL = window.location.search.substring(1);
            var sURLVariables = sPageURL.split('&');
            for (var i = 0; i < sURLVariables.length; i++) {
                var sParameterName = sURLVariables[i].split('=');
                bi.param[sParameterName[0]] = sParameterName[1];
            }
        };

        bi.getUrlParameter = function (sParam) {
            return bi.param[sParam];
        };

        bi.init();
        return bi;
    }
};

var WebSocketManager = {
    STATUS_CODE:{
        "1000":"1000:Normal Closure",
        "1001":"1001:Going Away",
        "1002":"1002:Protocol error",
        "1003":"1003:Unsupported Data",
        "1004":"1004:---Reserved----",
        "1005":"1005:No Status Rcvd",
        "1006":"1006:Abnormal Closure",
        "1007":"1007:Invalid frame payload data",
        "1008":"1008:Policy Violation",
        "1009":"1009:Message Too Big",
        "1010":"1010:Mandatory Ext.",
        "1011":"1011:Internal Server Error",
        "1015":"1015:TLS handshake"
    },
    createNew: function (host, name) {
        var wsm = {};
        wsm.host = host;
        wsm.name = name;
        wsm.websocket = undefined;
        wsm.closeCode = undefined;
        wsm.connect = function (host) {
            if (typeof(wsm.host) != "undefined") {
                try {
                    wsm.webSocket = new WebSocket(wsm.host);
                    wsm.dispatchState();//還未連線(readyState=0)
                    wsm.webSocket.addEventListener("open", wsm.onOpen, false);
                    wsm.webSocket.addEventListener("message", wsm.onMessage, false);
                    wsm.webSocket.addEventListener("close", wsm.onClose, false);
                    wsm.webSocket.addEventListener("error", wsm.onError, false);
                } catch (exception) {
                    wsm.addLog(exception);
                }
            } else {
                alert("host is undefined!");
            }
        };

        wsm.closeMsg = function () {
            return name+" WebSocket close:"+WebSocketManager.STATUS_CODE[wsm.closeCode];
        };

        wsm.onOpen = function (evt) {
            wsm.addLog("onOpen");
            wsm.dispatchState();//連線成功(readyState=1)
        };

        wsm.onClose = function (evt) {
            wsm.closeCode = evt.code;
            wsm.closeReason = evt.reason;
            wsm.dispatchState();//連線已關閉(readyState=3)
            wsm.addLog("close code=" + evt.code + ",reason=" + evt.reason);
        };

        wsm.onError = function (evt) {
            wsm.addLog("Error:" + evt);
        };

        wsm.onMessage = function (evt) {
            wsm.handleData(evt.data);
        };

        wsm.send = function (data) {
            try {
                wsm.addLog("send:" + data);
                wsm.webSocket.send(data);
            } catch (exception) {
                wsm.addLog(exception);
            }
        };

        wsm.close = function (evt) {
            wsm.addLog("User closes");
            try {
                wsm.webSocket.close(1000, "user close manually");
                wsm.dispatchState();//連線關閉中(readyState=2)
            } catch (exception) {
                wsm.addLog(exception);
            }
        };
        /**
         * 從Server端傳來的data
         */
        wsm.handleData = function (data) {
            wsm.addLog("receive:" + data);
            wsm.trigger("WebSocketDataEvent", [data]);
        };
        /**
         * 當前的狀態變動(readyState)
         */
        wsm.dispatchState = function () {
            wsm.trigger("WebSocketStateEvent", [wsm.webSocket.readyState]);
        };
        wsm.addLog = function (msg) {
            //log(msg);
            wsm.trigger("WebSocketLogEvent", [msg]);
        };

        wsm.trigger = function (evtName, parameters) {
            $(document).trigger(wsm.name + evtName, parameters);
        };

        wsm.onState = function (onStateFunction) {
            $(document).on(wsm.name + "WebSocketStateEvent", onStateFunction);
        };

        wsm.onData = function (onDataFunction) {
            $(document).on(wsm.name + "WebSocketDataEvent", onDataFunction);
        };
        return wsm;
    }
};

var JsonTool = {
    copy: function (a, b) {
        for (var k in a) {
            if (b.hasOwnProperty(k)) {
                a[k] = b[k];
            }
        }
    },
    length: function (obj) {
        var count = 0;
        for (var key in obj) {
            count++;
        }
        return count;
    },
    sortString: function (json, property, order) {
        json.sort(function (a, b) {
            if (order == "" || order == "asc") {
                return a[property].localeCompare(b[property]);
            } else {
                return b[property].localeCompare(a[property]);
            }
        });
    },
    sort: function (json, property, order) {
        json.sort(function (a, b) {
            if (order == "" || order == "asc") {
                return a[property] - b[property];
            } else {
                return b[property] - a[property];
            }
        });
    },
    isInt: function (n) {
        return Number(n) === n && n % 1 === 0;
    },
    formatFloat: function (num, pos) {
        var size = Math.pow(10, pos);
        return Math.round(num * size) / size;
    },
    random: function (min, max) {
        return Math.random() * (max - min) + min;
    },
    randomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    },
    numeralFormat: function (decimal) {
        var digit = "";
        for (var i = 0; i < decimal; i++) {
            digit += "0";
        }
        return "0,0." + digit;
    }
};

var DomTool = {
    /**
     * http://stackoverflow.com/questions/8034918/jquery-switch-elements-in-dom
     * pure dom element swap
     * @param elm1
     * @param elm2
     */
    swapElements: function (elm1, elm2) {
        var parent1, next1,
            parent2, next2;

        parent1 = elm1.parentNode;
        next1 = elm1.nextSibling;
        parent2 = elm2.parentNode;
        next2 = elm2.nextSibling;

        parent1.insertBefore(elm2, next1);
        parent2.insertBefore(elm1, next2);
    },
    appendCss: function (href) {
        $("head").append($("<link rel='stylesheet' type='text/css' href='" + href + "'>"));
    }
};

var SelectTool = {
    getTimeOptionHtml: function (value, text, selected) {
        if (value < 10)value = "0" + value;
        if (text < 10)text = "0" + text;
        return SelectTool.getOptionHtml(value, text, selected);
    },
    getOptionHtml: function (value, text, selected) {
        selected = (selected) ? "selected" : "";
        return "<option value='" + value + "' " + (selected || "") + ">" + text + "</option>";
    },
    generateTimeOptions: function (max) {
        var options = [];
        var text = "";
        for (var i = 0; i < max; i++) {
            text = (i < 10) ? "0" + i : i.toString();
            options.push({
                value: text,
                label: text
            });
        }
        return options;
    }
};

function log() {
    try {
        console.log.apply(console, arguments);
    } catch (e) {
    }
}
function logTime(msg) {
    try {
        console.time(msg);
    } catch (e) {
    }
}
function logTimeEnd(msg) {
    try {
        console.timeEnd(msg);
    } catch (e) {
    }
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
        || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

var browserInfo = BrowserInfo.createNew();
