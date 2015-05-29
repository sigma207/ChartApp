/**
 * Created by user on 2015/5/29.
 */
var SessionWrapper = function (a, b) {
    this._core = a;
    this._stock = a.getStock();
    this._websocket = null;
    this._replied_telegrams = {};
    this._onmessage = this._onclose = this._onopen = this._caller = null;
    this._id = b
};
SessionWrapper.prototype = {
    run: function (a, b, c, d, e, f) {
        console.log("Start to connect to " + a);
        this._caller = b;
        this._onopen = c;
        this._onclose = d;
        this._onerror = e;
        this._onmessage = f;
        var g = this, h = this._websocket = new WebSocket(a);
        h.onopen = function () {
            SessionWrapper.prototype._onOpen.call(g)
        };
        h.onclose = function () {
            SessionWrapper.prototype._onClose.call(g)
        };
        h.onerror = function () {
            SessionWrapper.prototype._onError.call(g)
        };
        h.onmessage = function (a) {
            SessionWrapper.prototype._onMessage.call(g, a.data)
        };
        setTimeout(function () {
            g.isConnecting() &&
            (console.warn("Websocket closed because timeout."), h.close())
        }, 9E3)
    }, _onOpen: function () {
        console.log("WebSocket: session was opened.");
        this._onopen && this._onopen.call(this._caller, this._id)
    }, _onClose: function () {
        console.warn("WebSocket: session was closed.");
        this._onclose && this._onclose.call(this._caller, this._id)
    }, _onError: function () {
        console.warn("WebSocket: session has an error occurred.");
        this._onerror && this._onerror.call(this._caller, this._id)
    }, _onMessage: function (a) {
        var b = JSON.parse(a);
        if ("r" !==
            b.tp)
            if ("1" === b.zip) {
                a = b.c.replace(/\s/g, "");
                a = atob(a);
                a = pako.ungzip(a);
                a = new Uint8Array(a);
                a = new Blob([a]);
                var c = new FileReader, d = this;
                c.onload = function (a) {
                    b.c = JSON.parse(a.target.result);
                    d._onTelegram(b)
                };
                c.readAsText(a)
            } else
                b.c = JSON.parse(b.c), this._onTelegram(b)
    }, _onTelegram: function (a) {
        var b = a.mid, c = this._replied_telegrams;
        b in c && (c[b] = !0);
        this._onmessage && this._onmessage.call(this._caller, a)
    }, close: function () {
        this._websocket.close()
    }, send: function (a) {
        var b = a.mid;
        "" !== b && (this._replied_telegrams[b] = !1);
        a = JSON.stringify(a);
        try {
            this._websocket.send(a), console.log("session sent: " + a)
        } catch (c) {
            throw console.log("session went to send a json but failed."), c;
        }
    }, isTelegramReplied: function (a) {
        return this._replied_telegrams[a]
    }, isConnecting: function () {
        return this._websocket.readyState == WebSocket.CONNECTING
    }, isOpened: function () {
        return this._websocket.readyState == WebSocket.OPEN
    }, isClosing: function () {
        return this._websocket.readyState == WebSocket.CLOSING
    }, isClosed: function () {
        return this._websocket.readyState ==
            WebSocket.CLOSED
    }
};
var Utility = function () {
};
Utility.prototype.__anchor_time;
Utility.prototype.anchorProfile = function () {
    var a = Utility.prototype.__anchor_time;
    Utility.prototype.__anchor_time = performance.now();
    if (void 0 != a)
        return Utility.prototype.__anchor_time - a
};
Utility.prototype.newPage = function (a) {
    var b = document.createElement("a");
    b.href = a;
    b.target = "_blank";
    b.rel = "noreferrer";
    a = document.createEvent("MouseEvents");
    a.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 0, null);
    b.dispatchEvent(a)
};
Utility.prototype.registerEvent = function (a, b, c, d) {
    var e = function () {
        d.apply(c, arguments)
    };
    if (window.attachEvent) {
        if (a.attachEvent(b, e))
            return function () {
                a.detachEvent(b, e)
            }
    } else
        return b = b.replace(/^on/, ""), a.addEventListener(b, e, !1), function () {
            a.removeEventListener(b, e, !1)
        };
    return null
};
Utility.prototype.leadingZero = function (a, b) {
    return (Array(b).join(0) + a).slice(-b)
};
Utility.prototype.numberFormat = function (a) {
    return null == a ? null : (a + "").replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")
};
Utility.prototype.colorStringToArray = function (a) {
    return -1 != a.indexOf("rgba") ? Utility.prototype.rgbaStringToArray(a) : Utility.prototype.rgbStringToArray(a)
};
Utility.prototype.rgbStringToArray = function (a) {
    var b = [];
    a.replace(/rgb\((.*),(.*),(.*)\)/, function (a, d, e, f, g) {
        a = parseInt(d);
        e = parseInt(e);
        f = parseInt(f);
        b = b.concat([a, e, f])
    });
    return b
};
Utility.prototype.rgbaStringToArray = function (a) {
    var b = [];
    a.replace(/rgba\((.*),(.*),(.*),(.*)\)/, function (a, d, e, f, g) {
        a = parseInt(d);
        e = parseInt(e);
        f = parseInt(f);
        g = parseFloat(g);
        b = b.concat([a, e, f, g])
    });
    return b
};
Utility.prototype.rgbArrayToHexStr = function (a) {
    return "#" + Utility.prototype.leadingZero(a[0].toString(16), 2) + Utility.prototype.leadingZero(a[1].toString(16), 2) + Utility.prototype.leadingZero(a[2].toString(16), 2)
};
Utility.prototype.getContrastiveColor = function (a, b, c) {
    if (null == a)
        console.log("getContrastiveColor: arg of color is invalid.");
    else {
        var d = a.replace(/[^\d,]/g, "").split(",");
        a = 1 * d[0];
        var e = 1 * d[1], d = 1 * d[2];
        return c && 0 <= c && 1 >= c ? "rgba(" + Math.floor(128 > a ? a + (255 - a) * b : a - a * b) + "," + Math.floor(128 > e ? e + (255 - e) * b : e - e * b) + "," + Math.floor(128 > d ? d + (255 - d) * b : d - d * b) + "," + c + ")" : "rgb(" + Math.floor(128 > a ? a + (255 - a) * b : a - a * b) + "," + Math.floor(128 > e ? e + (255 - e) * b : e - e * b) + "," + Math.floor(128 > d ? d + (255 - d) * b : d - d * b) + ")"
    }
};
Utility.prototype.convertCoordFromDomToAreaPixelSpace = function (a, b, c) {
    for (var d = 0, e = 0, f = a; f; f = f.offsetParent)
        d += f.offsetLeft, e += f.offsetTop;
    return {
        relative_px: Math.floor(a.width / a.clientWidth * (b - d)),
        relative_py: Math.floor(a.height / a.clientHeight * (c - e))
    }
};
Utility.prototype.__requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame;
Utility.prototype.requestAnimationFrame = Utility.prototype.__requestAnimationFrame ? function (a) {
    return Utility.prototype.__requestAnimationFrame.call(window, a)
} : null;
Utility.prototype.enterFullscreen = function (a) {
    (a.requestFullscreen || a.webkitRequestFullscreen || a.webkitRequestFullScreen || a.oRequestFullscreen || a.mozRequestFullScreen || a.msRequestFullscreen).call(a)
};
Utility.prototype.exitFullscreen = function () {
    document.cancelFullScreen ? document.cancelFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen && document.webkitCancelFullScreen()
};
Utility.prototype.escapeJquerySelector = function (a) {
    if (null == a) {
        debugger;
        return null
    }
    return a.toString().replace(/(:|\.|\[|\])/g, "\\$1")
};
Utility.prototype.newCrossOriginXMLHttpRequest = function () {
    var a;
    XMLHttpRequest ? a = new XMLHttpRequest : XDomainRequest ? a = new XDomainRequest : ActiveXObject && (a = new ActiveXObject("Microsoft.XMLHTTP"));
    return a
};
Utility.prototype.getWeekOfDate = function (a) {
    var b = new Date(a.getFullYear(), 0, 1);
    return Math.ceil(((a - b) / 864E5 + b.getDay() + 1) / 7)
};
Utility.prototype.buildDate = function (a, b, c, d, e, f, g) {
    var h = Utility.prototype._buildDate(a, b, c, d, e, f, g, "T", "-", ":"), k = h.getTime();
    k !== k && (h = Utility.prototype._buildDate(a, b, c, d, e, f, g, " ", "/", ":"));
    k = h.getTime();
    if (k !== k)
        throw "Failed to build date.";
    return h
};
Utility.prototype._buildDate = function (a, b, c, d, e, f, g, h, k, l) {
    d = Utility.prototype.leadingZero(d, 2) + l + Utility.prototype.leadingZero(e, 2) + l + Utility.prototype.leadingZero(f, 2);
    a = a + k + Utility.prototype.leadingZero(b, 2) + k + Utility.prototype.leadingZero(c, 2) + h + d + g;
    return new Date(a)
};
Utility.prototype.getTimeStringFromDateWithTimezone = function (a, b) {
    var c = b.match(/([-+])(\d{2})(\d{2})/), d = c[1], e = parseInt(c[2]), c = parseInt(c[3]), e = 60 * e + c;
    "-" === d && (e *= -1);
    c = new Date(a.getTime() + 6E4 * e);
    d = Utility.prototype.leadingZero(c.getUTCHours(), 2);
    e = Utility.prototype.leadingZero(c.getUTCMinutes(), 2);
    c = Utility.prototype.leadingZero(c.getUTCSeconds(), 2);
    return d + ":" + e + ":" + c
};
Utility.prototype.isObjectEmpty = function (a) {
    for (var b in a)
        return !1;
    return !0
};
var TypedKTicks = function (a) {
    this._type = a;
    this._kticks = []
};
TypedKTicks.prototype.DATE_FORMAT_M = "yyyy/MM/01";
TypedKTicks.prototype.DATE_FORMAT_W = "yyyy/MM/dd";
TypedKTicks.prototype.DATE_FORMAT_D = "yyyy/MM/dd";
TypedKTicks.prototype.DATE_FORMAT_D = "yyyy/MM/dd";
TypedKTicks.prototype.transformTo = function (a) {
    if (0 == this._kticks.length)
        throw "empty ticks";
    var b = Core.prototype.KTYPE_DEFINITIONS[a];
    if (null == b || 0 == b.duration)
        throw "unsupported transform to type " + a;
    a = new TypedKTicks(a);
    var c = new KTick;
    c.time = new Date(0);
    for (var d in this._kticks)
        this._kticks[d].time.getTime() < c.time.getTime() + b.duration ? c.merge(this._kticks[d]) : (c = KTick.prototype.clone(this._kticks[d]), t = this._kticks[d].time.getTime(), c.time = new Date(t - t % b.duration), a._kticks.push(c));
    return a
};
TypedKTicks.prototype.insert = function (a) {
    Array.prototype.unshift.apply(this._kticks, a)
};
TypedKTicks.prototype.append = function (a) {
    for (var b in a)
        this._kticks.push(a[b])
};
TypedKTicks.prototype.getAll = function () {
    return this._kticks
};
TypedKTicks.prototype.getLast = function () {
    return this._kticks[this._kticks.length - 1]
};
TypedKTicks.prototype.onTickAdded = function (a) {
    var b = this._kticks[this._kticks.length - 1], c = this._getCorrespondingKTime(a);
    c > b.time.getTime() ? (a = KTick.prototype.create(new Date(c), a.getPrice(), a.getVolume()), this._kticks.push(a)) : c == b.time.getTime() && b.update(a.getPrice(), a.getVolume())
};
TypedKTicks.prototype._getCorrespondingKTime = function (a) {
    a = new Date(a.getTimestamp());
    if ("M" === this._type)
        return a = a.format("yyyy/MM/01"), (new Date(a)).getTime();
    if ("W" === this._type) {
        var b = a.getDay(), b = 0 == b ? 6 : b - 1;
        a = (new Date(a.getTime() - 864E5 * b)).format("yyyy/MM/dd");
        return (new Date(a)).getTime()
    }
    if ("D" === this._type)
        return a = a.format("yyyy/MM/dd"), (new Date(a)).getTime();
    if ("H" == this._type.charAt(0)) {
        var b = parseInt(this._type.substring(1)), c = a.getHours();
        a.setHours(c - c % b);
        a = a.format("yyyy/MM/dd hh:00:00");
        return (new Date(a)).getTime()
    }
    if ("m" == this._type.charAt(0))
        return b = parseInt(this._type.substring(1)), c = a.getMinutes(), a.setMinutes(c - c % b), a = a.format("yyyy/MM/dd hh:mm:00"), (new Date(a)).getTime()
};
var RunChart = function (a, b) {
    null == RunChart.prototype.PERCENTAGE_FORMAT && (RunChart.prototype.PERCENTAGE_FORMAT = new DecimalFormat("###.00"));
    this.wrapper_ = a;
    this.domCanvas_ = document.getElementById(b);
    this.ctx_ = this.domCanvas_.getContext("2d");
    this.caption_ = "";
    this.priceFormatter_ = null;
    this.tEnd_ = this.tBegin_ = this._timezone_offset_in_minutes = 0;
    this.mouseDown_ = this.mouseMoving_ = this.pixelsPerVolume_ = this.pixelsPerMinute_ = this.pixelsPerPrice_ = this.graphRight_ = this.graphLeft_ = this.scalerWidthRight_ = this.scalerWidthLeft_ =
        this.minuteVolHigh_ = this.priceLow_ = this.priceHigh_ = this.prevClose_ = null;
    this.bufferedCanvas_ = document.createElement("canvas");
    this.bufferedCanvas_.width = this.domCanvas_.width;
    this.bufferedCanvas_.height = this.domCanvas_.height;
    this.bufferedCtx_ = null;
    this.map_ = [];
    this.checkToInterpolateSetted = !1;
    Utility.prototype.registerEvent(this.domCanvas_, "mousemove", this, RunChart.prototype.mouseMove);
    Utility.prototype.registerEvent(this.domCanvas_, "mousedown", this, RunChart.prototype.mouseDown);
    Utility.prototype.registerEvent(this.domCanvas_,
        "mouseup", this, RunChart.prototype.mouseUp)
};
RunChart.prototype.HEIGHT_RATIO_PRICE = .7;
RunChart.prototype.HEIGHT_CAPTION = 26;
RunChart.prototype.HEIGHT_X_SCALE = 15;
RunChart.prototype.MARGIN_PRICE_BOTTOM = 7;
RunChart.prototype.MARGIN_VOLUME_TOP = 7;
RunChart.prototype.Y_AXIS_MIN_SCALE_GAP_PIXELS = 30;
RunChart.prototype.CAPTION_FONT = "18px Arial";
RunChart.prototype.CAPTION_ALIGN = "center";
RunChart.prototype.SCALE_FONT = "12px Arial";
RunChart.prototype.STYLE_RAISING = "#ff3333";
RunChart.prototype.STYLE_SHEDDING = "#33cc33";
RunChart.prototype.STYLE_UNCHANGED = "#aaaaaa";
RunChart.prototype.STYLE_VOLUME_SCALE = "#88CAFF";
RunChart.prototype.STYLE_TIME_SCALE = "#aaaaaa";
RunChart.prototype.STYLE_CROSS = "rgb( 128, 128, 128 )";
RunChart.prototype.STYLE_PREV_CLOSE = "rgba( 255, 0, 255, 0.6)";
RunChart.prototype.TIP_BG = "rgba(255,200,128,0.3)";
RunChart.prototype.TIP_FG = "rgba(255,255,255,0.7)";
RunChart.prototype.TIP_FONT_PRICE = "15px Arial bold";
RunChart.prototype.TIP_FONT_DATE = "12Px Arial";
RunChart.prototype.TIP_FONT_HL = "12Px Arial bold";
RunChart.prototype.TIP_ROW_HEIGHT = 30;
RunChart.prototype.PERCENTAGE_FORMAT = null;
RunChart.prototype.INTERPOLATE_INTERVAL = 400;
RunChart.prototype._getBackgroundColor = function () {
    return window.getComputedStyle(this.domCanvas_).backgroundColor
};
RunChart.prototype.setElementalData = function (a, b, c, d, e) {
    this.caption_ = a;
    this.priceFormatter_ = this._createPriceFormat(b);
    this.tBegin_ = c.getTime();
    this.tEnd_ = d.getTime();
    this.prevClose_ = parseFloat(e)
};
RunChart.prototype.getTimezoneOffsetInMinutes = function () {
    return this._timezone_offset_in_minutes
};
RunChart.prototype.setTimezoneOffsetInMinutes = function (a) {
    this._timezone_offset_in_minutes = a
};
RunChart.prototype.initTicks = function (a) {
    this.map_ = [];
    if (0 < a.length) {
        for (var b in a)
            this._isTimeInScope(a[b].timestamp_) && this._createMinuteTicksByInitTick(a[b]);
        this._onTicksUpdated()
    }
    if (!this.checkToInterpolateSetted) {
        this.checkToInterpolateSetted = !0;
        var c = this, d = -1, e = -1;
        window.setInterval(function () {
                if (null != c.mouseMoving_) {
                    var a = c._getElapseMinutesFromX(c.mouseMoving_.x);
                    if (d == a) {
                        if (a != e) {
                            var b = c.tBegin_ + 6E4 * a;
                            c._isTimeInScope(b) && (c.wrapper_.requestInterpolation(b, b + 6E4), e = a, d = -1)
                        }
                    } else
                        d = a
                }
            },
            RunChart.prototype.INTERPOLATE_INTERVAL)
    }
};
RunChart.prototype.interpolate = function (a) {
    if (0 >= a.length)
        console.log("ERROR: received empty interpolation");
    else if (this._isTimeInScope(a[0].getTimestamp())) {
        var b = this._getElapseMinutesFromTime(a[0].getTimestamp());
        this.map_[b] ? this.map_[b]._interpolate(a) : this._createMinuteTicksByInterpolatedTicks(a);
        this._onTicksUpdated()
    } else
        console.log("ERROR: received illegal interpolation, t: " + new Date(a[0].getTimestamp()))
};
RunChart.prototype.resizeAndPaint = function () {
    this.bufferedCanvas_.width = this.domCanvas_.width;
    this.bufferedCanvas_.height = this.domCanvas_.height;
    this._evalPaintingParams();
    this.repaint()
};
RunChart.prototype.repaint = function () {
    this.bufferedCtx_ = null;
    this._paint()
};
RunChart.prototype.mouseMove = function (a) {
    a = this._getPositionInCanvas(a);
    this.mouseMoving_ = null;
    a.y > RunChart.prototype.HEIGHT_CAPTION && a.y < this.domCanvas_.height - RunChart.prototype.HEIGHT_X_SCALE && (a.elapseMinutes = this._getElapseMinutesFromX(a.x), this.mouseMoving_ = a, this.mouseDown_ && (this.mouseDown_ = this.mouseMoving_));
    this._paint()
};
RunChart.prototype.mouseDown = function (a) {
    a = this._getPositionInCanvas(a);
    this.mouseDown_ = null;
    a.y > RunChart.prototype.HEIGHT_CAPTION && a.y < this.domCanvas_.height - RunChart.prototype.HEIGHT_X_SCALE && (a.elapseMinutes = this._getElapseMinutesFromX(a.x), this.map_[a.elapseMinutes] && (this.mouseDown_ = a));
    this._paint()
};
RunChart.prototype.mouseUp = function (a) {
    this.mouseDown_ && (this.mouseDown_ = null, this._paint())
};
RunChart.prototype._onTicksUpdated = function () {
    this._evalPaintingParams();
    this.repaint()
};
RunChart.prototype._paint = function () {
    0 !== this.domCanvas_.width && 0 !== this.domCanvas_.height && 0 !== this.bufferedCanvas_.width && 0 !== this.bufferedCanvas_.height && (this.bufferedCtx_ || this._paintToBuffer(), this.ctx_.clearRect(0, 0, this.domCanvas_.width, this.domCanvas_.height), this.ctx_.drawImage(this.bufferedCanvas_, 0, 0), this.ctx_.translate(.5, .5), this._paintMouseMoving(), this._paintMouseDown(), this.ctx_.translate(-.5, -.5))
};
RunChart.prototype._paintToBuffer = function () {
    this.bufferedCtx_ = this.bufferedCanvas_.getContext("2d");
    this.bufferedCtx_.clearRect(0, 0, this.domCanvas_.width, this.domCanvas_.height);
    null != this.priceFormatter_ && (this.bufferedCtx_.translate(.5, .5), this._paintCaption(this.bufferedCtx_), this._paintScaleAndGrids(this.bufferedCtx_), 0 < this.map_.length && (this._paintPrices(this.bufferedCtx_), this._paintVolume(this.bufferedCtx_)), this.bufferedCtx_.translate(-.5, -.5))
};
RunChart.prototype._paintCaption = function (a) {
    a.font = RunChart.prototype.CAPTION_FONT;
    a.textAlign = RunChart.prototype.CAPTION_ALIGN;
    a.textBaseline = "middle";
    a.fillStyle = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), .8);
    a.fillText(this.caption_, this.domCanvas_.width / 2, RunChart.prototype.HEIGHT_CAPTION / 2)
};
RunChart.prototype._paintScaleAndGrids = function (a) {
    a.font = RunChart.prototype.SCALE_FONT;
    a.textAlign = "right";
    a.textBaseline = "middle";
    a.strokeStyle = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), .25);
    var b = RunChart.prototype.HEIGHT_CAPTION, c = this.domCanvas_.height - RunChart.prototype.HEIGHT_X_SCALE;
    a.beginPath();
    a.rect(this.graphLeft_, b, this.graphRight_ - this.graphLeft_, c - b);
    a.stroke();
    if (!(Infinity == this.pixelsPerPrice_ || 0 >= this.pixelsPerPrice_)) {
        a.beginPath();
        var d = Math.floor((this.domCanvas_.height - 2 * RunChart.prototype.MARGIN_PRICE_BOTTOM) / 2 / 50), e = (this.domCanvas_.height - 2 * RunChart.prototype.MARGIN_PRICE_BOTTOM) / 2 / d, d = e / this.pixelsPerPrice_;
        this._paintSinglePriceScale(a, this.priceHigh_);
        this._paintSinglePriceScale(a, this.priceLow_);
        this._paintSinglePriceScale(a, this.prevClose_);
        for (var f = this.prevClose_ + d; f < this.priceHigh_; f += d)
            this._paintSinglePriceScale(a, f);
        for (f = this.prevClose_ - d; f > this.priceLow_; f -= d)
            this._paintSinglePriceScale(a, f);
        a.stroke();
        a.beginPath();
        d = Math.floor(this._areaHeightVolume() /
        25);
        e = this._areaHeightVolume() / d;
        for (f = d = this.domCanvas_.height * RunChart.prototype.HEIGHT_RATIO_PRICE + RunChart.prototype.MARGIN_VOLUME_TOP; f < this.domCanvas_.height - RunChart.prototype.HEIGHT_X_SCALE;) {
            var g = this._getVolumeFromY(f);
            0 < g && this._paintSingleVolumeScale(a, g);
            f += e
        }
        a.stroke();
        e = this._getYFromPrice(this.priceLow_);
        a.font = RunChart.prototype.SCALE_FONT;
        a.textAlign = "center";
        a.textBaseline = "bottom";
        a.fillStyle = RunChart.prototype.STYLE_TIME_SCALE;
        a.beginPath();
        for (var f = this.domCanvas_.height, h =
            -1, g = new Date(this.tBegin_); g.getTime() <= this.tEnd_; g.setHours(g.getHours() + 1)) {
            var k = Math.floor(this.graphLeft_ + (this.graphRight_ - this.graphLeft_) * (g.getTime() - this.tBegin_) / (this.tEnd_ - this.tBegin_));
            k > h && (h = g.formatWithTimezoneOffsetInMinutes("hh:mm", this._timezone_offset_in_minutes), a.fillText(h, k, f), h = k + a.measureText(h).width, a.moveTo(k, b), a.lineTo(k, e), a.moveTo(k, d), a.lineTo(k, c))
        }
        a.stroke();
        a.beginPath();
        a.strokeStyle = RunChart.prototype.STYLE_PREV_CLOSE;
        f = this._getYFromPrice(this.prevClose_);
        a.moveTo(this.graphLeft_, f);
        a.lineTo(this.graphRight_, f);
        a.stroke()
    }
};
RunChart.prototype._paintPrices = function (a) {
    var b = null, c = null, d = this.map_, e;
    for (e in d)
        for (var f = d[e].ticks_, g = f.length, h = 0; h < g; ++h) {
            var k = f[h], l = this._getXOfTick(k), k = this._getYFromPrice(k.getPrice());
            null != b && this._drawLine(a, b, c, l, k);
            b = l;
            c = k
        }
};
RunChart.prototype._paintVolume = function (a) {
    var b = this._getYFromVolume(0), c = this.map_, d = RunChart.prototype.STYLE_RAISING, e = RunChart.prototype.STYLE_SHEDDING, f = this.pixelsPerMinute_, g = this.graphLeft_, h, k, l;
    for (l in c)
        k = c[l], a.fillStyle = 0 <= k.fluctuation_ ? d : e, h = g + k.elapseMinutes_ * f, k = this._getYFromVolume(k.volume_), a.fillRect(h, k, f, b - k)
};
RunChart.prototype._paintSinglePriceScale = function (a, b) {
    var c = this._getYFromPrice(b);
    a.fillStyle = b > this.prevClose_ ? RunChart.prototype.STYLE_RAISING : b < this.prevClose_ ? RunChart.prototype.STYLE_SHEDDING : RunChart.prototype.STYLE_UNCHANGED;
    a.fillText(this.priceFormatter_.format(b), this.scalerWidthLeft_, c);
    var d = (b >= this.prevClose_ ? "+" : "") + RunChart.prototype.PERCENTAGE_FORMAT.format((b - this.prevClose_) / this.prevClose_ * 100) + "%";
    a.fillText(d, this.domCanvas_.width, c);
    a.moveTo(this.graphLeft_, c);
    a.lineTo(this.graphRight_,
        c)
};
RunChart.prototype._paintSingleVolumeScale = function (a, b) {
    var c = this._getYFromVolume(b);
    a.fillStyle = RunChart.prototype.STYLE_VOLUME_SCALE;
    a.fillText(b, this.scalerWidthLeft_, c);
    if (b != this.minuteVolHigh_) {
        var d = RunChart.prototype.PERCENTAGE_FORMAT.format(100 * b / this.minuteVolHigh_) + "%";
        a.fillText(d, this.domCanvas_.width, c)
    }
    a.moveTo(this.graphLeft_, c);
    a.lineTo(this.graphRight_, c)
};
RunChart.prototype._drawLine = function (a, b, c, d, e) {
    a.beginPath();
    a.strokeStyle = e == c ? RunChart.prototype.STYLE_UNCHANGED : e < c ? RunChart.prototype.STYLE_RAISING : RunChart.prototype.STYLE_SHEDDING;
    a.lineWidth = 1;
    a.moveTo(b, c);
    a.lineTo(d, e);
    a.stroke()
};
RunChart.prototype._paintMouseMoving = function () {
    if (this.mouseMoving_ && !(this.mouseMoving_.x <= this.graphLeft_ || this.mouseMoving_.x >= this.graphRight_)) {
        this.ctx_.beginPath();
        this.ctx_.strokeStyle = RunChart.prototype.STYLE_CROSS;
        this.ctx_.moveTo(this.graphLeft_, this.mouseMoving_.y);
        this.ctx_.lineTo(this.graphRight_, this.mouseMoving_.y);
        this.ctx_.moveTo(this.mouseMoving_.x, RunChart.prototype.HEIGHT_CAPTION);
        this.ctx_.lineTo(this.mouseMoving_.x, this.domCanvas_.height - RunChart.prototype.HEIGHT_X_SCALE);
        this.ctx_.stroke();
        var a = this.map_[this.mouseMoving_.elapseMinutes];
        if (a) {
            this.ctx_.save();
            var b = a.ticks_.length, c = Math.floor((this.domCanvas_.height - RunChart.prototype.HEIGHT_CAPTION - RunChart.prototype.HEIGHT_X_SCALE - 10) / RunChart.prototype.TIP_ROW_HEIGHT), b = b > c ? c : b, d = 0;
            this.ctx_.font = RunChart.prototype.TIP_FONT_PRICE;
            for (c = 0; c < b; ++c) {
                var e = a.ticks_[c];
                e.tip = e.getPriceString() + " - " + e.getVolume();
                var f = this.ctx_.measureText(e.getPriceString() + " - " + e.getVolume()).width;
                f > d && (d = f)
            }
            c = d + 10;
            e = b * RunChart.prototype.TIP_ROW_HEIGHT +
            10;
            d = this.mouseMoving_.x < this.domCanvas_.width / 2 ? this.graphRight_ - c : this.graphLeft_;
            f = RunChart.prototype.HEIGHT_CAPTION;
            this.ctx_.shadowColor = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), .75, .75);
            this.ctx_.shadowBlur = 15;
            this.ctx_.shadowOffsetX = 0;
            this.ctx_.shadowOffsetY = 0;
            this.ctx_.fillStyle = RunChart.prototype.TIP_BG;
            this.ctx_.fillRect(d, f, c, e);
            this.ctx_.fillStyle = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), 1);
            this.ctx_.textAlign = "left";
            this.ctx_.textBaseline =
                "top";
            this.ctx_.shadowColor = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), .3);
            this.ctx_.shadowBlur = 1;
            this.ctx_.shadowOffsetX = 0;
            this.ctx_.shadowOffsetY = 1;
            for (c = 0; c < b; ++c) {
                var g = f + c * RunChart.prototype.TIP_ROW_HEIGHT, e = a.ticks_[c], h = d + 5;
                this.ctx_.font = RunChart.prototype.TIP_FONT_PRICE;
                this.ctx_.fillText(e.getPriceString() + " - " + e.getVolume(), h, g + 5);
                this.ctx_.font = RunChart.prototype.TIP_FONT_DATE;
                this.ctx_.fillText(e.getTimeString(), h, g + 5 + 14)
            }
            this.ctx_.restore()
        }
    }
};
RunChart.prototype._paintMouseDown = function () {
    if (this.mouseDown_) {
        var a = this.map_[this.mouseDown_.elapseMinutes];
        if (a) {
            this.ctx_.font = RunChart.prototype.TIP_FONT_HL;
            var b = this.priceFormatter_.format(a.high_), c = this.priceFormatter_.format(a.low_), d = this.ctx_.measureText(b).width + 10, e = this.mouseDown_.x - d / 2, f = this._getYFromPrice(a.high_) - 20, a = this._getYFromPrice(a.low_) + 2, g = f - 15, h = a + 15;
            0 > g && (f += -g, g = 0);
            this.ctx_.fillStyle = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), 1, .6);
            this.ctx_.fillRoundedRect(e,
                f, d, 15, 5);
            this.ctx_.fillRoundedRect(e, a, d, 15, 5);
            this.ctx_.fillRoundedRect(e, g, d, 15, 5);
            this.ctx_.fillRoundedRect(e, h, d, 15, 5);
            this.ctx_.textAlign = "center";
            this.ctx_.textBaseline = "top";
            this.ctx_.fillStyle = Utility.prototype.getContrastiveColor(this._getBackgroundColor(), 0);
            this.ctx_.fillText(b, this.mouseDown_.x, f);
            this.ctx_.fillText(c, this.mouseDown_.x, a);
            this.ctx_.fillText(this.priceFormatter_.format(this.priceHigh_), this.mouseDown_.x, g);
            this.ctx_.fillText(this.priceFormatter_.format(this.priceLow_),
                this.mouseDown_.x, h)
        }
    }
};
RunChart.prototype._getXOfTick = function (a) {
    a = (a.getTimestamp() - this.tBegin_) / 6E4;
    return this.graphLeft_ + a * this.pixelsPerMinute_
};
RunChart.prototype._getXFromElapseMinutes = function (a) {
    return this.graphLeft_ + a * this.pixelsPerMinute_
};
RunChart.prototype._getElapseMinutesFromX = function (a) {
    return Math.floor((a - this.graphLeft_) / this.pixelsPerMinute_)
};
RunChart.prototype._getElapseMinutesFromTime = function (a) {
    return Math.floor((a - this.tBegin_) / 60 / 1E3)
};
RunChart.prototype._getYFromPrice = function (a) {
    return Math.floor(RunChart.prototype.HEIGHT_CAPTION + (this.priceHigh_ - a) * this.pixelsPerPrice_)
};
RunChart.prototype._getYFromVolume = function (a) {
    return Math.floor(this.domCanvas_.height * RunChart.prototype.HEIGHT_RATIO_PRICE + RunChart.prototype.MARGIN_VOLUME_TOP + (this.minuteVolHigh_ - a) * this.pixelsPerVolume_)
};
RunChart.prototype._getVolumeFromY = function (a) {
    return Math.round(this.minuteVolHigh_ - (a - this.domCanvas_.height * RunChart.prototype.HEIGHT_RATIO_PRICE - RunChart.prototype.MARGIN_VOLUME_TOP) / this.pixelsPerVolume_)
};
RunChart.prototype._areaHeightPrice = function () {
    return this.domCanvas_.height * RunChart.prototype.HEIGHT_RATIO_PRICE - RunChart.prototype.HEIGHT_CAPTION - RunChart.prototype.MARGIN_PRICE_BOTTOM
};
RunChart.prototype._areaHeightVolume = function () {
    return this.domCanvas_.height * (1 - RunChart.prototype.HEIGHT_RATIO_PRICE) - RunChart.prototype.MARGIN_VOLUME_TOP - RunChart.prototype.HEIGHT_X_SCALE
};
RunChart.prototype._createPriceFormat = function (a) {
    for (var b = "#,###,###,##0.", c = 0; c < a; ++c)
        b += "0";
    return new DecimalFormat(b)
};
RunChart.prototype._getPositionInCanvas = function (a) {
    return {
        x: a.clientX - this.domCanvas_.getBoundingClientRect().left,
        y: a.clientY - this.domCanvas_.getBoundingClientRect().top
    }
};
RunChart.prototype._isTimeInScope = function (a) {
    return a >= this.tBegin_ && a < this.tEnd_
};
RunChart.prototype._evalPaintingParams = function () {
    this.ctx_.font = RunChart.prototype.SCALE_FONT;
    null == this.prevClose_ && (this.prevClose_ = 0);
    this.scalerWidthLeft_ = 0;
    this.scalerWidthRight_ = this.ctx_.measureText("+0.00%").width;
    this.priceHigh_ = 0;
    this.priceLow_ = Number.POSITIVE_INFINITY;
    this.minuteVolHigh_ = 0;
    var a = null, b = this.map_, c;
    for (c in b) {
        var d = b[c];
        d.fluctuation_ = null == a ? 0 : d.volume_ - a;
        a = d.volume_;
        d.high_ > this.priceHigh_ && (this.priceHigh_ = d.high_);
        d.low_ < this.priceLow_ && (this.priceLow_ = d.low_);
        d.volume_ >
        this.minuteVolHigh_ && (this.minuteVolHigh_ = d.volume_);
        d = d._findMaxPriceWidth(this.ctx_);
        d > this.scalerWidthLeft_ && (this.scalerWidthLeft_ = d)
    }
    a = this.ctx_.measureText("" + this.minuteVolHigh_).width;
    a > this.scalerWidthLeft_ && (this.scalerWidthLeft_ = a);
    a = 1.2 * Math.max(this.priceHigh_ - this.prevClose_, this.prevClose_ - this.priceLow_);
    0 >= a && (a = 0);
    this.priceHigh_ = this.prevClose_ + a;
    this.priceLow_ = this.prevClose_ - a;
    this.pixelsPerPrice_ = this._areaHeightPrice() / (this.priceHigh_ - this.priceLow_);
    this.pixelsPerVolume_ =
        this._areaHeightVolume() / this.minuteVolHigh_;
    this.graphLeft_ = this.scalerWidthLeft_ + 4;
    this.graphRight_ = this.domCanvas_.width - this.scalerWidthRight_ - 4;
    this.pixelsPerMinute_ = (this.graphRight_ - this.graphLeft_) / ((this.tEnd_ - this.tBegin_) / 60 / 1E3)
};
RunChart.prototype._createMinuteTicksByInitTick = function (a) {
    var b = new _MinuteTicks(this);
    b.elapseMinutes_ = this._getElapseMinutesFromTime(a.getTimestamp());
    var c = [], d = Math.floor(Math.random() * a.getVolume()), e = a.getVolume() - d;
    c.push(new Tick(-1, a.getPriceOpen(), this.priceFormatter_.format(a.getPriceOpen()), d, a.getTimestamp(), (new Date(a.getTimestamp())).formatWithTimezoneOffsetInMinutes("hh:mm", this._timezone_offset_in_minutes)));
    c.push(new Tick(-1, a.getPriceClose(), this.priceFormatter_.format(a.getPriceClose()),
        e, a.getTimestamp() + 59999, (new Date(a.getTimestamp() + 59999)).formatWithTimezoneOffsetInMinutes("hh:mm", this._timezone_offset_in_minutes)));
    b._interpolate(c);
    this.map_[b.elapseMinutes_] = b
};
RunChart.prototype._createMinuteTicksByInterpolatedTicks = function (a) {
    console.log("----- to create a _MinuteTicks by interpolation");
    var b = new _MinuteTicks(this);
    b.elapseMinutes_ = this._getElapseMinutesFromTime(a[0].getTimestamp());
    b._interpolate(a);
    this.map_[b.elapseMinutes_] = b
};
var _MinuteTicks = function (a) {
    this.runChart_ = a;
    this.elapseMinutes_ = -1;
    this.volume_ = 0;
    this.ticks_ = [];
    this.high_ = 0;
    this.low_ = Number.POSITIVE_INFINITY;
    this.fluctuation_ = 0
};
_MinuteTicks.prototype._interpolate = function (a) {
    this.ticks_ = [];
    this.high_ = this.volume_ = 0;
    this.low_ = Number.POSITIVE_INFINITY;
    for (var b in a)
        this.runChart_._getElapseMinutesFromTime(a[b].getTimestamp()) == this.elapseMinutes_ && (a[b].getPrice() > this.high_ && (this.high_ = a[b].getPrice()), a[b].getPrice() < this.low_ && (this.low_ = a[b].getPrice()), this.ticks_.push(a[b]), this.volume_ += parseFloat(a[b].getVolume()))
};
_MinuteTicks.prototype._findMaxPriceWidth = function (a) {
    var b = 0, c;
    for (c in this.ticks_) {
        var d = a.measureText(this.ticks_[c].getPriceString()).width;
        d > b && (b = d)
    }
    return b
};
var RunChartInitTick = function (a, b, c, d) {
    this.timestamp_ = a;
    this.priceOpen_ = b;
    this.priceClose_ = c;
    this.volume_ = d
};
RunChartInitTick.prototype.getTimestamp = function () {
    return this.timestamp_
};
RunChartInitTick.prototype.getPriceOpen = function () {
    return this.priceOpen_
};
RunChartInitTick.prototype.getPriceClose = function () {
    return this.priceClose_
};
RunChartInitTick.prototype.getVolume = function () {
    return this.volume_
};
var Tick = function (a, b, c, d, e, f, g) {
    this._index = a;
    this._price = b;
    this._price_string = c;
    this._volume = d;
    this._timestamp = e;
    this._timeString = null != f ? f : (new Date(e)).format("hh:mm:ss")
};
Tick.prototype.getIndex = function () {
    return this._index
};
Tick.prototype.getPriceString = function () {
    return this._price_string
};
Tick.prototype.getPrice = function () {
    return this._price
};
Tick.prototype.getVolume = function () {
    return this._volume
};
Tick.prototype.getTimestamp = function () {
    return this._timestamp
};
Tick.prototype.getTimeString = function () {
    return this._timeString
};
Tick.prototype.clone = function () {
    return new Tick(this._index, this._price, this._price_string, this._volume, this._timestamp, this._timeString)
};
var VolTriangle = function (a) {
    this._dom_canvas = document.getElementById(a);
    this._ctx = this._dom_canvas.getContext("2d");
    this._vol_buy;
    this._vol_sell
};
VolTriangle.prototype.setVols = function (a, b) {
    this._vol_buy = a;
    this._vol_sell = b;
    this.paint()
};
VolTriangle.prototype.paint = function () {
    var a = this._dom_canvas.width / (this._vol_buy + this._vol_sell);
    if (Infinity !== a && a === a) {
        var b = this._dom_canvas.width, c = this._dom_canvas.height, a = this._vol_sell * a;
        this._ctx.clearRect(0, 0, b, c);
        this._ctx.beginPath();
        this._ctx.moveTo(a, 0);
        this._ctx.lineTo(0, c);
        this._ctx.lineTo(a, c);
        this._ctx.closePath();
        var d = this._ctx.createLinearGradient(a, 0, a, 1.5 * c);
        d.addColorStop(0, "#330000");
        d.addColorStop(1, "#ff0000");
        this._ctx.fillStyle = d;
        this._ctx.fill();
        this._ctx.beginPath();
        this._ctx.moveTo(a, 0);
        this._ctx.lineTo(a, c);
        this._ctx.lineTo(b, c);
        this._ctx.closePath();
        d = this._ctx.createLinearGradient(a, 0, a, 1.5 * c);
        d.addColorStop(0, "#003300");
        d.addColorStop(1, "#00cc00");
        this._ctx.fillStyle = d;
        this._ctx.fill()
    }
};
var TelegramFactory = function () {
    this._all_msgs = {};
    this._msg_serial_number = 0;
    this._encrypt_content = this._gzip_content = !1
};
TelegramFactory.prototype._generateTelegramFullParams = function (a, b, c, d, e) {
    var f = this._msg_serial_number++;
    return this._all_msgs[f] = {srv: a, tr: b, tp: "r", zip: c ? "1" : "0", encrypt: d ? "1" : "0", mid: f, c: e}
};
TelegramFactory.prototype._generateTelegramFullParamsUSER = function (a, b, c, d, e) {
    var f = this._msg_serial_number++;
    return this._all_msgs[f] = {
        srv: "USER",
        tr: a,
        tp: "r",
        zip: b ? "1" : "0",
        encrypt: c ? "1" : "0",
        mid: f,
        lid: d,
        c: e
    }
};
TelegramFactory.prototype._generateTelegramFullParamsQUERY = function (a, b, c, d, e) {
    var f = this._msg_serial_number++;
    return this._all_msgs[f] = {
        srv: "QUERY",
        tr: a,
        tp: "r",
        zip: b ? "1" : "0",
        encrypt: c ? "1" : "0",
        mid: f,
        lid: d,
        c: e
    }
};
TelegramFactory.prototype._generateTelegramFullParamsOrder = function (a, b, c, d, e) {
    var f = this._msg_serial_number++;
    return this._all_msgs[f] = {
        srv: "ORDER",
        tr: a,
        tp: "r",
        zip: b ? "1" : "0",
        encrypt: c ? "1" : "0",
        mid: f,
        lid: d,
        c: e
    }
};
TelegramFactory.prototype._generateTelegram = function (a, b, c) {
    return this._generateTelegramFullParams(a, b, this._gzip_content, this._encrypt_content, c)
};
TelegramFactory.prototype.generateTelegramUSER = function (a, b, c) {
    for (var d in c)
        null == c[d] && (c[d] = "");
    return this._generateTelegramFullParamsUSER(a, this._gzip_content, this._encrypt_content, b, c.join(","))
};
TelegramFactory.prototype.generateTelegramQUERY = function (a, b, c) {
    for (var d in c)
        null == c[d] && (c[d] = "");
    return this._generateTelegramFullParamsQUERY(a, this._gzip_content, this._encrypt_content, b, c.join(","))
};
TelegramFactory.prototype.generateTelegramORDER = function (a, b, c) {
    for (var d in c)
        null == c[d] && (c[d] = "");
    return this._generateTelegramFullParamsOrder(a, this._gzip_content, this._encrypt_content, b, c.join(","))
};
TelegramFactory.prototype.convertInstrumentFullId = function (a) {
    return a.replace(":", "|")
};
TelegramFactory.prototype.convertInstrumentFullIdList = function (a) {
    var b = [], c;
    for (c in a)
        b.push(a[c].replace(":", "|"));
    return b
};
TelegramFactory.prototype.requestToLogin = function (a, b, c) {
    return this._generateTelegram("USER", "9001", {id: a, key: b, v: c})
};
TelegramFactory.prototype.requestToLogout = function (a, b) {
    return this._generateTelegram("USER", "9002", {id: a, key: b})
};
TelegramFactory.prototype.requestToSendHeartbeat = function (a) {
    var b = a.getUTCFullYear().toString(), c = a.getUTCMonth().toString(), d = a.getUTCDate().toString(), e = a.getUTCHours().toString(), f = a.getUTCMinutes().toString(), g = a.getUTCSeconds().toString();
    a = a.getUTCMilliseconds().toString();
    1 === b.length && (b = "0" + b);
    1 === c.length && (c = "0" + c);
    1 === d.length && (d = "0" + d);
    1 === e.length && (e = "0" + e);
    1 === f.length && (f = "0" + f);
    1 === g.length && (g = "0" + g);
    1 === a.length ? a = "00" + a : 2 === a.length && (a = "0" + a);
    return this._generateTelegram("SYSTEM",
        "9999", {t: b + c + d + e + f + g + a})
};
TelegramFactory.prototype.requestToGetTickByPeriod = function (a, b, c, d, e) {
    return this._generateTelegram("TICK", "1001", {ex: a, id: b, td: c, bt: d, et: e})
};
TelegramFactory.prototype.requestToGetTradeDateNewestTick = function (a, b, c, d) {
    return this._generateTelegram("TICK", "1011", {ex: a, id: b, td: c, nt: d})
};
TelegramFactory.prototype.requestToGetTradeDateNewestTickByTickIndex = function (a, b, c, d, e) {
    return this._generateTelegram("TICK", "1012", {ex: a, id: b, td: c, idx: d, nt: e})
};
TelegramFactory.prototype.requestToGetMinuteTickOfToday = function (a, b, c, d, e) {
    return this._generateTelegram("TICK", "1002", {ex: a, id: b, tp: c, td: d, nt: e})
};
TelegramFactory.prototype.requestToGetMinuteTickOfHistory = function (a, b, c, d, e) {
    return this._generateTelegram("TICK", "1003", {ex: a, id: b, tp: c, td: d, nt: e})
};
TelegramFactory.prototype.requestToGetLongPeriodTickOfHistory = function (a, b, c, d, e) {
    return this._generateTelegram("TICK", "1004", {ex: a, id: b, tp: c, td: d, nt: e})
};
TelegramFactory.prototype.requestToGetPriceVolumeData = function (a, b, c) {
    return this._generateTelegram("TICK", "2003", {ex: a, id: b, td: c})
};
TelegramFactory.prototype.requestToRegisterPriceVolumeData = function (a) {
    a = {es: this.convertInstrumentFullId(a)};
    return this._generateTelegram("TICK", "2001", a)
};
TelegramFactory.prototype.requestToUnregisterPriceVolumeData = function (a) {
    a = {es: this.convertInstrumentFullId(a)};
    return this._generateTelegram("TICK", "2002", a)
};
TelegramFactory.prototype.requestToGetTradeDayInstrumentSituations = function (a) {
    a = {es: this.convertInstrumentFullId(a)};
    return this._generateTelegram("QUOTE", "5003", a)
};
TelegramFactory.prototype.requestToRegisterInstrument = function (a, b, c, d) {
    var e = [];
    b && e.push("RT");
    c && e.push("RQ");
    d && e.push("RB");
    a = {tp: e.join(","), es: this.convertInstrumentFullId(a)};
    return this._generateTelegram("QUOTE", "5001", a)
};
TelegramFactory.prototype.requestToUnregisterInstrument = function (a, b, c, d) {
    var e = [];
    b && e.push("RT");
    c && e.push("RQ");
    d && e.push("RB");
    a = {tp: e.join(","), es: this.convertInstrumentFullId(a)};
    return this._generateTelegram("QUOTE", "5002", a)
};
TelegramFactory.prototype.genTelegramLogin = function (a, b) {
    return this.generateTelegramUSER("2001", a, b)
};
TelegramFactory.prototype.genTelegramGetSubAccounts = function (a, b) {
    return this.generateTelegramQUERY("2010", a, b)
};
TelegramFactory.prototype.genTelegramGetStatement = function (a, b) {
    return this.generateTelegramQUERY("2011", a, b)
};
TelegramFactory.prototype.genTelegramGetOrders = function (a, b) {
    return this.generateTelegramQUERY("2012", a, b)
};
TelegramFactory.prototype.getTelegramGetTickets = function (a, b) {
    return this.generateTelegramQUERY("2014", a, b)
};
TelegramFactory.prototype.genTelegramGetAccountSettings = function (a, b) {
    return this.generateTelegramQUERY("2015", a, b)
};
TelegramFactory.prototype.genTelegramGetAccountSymbols = function (a, b) {
    return this.generateTelegramQUERY("2016", a, b)
};
TelegramFactory.prototype.genTelegramGetBankbook = function (a, b) {
    return this.generateTelegramQUERY("2018", a, b)
};
TelegramFactory.prototype.genTelegramGetServerTime = function (a) {
    return this.generateTelegramQUERY("2019", a, [])
};
TelegramFactory.prototype.genTelegramGetActiveSymbols = function (a, b) {
    return this.generateTelegramQUERY("2025", a, b)
};
TelegramFactory.prototype.genTelegramToPlaceOrder = function (a, b) {
    return this.generateTelegramORDER("3001", a, b)
};
TelegramFactory.prototype.genTelegramToModifyOrder = function (a, b) {
    return this.generateTelegramORDER("3002", a, b)
};
TelegramFactory.prototype.genTelegramToDeleteOrder = function (a, b) {
    return this.generateTelegramORDER("3003", a, b)
};
TelegramFactory.prototype.BATE_CODE_DEFINITIONS = {
    ",": {name: "bid_6"},
    _: {name: "bid_7"},
    ".": {name: "bid_8"},
    "/": {name: "bid_9"},
    0: {name: "bid_10"},
    1: {name: "bid_volume_6"},
    2: {name: "bid_volume_7"},
    3: {name: "bid_volume_8"},
    4: {name: "bid_volume_9"},
    5: {name: "bid_volume_10"},
    6: {name: "ask_6"},
    7: {name: "ask_7"},
    8: {name: "ask_8"},
    9: {name: "ask_9"},
    ":": {name: "ask_10"},
    ";": {name: "ask_volume_6"},
    "<": {name: "ask_volume_7"},
    ">": {name: "ask_volume_8"},
    "?": {name: "ask_volume_9"},
    "@": {name: "ask_volume_10"},
    A: {name: "tick_time"},
    B: {name: "scale"},
    C: {name: "last"},
    D: {name: "bid"},
    E: {name: "ask"},
    F: {name: "total_volume"},
    G: {name: "high"},
    H: {name: "low"},
    I: {name: "open"},
    J: {name: "close"},
    K: {name: "net_change"},
    L: {name: "pre_close"},
    M: {name: "oi"},
    N: {name: "updown"},
    O: {name: "updown_percent"},
    P: {name: "volume"},
    Q: {name: "quote_index"},
    R: {name: null},
    S: {name: "type"},
    T: {name: "status"},
    U: {name: "settlement_price"},
    V: {name: "high_limit"},
    W: {name: "low_limit"},
    X: {name: "preday_volume"},
    Y: {name: "volume_pre_w"},
    Z: {name: "bid_volume"},
    "[": {name: "ask_volume"},
    "\\": {name: "trade_date"},
    "]": {name: "expire_date"},
    "^": {name: "strike_price"},
    _: {name: "chinese_name"},
    "`": {name: "quote_date"},
    a: {name: "bid_2"},
    b: {name: "bid_3"},
    c: {name: "bid_4"},
    d: {name: "bid_5"},
    e: {name: "bid_volume_2"},
    f: {name: "bid_volume_3"},
    g: {name: "bid_volume_4"},
    h: {name: "bid_volume_5"},
    i: {name: "ask_2"},
    j: {name: "ask_3"},
    k: {name: "ask_4"},
    l: {name: "ask_5"},
    m: {name: "ask_volume_2"},
    n: {name: "ask_volume_3"},
    o: {name: "ask_volume_4"},
    p: {name: "ask_volume_5"},
    q: {name: "month_code"},
    r: {name: "settlement_day"},
    "{": {name: "force_close_or_stop_order"}
};
var Instrument = function (a, b, c) {
    this._exchange_id = a;
    this._ic = b;
    this._id = c;
    this._price_formatter = this._decimal_digits = this._ct2 = this._ot2 = this._ct1 = this._ot1 = this._time = this._trade_date = this._expiry_date = this._settlement_price = this._prev_close_price = this._open_price = this._ask_volume = this._bid_volume = this._lowest_price = this._highest_price = this._updown_percent = this._updown = this._total_volume = this._volume = this._quote_index = this._last_price = this._ask_price = this._bid_price = this._display_name = null;
    this._trade_date_ticks =
    {};
    this._trade_date_ticks_of_top_n = {};
    this._trade_date_merged_ticks_of_top_n = {};
    this._trade_date_merged_tick_volumes = {};
    this._best5 = {
        buy: [{price: "", volume: 0}, {price: "", volume: 0}, {price: "", volume: 0}, {
            price: "",
            volume: 0
        }, {price: "", volume: 0}],
        sell: [{price: "", volume: 0}, {price: "", volume: 0}, {price: "", volume: 0}, {
            price: "",
            volume: 0
        }, {price: "", volume: 0}]
    };
    this._timezone_offset_in_minutes = this._timezone = null;
    this.setTimezoneOffsetInMinutes(0)
};
Instrument.prototype.getFullId = function () {
    return this._exchange_id + ":" + this._id
};
Instrument.prototype.getExchangeId = function () {
    return this._exchange_id
};
Instrument.prototype.getIc = function () {
    return this._ic
};
Instrument.prototype.getId = function () {
    return this._id
};
Instrument.prototype.getDisplayName = function () {
    return this._display_name
};
Instrument.prototype.getBidPrice = function () {
    return this._bid_price
};
Instrument.prototype.getAskPrice = function () {
    return this._ask_price
};
Instrument.prototype.getLastPrice = function () {
    return this._last_price
};
Instrument.prototype.getQuoteIndex = function () {
    return this._quote_index
};
Instrument.prototype.getVolume = function () {
    return this._volume
};
Instrument.prototype.getTotalVolume = function () {
    return this._total_volume
};
Instrument.prototype.getUpdown = function () {
    return this._updown
};
Instrument.prototype.getUpdownPercent = function () {
    return this._updown_percent
};
Instrument.prototype.getHighestPrice = function () {
    return this._highest_price
};
Instrument.prototype.getLowestPrice = function () {
    return this._lowest_price
};
Instrument.prototype.getBidVolume = function () {
    return this._bid_volume
};
Instrument.prototype.getAskVolume = function () {
    return this._ask_volume
};
Instrument.prototype.getOpenPrice = function () {
    return this._open_price
};
Instrument.prototype.getPrevClosePrice = function () {
    return this._prev_close_price
};
Instrument.prototype.getSettlementPrice = function () {
    return this._settlement_price
};
Instrument.prototype.getExpiryDate = function () {
    return this._expiry_date
};
Instrument.prototype.getTradeDate = function () {
    return this._trade_date
};
Instrument.prototype.getTime = function () {
    return this._time
};
Instrument.prototype.getOt1 = function () {
    return this._ot1
};
Instrument.prototype.getCt1 = function () {
    return this._ct1
};
Instrument.prototype.getOt2 = function () {
    return this._ot2
};
Instrument.prototype.getCt2 = function () {
    return this._ct2
};
Instrument.prototype.getBest5 = function () {
    return this._best5
};
Instrument.prototype.getDecimalDigits = function () {
    return this._decimal_digits
};
Instrument.prototype.getCfdMarketOpen = function () {
    return this._cfd_market_open
};
Instrument.prototype.getCfdForceCloseOrStopOrderStatus = function () {
    return this._cfd_force_close_or_stop_order_status
};
Instrument.prototype.getPriceFormatter = function () {
    return this._price_formatter
};
Instrument.prototype.getLastTick = function () {
    return 0 < this._ticks.length ? [this._ticks.length - 1] : null
};
Instrument.prototype.setDisplayName = function (a) {
    this._display_name = a
};
Instrument.prototype.setBidPrice = function (a) {
    this._bid_price = a
};
Instrument.prototype.setAskPrice = function (a) {
    this._ask_price = a
};
Instrument.prototype.setLastPrice = function (a) {
    this._last_price = a
};
Instrument.prototype.setQuoteIndex = function (a) {
    this._quote_index = a
};
Instrument.prototype.setVolume = function (a) {
    this._volume = a
};
Instrument.prototype.setTotalVolume = function (a) {
    this._total_volume = a
};
Instrument.prototype.setUpdown = function (a) {
    this._updown = a
};
Instrument.prototype.setUpdownPercent = function (a) {
    this._updown_percent = a
};
Instrument.prototype.setHighestPrice = function (a) {
    this._highest_price = a
};
Instrument.prototype.setLowestPrice = function (a) {
    this._lowest_price = a
};
Instrument.prototype.setBidVolume = function (a) {
    this._bid_volume = a
};
Instrument.prototype.setAskVolume = function (a) {
    this._ask_volume = a
};
Instrument.prototype.setOpenPrice = function (a) {
    this._open_price = a
};
Instrument.prototype.setPrevClosePrice = function (a) {
    this._prev_close_price = a
};
Instrument.prototype.setSettlementPrice = function (a) {
    this._settlement_price = a
};
Instrument.prototype.setExpireDate = function (a) {
    this._expiry_date = a
};
Instrument.prototype.setTradeDate = function (a) {
    this._trade_date = a
};
Instrument.prototype.setTime = function (a) {
    this._time = a
};
Instrument.prototype.setOt1 = function (a) {
    this._ot1 = a
};
Instrument.prototype.setCt1 = function (a) {
    this._ct1 = a
};
Instrument.prototype.setOt2 = function (a) {
    this._ot2 = a
};
Instrument.prototype.setCt2 = function (a) {
    this._ct2 = a
};
Instrument.prototype.setBest5 = function (a) {
    this._best5 = a
};
Instrument.prototype.setDecimalDigits = function (a) {
    this._decimal_digits = a;
    for (var b = "#########0.", c = 0; c < a; ++c)
        b += "0";
    this._price_formatter = new DecimalFormat(b)
};
Instrument.prototype.setCfdMarketOpen = function (a) {
    this._cfd_market_open = a
};
Instrument.prototype.setCfdForceCloseOrStopOrderStatus = function (a) {
    this._cfd_force_close_or_stop_order_status = a
};
Instrument.prototype.getTimezone = function () {
    return this._timezone
};
Instrument.prototype.getTimezoneOffsetInMinutes = function () {
    return this._timezone_offset_in_minutes
};
Instrument.prototype.setTimezoneOffsetInMinutes = function (a) {
    this._timezone = (0 <= a ? "+" : "-") + Utility.prototype.leadingZero(Math.floor(Math.abs(a) / 60), 2) + "00";
    this._timezone_offset_in_minutes = a
};
Instrument.prototype.hackToSetValueByFieldName = function (a, b) {
    var c = "_" + a;
    if (Object.hasOwnProperty.call(this, c))
        return this[c] = b, !0;
    debugger;
    return !1
};
Instrument.prototype.setTradeDateTicks = function (a, b) {
    this._trade_date_ticks[a] = b
};
Instrument.prototype.getTradeDateTicks = function (a) {
    var b = this._trade_date_ticks[a];
    void 0 === b && (b = this._trade_date_ticks[a] = []);
    return b
};
Instrument.prototype.addTradeDateTick = function (a, b) {
    var c = this._trade_date_ticks[a];
    void 0 === c && (c = this._trade_date_ticks[a] = []);
    c.push(b)
};
Instrument.prototype.setTradeDateTicksOfTopN = function (a, b) {
    this._trade_date_ticks_of_top_n[a] = b
};
Instrument.prototype.setTradeDateMergedTicksOfTopN = function (a, b) {
    this._trade_date_merged_ticks_of_top_n[a] = b
};
Instrument.prototype.setTradeDateMergedTickVolumes = function (a, b) {
    this._trade_date_merged_tick_volumes[a] = b
};
Instrument.prototype.getTradeDateTicksOfTopN = function (a) {
    var b = this._trade_date_ticks_of_top_n[a];
    void 0 === b && (b = this._trade_date_ticks_of_top_n[a] = []);
    return b
};
Instrument.prototype.getTradeDateMergedTicksOfTopN = function (a) {
    var b = this._trade_date_merged_ticks_of_top_n[a];
    void 0 === b && (b = this._trade_date_merged_ticks_of_top_n[a] = []);
    return b
};
Instrument.prototype.getTradeDateMergedTickVolumes = function (a) {
    var b = this._trade_date_merged_tick_volumes[a];
    void 0 === b && (b = this._trade_date_merged_tick_volumes[a]);
    return b
};
var ResourceLoader = function () {
    this._resource_id_list = [];
    this._resources = {};
    this._resources_data = {};
    this._callback_list = []
};
ResourceLoader.prototype.queryResourcesData = function () {
    return this._resources_data
};
ResourceLoader.prototype.addResource = function (a, b, c) {
    this._resources[a] = {url: b, data_type: c}
};
ResourceLoader.prototype.loadAndQuery = function (a) {
    this._callback_list.push(a);
    if (!this._checkAllResourcesData()) {
        var b = this;
        a = this._resources;
        this._resource_id_list = Object.keys(a);
        var c = this._resources_data, d;
        for (d in a)
            if (!c[d] && null !== c[d]) {
                c[d] = !1;
                var e = a[d], e = {
                    type: "GET",
                    crossDomain: !1,
                    dataType: e.data_type,
                    timeout: 9E3,
                    url: e.url,
                    success: function (a) {
                        return function (d) {
                            c[a] = d;
                            b._checkAllResourcesData()
                        }
                    }(d),
                    error: function (a) {
                        return function (d, e, k) {
                            c[a] = null;
                            b._checkAllResourcesData()
                        }
                    }(d)
                };
                $.ajax(e)
            }
    }
};
ResourceLoader.prototype._checkAllResourcesData = function () {
    var a = this._resources, b = this._resources_data, c = 0, d;
    for (d in a)
        b[d] || "" === b[d] || null === b[d] || ++c;
    if (0 < c)
        return !1;
    var a = this._callback_list, e;
    for (e in a)
        (0, a[e])(this.queryResourcesData());
    this._callback_list = [];
    return !0
};
var Core = function (a, b) {
    this._stock = a;
    this._ticket = null;
    this._locale = b;
    this._telegram_factory = new TelegramFactory;
    this._all_session_opend = !1;
    this._all_session_closed = !0;
    this._must_to_reset_when_connected = !1;
    this._theme_resource_loaders = {};
    this._i18n_resouce_loader = new ResourceLoader;
    this._i18n_lang_scripts = {};
    this._client_id_serial_number = 0;
    this._map_client_id_to_client = {};
    this._map_of_instrument_subscription_client_id_set = {};
    this._map_of_instrument_subscription_flag_count = {};
    this._events = {};
    this._debug_mode = !0;
    this._house_id = "H001";
    this._market_data = this._user_ticket = this._user_id = null;
    this._logging_in_query_session = !1;
    this._latestSyncServerTime = this._accountData = null;
    this.ResetState()
};
Core.prototype = {
    ResetState: function () {
        this._instruments_by_full_id = {};
        this._instruments_by_exchange_id = {};
        this._instruments_by_ic = {};
        this._instruments_kticks = {};
        this._callback_1001_query = {};
        this._callback_1001_interpolation = {};
        this._callback_1002 = {};
        this._callback_1003 = {};
        this._callback_1004 = {};
        this._callback_1011 = {};
        this._callback_1012 = {};
        this._callback_2003 = {};
        this._callback_5001 = {};
        this._callback_9001 = {};
        this._context_1011 = {};
        this._context_1012 = {};
        this._todo_lists_when_instrument_tape_had_got =
        {}
    }, isBrowserSupported: function () {
        return "undefined" === typeof FileReader || "undefined" === typeof Blob || "undefined" === typeof Uint8Array || "undefined" === typeof XMLHttpRequest ? !1 : !0
    }, getHouseId: function () {
        return this._house_id
    }, getUserId: function () {
        return this._user_id
    }, getStock: function () {
        return this._stock
    }, getLocale: function () {
        return this._locale
    }, getInstrumentInfos: function () {
        return this._market_data.instrumentInfos
    }, getInstrumentTimezoneOffsetInMinutes: function (a) {
        a = a.split(":")[0];
        return (a = this.getInstrumentInfos()[a]) ?
            a.timezoneOffsetInMinutes : null
    }, getExchangeList: function () {
        return this._stock.getExchangeList()
    }, getAllInstruments: function () {
        return this._instruments_by_full_id
    }, getInstrumentByFullId: function (a) {
        return this._instruments_by_full_id[a]
    }, getInstrumentsInIc: function (a) {
        return this._instruments_by_ic[a]
    }, getInstrumentKTickTypes: function (a) {
        a = this._instruments_kticks[a];
        return void 0 === a ? null : Object.keys(a)
    }, getInstrumentKTicks: function (a, b) {
        var c = this._instruments_kticks[a];
        return void 0 === c ? null : (c =
            c[b]) ? c.getAll() : []
    }, getInstrumentLastKTick: function (a, b) {
        var c = this._instruments_kticks[a];
        return void 0 === c ? null : (c = c[b]) ? c.getLast() : null
    }, getInstrumentTypedKTicks: function (a, b) {
        var c = this._instruments_kticks[a];
        return void 0 === c ? null : c[b]
    }, getSessionReference: function () {
        return this._session_reference
    }, setLocale: function (a) {
        this._locale = this.ensureLocaleFormat(a)
    }, setMarketData: function (a) {
        this._market_data = a
    }, setInstrumentTypedKTicks: function (a, b, c) {
        var d = this._instruments_kticks[a];
        void 0 ===
        d && (d = this._instruments_kticks[a] = {});
        d[b] = c
    }, insertKTicks: function (a, b, c) {
        var d = this._instruments_kticks[a];
        void 0 === d && (d = this._instruments_kticks[a] = {});
        (a = d[b]) || (d[b] = a = new TypedKTicks(b));
        a.insert(c)
    }, appendKTicks: function (a, b, c) {
        var d = this._instruments_kticks[a];
        void 0 === d && (d = this._instruments_kticks[a] = {});
        (a = d[b]) || (d[b] = a = new TypedKTicks(b));
        a.append(c)
    }, updateKTicks: function (a, b) {
        var c = this._instruments_kticks[a];
        void 0 === c && (c = this._instruments_kticks[a] = {});
        for (var d in c)
            c[d].onTickAdded(b)
    },
    _onMessageOfTickSession: function (a) {
        var b = a.tr, c = a.error;
        switch (b) {
            case "1001":
                var d;
                if ("0" === c) {
                    var e = a.c;
                    d = this._parseTicksData(e)
                } else
                    d = {};
                var f = a.mid, g = this._callback_1001_query[f], h = this._callback_1001_interpolation[f];
                g && (delete this._callback_1001_query[f], g.call(this, d));
                h && (delete this._callback_1001_interpolation[f], h.call(this, d));
                break;
            case "1011":
                if ("0" === c) {
                    f = a.mid;
                    e = a.c;
                    d = this._parseTicksData(e);
                    var k = this._callback_1011[f], l = this._context_1011[f].trade_date;
                    for (g in d)
                        h = d[g], e = this._instruments_by_full_id[g],
                            null == e ? console.error('Telegram 1011 received but there is no the instrument, instrument full ID is "' + g + '".') : (e.setTradeDateTicksOfTopN(l, h), h = this._mergeTicksByTimeAndPriceFromBack(e, h, e.getTradeDateMergedTicksOfTopN(l)), k && k.call(this, g));
                    delete this._callback_1011[f]
                }
                break;
            case "1012":
                if ("0" === c) {
                    f = a.mid;
                    e = a.c;
                    d = this._parseTicksData(e);
                    k = this._callback_1012[f];
                    l = this._context_1012[f].trade_date;
                    for (g in d)
                        if (h = d[g], e = this._instruments_by_full_id[g], null == e)
                            console.error('Telegram 1012 received but there is no the instrument, instrument full ID is "' +
                            g + '".');
                        else {
                            var m = e.getTradeDateTicksOfTopN(l), n = m.length;
                            if (m && 0 < m.length) {
                                if (0 < h.length && h[0]._index >= m[m.length - 1]._index) {
                                    console.warn("tick\u91cd\u8907\u8acb\u6c42\u3002");
                                    continue
                                }
                                Array.prototype.push.apply(m, h)
                            } else
                                e.setTradeDateTicksOfTopN(l, h);
                            h = this._mergeTicksByTimeAndPriceFromBack(e, h, e.getTradeDateMergedTicksOfTopN(l));
                            k && k.call(this, g, n, h)
                        }
                    delete this._callback_1012[f]
                }
                break;
            case "1002":
            case "1003":
            case "1004":
                h = [];
                if ("0" === c)
                    for (e = a.c, f = e.split("\u0003"), 0 < f.length && "" === f[f.length -
                    1] && f.pop(), l = f.length, k = 0; k < l; ++k) {
                        var e = f[k].split(","), g = e[0].replace("|", ":"), q = e[1], p = e[2], n = e[3], m = e[4], r = e[5], s = e[6], w = e[7];
                        if (e = this.getInstrumentByFullId(g)) {
                            var u = q.match(/(.{4})(.{2})(.{2})/), q = u[1], v = u[2], u = u[3], p = p.split(":"), e = Utility.prototype.buildDate(q, v, u, p[0], p[1], 0, e.getTimezone()), p = new KTick;
                            p.high = parseFloat(m);
                            p.low = parseFloat(r);
                            p.open = parseFloat(n);
                            p.close = parseFloat(s);
                            p.time = e;
                            p.volume = parseInt(w);
                            h.push(p)
                        }
                    }
                "1002" === b ? d = this._callback_1002 : "1003" === b ? d = this._callback_1003 :
                "1004" === b && (d = this._callback_1004);
                if (d) {
                    e = d[a.mid];
                    if (!e)
                        throw "error: inexistent callback" + a.tr + "(" + a.mid + ") of inst " + g;
                    delete d[a.mid];
                    e.call(this, h)
                }
                break;
            case "2003":
                "0" === c && (e = a.c, f = e.split("\u0003"), 0 < f.length && "" === f[f.length - 1] && f.pop(), g = a.mid, h = this._callback_2003[g]) && (h.call(this, f), delete this._callback_2003[g]);
                break;
            case "9001":
                f = a.mid;
                g = this._callback_9001[f];
                h = "0" === a.error;
                g && g.call(this, h);
                break;
            case "9002":
                break;
            case "9999":
                if ("0" === c) {
                    var y = this;
                    setTimeout(function () {
                            y._tickSessionRequestToSendHeartbeat()
                        },
                        2E4)
                }
                break;
            default:
                console.error("Unknown telegram type - " + b)
        }
        if (null != c && "0" !== c) {
            var x;
            (a = a.c) && (x = a.ec);
            console.warn("\u96fb\u6587 " + b + " \u56de\u8986\u4e86\u4e00\u500b\u932f\u8aa4\uff0cec:" + x)
        }
    }, _onMessageOfQuoteSession: function (a) {
        var b = a.tr, c = a.error;
        switch (b) {
            case "5001":
                if ("0" === c) {
                    var d = a.c.es.replace("|", ":");
                    this._fireEvent("instrumentRegistered", {instrumentFullId: d});
                    void 0 === this._instruments_by_full_id[d] && this._qutoeSessionRequestTape([d]);
                    var e = a.mid, f = this._callback_5001[e];
                    delete this._callback_5001[e];
                    f && f.call(this, d)
                }
                break;
            case "5002":
                break;
            case "5003":
                var d = a.c.data, e = this._parseQuoteSerial(d), d = e.instrument_full_id, g = d.split(":"), f = g[0], h = g[1], k = this.getInstrumentInfos()[f];
                if (k && (g = k.symbols[h]))
                    if (e = e.bate_code, f = new Instrument(f, g.ic, h), this._setQutoeBateCodeForInstrument(f, e), f.setDisplayName(g.displayName), f.setTimezoneOffsetInMinutes(k.timezoneOffsetInMinutes), k = e.trade_date, void 0 != k) {
                        var l = k.match(/(.{4})(.{2})(.{2})/), k = l[1], h = l[2], l = l[3], e = Utility.prototype.buildDate(k, h, l, g.openTimeHour,
                            g.openTimeMinute, 0, f.getTimezone()), g = Utility.prototype.buildDate(k, h, l, g.closeTimeHour, g.closeTimeMinute, 0, f.getTimezone());
                        g <= e && (g = new Date(g.getTime() + 864E5));
                        f.setOt1(e);
                        f.setCt1(g);
                        this._addInstrument(f);
                        this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Instrument_Init, {instrument_full_id: d});
                        this._fireEvent("gotTapeInstrument", {instrumentFullId: d});
                        if (f = this._todo_lists_when_instrument_tape_had_got[d]) {
                            g = f.length;
                            for (e = 0; e < g; ++e)
                                f[e].call(this, d);
                            delete this._todo_lists_when_instrument_tape_had_got[d]
                        }
                    } else
                        console.warn(g.displayName +
                        " \u7121\u4ea4\u6613\u65e5\u8cc7\u8a0a\uff0c\u7121\u6cd5\u4f7f\u7528\u76f8\u95dc\u670d\u52d9\u3002");
                break;
            case "5004":
                "0" === c && (d = a.c.es, this._qutoeSessionRequestTape([d]), this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Instruments_Reset_Instrument, {instrument_full_id: d}));
                break;
            case "9001":
                (d = this._callback_9001[a.mid]) && d.call(this, "0" === c);
                break;
            case "9002":
                break;
            case "9999":
                if ("0" === c) {
                    var m = this;
                    setTimeout(function () {
                            m._quoteSessionRequestToSendHeartbeat()
                        },
                        2E4)
                }
                break;
            case "":
                d = a.c;
                g = d.tp;
                switch (g) {
                    case "RT":
                    case "RQ":
                        if ("0" === c)
                            if (d = d.data, e = this._parseQuoteSerial(d), d = e.instrument_full_id, f = this._instruments_by_full_id[d]) {
                                if (e = e.bate_code, k = e.trade_date, this._setQutoeBateCodeForInstrument(f, e), this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Instrument_Update, {
                                        trade_date: k,
                                        instrument_full_id: d
                                    }), "RT" === g) {
                                    g = this._generateTickFromQutoeBatecode(f, e);
                                    this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Runchart_Interpolate_Ticks,
                                        {trade_date: k, ticks: [g]});
                                    if (h = f.getTradeDateMergedTickVolumes(k))
                                        l = h[g._price_string], l = void 0 === l ? h[g._price_string] = g._volume : h[g._price_string] = parseInt(h[g._price_string]) + parseInt(g._volume), this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Runchart_New_Tick_5vpm_v, {
                                            trade_date: k,
                                            price: g._price_string,
                                            volume: l
                                        });
                                    l = !1;
                                    if (h = f.getTradeDateMergedTicksOfTopN(k))
                                        0 === h.length ? (h.push(g), l = !1) : (l = h[0], l._timeString === g._timeString && l._price_string === g._price_string ?
                                            (l._volume = parseInt(l._volume) + parseInt(g._volume), l = !0) : (h.unshift(g), l = !1)), this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Runchart_New_Tick_5vpm_p, {
                                            trade_date: k,
                                            tick: h[0],
                                            is_merged: l
                                        }), this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Runchart_New_Tick_5vpm_m, {
                                            trade_date: k,
                                            tick: g
                                        });
                                    g = e.tick_time;
                                    l = k.match(/(.{4})(.{2})(.{2})/);
                                    k = l[1];
                                    h = l[2];
                                    l = l[3];
                                    g = g.split(":");
                                    f = Utility.prototype.buildDate(k, h, l, g[0], g[1], 0, f.getTimezone());
                                    g = parseFloat(e.last);
                                    k = parseInt(e.volume);
                                    if (h = this.getInstrumentKTickTypes(d))
                                        for (l = h.length, e = 0; e < l; ++e)
                                            this._handleNewKTick(d, h[e], f, g, k)
                                }
                            } else
                                console.log("Quote received but there's no instrument, full id is \"" + d + '".');
                        break;
                    case "RB":
                        "0" === c && (d = d.data, e = this._parseQuoteSerial(d), d = e.instrument_full_id, (f = this._instruments_by_full_id[d]) ? (e = e.bate_code, this._setQutoeBateCodeForInstrument(f, e), this._notifyMsgForClientsBySubscribedInstrumentFullId(d, Core.prototype.CLIENT_EVENTS.Runchart_Update_5vpm_5,
                            {inst_full_id: d})) : console.log("Quote received but there's no instrument, full id is \"" + d + '".'));
                        break;
                    default:
                        console.error("Unknown quote type - " + g)
                }
                break;
            default:
                console.error("Unknown telegram type - " + b)
        }
        if (null != c && "0" !== c) {
            var n;
            (d = a.c) && (n = d.ec);
            console.warn("\u96fb\u6587 " + b + " \u56de\u8986\u4e86\u4e00\u500b\u932f\u8aa4\uff0cec:" + n)
        }
    }, _onMessageOfQuerySession: function (a) {
        var b = a.tr, c = a.error, d = a.tp, e = a.c, f = a.mid;
        this._debug("\u6536\u5230 svr=QUERY tr=" + b + " \u56de\u8986: [" + e + "]");
        switch (b) {
            case "9001":
                (d =
                    this._callback_9001[a.mid]) && d.call(this, "0" === c);
                break;
            case "9002":
                break;
            case "9999":
                if ("0" === c) {
                    var g = this;
                    setTimeout(function () {
                        g._querySessionRequestToSendHeartbeat()
                    }, 2E4)
                }
                break;
            case "2001":
                if ("0" === c)
                    d = e.split(","), this._session_reference = d[0];
                else {
                    var d = e.split(","), h = d[0], d = d[1];
                    console.error('Login failed, error code is "' + h + '". (' + d + ")")
                }
                break;
            case "2010":
                "s" == d ? this._accountData = AccountData.prototype.createFromTelegram2010(this, e) : this._accountData.updateFromTelegram2010(e);
                !1 == this._logging_in_query_session &&
                this._fireEvent("subAccount", this._accountData);
                break;
            case "2011":
                d = this._accountData.receivedQuery2011(f, e);
                !1 == this._logging_in_query_session && this._fireEvent("statement", d);
                break;
            case "2012":
                d = this._accountData.receivedQuery2012(f, e);
                !1 == this._logging_in_query_session && this._fireEvent("order", d);
                break;
            case "2014":
                d = this._accountData.receivedQuery2014(f, e);
                !1 == this._logging_in_query_session && this._fireEvent("ticket", d);
                break;
            case "2015":
                d = this._accountData.receivedQuery2015(f, e);
                !1 == this._logging_in_query_session &&
                this._fireEvent("account", d);
                break;
            case "2016":
                d = this._accountData.receivedQuery2016(f, e);
                !1 == this._logging_in_query_session && this._fireEvent("accSymbol", d);
                break;
            case "2018":
                d = this._accountData.receivedQuery2018(f, e);
                !1 == this._logging_in_query_session && this._fireEvent("bankbook", d);
                break;
            case "2025":
                d = this._accountData.receivedQuery2025(e);
                !1 == this._logging_in_query_session && this._fireEvent("activeSymbol", d);
                break;
            case "2044":
                this._fireEvent("marketClose");
                break;
            case "2019":
                this._latestSyncServerTime =
                    e.split(",")[0];
                this._fireEvent("serverTime", {serverTime: this._latestSyncServerTime});
                this._notifyMsgForAllClients(Core.prototype.CLIENT_EVENTS.AccountData_Init);
                this._fireEvent("loginComplete");
                break;
            case "3001":
            case "3002":
            case "3003":
                d = e.split(",");
                "0" == c ? this._fireEvent("orderReport", {
                    orderNo: d[0],
                    status: d[1]
                }) : (h = d[0], d = d[1], this._fireEvent("orderReport", {errorCode: h, errorMsg: d}));
                break;
            default:
                console.error("Unknown telegram type - " + b)
        }
        !0 == this._logging_in_query_session && this._continueQuerySessionLoginProcedure(b);
        null != c && "0" !== c && ((e = a.c) && (h = e.ec), console.warn("\u96fb\u6587 " + b + " \u56de\u8986\u4e86\u4e00\u500b\u932f\u8aa4\uff0cec:" + h))
    }, _continueQuerySessionLoginProcedure: function (a) {
        switch (a) {
            case null:
                this._logging_in_query_session = !0;
                this._query_session_wrapper.send(this._telegram_factory.genTelegramLogin(this._user_id, [this._house_id, this._user_id, this._user_ticket, "0.0.6.9", "web"]));
                break;
            case "2001":
                this._send(this._telegram_factory.genTelegramGetSubAccounts(this._user_id, [this._house_id, this._user_id]));
                break;
            case "2010":
                this._accountData.requestQuery2011();
                break;
            case "2011":
                !1 == this._accountData.isWaitingResponse() && this._accountData.requestQuery2012();
                break;
            case "2012":
                !1 == this._accountData.isWaitingResponse() && this._accountData.requestQuery2014();
                break;
            case "2014":
                !1 == this._accountData.isWaitingResponse() && this._accountData.requestQuery2015();
                break;
            case "2015":
                !1 == this._accountData.isWaitingResponse() && this._accountData.requestQuery2016();
                break;
            case "2016":
                !1 == this._accountData.isWaitingResponse() &&
                this._accountData.requestQuery2018();
                break;
            case "2018":
                !1 == this._accountData.isWaitingResponse() && this._send(this._telegram_factory.genTelegramGetActiveSymbols(this._user_id, [this._house_id, "null"]));
                break;
            case "2025":
                this._logging_in_query_session = !1, this._send(this._telegram_factory.genTelegramGetServerTime(this._user_id))
        }
    }, _notifyMsgForAllClients: function (a, b) {
        for (var c in this._map_client_id_to_client) {
            var d = this._map_client_id_to_client[c];
            d._onClientEvents && d._onClientEvents(a, b)
        }
    }, _notifyMsgForClients: function (a,
                                       b, c) {
        for (var d in a) {
            var e = a[d];
            e._onClientEvents && e._onClientEvents(b, c)
        }
    }, _notifyMsgForClientsBySubscribedInstrumentFullId: function (a, b, c) {
        a = this._map_of_instrument_subscription_client_id_set[a];
        if (void 0 === a)
            return !1;
        var d = [], e;
        for (e in a)
            d.push(this._map_client_id_to_client[e]);
        this._notifyMsgForClients(d, b, c);
        return !0
    }, _send: function (a, b) {
        switch (a.srv) {
            case "TICK":
                this._tick_session_wrapper.send(a, b);
                break;
            case "QUOTE":
                this._quote_session_wrapper.send(a, b);
                break;
            case "QUERY":
                this._query_session_wrapper.send(a,
                    b);
                break;
            case "USER":
            case "SYSTEM":
                console.log("User and system service should not send telegram by this method.");
                break;
            default:
                console.log("send: unknown srv of telegram.")
        }
    }, closeSessions: function () {
        this._tick_session_wrapper.close();
        this._quote_session_wrapper.close();
        this._query_session_wrapper.close()
    }, _quoteSessionRequestRegisterInstruments: function (a, b) {
        for (var c in a) {
            var d = a[c], e = this._map_of_instrument_subscription_flag_count[d], d = this._telegram_factory.requestToRegisterInstrument(d, 0 <
            e.tick, 0 < e.quote, 0 < e.best_rank);
            this._callback_5001[d.mid] = function (a) {
                b && b.call(this, a)
            };
            this._send(d)
        }
    }, _quoteSessionRequestUnregisterInstruments: function (a) {
        for (var b in a)
            this._send(this._telegram_factory.requestToUnregisterInstrument(a[b], !0, !0, !0))
    }, _qutoeSessionRequestTape: function (a) {
        for (var b in a)
            this._send(this._telegram_factory.requestToGetTradeDayInstrumentSituations(a[b]))
    }, _addInstrument: function (a) {
        var b = a.getExchangeId(), c = a.getId();
        this._instruments_by_full_id[b + ":" + c] = a;
        var d = this._instruments_by_exchange_id[b];
        void 0 === d && (d = this._instruments_by_exchange_id[b] = {});
        d[c] = a;
        b = a.getIc();
        d = this._instruments_by_ic[b];
        void 0 === d && (d = this._instruments_by_ic[b] = {});
        d[c] = a
    }, _parseTicksData: function (a) {
        var b = {};
        a = a.split("\u0003");
        0 < a.length && "" === a[a.length - 1] && a.pop();
        for (var c = a.length, d = 0; d < c; ++d) {
            var e = a[d].split(","), f = e[0].replace("|", ":"), g = e[1], h = e[2], k = e[3], l = e[4], m = e[6], n = this.getInstrumentByFullId(f);
            if (n) {
                e = b[f];
                void 0 === e && (e = b[f] = []);
                var q = g.match(/(.{4})(.{2})(.{2})/), f = q[1], g = q[2], q = q[3], p = h.split(":"),
                    f = Utility.prototype.buildDate(f, g, q, p[0], p[1], 0, n.getTimezone()), h = new Tick(parseInt(m), parseFloat(k), n.getPriceFormatter().format(k), l, f.getTime(), h);
                e.push(h)
            }
        }
        return b
    }, _parseQuoteSerial: function (a) {
        var b, c = a.indexOf(",");
        b = a.substr(0, c);
        b = b.replace("|", ":");
        a = a.substr(c + 1);
        for (var d = 0, c = TelegramFactory.prototype.BATE_CODE_DEFINITIONS, e = {}; d < a.length;) {
            var f = a.indexOf(",", d + 1), g = 0 > f, h = c[a[d]];
            h && (h = h.name, d = a.substring(d + 1, g ? a.length : f), e[h] = d);
            if (g)
                break;
            else
                d = f + 1
        }
        return {
            instrument_full_id: b,
            bate_code: e
        }
    }, _handleNewKTick: function (a, b, c, d, e) {
        this.getInstrumentByFullId(a);
        var f = this.getInstrumentLastKTick(a, b), g;
        if (f)
            switch (b) {
                case "D":
                    g = f.time.getDay() === c.getDay();
                    break;
                case "W":
                    g = Utility.prototype.getWeekOfDate(f.time);
                    var h = Utility.prototype.getWeekOfDate(c.time);
                    g = g === h;
                    break;
                case "M":
                    g = f.time.getMonth() === c.getMonth();
                    break;
                default:
                    g = Core.prototype.KTYPE_DEFINITIONS[b].duration;
                    var h = f.time.getTime(), k = c.getTime();
                    g = Math.floor(h / g) === Math.floor(k / g)
            }
        else
            g = !1;
        g ? (f.update(d, e), this._notifyMsgForClientsBySubscribedInstrumentFullId(a,
            Core.prototype.CLIENT_EVENTS.KGraph_Update_Last_KTick, {
                inst_full_id: a,
                type: b
            })) : (f = new KTick, f.open = d, f.high = d, f.low = d, f.close = d, f.time = c, f.volume = e, this.appendKTicks(a, b, [f]), this._notifyMsgForClientsBySubscribedInstrumentFullId(a, Core.prototype.CLIENT_EVENTS.KGraph_Append_KTick, {
            inst_full_id: a,
            type: b
        }))
    }, _mergeTicksByTimeAndPriceFromBack: function (a, b, c) {
        a = b.length;
        if (0 === a)
            return null;
        var d, e;
        0 < c.length ? (e = c[c.length - 1], d = c.length - 1) : (e = b[0].clone(), d = 0);
        for (var f = 1; f < a; ++f) {
            var g = b[f], h = g._timeString,
                k = g._price_string;
            e._timeString === h && e._price_string === k ? e._volume = parseInt(e._volume) + parseInt(g._volume) : (c.push(e), e = new Tick(g._index, g._price, k, parseInt(g._volume), g._timestamp, h))
        }
        c.push(e);
        return d
    }, _generateTickFromQutoeBatecode: function (a, b) {
        var c = b.tick_time, d = a.getTradeDate().match(/(.{4})(.{2})(.{2})/), e = d[1], f = d[2], d = d[3], g = c.split(":"), e = Utility.prototype.buildDate(e, f, d, g[0], g[1], g[2], a.getTimezone());
        return new Tick(b.quote_index, parseFloat(b.last), a.getPriceFormatter().format(b.last),
            b.volume, e.getTime(), c)
    }, _setQutoeBateCodeForInstrument: function (a, b) {
        var c = b.bid, d = b.ask, e = b.bid_volume, f = b.ask_volume, g = b.last, h = b.volume, k = b.total_volume, l = b.high, m = b.low, n = b.open, q = b.pre_close, p = b.trade_date, r = b.tick_time, s = b.scale, w = b.net_change, u = b.quote_index, v = b.updown, y = b.settlement_price, x = b.expire_date, v = [b.bid, b.bid_2, b.bid_3, b.bid_4, b.bid_5], z = [b.ask, b.ask_2, b.ask_3, b.ask_4, b.ask_5], B = [b.bid_volume, b.bid_volume_2, b.bid_volume_3, b.bid_volume_4, b.bid_volume_5], C = [b.ask_volume, b.ask_volume_2,
            b.ask_volume_3, b.ask_volume_4, b.ask_volume_5], A = b.force_close_or_stop_order;
        void 0 !== c && a.setBidPrice(c);
        void 0 !== d && a.setAskPrice(d);
        void 0 !== g && a.setLastPrice(g);
        void 0 !== u && a.setQuoteIndex(u);
        void 0 !== h && a.setVolume(h);
        void 0 !== k && a.setTotalVolume(k);
        void 0 !== l && a.setHighestPrice(l);
        void 0 !== m && a.setLowestPrice(m);
        void 0 !== n && a.setOpenPrice(n);
        void 0 !== q && a.setPrevClosePrice(q);
        void 0 !== p && a.setTradeDate(p);
        void 0 !== r && a.setTime(r);
        void 0 !== s && a.setDecimalDigits(parseInt(s));
        void 0 !== e && a.setBidVolume(e);
        void 0 !== f && a.setAskVolume(f);
        void 0 !== y && a.setSettlementPrice(y);
        void 0 !== x && a.setExpireDate(x);
        void 0 !== w && a.setCfdMarketOpen(1 == parseInt(w) ? !0 : !1);
        void 0 !== A && a.setCfdForceCloseOrStopOrderStatus(A);
        h = a.getBest5();
        c = h.buy;
        d = h.sell;
        for (f = e = 0; 5 > f; ++f)
            z[f] && (g = z[f], h = C[f], c[e].price = parseFloat(g), c[e].volume = parseFloat(h), ++e);
        for (f = e = 0; 5 > f; ++f)
            v[f] && (d[e].price = parseFloat(v[f]), d[e].volume = parseFloat(B[f]), ++e);
        h = a.getPrevClosePrice();
        null != h && 0 != h && (v = a.getLastPrice() - h, h = (v / h * 100).toFixed(2) + "%",
            a.setUpdown(a.getPriceFormatter().format(v)), a.setUpdownPercent(h))
    }, isAllSessionIsOpened: function () {
        return null == this._tick_session_wrapper || null == this._quote_session_wrapper || null == this._query_session_wrapper ? !1 : this._tick_session_wrapper.isOpened() && this._quote_session_wrapper.isOpened() && this._query_session_wrapper.isOpened()
    }, isAllSessionIsClosed: function () {
        var a = null == this._tick_session_wrapper || this._tick_session_wrapper.isClosed(), b = null == this._quote_session_wrapper || this._quote_session_wrapper.isClosed(),
            c = null == this._query_session_wrapper || this._query_session_wrapper.isClosed();
        return a && b && c
    }, _checkAllSessionIsOpened: function () {
        if (!this._all_session_opend && this.isAllSessionIsOpened()) {
            this._all_session_opend = !0;
            var a = this;
            setTimeout(function () {
                a._fireEvent("connected", {serviceType: null});
                a._must_to_reset_when_connected && (a._must_to_reset_when_connected = !1, a._notifyMsgForAllClients(Core.prototype.CLIENT_EVENTS.Reset));
                a._continueQuerySessionLoginProcedure(null)
            })
        }
    }, _checkAllSessionIsClosed: function () {
        if (!this._all_session_closed &&
            this.isAllSessionIsClosed()) {
            this._all_session_closed = !0;
            var a = this;
            setTimeout(function () {
                console.log("all sessions are closed.");
                a.ResetState();
                a._fireEvent("disconnected", {serviceType: null});
                a._must_to_reset_when_connected = !0
            })
        }
    }, _reconnectTickService: function () {
        this._fireEvent("connecting", {serviceType: "tick"});
        var a = !1, b = !1, c = this, d = this._stock.getUrlOfTickWebSocketServer();
        null == d ? console.warn("There's no host for tick service.") : (this._tick_session_wrapper = new SessionWrapper(this, "tick"), this._tick_session_wrapper.run(d,
            c, function () {
                a = !0;
                c._all_session_closed = !1;
                this.tickSessionRequestToLogin(this._user_id, this._user_ticket, function (a) {
                    a && c._tickSessionRequestToSendHeartbeat()
                });
                this._fireEvent("connected", {serviceType: "tick"});
                this._checkAllSessionIsOpened()
            }, function () {
                this._all_session_opend = !1;
                this._fireEvent("disconnected", {serviceType: "tick", connected: a, errorHasOccurred: b});
                this._checkAllSessionIsClosed()
            }, function () {
                b = !0;
                this._fireEvent("connection_failed", {serviceType: "tick", connected: a})
            }, function (a) {
                this._onMessageOfTickSession(a)
            }))
    },
    _reconnectQuoteService: function () {
        this._fireEvent("connecting", {serviceType: "quote"});
        var a = !1, b = !1, c = this, d = this._stock.getUrlOfQuoteWebSocketServer();
        null == d ? console.warn("There's no host for quote service.") : (this._quote_session_wrapper = new SessionWrapper(this, "quote"), this._quote_session_wrapper.run(d, c, function () {
            c._all_session_closed = !1;
            a = !0;
            this.quoteSessionRequestToLogin(this._user_id, this._user_ticket, function (a) {
                a && (c._quoteSessionRequestToSendHeartbeat(), a = Object.keys(this._map_of_instrument_subscription_client_id_set),
                0 < a.length && c._quoteSessionRequestRegisterInstruments(a))
            });
            this._fireEvent("connected", {serviceType: "quote"});
            this._checkAllSessionIsOpened()
        }, function () {
            this._all_session_opend = !1;
            this._fireEvent("disconnected", {serviceType: "quote", connected: a, errorHasOccurred: b});
            this._checkAllSessionIsClosed()
        }, function () {
            b = !0;
            this._fireEvent("connection_failed", {serviceType: "quote", connected: a})
        }, function (a) {
            this._onMessageOfQuoteSession(a)
        }))
    }, _reconnectQueryService: function () {
        this._fireEvent("connecting", {serviceType: "query"});
        var a = !1, b = !1, c = this, d = this._stock.getUrlOfQueryWebSocketServer();
        null == d ? console.warn("There's no host for query service.") : (this._query_session_wrapper = new SessionWrapper(this, "query"), this._query_session_wrapper.run(d, c, function () {
                c._all_session_closed = !1;
                a = !0;
                this._fireEvent("connected", {serviceType: "query"});
                this._checkAllSessionIsOpened()
            }, function () {
                this._all_session_opend = !1;
                this._fireEvent("disconnected", {serviceType: "query", connected: a, errorHasOccurred: b});
                this._checkAllSessionIsClosed()
            },
            function () {
                b = !0;
                this._fireEvent("connection_failed", {serviceType: "query", connected: a})
            }, function (a) {
                this._onMessageOfQuerySession(a)
            }))
    }, start: function (a, b, c) {
        this._user_id = b;
        this._user_ticket = c;
        this._market_data = a;
        this._reconnectTickService();
        this._reconnectQuoteService();
        this._reconnectQueryService();
        return !0
    }, bindClient: function (a) {
        if (null == a)
            return !1;
        var b = this._client_id_serial_number++;
        a._initStockClient(this, b);
        this._map_client_id_to_client[b] = a;
        return !0
    }, unbindClient: function (a) {
        if (null ==
            a)
            return !1;
        var b = a.getClientId();
        if (null == this._map_client_id_to_client[b])
            throw "The client has never bound.";
        delete this._map_client_id_to_client[b];
        a._release();
        return !0
    }, subscribeInstrument: function (a, b, c, d, e, f) {
        a = a.getClientId();
        var g = this._map_of_instrument_subscription_client_id_set[b], h = this._map_of_instrument_subscription_flag_count[b];
        if (void 0 === g)
            g = this._map_of_instrument_subscription_client_id_set[b] = {}, h = this._map_of_instrument_subscription_flag_count[b] = {
                tick: 0,
                quote: 0,
                best_rank: 0
            };
        else if (g[a])
            throw "The client has already bound.";
        g[a] = !0;
        c && ++h.tick;
        d && ++h.quote;
        e && ++h.best_rank;
        this._quoteSessionRequestRegisterInstruments([b], f);
        console.log("Flag count of instrument was updated: " + JSON.stringify(h));
        return !0
    }, unsubscribeInstrument: function (a, b) {
        var c = this._map_of_instrument_subscription_client_id_set[b];
        if (void 0 === c)
            throw 'The instrument is not existing in subscription map, maybe the instrument had never bound, instrument full id - "' + b + '".';
        var d = a.getClientId();
        if (null ==
            c[d])
            throw "The client had never bound.";
        delete c[d];
        Utility.prototype.isObjectEmpty(c) && (delete this._map_of_instrument_subscription_client_id_set[b], delete this._map_of_instrument_subscription_flag_count[b], this._quoteSessionRequestUnregisterInstruments([b]));
        return !0
    }, _requestToLogin: function (a, b, c, d) {
        var e = this, f = this._telegram_factory.requestToLogin(b, c, "1.0.0.1");
        this._callback_9001[f.mid] = function () {
            d && d.call(e, {user_id: b, user_ticket: c})
        };
        switch (a) {
            case "tick":
                this._tick_session_wrapper.send(f,
                    d);
                break;
            case "quote":
                this._quote_session_wrapper.send(f, d);
                break;
            case "query":
                this._query_session_wrapper.send(f, d)
        }
    }, tickSessionRequestToLogin: function (a, b, c, d) {
        return this._requestToLogin("tick", a, b, c, d)
    }, quoteSessionRequestToLogin: function (a, b, c, d) {
        return this._requestToLogin("quote", a, b, c, d)
    }, querySessionRequestToLogin: function (a, b, c, d) {
        return this._requestToLogin("query", a, b, c, d)
    }, _tickSessionRequestToSendHeartbeat: function () {
        var a = this._telegram_factory.requestToSendHeartbeat(new Date);
        this._tick_session_wrapper.send(a);
        console.log("Heartbeat sent for tick session.")
    }, _quoteSessionRequestToSendHeartbeat: function () {
        var a = this._telegram_factory.requestToSendHeartbeat(new Date);
        this._quote_session_wrapper.send(a);
        console.log("Heartbeat sent for quote session.")
    }, _querySessionRequestToSendHeartbeat: function () {
        var a = this._telegram_factory.requestToSendHeartbeat(new Date);
        this._query_session_wrapper.send(a);
        console.log("Heartbeat sent for query session.")
    }, requestToGetPriceVolumeDataInTradeDay: function (a, b, c) {
        return this.toDoWhenInstrumentTapeHadGotProxy(a,
            this._requestToGetPriceVolumeDataInTradeDay, this, arguments)
    }, _requestToGetPriceVolumeDataInTradeDay: function (a, b, c) {
        var d = this._instruments_by_full_id[a];
        if (void 0 !== d) {
            var e = d.getExchangeId(), f = d.getId(), g = null != b ? b : d.getTradeDate(), h = this, d = this._telegram_factory.requestToGetPriceVolumeData(e, f, g);
            this._callback_2003[d.mid] = function (d) {
                var e = d.length, f = this._instruments_by_full_id[a];
                if (f) {
                    for (var n = {}, q = 0; q < e; ++q) {
                        var p = d[q].split(","), r = p[0].replace("|", ":");
                        a === r && (n[p[2]] = p[3])
                    }
                    f.setTradeDateMergedTickVolumes(g,
                        n);
                    c.call(h, {trade_date: b, instrument_full_id: a, volume_ticks: n})
                }
            };
            this._send(d)
        }
    }, requestToGetMinuteTicksInTradeDay: function (a, b, c) {
        return this.toDoWhenInstrumentTapeHadGotProxy(a, this._requestToGetMinuteTicksInTradeDay, this, arguments)
    }, _requestToGetMinuteTicksInTradeDay: function (a, b, c) {
        var d = this._instruments_by_full_id[a];
        if (void 0 !== d) {
            var e = d.getExchangeId(), f = d.getId();
            b = null != b ? b : d.getTradeDate();
            var g = Core.prototype.SERVER_K_TYPES.m1.request, e = this._telegram_factory.requestToGetMinuteTickOfToday(e,
                f, Core.prototype.SERVER_K_TYPES[g].server, b, 5E3), h = this;
            this._callback_1002[e.mid] = function (b) {
                console.log("callback invoked, requestType: " + g);
                c.call(h, {instrument_full_id: a, kticks: b})
            };
            this._send(e)
        }
    }, requestToGetTicksToMakeUpAllInTradeDay: function (a, b, c, d) {
        return this.toDoWhenInstrumentTapeHadGotProxy(a, this._requestToGetTicksToMakeUpAllInTradeDay, this, arguments)
    }, _requestToGetTicksToMakeUpAllInTradeDay: function (a, b, c, d) {
        var e = this.getInstrumentByFullId(a);
        if (null != e) {
            a = e.getExchangeId();
            var f =
                e.getId(), g = null != b ? b : e.getTradeDate();
            b = e.getTradeDateTicksOfTopN(g);
            var h = this;
            void 0 == b || 0 === b.length ? (b = this._telegram_factory.requestToGetTradeDateNewestTick(a, f, g, c), c = b.mid, this._callback_1011[c] = function (a) {
                a = h.getInstrumentByFullId(a);
                d.call(h, {
                    start_index_of_ticks: 0,
                    start_index_of_merged_ticks: 0,
                    ticks: a.getTradeDateTicksOfTopN(g),
                    merged_ticks: a.getTradeDateMergedTicksOfTopN(g)
                })
            }, this._context_1011[c] = {trade_date: g}) : (b = this._telegram_factory.requestToGetTradeDateNewestTickByTickIndex(a,
                f, g, b[b.length - 1]._index - 1, c), c = b.mid, this._callback_1012[c] = function (a, b, c) {
                a = h.getInstrumentByFullId(a);
                d.call(h, {
                    start_index_of_ticks: b,
                    start_index_of_merged_ticks: c,
                    ticks: a.getTradeDateTicksOfTopN(g),
                    merged_ticks: a.getTradeDateMergedTicksOfTopN(g)
                })
            }, this._context_1012[c] = {trade_date: g});
            this._send(b)
        }
    }, requestToGetMinuteTicksInPeriodOfTradeDay: function (a, b, c, d, e, f, g) {
        return this.toDoWhenInstrumentTapeHadGotProxy(a, this._requestToGetMinuteTicksInPeriodOfTradeDay, this, arguments)
    }, _requestToGetMinuteTicksInPeriodOfTradeDay: function (a,
                                                             b, c, d, e, f, g) {
        var h = this._instruments_by_full_id[a];
        if (void 0 === h)
            console.warn("There's no the instrument (" + a + ")");
        else {
            if (0 > e)
                throw "Duration must be greater or equal than zero.";
            var k = (null != b ? b : h.getTradeDate()).match(/(.{4})(.{2})(.{2})/);
            c = Utility.prototype.buildDate(k[1], k[2], k[3], c, d, 0, h.getTimezone());
            e = new Date(c.getTime() + e);
            return this.requestToGetMinuteTicksInPeriod(a, b, c, e, f, g)
        }
    }, requestToGetMinuteTicksInPeriod: function (a, b, c, d, e, f) {
        return this.toDoWhenInstrumentTapeHadGotProxy(a, this._requestToGetMinuteTicksInPeriod,
            this, arguments)
    }, _requestToGetMinuteTicksInPeriod: function (a, b, c, d, e, f) {
        var g = this._instruments_by_full_id[a];
        if (void 0 === g)
            console.warn("There's no the instrument (" + a + ")");
        else {
            var h = null != b ? b : g.getTradeDate();
            c = Utility.prototype.getTimeStringFromDateWithTimezone(c, g.getTimezone());
            d = Utility.prototype.getTimeStringFromDateWithTimezone(d, g.getTimezone());
            var h = this._telegram_factory.requestToGetTickByPeriod(g.getExchangeId(), g.getId(), h, c, d), k = this;
            this._callback_1001_interpolation[h.mid] = function (c) {
                c =
                    c[a];
                void 0 === c && (console.warn("ERROR from callback1001: inst ID (" + a + ") is not existing in ticks."), c = []);
                console.log("callback invoked.");
                if (f)
                    if (e) {
                        var d = [];
                        this._mergeTicksByTimeAndPriceFromBack(g, c, d);
                        f.call(k, {trade_date: b, ticks: d})
                    } else
                        f.call(k, {trade_date: b, ticks: c})
            };
            this._send(h)
        }
    }, requestToGetKTicks: function (a, b, c, d, e) {
        return this.toDoWhenInstrumentTapeHadGotProxy(a, this._requestToGetKTicks, this, arguments)
    }, _requestToGetKTicks: function (a, b, c, d, e) {
        var f = this._instruments_by_full_id[a];
        if (null == f)
            return !1;
        var g = Core.prototype.SERVER_K_TYPES[b].request, h = this.getInstrumentTypedKTicks(a, g);
        if (h)
            return console.log("Using cache for KTicks, instrument is " + a + ", ktype is " + b), d = g == b ? h : h.transformTo(b), this.setInstrumentTypedKTicks(a, b, d), e && e.call(m, {
                instrument_full_id: a,
                ktype: b
            }), !0;
        var h = Core.prototype.SERVER_K_TYPES[g].server, k = f.getExchangeId(), l = f.getId(), f = null != c ? c : f.getTradeDate(), m = this;
        "W" === b || "M" === b || "Y" === b ? (d = this._telegram_factory.requestToGetLongPeriodTickOfHistory(k,
            l, h, f, d), this._callback_1004[d.mid] = function (c) {
            console.log("callback1004 invoked, requestType: " + g + ", targetType: " + b);
            var d = this.getInstrumentTypedKTicks(a, g);
            d || (d = new TypedKTicks(g));
            0 < c.length ? (d.append(c), this.setInstrumentTypedKTicks(a, g, d), g != b && (c = d.transformTo(b), this.setInstrumentTypedKTicks(a, b, c))) : this.setInstrumentTypedKTicks(a, b, d);
            e && e.call(m, {instrument_full_id: a, ktype: b})
        }) : (c = this._telegram_factory.requestToGetMinuteTickOfToday(k, l, h, f, d), d = this._telegram_factory.requestToGetMinuteTickOfHistory(k,
            l, h, f, d), this._callback_1002[c.mid] = function (c) {
            console.log("callback1002 invoked, requestType: " + g + ", targetType: " + b);
            var d = this.getInstrumentTypedKTicks(a, g);
            d || (d = new TypedKTicks(g));
            0 < c.length ? (d.append(c.reverse()), this.setInstrumentTypedKTicks(a, g, d), g != b && (c = d.transformTo(b), this.setInstrumentTypedKTicks(a, b, c))) : this.setInstrumentTypedKTicks(a, b, d);
            e && e.call(m, {instrument_full_id: a, ktype: b, isInsert: !1})
        }, this._callback_1003[d.mid] = function (c) {
            console.log("callback1003 invoked, requestType: " +
            g + ", targetType: " + b);
            var d = this.getInstrumentTypedKTicks(a, g);
            d || (d = new TypedKTicks(g));
            0 < c.length ? (d.insert(c.reverse()), this.setInstrumentTypedKTicks(a, g, d), g != b && (c = d.transformTo(b), this.setInstrumentTypedKTicks(a, b, c))) : this.setInstrumentTypedKTicks(a, b, d);
            e && e.call(m, {instrument_full_id: a, ktype: b, isInsert: !0})
        }, this._send(c));
        this._send(d);
        return !0
    }, requestToQueryOrders: function () {
        this._accountData.requestQuery2012()
    }, requestToQueryTickets: function () {
        this._accountData.requestQuery2014()
    }, postToHTTPServiceAsync: function (a,
                                         b, c, d, e, f) {
        $.ajax({
            type: b ? "POST" : "GET",
            url: a,
            crossDomain: !0,
            data: c,
            dataType: "text",
            contentType: "text/plain; charset=UTF-8",
            headers: b ? {"Content-Type": "application/x-www-form-urlencoded"} : void 0,
            xhrFields: {withCredentials: !1},
            success: function (a) {
                d && d(a)
            },
            error: function (a, b, c) {
                0 === a.readyState && 0 === a.status ? d && d(a.responseText) : e && e()
            },
            timeout: f
        })
    }, changeThemeForAllClient: function (a) {
        var b = this._map_client_id_to_client, c;
        for (c in b)
            b[c].changeTheme(a)
    }, changeI18NLocaleForAllClient: function (a) {
        var b =
            this._map_client_id_to_client, c;
        for (c in b)
            b[c].changeI18NLocale(a)
    }, ensureLocaleFormat: function (a) {
        return a.replace(/(.*)[-_](.*)/, function (a, c, d) {
            return c.toLowerCase() + "-" + d.toUpperCase()
        })
    }, loadThemeCSS: function (a, b) {
        var c = this._theme_resource_loaders[a];
        void 0 === c && (c = this._theme_resource_loaders[a] = new ResourceLoader, c.addResource("app", "./css/themes/app_" + a + "-pc.css", "text"), c.addResource("jquery_ui", "./3rdParty/jquery-ui-1.11.0/themes/" + a + "/jquery-ui.min.css", "text"));
        c.loadAndQuery(b)
    }, loadI18N: function (a,
                           b) {
        var c = this.ensureLocaleFormat(a), d = this._i18n_resouce_loader;
        void 0 === d.queryResourcesData()[a] && d.addResource(a, "./js/i18n/lang_" + c + ".js", "text");
        var e = this;
        d.loadAndQuery(function (a) {
            var d = a[c];
            d ? (a = !0, d = (new Function("return " + d + ";"))(), e._i18n_lang_scripts[c] = d) : a = !1;
            b.call(e, a)
        })
    }, applyI18N: function (a, b, c) {
        a = this.ensureLocaleFormat(a);
        var d = this._i18n_lang_scripts[a];
        if (!d)
            return !1;
        c = b(c);
        c.find("th[data-i18n], a[data-i18n], option[data-i18n], div[data-i18n], span[data-i18n], input[data-i18n]").each(function () {
            var a =
                b(this), c = a.attr("data-i18n");
            if (null != c) {
                var g = a.attr("data-i18n_map"), c = d[c];
                if (g)
                    try {
                        var h = JSON.parse(g), k;
                        for (k in h)
                            c = c.replace("%" + k + "%", h[k])
                    } catch (l) {
                        console.error('applyI18N failed when parse JSON from data-i18n_map - "' + g + '".'), console.log(l)
                    }
                if (a.hasClass("ui-dialog"))
                    a.dialog("option", "title", c);
                else if (a.hasClass("ui-button"))
                    a.button("option", "label", c);
                else if ("input" === a[0].tagName.toLowerCase()) {
                    if ("button" === a.attr("type")) {
                        a.val(c);
                        try {
                            a.button("refresh")
                        } catch (m) {
                        }
                    }
                } else
                    a.text(c)
            }
        });
        c.find("[data-i18n][data-menutitle]").each(function () {
            var a = b(this), c = a.attr("data-i18n");
            null != c && a.attr("data-menutitle", d[c])
        });
        c.find("[data-i18n_tooltip]").each(function () {
            var a = b(this), c = a.attr("data-i18n_tooltip");
            null != c && a.attr("title", d[c])
        });
        return !0
    }, loadAndApplyI18N: function (a, b, c, d) {
        var e = this.ensureLocaleFormat(a);
        this.loadI18N(e, function (a) {
            a && this.applyI18N(e, b, c);
            d && d(a)
        })
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    },
    registerEventOfConnecting: function (a) {
        return this._setEvent("connecting", a)
    }, registerEventOfConnected: function (a) {
        return this._setEvent("connected", a)
    }, registerEventOfDisconnected: function (a) {
        return this._setEvent("disconnected", a)
    }, registerEventOfConnected: function (a) {
        return this._setEvent("connected", a)
    }, registerEventOfDisconnected: function (a) {
        return this._setEvent("disconnected", a)
    }, registerEventOfConnectionFailed: function (a) {
        return this._setEvent("connection_failed", a)
    }, registerEventOfInstrumentRegistered: function (a) {
        return this._setEvent("instrumentRegistered",
            a)
    }, registerEventOfLoginComplete: function (a) {
        return this._setEvent("loginComplete", a)
    }, registerEventOfServerTimeReceived: function (a) {
        return this._setEvent("serverTime", a)
    }, registerEventOfSubAccount: function (a) {
        return this._setEvent("subAccount", a)
    }, registerEventOfStatement: function (a) {
        return this._setEvent("statement", a)
    }, registerEventOfOrder: function (a) {
        return this._setEvent("order", a)
    }, registerEventOfTicket: function (a) {
        return this._setEvent("ticket", a)
    }, registerEventOfAccount: function (a) {
        return this._setEvent("account",
            a)
    }, registerEventOfAccSymbol: function (a) {
        return this._setEvent("accSymbol", a)
    }, registerEventOfBankbook: function (a) {
        return this._setEvent("bankbook", a)
    }, registerEventOfActiveSymbol: function (a) {
        return this._setEvent("activeSymbol", a)
    }, registerEventOfMarketClose: function (a) {
        return this._setEvent("marketClose", a)
    }, registerEventOfGotTapeInstrument: function (a) {
        return this._setEvent("gotTapeInstrument", a)
    }, registerEventOfOrderReport: function (a) {
        return this._setEvent("orderReport", a)
    }, toDoWhenInstrumentTapeHadGotProxy: function (a,
                                                    b, c, d) {
        this.toDoWhenInstrumentTapeHadGot(a, function () {
            b.apply(c, d)
        })
    }, toDoWhenInstrumentTapeHadGot: function (a, b) {
        if (this._instruments_by_full_id[a])
            return b.call(this, a), !0;
        var c = this._todo_lists_when_instrument_tape_had_got[a];
        void 0 === c && (c = this._todo_lists_when_instrument_tape_had_got[a] = []);
        c.push(b);
        return !1
    }, DEF_SUBSCRIPTION_TYPES: {REALTIME_TAPE: 0, REALTIME_TICK: 1}, getAccountData: function () {
        return this._accountData
    }, getTelegramFactory: function () {
        return this._telegram_factory
    }, getQuerySessionWrapper: function () {
        return this._query_session_wrapper
    },
    _debug: function (a) {
        !0 == this._debug_mode && console.log(a)
    }
};
Core.prototype.KTYPE_DEFINITIONS = {
    m1: {"name-i18n": "KGraph_Type_Minute_1", duration: 6E4},
    m2: {"name-i18n": "KGraph_Type_Minute_2", duration: 12E4},
    m3: {"name-i18n": "KGraph_Type_Minute_3", duration: 18E4},
    m5: {"name-i18n": "KGraph_Type_Minute_5", duration: 3E5},
    m10: {"name-i18n": "KGraph_Type_Minute_10", duration: 6E5},
    m15: {"name-i18n": "KGraph_Type_Minute_15", duration: 9E5},
    m20: {"name-i18n": "KGraph_Type_Minute_20", duration: 12E5},
    m30: {"name-i18n": "KGraph_Type_Minute_30", duration: 18E5},
    m60: {
        "name-i18n": "KGraph_Type_Minute_60",
        duration: 36E5
    },
    H4: {"name-i18n": "KGraph_Type_Hour_4", duration: 144E5},
    D: {"name-i18n": "KGraph_Type_Day_1", duration: 0},
    W: {"name-i18n": "KGraph_Type_Week_1", duration: 0},
    M: {"name-i18n": "KGraph_Type_Month_1", duration: 0}
};
Core.prototype.CLIENT_EVENT_COUNTER = 0;
Core.prototype.CLIENT_EVENTS = {
    Reset: Core.prototype.CLIENT_EVENT_COUNTER++,
    Instrument_Init: Core.prototype.CLIENT_EVENT_COUNTER++,
    Instrument_Update: Core.prototype.CLIENT_EVENT_COUNTER++,
    Instruments_Reset_Instrument: Core.prototype.CLIENT_EVENT_COUNTER++,
    KGraph_Init: Core.prototype.CLIENT_EVENT_COUNTER++,
    KGraph_Append_KTick: Core.prototype.CLIENT_EVENT_COUNTER++,
    KGraph_Update_Last_KTick: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Init: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Interpolate_Ticks: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Init_5vpm_v: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Init_5vpm_p: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Init_5vpm_m: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Update_5vpm_5: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Update_5vpm_p: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Update_5vpm_m: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_New_Tick_5vpm_v: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_New_Tick_5vpm_p: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_New_Tick_5vpm_m: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Query_5vpm_p: Core.prototype.CLIENT_EVENT_COUNTER++,
    Runchart_Query_5vpm_m: Core.prototype.CLIENT_EVENT_COUNTER++,
    AccountData_Init: Core.prototype.CLIENT_EVENT_COUNTER++
};
Core.prototype.TELEGRAM_1002_C_NT = 5E3;
Core.prototype.TELEGRAM_1003_C_NT = 5E3;
Core.prototype.TELEGRAM_1004_C_NT = 5E3;
Core.prototype.SERVER_K_TYPES = {
    m1: {request: "m1", server: "min1"},
    m2: {request: "m1", duration: 12E4},
    m3: {request: "m1", duration: 18E4},
    m5: {request: "m5", server: "min5"},
    m10: {request: "m5", duration: 6E5},
    m15: {request: "m15", server: "min15"},
    m20: {request: "m5", duration: 12E5},
    m30: {request: "m30", server: "min30"},
    m60: {request: "m60", server: "min60"},
    H4: {request: "m60", duration: 144E5},
    D: {request: "D", server: "day"},
    W: {request: "W", server: "week"},
    M: {request: "M", server: "month"}
};
var AccountData = function (a) {
    this.arrAccounts_ = [];
    this.mapAccounts_ = {};
    this.arrSymbols_ = [];
    this.mapSymbols_ = {};
    this.waitingResponseMids_ = {};
    this.houseId_ = a.getHouseId();
    this.userId_ = a.getUserId();
    this.querySessionWrapper_ = a.getQuerySessionWrapper();
    this.telegramFactory_ = a.getTelegramFactory()
};
AccountData.prototype.createFromTelegram2010 = function (a, b) {
    for (var c = new AccountData(a), d = b.split("\u0003"), e = 0; e < d.length; ++e) {
        var f = d[e].split(","), g = f[0];
        c.mapAccounts_[g] = new Account(g, f[3]);
        c.arrAccounts_.push(c.mapAccounts_[g])
    }
    return c
};
AccountData.prototype.updateFromTelegram2010 = function (a) {
    a = a.split("\u0003");
    for (var b = 0; b < a.length; ++b) {
        var c = a[b].split(","), d = c[0], c = c[3], e = this.mapAccounts_[d];
        void 0 != e ? e.status_ = c : (this.mapAccounts_[d] = new Account(d, c), this.arrAccounts_.push(this.mapAccounts_[d]))
    }
};
AccountData.prototype.getAccountList = function () {
    return this.arrAccounts_
};
AccountData.prototype.getAccount = function (a) {
    return this.mapAccounts_[a]
};
AccountData.prototype.getSymbolList = function () {
    return this.arrSymbols_
};
AccountData.prototype.getSymbol = function (a) {
    return this.mapSymbols_[a]
};
AccountData.prototype.getAccSymbolSettings = function (a, b) {
    var c = this.mapAccounts_[a];
    return void 0 != c ? c.symbolSettings_[b] : null
};
AccountData.prototype.getOrdersOfAccount = function (a) {
    return this.mapAccounts_[a].getOrders()
};
AccountData.prototype.getOrder = function (a, b) {
    return this.mapAccounts_[a].getOrders()[b]
};
AccountData.prototype.getTicketsOfAccount = function (a) {
    return this.mapAccounts_[a].getTickets()
};
AccountData.prototype.getTicket = function (a, b) {
    return this.mapAccounts_[a].getTickets()[b]
};
AccountData.prototype.getProfit = function (a) {
    return this.mapAccounts_[a].getProfit()
};
AccountData.prototype.getBalance = function (a) {
    return this.mapAccounts_[a].getBalance()
};
AccountData.prototype.requestQuery2011 = function () {
    for (var a in this.mapAccounts_) {
        var b = this.telegramFactory_.genTelegramGetStatement(this.userId_, [this.houseId_, a]);
        this.querySessionWrapper_.send(b);
        b = b.mid;
        this.waitingResponseMids_[b] = b
    }
};
AccountData.prototype.receivedQuery2011 = function (a, b) {
    delete this.waitingResponseMids_[a];
    var c = [], d = b.split(","), e = d[0], f = this.mapAccounts_[e];
    void 0 != f && (f._accountFilledFrom2011(d), c.push(e));
    return c
};
AccountData.prototype.requestQuery2012 = function () {
    for (var a in this.mapAccounts_) {
        var b = this.telegramFactory_.genTelegramGetOrders(this.userId_, [this.houseId_, a]);
        this.querySessionWrapper_.send(b);
        b = b.mid;
        this.waitingResponseMids_[b] = b
    }
};
AccountData.prototype.receivedQuery2012 = function (a, b) {
    delete this.waitingResponseMids_[a];
    var c = {};
    if (0 == b.length)
        return c;
    for (var d = b.split("\u0003"), e = 0; e < d.length; ++e) {
        var f = d[e].split(","), g = f[3], h = this.mapAccounts_[g];
        if (void 0 != h) {
            var h = h._accountFilledFrom2012(f), f = f[0], k = c[g];
            void 0 == k && (k = c[g] = {update: [], add: []});
            k["U" == h ? "update" : "add"].push(f)
        }
    }
    return c
};
AccountData.prototype.requestQuery2014 = function () {
    for (var a in this.mapAccounts_) {
        var b = this.telegramFactory_.getTelegramGetTickets(this.userId_, [this.houseId_, a, " "]);
        this.querySessionWrapper_.send(b);
        b = b.mid;
        this.waitingResponseMids_[b] = b
    }
};
AccountData.prototype.receivedQuery2014 = function (a, b) {
    delete this.waitingResponseMids_[a];
    var c = {};
    if (0 == b.length)
        return c;
    for (var d = b.split("\u0003"), e = 0; e < d.length; ++e) {
        var f = d[e].split(","), g = f[2], h = this.mapAccounts_[g];
        if (void 0 != h) {
            var h = h._accountFilledFrom2014(f), f = f[0], k = c[g];
            void 0 == k && (k = c[g] = {update: [], add: []});
            k["U" == h ? "update" : "add"].push(f)
        }
    }
};
AccountData.prototype.requestQuery2015 = function () {
    for (var a in this.mapAccounts_) {
        var b = this.telegramFactory_.genTelegramGetAccountSettings(this.userId_, [this.houseId_, a]);
        this.querySessionWrapper_.send(b);
        b = b.mid;
        this.waitingResponseMids_[b] = b
    }
};
AccountData.prototype.receivedQuery2015 = function (a, b) {
    delete this.waitingResponseMids_[a];
    var c = [], d = b.split(","), e = d[0], f = this.mapAccounts_[e];
    void 0 != f && (f._accountFilledFrom2015(d), c.push(e));
    return c
};
AccountData.prototype.requestQuery2016 = function () {
    for (var a in this.mapAccounts_) {
        var b = this.telegramFactory_.genTelegramGetAccountSymbols(this.userId_, [this.houseId_, a]);
        this.querySessionWrapper_.send(b);
        b = b.mid;
        this.waitingResponseMids_[b] = b
    }
};
AccountData.prototype.receivedQuery2016 = function (a, b) {
    delete this.waitingResponseMids_[a];
    for (var c = {}, d = b.split("\u0003"), e = 0; e < d.length; ++e) {
        var f = d[e].split(","), g = f[2];
        g in this.mapSymbols_ || (this.mapSymbols_[g] = new Symbol(g, f[27]), this.arrSymbols_.push(this.mapSymbols_[g]));
        var h = f[0], k = this.mapAccounts_[h];
        void 0 != k && (k._accountFilledFrom2016(f), f = c[h], void 0 == f && (f = c[h] = []), f.push(g))
    }
    return c
};
AccountData.prototype.requestQuery2018 = function () {
    for (var a in this.mapAccounts_) {
        var b = this.telegramFactory_.genTelegramGetBankbook(this.userId_, [this.houseId_, a]);
        this.querySessionWrapper_.send(b);
        b = b.mid;
        this.waitingResponseMids_[b] = b
    }
};
AccountData.prototype.receivedQuery2018 = function (a, b) {
    delete this.waitingResponseMids_[a];
    for (var c = {}, d = b.split("\u0003"), e = 0; e < d.length; ++e) {
        var f = d[e].split(","), g = f[0], h = this.mapAccounts_[g];
        void 0 != h && (h._accountFilledFrom2018(f), h = c[g], void 0 == h && (h = c[g] = []), h.push(f[1]))
    }
    return c
};
AccountData.prototype.receivedQuery2025 = function (a) {
    var b = [];
    a = a.split("\u0003");
    for (var c = 0; c < a.length; ++c) {
        var d = a[c].split(","), e = d[0], f = this.mapSymbols_[e];
        void 0 != f && (f.symbolFilledFrom2025(d), b.push(e))
    }
    return b
};
AccountData.prototype.isWaitingResponse = function () {
    return 0 < this.waitingResponseMids_.length
};
var Account = function (a, b) {
    this.id_ = a;
    this.status_ = b;
    this.balance_ = this.profit_ = null;
    this.orders_ = {};
    this.tickets_ = {};
    this.symbolSettings_ = {};
    this.bankbooks_ = []
};
Account.prototype.getAccountId = function () {
    return this.id_
};
Account.prototype.getAccountStatus = function () {
    return this.status_
};
Account.prototype.getProfit = function () {
    return this.profit_
};
Account.prototype.getBalance = function () {
    return this.balance_
};
Account.prototype.getOrders = function () {
    return this.orders_
};
Account.prototype.getTickets = function () {
    return this.tickets_
};
Account.prototype.getOrder = function (a) {
    return this.orders_[a]
};
Account.prototype.getTicket = function (a) {
    return this.tickets_[a]
};
Account.prototype.getInitialMargin = function () {
    return this.initialMargin_
};
Account.prototype.getServicePerson = function () {
    return this.servicePerson_
};
Account.prototype.getServiceNumber = function () {
    return this.serviceNumber_
};
Account.prototype._accountFilledFrom2011 = function (a) {
    this.profit_ = a[7];
    this.balance_ = a[11]
};
Account.prototype._accountFilledFrom2012 = function (a) {
    var b = a[0], c = this.orders_[b];
    void 0 == c ? (c = this.orders_[b] = new Order(b), b = "A") : b = "U";
    c.filledFrom2012(a);
    return b
};
Account.prototype._accountFilledFrom2014 = function (a) {
    var b = a[0], c = this.tickets_[b];
    void 0 == c ? (c = this.tickets_[b] = new Ticket(b), b = "A") : b = "U";
    c.filledFrom2014(a);
    return b
};
Account.prototype._accountFilledFrom2015 = function (a) {
    this.initialMargin_ = a[5];
    this.servicePerson_ = a[19];
    this.serviceNumber_ = a[20]
};
Account.prototype._accountFilledFrom2016 = function (a) {
    var b = a[2], c = this.symbolSettings_[b];
    void 0 == c && (c = this.symbolSettings_[b] = new AccSymbolSettings);
    c.filledFrom2016(a)
};
Account.prototype._accountFilledFrom2018 = function (a) {
    var b = new BankbookRow;
    b.filledFrom2018(a);
    this.bankbooks_.push(b)
};
var Order = function (a) {
    this.orderNo_ = a
};
Order.prototype.filledFrom2012 = function (a) {
    this.originalTicketNo_ = a[1];
    this.tradeDate_ = a[2];
    this.accountId_ = a[3];
    this.houseId_ = a[4];
    this.symbolId_ = a[5];
    this.openClose_ = a[6];
    this.orderType_ = a[7];
    this.buySell_ = a[8];
    this.ownerId_ = a[9];
    this.operatorId_ = a[10];
    this.dealerId_ = a[11];
    this.orderLots_ = a[12];
    this.orderStatus_ = a[13];
    this.price_ = a[14];
    this.accumulatedLots_ = a[15];
    this.leftLots_ = a[16];
    this.activeTime_ = a[17];
    this.activePrice_ = a[18];
    this.triggeredPrice_ = a[19];
    this.openLimitPrice_ = a[20];
    this.closeLimitPrice_ =
        a[21];
    this.openStopPrice_ = a[22];
    this.closeStopPrice_ = a[23];
    this.screenBid_ = a[24];
    this.screenAsk_ = a[25];
    this.receiveTime_ = a[26];
    this.updateTime_ = a[27];
    this.triggeredTime_ = a[28];
    this.deletedTime_ = a[29];
    this.contractType_ = a[30];
    this.orderMemo_ = a[31];
    this.orderAction_ = a[32];
    this.closeWhenMc_ = a[33];
    this.limitPip_ = a[34];
    this.stopPip_ = a[35]
};
Order.prototype.getOrderNo = function () {
    return this.orderNo_
};
Order.prototype.getOriginalTicketNo = function () {
    return this.originalTicketNo_
};
Order.prototype.getTradeDate = function () {
    return this.tradeDate_
};
Order.prototype.getAccountId = function () {
    return this.accountId_
};
Order.prototype.getHouseId = function () {
    return this.houseId_
};
Order.prototype.getSymbolId = function () {
    return this.symbolId_
};
Order.prototype.getOpenClose = function () {
    return this.openClose_
};
Order.prototype.getOrderType = function () {
    return this.orderType_
};
Order.prototype.getBuySell = function () {
    return this.buySell_
};
Order.prototype.getOwnerId = function () {
    return this.ownerId_
};
Order.prototype.getOperatorId = function () {
    return this.operatorId_
};
Order.prototype.getDealerId = function () {
    return this.dealerId_
};
Order.prototype.getOrderLots = function () {
    return this.orderLots_
};
Order.prototype.getOrderStatus = function () {
    return this.orderStatus_
};
Order.prototype.getPrice = function () {
    return this.price_
};
Order.prototype.getLeftLots = function () {
    return this.leftLots_
};
Order.prototype.getActiveTime = function () {
    return this.activeTime_
};
Order.prototype.getActivePrice = function () {
    return this.activePrice_
};
Order.prototype.getTriggeredPrice = function () {
    return this.triggeredPrice_
};
Order.prototype.getOpenLimitPrice = function () {
    return this.openLimitPrice_
};
Order.prototype.getCloseLimitPrice = function () {
    return this.closeLimitPrice_
};
Order.prototype.getOpenStopPrice = function () {
    return this.openStopPrice_
};
Order.prototype.getCloseStopPrice = function () {
    return this.closeStopPrice_
};
Order.prototype.getScreenBid = function () {
    return this.screenBid_
};
Order.prototype.getScreenAsk = function () {
    return this.screenAsk_
};
Order.prototype.getReceiveTime = function () {
    return this.receiveTime_
};
Order.prototype.getUpdateTime = function () {
    return this.updateTime_
};
Order.prototype.getTriggeredTime = function () {
    return this.triggeredTime_
};
Order.prototype.getDeletedTime = function () {
    return this.deletedTime_
};
Order.prototype.getContractType = function () {
    return this.contractType_
};
Order.prototype.getOrderMemo = function () {
    return this.orderMemo_
};
Order.prototype.getOrderAction = function () {
    return this.orderAction_
};
Order.prototype.getCloseWhenMc = function () {
    return this.closeWhenMc_
};
Order.prototype.getLimitPip = function () {
    return this.limitPip_
};
Order.prototype.getStopPip = function () {
    return this.stopPip_
};
var Ticket = function (a) {
    this.ticketNo_ = a
};
Ticket.prototype.filledFrom2014 = function (a) {
    this.originTicketNo_ = a[1];
    this.accountId_ = a[2];
    this.houseId_ = a[3];
    this.openClose_ = a[4];
    this.ownerId_ = a[5];
    this.dealerId_ = a[6];
    this.symbolId_ = a[7];
    this.orderType_ = a[8];
    this.buySell_ = a[9];
    this.isLock_ = a[10];
    this.timeInForce_ = a[12];
    this.openOrderNo_ = a[13];
    this.openOperatorId_ = a[14];
    this.openPrice_ = a[15];
    this.openTime_ = a[16];
    this.openScreenBid_ = a[17];
    this.openScreenAsk_ = a[18];
    this.closeOperatorId_ = a[19];
    this.closeOrderNo_ = a[20];
    this.closePrice_ = a[21];
    this.closeTime_ =
        a[22];
    this.closeScreenBid_ = a[23];
    this.closeScreenAsk_ = a[24];
    this.profit_ = a[25];
    this.leftLots_ = a[27];
    this.openCommission_ = a[28];
    this.closeCommission_ = a[29];
    this.tax_ = a[30];
    this.fee_ = a[31];
    this.interest_ = a[32];
    this.accumulatedInterest_ = a[33];
    this.netProfit_ = a[34];
    this.initialMargin_ = a[35];
    this.mntMargin_ = a[36];
    this.updateTime_ = a[37];
    this.commission_ = a[38];
    this.overNightDayCount_ = a[39];
    this.overNightMarginRequired_ = a[40];
    this.contractType_ = a[41];
    this.positionStatus_ = a[42];
    this.openOrderType_ = a[43];
    this.closeOrderType_ =
        a[44];
    this.currency_ = a[45]
};
Ticket.prototype.getTicketNo = function () {
    return this.ticketNo_
};
Ticket.prototype.getOriginTicketNo = function () {
    return this.originTicketNo_
};
Ticket.prototype.getAccountId = function () {
    return this.accountId_
};
Ticket.prototype.getHouseId = function () {
    return this.houseId_
};
Ticket.prototype.getOpenClose = function () {
    return this.openClose_
};
Ticket.prototype.getOwnerId = function () {
    return this.ownerId_
};
Ticket.prototype.getDealerId = function () {
    return this.dealerId_
};
Ticket.prototype.getSymbolId = function () {
    return this.symbolId_
};
Ticket.prototype.getOrderType = function () {
    return this.orderType_
};
Ticket.prototype.getBuySell = function () {
    return this.buySell_
};
Ticket.prototype.getIsLock = function () {
    return this.isLock_
};
Ticket.prototype.getTimeInForce = function () {
    return this.timeInForce_
};
Ticket.prototype.getOpenOrderNo = function () {
    return this.openOrderNo_
};
Ticket.prototype.getOpenOperatorId = function () {
    return this.openOperatorId_
};
Ticket.prototype.getOpenPrice = function () {
    return this.openPrice_
};
Ticket.prototype.getOpenTime = function () {
    return this.openTime_
};
Ticket.prototype.getOpenScreenBid = function () {
    return this.openScreenBid_
};
Ticket.prototype.getOpenScreenAsk = function () {
    return this.openScreenAsk_
};
Ticket.prototype.getCloseOperatorId = function () {
    return this.closeOperatorId_
};
Ticket.prototype.getCloseOrderNo = function () {
    return this.closeOrderNo_
};
Ticket.prototype.getClosePrice = function () {
    return this.closePrice_
};
Ticket.prototype.getCloseTime = function () {
    return this.closeTime_
};
Ticket.prototype.getCloseScreenBid = function () {
    return this.closeScreenBid_
};
Ticket.prototype.getCloseScreenAsk = function () {
    return this.closeScreenAsk_
};
Ticket.prototype.getProfit = function () {
    return this.profit_
};
Ticket.prototype.getLeftLots = function () {
    return this.leftLots_
};
Ticket.prototype.getOpenCommission = function () {
    return this.openCommission_
};
Ticket.prototype.getCloseCommission = function () {
    return this.closeCommission_
};
Ticket.prototype.getTax = function () {
    return this.tax_
};
Ticket.prototype.getFee = function () {
    return this.fee_
};
Ticket.prototype.getInterest = function () {
    return this.interest_
};
Ticket.prototype.getAccumulatedInterest = function () {
    return this.accumulatedInterest_
};
Ticket.prototype.getNetProfit = function () {
    return this.netProfit_
};
Ticket.prototype.getInitialMargin = function () {
    return this.initialMargin_
};
Ticket.prototype.getMntMargin = function () {
    return this.mntMargin_
};
Ticket.prototype.getUpdateTime = function () {
    return this.updateTime_
};
Ticket.prototype.getCommission = function () {
    return this.commission_
};
Ticket.prototype.getOverNightDayCount = function () {
    return this.overNightDayCount_
};
Ticket.prototype.getOverNightMarginRequired = function () {
    return this.overNightMarginRequired_
};
Ticket.prototype.getContractType = function () {
    return this.contractType_
};
Ticket.prototype.getPositionStatus = function () {
    return this.positionStatus_
};
Ticket.prototype.getOpenOrderType = function () {
    return this.openOrderType_
};
Ticket.prototype.getCloseOrderType = function () {
    return this.closeOrderType_
};
Ticket.prototype.getCurrency = function () {
    return this.currency_
};
var Symbol = function (a, b) {
    this.symbolId_ = a;
    this.symbolName_ = b;
    this.monthCode_ = this.symbolOrder_ = this.tradeDateToday_ = this.step_ = this.decimal_ = this.timeZone_ = this.crossDay_ = this.resetTime1_ = this.resetTime_ = this.closeTime1_ = this.closeTime_ = this.openTime1_ = this.openTime_ = this.tradeStatus_ = this.lastTradeDate_ = null
};
Symbol.prototype.symbolFilledFrom2025 = function (a) {
    this.lastTradeDate_ = a[2];
    this.tradeStatus_ = a[3];
    this.openTime_ = a[4];
    this.openTime1_ = a[5];
    this.closeTime_ = a[6];
    this.closeTime1_ = a[7];
    this.resetTime_ = a[8];
    this.resetTime1_ = a[9];
    this.crossDay_ = a[10];
    this.timeZone_ = a[11];
    this.decimal_ = a[12];
    this.step_ = a[13];
    this.tradeDateToday_ = a[14];
    this.symbolOrder_ = a[15];
    this.monthCode_ = a[16]
};
Symbol.prototype.getId = function () {
    return this.symbolId_
};
Symbol.prototype.getName = function () {
    return this.symbolName_
};
Symbol.prototype.getLastTradeDate = function () {
    return this.lastTradeDate_
};
Symbol.prototype.getTradeStatus = function () {
    return this.tradeStatus_
};
Symbol.prototype.getOpenTime = function () {
    return this.openTime_
};
Symbol.prototype.getOpenTime1 = function () {
    return this.openTime1_
};
Symbol.prototype.getCloseTime = function () {
    return this.closeTime_
};
Symbol.prototype.getCloseTime1 = function () {
    return this.closeTime1_
};
Symbol.prototype.getResetTime = function () {
    return this.resetTime_
};
Symbol.prototype.getResetTime1 = function () {
    return this.resetTime1_
};
Symbol.prototype.getCrossDay = function () {
    return this.crossDay_
};
Symbol.prototype.getTimeZone = function () {
    return this.timeZone_
};
Symbol.prototype.getDecimal = function () {
    return this.decimal_
};
Symbol.prototype.getStep = function () {
    return this.step_
};
Symbol.prototype.getTradeDateToday = function () {
    return this.tradeDateToday_
};
Symbol.prototype.getSymbolOrder = function () {
    return this.symbolOrder_
};
Symbol.prototype.getMonthCode = function () {
    return this.monthCode_
};
var AccSymbolSettings = function () {
    this.ruleTradable_ = this.ruleFastOrder_ = this.tickValue_ = this.tickUnit_ = null
};
AccSymbolSettings.prototype.filledFrom2016 = function (a) {
    this.mainSymbolId_ = a[1];
    this.symbolId_ = a[2];
    this.houseId_ = a[3];
    this.contractSize_ = a[4];
    this.tickUnit_ = a[5];
    this.tickValue_ = a[6];
    this.tradeStatus_ = a[7];
    this.oiDays_ = a[8];
    this.oiLots_ = a[9];
    this.lotsPerMinutes_ = a[10];
    this.lotsPerTrade_ = a[11];
    this.creditLots_ = a[12];
    this.creditLine_ = a[13];
    this.initialMargin_ = a[14];
    this.mntMargin_ = a[15];
    this.dailyMargin_ = a[16];
    this.overnightMargin_ = a[17];
    this.openCommission_ = a[18];
    this.closeCommission_ = a[19];
    this.openUpdown_ =
        a[20];
    this.updateTime_ = a[21];
    this.fee_ = a[22];
    this.interest_ = a[23];
    this.lastTradeDate_ = a[24];
    this.decimal_ = a[25];
    this.step_ = a[26];
    this.symbolName_ = a[27];
    this.ruleFastOrder_ = a[28];
    this.ruleTradable_ = a[29];
    this.ruleTradeOnbehave_ = a[30];
    this.ruleDeleteOnbehave_ = a[31];
    this.ruleModifyLimitStopOrder_ = a[32];
    this.ruleStopOrder_ = a[33];
    this.ruleMarketOrder_ = a[34];
    this.ruleLimitOrder_ = a[35];
    this.ruleSettlementByClosePrice_ = a[36];
    this.ruleMultiOrder_ = a[37];
    this.ruleReverseOrderAllowed_ = a[38];
    this.ruleCloseStopLimitSync_ =
        a[39];
    this.tradeMarketOrderSecond_ = a[40];
    this.tradeLimitOrderSecond_ = a[41];
    this.tradeDeleteOrderSecond_ = a[42];
    this.tradeOpenUpLimit_ = a[43];
    this.tradeLotUpDownLimit_ = a[44];
    this.tradeLimitPipGap_ = a[45];
    this.tradeStopPipGap_ = a[46];
    this.tradeStopOrderGap_ = a[47];
    this.tradeForceCloseGap_ = a[48];
    this.settingBigAllowed_ = a[49];
    this.settingBigPipCost_ = a[50];
    this.settingBigOpenCommission_ = a[51];
    this.settingBigCloseCommission_ = a[52];
    this.settingMedAllowed_ = a[53];
    this.settingMedPipCost_ = a[54];
    this.settingMedOpenCommission_ =
        a[55];
    this.settingMedCloseCommission_ = a[56];
    this.settingSmallAllowed_ = a[57];
    this.settingSmallPipCost_ = a[58];
    this.settingSmallOpenCommission_ = a[59];
    this.settingSmallCloseCommission_ = a[60]
};
AccSymbolSettings.prototype.getTickUnit = function () {
    return this.tickUnit_
};
AccSymbolSettings.prototype.getTickValue = function () {
    return this.tickValue_
};
AccSymbolSettings.prototype.getStep = function () {
    return this.step_
};
AccSymbolSettings.prototype.getRuleFastOrder = function () {
    return this.ruleFastOrder_
};
AccSymbolSettings.prototype.getRuleTradable = function () {
    return this.ruleTradable_
};
AccSymbolSettings.prototype.getTradeLimitPipGap = function () {
    return this.tradeLimitPipGap_
};
AccSymbolSettings.prototype.getTradeStopPipGap = function () {
    return this.tradeStopPipGap_
};
AccSymbolSettings.prototype.getTradeStopOrderGap = function () {
    return this.tradeStopOrderGap_
};
AccSymbolSettings.prototype.getTradeForceCloseGap = function () {
    return this.tradeForceCloseGap_
};
AccSymbolSettings.prototype.getSettingBigAllowed = function () {
    return this.settingBigAllowed_
};
AccSymbolSettings.prototype.getSettingBigPipCost = function () {
    return this.settingBigPipCost_
};
AccSymbolSettings.prototype.getSettingBigOpenCommission = function () {
    return this.settingBigOpenCommission_
};
AccSymbolSettings.prototype.getSettingBigCloseCommission = function () {
    return this.settingBigCloseCommission_
};
AccSymbolSettings.prototype.getSettingMedAllowed = function () {
    return this.settingMedAllowed_
};
AccSymbolSettings.prototype.getSettingMedPipCost = function () {
    return this.settingMedPipCost_
};
AccSymbolSettings.prototype.getSettingMedOpenCommission = function () {
    return this.settingMedOpenCommission_
};
AccSymbolSettings.prototype.getSettingMedCloseCommission = function () {
    return this.settingMedCloseCommission_
};
AccSymbolSettings.prototype.getSettingSmallAllowed = function () {
    return this.settingSmallAllowed_
};
AccSymbolSettings.prototype.getSettingSmallPipCost = function () {
    return this.settingSmallPipCost_
};
AccSymbolSettings.prototype.getSettingSmallOpenCommission = function () {
    return this.settingSmallOpenCommission_
};
AccSymbolSettings.prototype.getSettingSmallCloseCommission = function () {
    return this.settingSmallCloseCommission_
};
var BankbookRow = function () {
    this.balance_ = this.amount_ = this.bankbookType_ = this.tradeDate_ = null
};
BankbookRow.prototype.filledFrom2018 = function (a) {
    this.tradeDate_ = a[2];
    this.bankbookType_ = a[3];
    this.amount_ = a[4];
    this.balance_ = a[5]
};
BankbookRow.prototype.getTradeDate = function () {
    return this.tradeDate_
};
BankbookRow.prototype.getBankbookType = function () {
    return this.bankbookType_
};
BankbookRow.prototype.getAmount = function () {
    return this.amount_
};
BankbookRow.prototype.getBalance = function () {
    return this.balance_
};
var FQClient_Tooltips = function () {
    this._events = {};
    this._initLayout()
};
FQClient_Tooltips.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        $("body").on("contextmenu", function () {
            return !1
        });
        $(frameElement).css("clip", "rect( 0, 0, 0, 0)")
    }, _getJqueryTooltipById: function (a) {
        return $("#tooltip_" + a)
    }, addTooltip: function (a, b) {
        $("<span>").appendTo("body").addClass("tooltip").attr("id",
            "tooltip_" + a).tooltip({
                content: b,
                show: {effect: "fadeIn", duration: 50, delay: 200},
                hide: !1,
                track: !1,
                open: function (a, b) {
                    var e = b.tooltip;
                    e.show();
                    var f = e[0].getBoundingClientRect();
                    e.hide();
                    e = "rect( " + Math.floor(f.top) + "px, " + Math.ceil(f.right) + "px, " + Math.ceil(f.bottom) + "px, " + Math.floor(f.left) + "px)";
                    $(frameElement).css("clip", e)
                }
            })
    }, showTooltipByEvent: function (a, b) {
        var c = this._getJqueryTooltipById(a);
        c.tooltip("close");
        var d = b.view.frameElement.getBoundingClientRect(), e = b.target.getBoundingClientRect();
        b.pageX = d.left + e.right;
        b.pageY = d.top + Math.floor(.5 * (e.top + e.bottom));
        c.tooltip("option", "position", {my: "left center", at: "center center", of: b});
        c.attr("title", "").tooltip("open")
    }, hideAllTooltips: function () {
        $(".tooltip").tooltip("close")
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui),
                $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        this._core.loadAndApplyI18N(a, $, document)
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfShowing: function (a) {
        this._setEvent("showing", a)
    }, registerEventOfClosed: function (a) {
        this._setEvent("closed", a)
    }
};
var FQClient_ContextMenus = function () {
    this._events = {};
    this._initLayout()
};
FQClient_ContextMenus.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
    }, _convertItem: function (a) {
        var b = "string" === typeof a;
        if (b)
            return a;
        var c = {}, d = a.name, e = a.nameI18N, f = a.items;
        null == d && (d = "");
        c.name = null != e ? '<span data-i18n="' + e + '">' + d + "</span>" : d;
        if (null != f) {
            var d = c.items = {}, g;
            for (g in f)
                d[g] = this._convertItem(f[g])
        }
        if (!b)
            for (var h in a)
                void 0 ===
                c[h] && (c[h] = a[h]);
        return c
    }, addContextMenu: function (a, b, c, d, e) {
        var f = {}, g;
        for (g in d)
            f[g] = this._convertItem(d[g]);
        var h = this;
        $("<div>").appendTo(document.body).attr("id", a).css("display", "none");
        d = "context_menu_class_" + a;
        $.contextMenu({
            appendTo: document.body,
            selector: "#" + a,
            className: d,
            trigger: "none",
            zIndex: 3,
            items: f,
            callback: function (a, b) {
                return e(a, {})
            },
            events: {
                show: function (a) {
                    h._fireEvent("showing");
                    $.contextMenu.setInputValues(a, this.data())
                }, hide: function (a) {
                    $.contextMenu.getInputValues(a, this.data());
                    h._fireEvent("closed")
                }, change: function (a, b) {
                    $.contextMenu.getInputValues(a, this.data());
                    var c = e(b, {selected: a.items[b].selected});
                    !1 !== c && this.contextMenu("hide");
                    return c
                }
            }
        });
        a = $("." + d);
        a.attr("data-menutitle", b).attr("data-i18n", c);
        a.parent().find(".context-menu-list").addClass("ui-widget-content");
        this.changeI18NLocale(this._locale)
    }, showContextMenu: function (a, b, c) {
        $("#" + a).contextMenu({x: b, y: c})
    }, hideContextMenu: function (a) {
        $("#" + a).contextMenu("hide")
    }, hideAllContextMenus: function () {
        $(".context-menu-root").contextMenu("hide")
    },
    isItemSelectedForContextMenu: function (a, b) {
        return $(".context_menu_class_" + a).find('input[name="context-menu-input-' + b + '"]').prop("checked")
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        this._core.loadAndApplyI18N(a, $,
            document)
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfShowing: function (a) {
        this._setEvent("showing", a)
    }, registerEventOfClosed: function (a) {
        this._setEvent("closed", a)
    }
};
var FQClient_DialogHTML = function () {
    this._events = {};
    this._initLayout()
};
FQClient_DialogHTML.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        $("#dialog").dialog({
            modal: !0,
            closeOnEscape: !0,
            autoResize: !1,
            autoOpen: !1,
            draggable: !0,
            resizable: !1,
            width: "auto",
            height: "auto",
            open: function (b, c) {
                a._fireEvent("showing");
                var d =
                    $("#dialog"), e = d.dialog("option", "closeOnEscape");
                $(window.frameElement).css({visibility: "visible"});
                $(".ui-widget-overlay").on("click", function () {
                    e && d.dialog("close")
                });
                e ? d.parent().find(".ui-dialog-titlebar-close").show() : d.parent().find(".ui-dialog-titlebar-close").hide()
            },
            close: function () {
                a._fireEvent("closed");
                $(window.frameElement).css({visibility: "hidden"})
            }
        })
    }, getDialog: function () {
        return $("#dialog")[0]
    }, resetHTML: function (a) {
        $("#dialog").html(a)
    }, setSize: function (a, b) {
        $("#dialog").dialog("option",
            "width", a).dialog("option", "height", b)
    }, setMinSize: function (a, b) {
        $("#dialog").dialog("option", "minWidth", a).dialog("option", "minHeight", b)
    }, setMaxSize: function (a, b) {
        $("#dialog").dialog("option", "maxWidth", a).dialog("option", "maxHeight", b)
    }, setResizable: function (a) {
        $("#dialog").dialog("option", "resizable", a)
    }, showDialog: function (a) {
        var b = $("#dialog");
        b.dialog("option", "closeOnEscape", a);
        b.dialog("open");
        a = b.dialog("option", "width");
        var c = b.dialog("option", "height");
        b.dialog("option", "width", a);
        b.dialog("option",
            "height", c)
    }, hideDialog: function () {
        $("#dialog").dialog("close")
    }, repositionDialog: function () {
        var a = $("#dialog");
        a.width();
        var b = a.height();
        $(window).width();
        var c = $(window).height();
        b < c ? a.dialog("option", "position", {
            my: "center",
            at: "center",
            of: window
        }) : a.dialog("option", "position", {my: "center top", at: "center top", of: window})
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, setTitle: function (a) {
        $("#dialog").dialog("option",
            "title", a)
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        this._core.loadAndApplyI18N(a, $, document)
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfShowing: function (a) {
        this._setEvent("showing", a)
    }, registerEventOfClosed: function (a) {
        this._setEvent("closed", a)
    }
};
var FQClient_DialogCustomColumns = function () {
    this._events = {};
    this._initLayout()
};
FQClient_DialogCustomColumns.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        $("#dialog").dialog({
            modal: !0,
            closeOnEscape: !0,
            autoResize: !1,
            autoOpen: !1,
            draggable: !0,
            resizable: !1,
            width: "auto",
            height: "auto",
            open: function (b, c) {
                a._fireEvent("showing");
                $(window.frameElement).css({visibility: "visible"})
            },
            close: function () {
                a._fireEvent("closed");
                $(window.frameElement).css({visibility: "hidden"})
            }
        });
        $("#setup_column_select").button().click(function () {
            $("#setup_unselected_columns").find("option:selected").appendTo($("#setup_selected_columns"))
        });
        $("#setup_column_unselect").button().click(function () {
            $("#setup_selected_columns").find("option:selected").appendTo($("#setup_unselected_columns"))
        });
        $("#setup_column_selected_up").button().click(function () {
            $("#setup_selected_columns").find("option:selected").each(function () {
                $(this).insertBefore($(this).prev())
            })
        });
        $("#setup_column_selected_down").button().click(function () {
            $($("#setup_selected_columns").find("option:selected").get().reverse()).each(function () {
                $(this).insertAfter($(this).next())
            })
        });
        $("#setup_column_ok").button().click(function () {
            $("#dialog").dialog("close");
            var b = $("#setup_selected_columns").find("option").map(function () {
                return this.value
            }).get();
            a._fireEvent("commit", {selectedColumnNameList: b})
        })
    }, resetColumns: function (a, b, c) {
        var d;
        d = "";
        for (var e in b) {
            var f = b[e], g = a[f];
            void 0 === g ? console.error("There's no column \"" +
            f + '".') : d = d + '<option value="' + f + '" data-i18n="' + g["name-i18n"] + '"></option>'
        }
        $("#setup_selected_columns").html(d);
        d = "";
        for (e in c)
            f = c[e], g = a[f], d = d + '<option value="' + f + '" data-i18n="' + g["name-i18n"] + '"></option>';
        $("#setup_unselected_columns").html(d);
        this.changeI18NLocale(this._locale)
    }, showDialog: function () {
        $("#dialog").dialog("open")
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a,
            function (a) {
                a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
            })
    }, changeI18NLocale: function (a) {
        this._core.loadAndApplyI18N(a, $, document)
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfShowing: function (a) {
        this._setEvent("showing", a)
    }, registerEventOfClosed: function (a) {
        this._setEvent("closed", a)
    }, registerEventOfCommit: function (a) {
        this._setEvent("commit", a)
    }
};
var FQClient_DialogCustomInstruments = function () {
    this._events = {};
    this._instrument_lists = [];
    this._temp_instrument_lists = [];
    this._instrument_limit_number_limit = 0;
    this._initLayout()
};
FQClient_DialogCustomInstruments.prototype = {
    _initStockClient: function (a, b) {
        var c = this;
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        var d = $("#setup_exchange_list"), e, f = this._core.getInstrumentInfos();
        e = "";
        var g = this._core.getExchangeList(), h;
        for (h in g) {
            var k = g[h];
            e += '<option value="' + k + '" >' + f[k].displayName + "</option>"
        }
        d.html(e);
        d.on("change", function () {
            var a = d.val();
            c._updateSetupICListByExchange(a)
        }).trigger("change");
        $("#setup_instrument_custom_list").on("change", function () {
            var a =
                $(this).val();
            c._updateTempInstrumentList(a)
        });
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        $("#dialog").dialog({
            modal: !0,
            closeOnEscape: !0,
            autoResize: !1,
            autoOpen: !1,
            draggable: !0,
            resizable: !1,
            width: "auto",
            height: "auto",
            open: function (b, c) {
                a._fireEvent("showing");
                $(window.frameElement).css({visibility: "visible"})
            },
            close: function () {
                a._fireEvent("closed");
                $(window.frameElement).css({visibility: "hidden"})
            }
        });
        $("#setup_instruments_add").button().on("click", function () {
            var b = {}, c = $("#setup_instrument_registered_in_the_custom");
            c.children().each(function () {
                var a = $(this).val();
                b[a] = !0
            });
            $("#setup_instruments").find("option:selected").each(function () {
                var a = $(this).val();
                b[a] || $(this).clone().appendTo(c)
            });
            a._updateSelectedInstrumentList()
        });
        $("#setup_instruments_move_up").button().click(function () {
            $("#setup_instrument_registered_in_the_custom").find("option:selected").each(function () {
                $(this).insertBefore($(this).prev())
            });
            a._updateSelectedInstrumentList()
        });
        $("#setup_instruments_move_down").button().click(function () {
            a._updateSelectedInstrumentList();
            $($("#setup_instrument_registered_in_the_custom").find("option:selected").get().reverse()).each(function () {
                $(this).insertAfter($(this).next())
            })
        });
        $("#setup_instruments_remove").button().on("click", function () {
            $("#setup_instrument_registered_in_the_custom").find("option:selected").remove();
            a._updateSelectedInstrumentList()
        });
        $("#setup_instrument_ok").button().on("click",
            function () {
                var b = $("#setup_instrument_custom_list").val();
                a._ApplyChanging();
                $("#dialog").dialog("close");
                a._fireEvent("commit", {selectedInstrumentListIndex: parseInt(b)})
            });
        $("#setup_instrument_custom_list").on("change", function () {
            var b = $(this).val();
            a._updateTempInstrumentList(b)
        });
        $("#setup_instrument_ic_list").on("change", function () {
            var b = $(this).val();
            "__all" === b && (b = null);
            var c = $("#setup_exchange_list").val();
            a._updateSetupInstrumentListByIC(c, b)
        })
    }, _updateSetupICListByExchange: function (a) {
        var b =
            $("#setup_instrument_ic_list");
        a = this._core.getInstrumentInfos()[a].icInfos;
        var c = '<option value="__all" selected="selected">(\u5168\u90e8)</option>', d;
        for (d in a)
            c += '<option value="' + d + '">' + a[d].displayName + "</option>";
        $("#setup_instrument_ic_list").trigger("change");
        b.html(c)
    }, _updateSetupInstrumentListByIC: function (a, b) {
        var c = $("#setup_instruments"), d = "", e = this._core.getInstrumentInfos()[a].symbols, f;
        for (f in e) {
            var g = e[f];
            if (null == b || g.ic === b)
                d += '<option value="' + (a + ":" + f) + '">(' + f + ") " + g.displayName +
                "</option>"
        }
        c.html(d).children(":first").prop("selected", !0);
        this._core.loadAndApplyI18N(this._locale, $, c[0])
    }, _updateTempInstrumentList: function (a) {
        var b = $("#setup_instrument_registered_in_the_custom"), c = "";
        if (null != a) {
            var d = this._core.getInstrumentInfos();
            if (a = this.getTempInstrumentLists()[a])
                for (var e in a) {
                    var f = a[e], g = f.split(":"), h = g[1], g = d[g[0]];
                    null != g && (g = g.symbols[h]) && (c += '<option value="' + f + '">(' + h + ") " + g.displayName + "</option>")
                }
        }
        b.html(c);
        this._updateInstrumentListCount()
    }, _updateSelectedInstrumentList: function () {
        var a =
            $("#setup_instrument_custom_list").find("option:selected").val(), b = $("#setup_instrument_registered_in_the_custom").children().map(function () {
            return $(this).val()
        }).get(), a = parseInt(a);
        this._temp_instrument_lists[a] = b;
        this._updateInstrumentListCount()
    }, _compareArray: function (a, b) {
        var c = a.length;
        if (c !== b.length)
            return !1;
        for (var d = 0; d < c; ++d)
            if (a[d] != b[d])
                return !1;
        return !0
    }, _ApplyChanging: function () {
        var a, b = this._instrument_lists, c = this._temp_instrument_lists, d = b.length, e = {};
        if (d != c.length)
            a = !0;
        else {
            a = !1;
            for (var f = 0; f < d; ++f) {
                var g = c[f];
                !1 == this._compareArray(b[f], g) && (a = !0, e[f] = g)
            }
        }
        a && (this._fireEvent("instrument_list_updated", {
            originalInstrumentLists: b,
            currentInstrumentLists: c,
            updatedInstrumentLists: e
        }), b = this._instrument_lists = [], this._cloneInstrumentLists(b, this._temp_instrument_lists))
    }, getInstrumentLists: function () {
        return this._instrument_lists
    }, getTempInstrumentLists: function () {
        return this._temp_instrument_lists
    }, resetInstrumentListNumberLimit: function (a) {
        this._instrument_limit_number_limit =
            a;
        this._updateInstrumentListCount()
    }, _updateInstrumentListCount: function () {
        var a = $("#setup_instrument_registered_in_the_custom").children().length;
        0 < this._instrument_limit_number_limit ? $("#setup_instrument_counter").text(a + "/" + this._instrument_limit_number_limit) : $("#setup_instrument_counter").text(a);
        a = $("#setup_instrument_registered_in_the_custom").children().length;
        a > this._instrument_limit_number_limit ? ($("#setup_instrument_custom_list").prop("disabled", !0), $("#setup_instrument_ok").button("disable"),
            $("#setup_instrument_counter").addClass("irrational")) : ($("#setup_instrument_custom_list").prop("disabled", !1), $("#setup_instrument_ok").button("enable"), $("#setup_instrument_counter").removeClass("irrational"))
    }, resetInstrumentsLists: function (a) {
        this._instrument_lists = a;
        a = this._instrument_lists.length;
        for (var b = "", c = 0; c < a; ++c)
            b += '<option value="' + c + '" data-i18n="Instruments_Setup_Registered_Custom_List_Name" data-i18n_map=\'{"no": "' + (c + 1) + "\"}'></option>";
        $("#setup_instrument_custom_list").html(b).find(":first").prop("selected",
            !0);
        this.changeI18NLocale(this._core.getLocale())
    }, _cloneInstrumentLists: function (a, b) {
        for (var c = b.length, d = 0; d < c; ++d)
            a.push(b[d].slice(0))
    }, showDialog: function (a) {
        $("#setup_instrument_ic_list").val("__all");
        var b = this._temp_instrument_lists = [], c = this._instrument_lists, d;
        for (d in c) {
            var e = [], f = c[d], g = {}, h;
            for (h in f) {
                var k = f[h];
                g[k] || (g[k] = !0, e.push(k))
            }
            b.push(e)
        }
        null != a ? (b = a, $("#setup_instrument_custom_list").val(a)) : b = $("#setup_instrument_custom_list").val();
        this._updateTempInstrumentList(b);
        this._updateInstrumentListCount();
        $("#dialog").dialog("open")
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        this._core.loadAndApplyI18N(a, $, document)
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this,
            b)
    }, registerEventOfShowing: function (a) {
        this._setEvent("showing", a)
    }, registerEventOfClosed: function (a) {
        this._setEvent("closed", a)
    }, registerEventOfCommit: function (a) {
        this._setEvent("commit", a)
    }, registerEventOfInstrumentListUpdated: function (a) {
        this._setEvent("instrument_list_updated", a)
    }
};
var FQClient_DialogKGraphIndicators = function () {
    this._events = {};
    this._initLayout()
};
FQClient_DialogKGraphIndicators.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        $("#dialog").dialog({
            modal: !0,
            closeOnEscape: !0,
            autoResize: !1,
            autoOpen: !1,
            draggable: !0,
            resizable: !1,
            width: "auto",
            height: "auto",
            close: function (b, c) {
                a._fireEvent("closed");
                $(window.frameElement).css({visibility: "hidden"})
            },
            open: function (b, c) {
                a._fireEvent("showing");
                $(window.frameElement).css({visibility: "visible"})
            }
        })
    }, resetIndicatorConfiguration: function (a) {
        var b = a.params, c = a.id;
        a = a.title;
        var d = $("#dialog");
        d.empty();
        d.data("area_xy_tech_id", c);
        d.dialog("option", "title", a);
        var e = $("<table></table>").appendTo(d), f;
        for (f in b) {
            var g = b[f], c = g.name, h = g.displayName, k = g.value;
            a = g.defaultValue;
            var l = g.type, g = g.typedArguments, m = $("<tr></tr>").appendTo(e), n = $("<td></td>").appendTo(m),
                m = $("<td></td>").appendTo(m);
            n.text(h);
            switch (l) {
                case "number":
                    h = $("<input />").appendTo(m);
                    h.val(k);
                    h.spinner({min: g.min, max: g.max});
                    h.data("reset", function (a) {
                        return function (b) {
                            b.val(a)
                        }
                    }(a));
                    break;
                case "enum":
                    h = $("<select></select>").appendTo(m);
                    n = "";
                    for (f in g)
                        n += '<option value="' + g[f] + '">' + g[f] + "</option>";
                    h.html(n);
                    h.val(k);
                    h.data("reset", function (a) {
                        return function (b) {
                            b.val(a)
                        }
                    }(a));
                    break;
                case "color":
                    h = $("<input />").appendTo(m);
                    k = Utility.prototype.colorStringToArray(k);
                    g = 4 <= k.length;
                    n = Utility.prototype.rgbArrayToHexStr(k);
                    h.minicolors({
                        control: "hue",
                        defaultValue: n,
                        inline: !1,
                        letterCase: "lowercase",
                        opacity: g,
                        position: "bottom left",
                        theme: "default"
                    });
                    g && h.minicolors("opacity", k[3]);
                    h.addClass("ui-widget-content");
                    h.data("reset", function (a) {
                        var b = Utility.prototype.colorStringToArray(a), c = Utility.prototype.rgbArrayToHexStr(b);
                        return function (a) {
                            a.minicolors("value", c);
                            4 <= b.length && a.minicolors("opacity", b[3])
                        }
                    }(a));
                    break;
                default:
                    debugger;
                    continue
            }
            h.data("param_type", l);
            h.data("param_name", c);
            h.addClass("kgraph_indicator_value");
            h.prop("tabindex", -1)
        }
        $("<br/><hr/>").appendTo(d);
        f = $('<div style="float: left;"></div>').appendTo(d);
        b = $('<div style="float: right;"></div>').appendTo(d);
        f = $('<input type="button" value="Reset" />').appendTo(f).button();
        var c = $('<input type="button" value="OK" />').appendTo(b).button(), b = $('<input type="button" value="Cancel" tabindex=0 />').appendTo(b).button(), q = this;
        c.on("click", function () {
            var a = {}, b = d.data("area_xy_tech_id");
            e.find(".kgraph_indicator_value").each(function () {
                var b = $(this), c = b.data("param_type"),
                    d = b.data("param_name"), e;
                switch (c) {
                    case "number":
                        e = b.val();
                        break;
                    case "enum":
                        e = b.val();
                        break;
                    case "color":
                        e = b.minicolors("rgbaString")
                }
                a[d] = e
            });
            q._fireEvent("commit", {id: b, params: a});
            d.dialog("close")
        });
        b.on("click", function () {
            d.dialog("close")
        });
        f.on("click", function () {
            e.find("*").each(function () {
                var a = $(this), b = a.data("reset");
                null != b && b(a)
            })
        });
        this._core.loadAndApplyI18N(this._locale, $, document)
    }, showDialog: function () {
        $("#dialog").dialog("open")
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight",
            a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        this._core.loadAndApplyI18N(a, $, document)
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfShowing: function (a) {
        this._setEvent("showing", a)
    }, registerEventOfClosed: function (a) {
        this._setEvent("closed",
            a)
    }, registerEventOfCommit: function (a) {
        this._setEvent("commit", a)
    }
};
var FQClient_KGraph = function () {
    this._events = {};
    this._ktype = this._instrument_full_id = null;
    this._paint_is_pending = !1;
    var a = this;
    this._mars_k = new MarsK("kgraph_canvas", "m1", "js/kgraph/src/i18n/", function (b) {
        var c = b.value;
        switch (b.type) {
            case "removed":
                a._fireEvent("ui", {name: "indicatorRemoved", operation: "clicked", value: null});
                break;
            case "configure":
                b = a._getIndicatorConfigurationStatesFromAreaXY(c.area_xy), a._fireEvent("ui", {
                    name: "indicatorConfigure",
                    operation: "clicked",
                    value: b
                })
        }
    });
    this._initLayout()
};
FQClient_KGraph.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._locale)
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        $("body").on("mousedown", function (b) {
            2 === b.button && a._fireEvent("ui", {name: "contextmenu", operation: "contextmenu", event: b})
        });
        $("#kgraph_exit_fullscreen").button().click(function () {
            Utility.prototype.exitFullscreen()
        });
        $(document).on("fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange", function () {
            if (document.isFullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement) {
                var b = $("#kgraph_canvas");
                b.data("orig_parent", b.parent());
                $("#fullscreen_element").append(b).show()
            } else
                b = $("#kgraph_canvas"), b.data("orig_parent").append(b), $("#fullscreen_element").hide();
            a._mars_k.resizeToClientSize()
        });
        this.resizeToClientSize()
    }, getInstrumentFullId: function () {
        return this._instrument_full_id
    },
    getKType: function () {
        return this._ktype
    }, getCanvasDOM: function () {
        return $("#kgraph_canvas")[0]
    }, resizeToClientSize: function () {
        this._mars_k.resizeToClientSize()
    }, setTimezoneOffsetInMinutes: function (a) {
        this._mars_k.setTimezoneOffsetInMinutes(a)
    }, setNumberOfVisibleKTick: function (a) {
        this._mars_k.setSizeOfVisibleTicks(a)
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px")
    }, changeTheme: function (a) {
        var b = this;
        this._core.loadThemeCSS(a,
            function (a) {
                a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), b._mars_k.refreshColors(), b._mars_k.paint(), $("body").css("visibility", ""))
            })
    }, changeI18NLocale: function (a) {
        var b = this, c = this._core.ensureLocaleFormat(a);
        this._core.loadAndApplyI18N(a, $, document, function (a) {
            a && (b._mars_k.setLocale(c), b._mars_k.paint())
        })
    }, _getIndicatorConfigurationStatesFromAreaXY: function (a) {
        var b = [], c = a.getDefinition(), d = c.params, e = a.getParams(), f;
        for (f in d) {
            var g = d[f], h = g[0], g = g[1], k = this._mars_k.i18n(g.alias_i18n),
                h = {name: f, displayName: k ? k : f, value: e[f], defaultValue: h}, k = g.type;
            switch (k) {
                case AreaXY.prototype.PARAM_TYPES.NUMBER:
                    h.type = "number";
                    h.typedArguments = {min: g.min, max: g.max};
                    break;
                case AreaXY.prototype.PARAM_TYPES.ENUM:
                    h.type = "enum";
                    h.typedArguments = g["enum"].splice(0);
                    break;
                case AreaXY.prototype.PARAM_TYPES.COLOR:
                    h.type = "color";
                    h.typedArguments = null;
                    break;
                default:
                    console.warn('Unknown param type - "' + k + '" when get configurations of indicator.');
                    continue
            }
            b.push(h)
        }
        return {
            id: a.getId ? a.getId() : null, type: a.getType(),
            title: this._mars_k.i18n(c.name_i18n), params: b
        }
    }, paint: function () {
        this._mars_k.paint()
    }, tryToPaint: function () {
        if (!this._paint_is_pending) {
            this._paint_is_pending = !0;
            var a = this;
            setTimeout(function () {
                a._paint_is_pending = !1;
                a.paint()
            })
        }
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfUI: function (a) {
        this._setEvent("ui", a)
    }, zoomIn: function () {
        this._mars_k.zoomAndPaint(!0)
    }, zoomOut: function () {
        this._mars_k.zoomAndPaint(!1)
    }, startToDrawLine: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_LINE)
    },
    startToDrawPriceTangent: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_PRICE_TANGENT)
    }, startToDrawHorizontal: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_HORIZONTAL)
    }, startToDrawChannel: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_CHANNEL)
    }, startToDrawGoldenSection: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_GOLDEN_SECTION)
    }, startToDrawGoldenBands: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_GOLDEN_BANDS)
    }, startToDrawGoldenCircles: function () {
        this._mars_k.startDrawing(Drawer.prototype.MODE_GOLDEN_CIRCLES)
    },
    removeAllDrawns: function () {
        this._mars_k.removeAllDrawns()
    }, resetInstrument: function (a, b, c, d, e) {
        if (null == a)
            throw 'Invalid instrument full id - "' + a + '".';
        if (null == b)
            throw 'Invalid k-type - "' + b + '".';
        if (!e && this._instrument_full_id === a && this._ktype == b)
            return !1;
        window.widgetLoadingProgress && window.widgetLoadingProgress.show();
        null != this._instrument_full_id && this._core.unsubscribeInstrument(this, this._instrument_full_id);
        var f = this;
        this._core.subscribeInstrument(this, a, !0, !1, !1);
        this._instrument_full_id =
            a;
        this._ktype = b;
        this._core.requestToGetKTicks(a, b, c, d, function (a) {
            var b = a.instrument_full_id;
            a = a.ktype;
            b == f._instrument_full_id && a == f._ktype && (f._handleKGraphInit(b, a), window.widgetLoadingProgress && window.widgetLoadingProgress.hide())
        })
    }, setParamsForIndicator: function (a, b) {
        var c = this._mars_k, d;
        d = null == a ? c.getAreaTicks() : c.getTechArea(a);
        for (var e in b) {
            var f = b[e];
            console.log('Set param "' + e + '" to ' + f);
            d.setParam(e, f)
        }
        d.doEvaluateAll && d.doEvaluateAll();
        c.evalAllKTicksPaintingPriceHighLow();
        c.paint()
    },
    addIndicator: function (a) {
        return this._mars_k.addTechArea(a)
    }, saveStatesToJson: function () {
        return this._mars_k.saveToJson()
    }, restoreStatesFromJson: function (a) {
        this._mars_k.restoreFromJson(a)
    }, isScrollAreaVisibled: function (a) {
        return this._mars_k.isVisibledForAreaXScroll()
    }, isTickAreaVisibled: function (a) {
        return this._mars_k.isVisibledForAreaTicks()
    }, setVisibledForScrollArea: function (a) {
        this._mars_k.setVisibledForAreaXScroll(a)
    }, setVisibledForTickArea: function (a) {
        this._mars_k.setVisibledForAreaTicks(a)
    },
    enterFullscreen: function () {
        var a = $("body");
        Utility.prototype.enterFullscreen(a[0])
    }, print: function () {
        var a = $("#kgraph_canvas")[0], b = a.toDataURL(), c = window.getComputedStyle($("body")[0]), d = c.backgroundColor, c = window.getComputedStyle(a), a = new Blob(['<head><script>function main(){ print(); close();}\x3c/script></head><body onload="main()" style="background-color: ' + d + '"><img src="' + b + '" style="background-color: ' + c.backgroundColor + '"></img></body>'], {type: "text/html"}), a = window.URL.createObjectURL(a);
        Utility.prototype.newPage(a)
    }, _onClientEvents: function (a, b) {
        switch (a) {
            case Core.prototype.CLIENT_EVENTS.Reset:
                console.log("reset kgraph.");
                this.resetInstrument(this._instrument_full_id, this._ktype, this._local_trade_date, this._number_of_tick, !0);
                break;
            case Core.prototype.CLIENT_EVENTS.KGraph_Append_KTick:
                this._handleTickAppended(b.inst_full_id, b.type);
                break;
            case Core.prototype.CLIENT_EVENTS.KGraph_Update_Last_KTick:
                this._handleLastKTickUpdated(b.inst_full_id, b.type)
        }
    }, _handleKGraphInit: function (a,
                                    b) {
        this._instrument_full_id = a;
        var c = this._core.getInstrumentByFullId(a);
        this._mars_k.setCaption(c.getDisplayName());
        this._mars_k.setType(b);
        this._mars_k.setDecimalDigits(c.getDecimalDigits());
        this._mars_k.removeAllKTicks();
        this._mars_k.appendKTicks(this._core.getInstrumentKTicks(a, b));
        this._mars_k.evalAllKTicksPaintingPriceHighLow();
        c = this._core.getInstrumentTimezoneOffsetInMinutes(a);
        this._mars_k.setTimezoneOffsetInMinutes(c);
        this._mars_k.setVisibleAreaLeft(null);
        this._mars_k.paint()
    }, _handleTickAppended: function (a,
                                      b) {
        this._core.getInstrumentByFullId(a);
        if (a == this._instrument_full_id && b == this._mars_k.getType()) {
            var c = this._core.getInstrumentLastKTick(a, b);
            c && (this._mars_k.appendKTicks([c]), this._mars_k.paint())
        }
    }, _handleLastKTickUpdated: function (a, b) {
        this._core.getInstrumentByFullId(a);
        if (a == this._instrument_full_id && b == this._mars_k.getType()) {
            var c = this._core.getInstrumentLastKTick(a, b);
            c && (this._mars_k.updateLastKTick(c), this._mars_k.paint())
        }
    }
};
var FQClient_KGraphToolkits = function () {
    this._events = {};
    this._enabled_auto_height_fixing = this._enabled_auto_width_fixing = !1;
    this._initLayout()
};
FQClient_KGraphToolkits.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale());
        var c = this;
        setTimeout(function () {
            $("#kgraph_type_list").selectmenu("refresh");
            c.resizeFrame()
        })
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        var b = "", c = Core.prototype.KTYPE_DEFINITIONS, d;
        for (d in c)
            b += '<option value="' +
            d + '" data-i18n="' + c[d]["name-i18n"] + '"></option>';
        $("#kgraph_type_list").html(b).selectmenu({
            width: "auto", change: function (b) {
                b.currentTarget = $(this)[0];
                a._fireEvent("ui", {name: "ktype", operation: "changed", event: b})
            }
        }).val("m1");
        $("#kgraph_load").button().on("click", function (b) {
            a._fireEvent("ui", {name: "reload", operation: "clicked", event: b})
        });
        $("#kgraph_save").button().on("click", function (b) {
            a._fireEvent("ui", {name: "restore", operation: "clicked", event: b})
        });
        $("#kgraph_tech").button().on("click", function (b) {
            a._fireEvent("ui",
                {name: "indicator", operation: "clicked", event: b})
        });
        $("#kgraph_zoom_in").button().click(function (b) {
            a._fireEvent("ui", {name: "zoomIn", operation: "clicked", event: b})
        });
        $("#kgraph_zoom_out").button().click(function (b) {
            a._fireEvent("ui", {name: "zoomOut", operation: "clicked", event: b})
        });
        $("#kgraph_print").button().click(function (b) {
            a._fireEvent("ui", {name: "print", operation: "clicked", event: b})
        });
        $("#kgraph_fullscreen").button().click(function (b) {
            a._fireEvent("ui", {
                name: "enterFullscreen", operation: "clicked",
                event: b
            })
        });
        $("#kgraph_exit_fullscreen").button().click(function (b) {
            a._fireEvent("ui", {name: "exitFullscreen", operation: "clicked", event: b})
        })
    }, getKType: function () {
        return $("#kgraph_type_list").val()
    }, setKType: function (a) {
        $("#kgraph_type_list").val(a).selectmenu("refresh");
        this.resizeFrame()
    }, setEnabledForAutoWidthFixing: function (a) {
        this._enabled_auto_width_fixing = a
    }, setEnabledForAutoHeightFixing: function (a) {
        this._enabled_auto_height_fixing = a
    }, setStatesForButtonOfRestore: function (a, b) {
        return this._setStatesForButton($("#kgraph_load"),
            a, b)
    }, setStatesForButtonOfSave: function (a, b) {
        return this._setStatesForButton($("#kgraph_save"), a, b)
    }, setStatesForButtonOfIndicator: function (a, b) {
        return this._setStatesForButton($("#kgraph_tech"), a, b)
    }, setStatesForButtonOfZoomIn: function (a, b) {
        return this._setStatesForButton($("#kgraph_zoom_in"), a, b)
    }, setStatesForButtonOfZoomOut: function (a, b) {
        return this._setStatesForButton($("#kgraph_zoom_out"), a, b)
    }, setStatesForButtonOfPrint: function (a, b) {
        return this._setStatesForButton($("#kgraph_print"), a, b)
    }, setStatesForButtonOfEnterFullscreen: function (a,
                                                      b) {
        return this._setStatesForButton($("#kgraph_fullscreen"), a, b)
    }, _setStatesForButton: function (a, b, c) {
        if (!a.has("ui-button"))
            return !1;
        a.button(b ? "enabled" : "disable");
        c ? a.show() : a.hide();
        return !0
    }, resizeFrame: function () {
        this._enabled_auto_width_fixing && (frameElement.style.width = document.body.scrollWidth + "px");
        this._enabled_auto_height_fixing && (frameElement.style.height = document.body.scrollHeight + "px")
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        this._enabled_auto_width_fixing &&
        (frameElement.style.width = "1px");
        this._enabled_auto_height_fixing && (frameElement.style.height = "1px");
        $("body").css("font-size", a + "px");
        this.resizeFrame()
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        var b = this;
        this._core.loadAndApplyI18N(a, $, document, function (a) {
            a && b.resizeFrame()
        })
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c =
            this._events[a];
        c && c.call(this, b)
    }, registerEventOfUI: function (a) {
        this._setEvent("ui", a)
    }, getJQuery: function () {
        return jQuery
    }
};
var FQClient_RunChart = function () {
    this._events = {};
    this._run_chart = new RunChart(this, "run_chart_graph");
    this._datatable_5vpm_m_query = this._datatable_5vpm_m = this._datatable_5vpm_p_query = this._datatable_5vpm_p = this._datatable_5vpm_v = null;
    this._5vpm_selected = "run_chart_5vpm_5";
    this._number_of_request_tick = 100;
    this._table_page_length = 1E3;
    this._instrument_full_id = null;
    this._resizing_is_pending = !1;
    this._jquery_best_5_buy_price_doms = [];
    this._jquery_best_5_buy_volume_doms = [];
    this._jquery_best_5_sell_price_doms =
        [];
    this._jquery_best_5_sell_volume_doms = [];
    this._initLayout()
};
FQClient_RunChart.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, getClientId: function () {
        return this._client_id
    }, getInstrumentFullId: function () {
        return this._instrument_full_id
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function () {
            return !1
        });
        $("body").on("mousedown", function (b) {
            2 === b.button && a._fireEvent("ui", {
                name: "contextmenu", operation: "contextmenu",
                event: b
            })
        });
        $("#run_chart_5vpm_5_switch").button().click(this._func2SwitchRunChart5vpm("run_chart_5vpm_5"));
        $("#run_chart_5vpm_v_switch").button().click(this._func2SwitchRunChart5vpm("run_chart_5vpm_v"));
        $("#run_chart_5vpm_p_switch").button().click(this._func2SwitchRunChart5vpm("run_chart_5vpm_p"));
        $("#run_chart_5vpm_m_switch").button().click(this._func2SwitchRunChart5vpm("run_chart_5vpm_m"));
        var b = function (a) {
            a = $(this);
            var b = a.data("scroll_body");
            b || (b = a.closest(".dataTables_scrollBody"), a.data("scroll_body",
                b));
            b = b.prop("scrollTop");
            a.data("orig_scroll_top", b)
        }, c = function (a) {
            var b = $(this);
            a = b.data("scroll_body");
            b = b.data("orig_scroll_top");
            a.prop("scrollTop", b)
        }, d = {
            info: "&nbsp;&nbsp;&nbsp;_PAGE_ / _PAGES_",
            infoEmpty: "",
            zeroRecords: "",
            paginate: {first: "|<", last: ">|", next: ">", previous: "<"}
        };
        this._datatable_5vpm_v = $("#run_chart_5vpm_v_table").DataTable({
            autoWidth: !1,
            searching: !1,
            ordering: !0,
            orderClasses: !1,
            stripeClasses: [],
            paging: !0,
            lengthChange: !1,
            pagingType: "simple_numbers",
            pageLength: this._table_page_length,
            info: !1,
            language: d,
            jQueryUI: !0,
            dom: "tip",
            scrollY: "100%",
            columns: [{type: "num-fmt"}, {type: "num-fmt"}],
            preDrawCallback: b,
            drawCallback: c
        });
        this._datatable_5vpm_p = $("#run_chart_5vpm_p_table").DataTable({
            autoWidth: !1,
            searching: !1,
            ordering: !0,
            order: [0, "desc"],
            orderClasses: !1,
            stripeClasses: [],
            paging: !0,
            lengthChange: !1,
            pagingType: "simple_numbers",
            pageLength: this._table_page_length,
            info: !1,
            language: d,
            jQueryUI: !0,
            dom: "tip",
            scrollY: "100%",
            columns: [{type: "num-fmt", visible: !1}, {type: "date"}, {type: "num-fmt"}, {type: "num-fmt"}],
            preDrawCallback: b,
            drawCallback: c
        });
        this._datatable_5vpm_p_query = $("#run_chart_5vpm_p_query_table").DataTable({
            autoWidth: !1,
            searching: !1,
            ordering: !1,
            order: [0, "desc"],
            orderClasses: !1,
            stripeClasses: [],
            paging: !0,
            lengthChange: !1,
            pagingType: "simple_numbers",
            pageLength: this._table_page_length,
            info: !1,
            language: d,
            jQueryUI: !0,
            dom: "tip",
            scrollY: "100%",
            columns: [{type: "date"}, {type: "num-fmt"}, {type: "num-fmt"}]
        });
        this._datatable_5vpm_m = $("#run_chart_5vpm_m_table").DataTable({
            autoWidth: !1,
            searching: !1,
            ordering: !0,
            order: [0, "desc"],
            orderClasses: !1,
            stripeClasses: [],
            paging: !0,
            lengthChange: !1,
            pagingType: "simple_numbers",
            pageLength: this._table_page_length,
            info: !1,
            language: d,
            jQueryUI: !0,
            dom: "tip",
            scrollY: "100%",
            columns: [{type: "num-fmt", visible: !1}, {type: "date"}, {type: "num-fmt"}, {type: "num-fmt"}],
            preDrawCallback: b,
            drawCallback: c
        });
        this._datatable_5vpm_m_query = $("#run_chart_5vpm_m_query_table").DataTable({
            autoWidth: !1,
            searching: !1,
            ordering: !1,
            order: [0, "desc"],
            orderClasses: !1,
            stripeClasses: [],
            paging: !0,
            lengthChange: !1,
            pagingType: "simple_numbers",
            pageLength: this._table_page_length,
            info: !1,
            language: d,
            jQueryUI: !0,
            dom: "tip",
            scrollY: "100%",
            columns: [{type: "date"}, {type: "num-fmt"}, {type: "num-fmt"}]
        });
        $("#run_chart_5vpm_p_table").on("page.dt", function (b) {
            b = $("#run_chart_5vpm_p_table_wrapper").find(".dataTables_scrollBody");
            var c = b.height();
            b.prop("scrollHeight") > c || (c = a._datatable_5vpm_p.page.info(), c.page === c.pages - 1 && a._requestToGetTicksInTradeDay(), b.prop("scrollTop", 0))
        });
        $("#run_chart_5vpm_m_table").on("page.dt",
            function (b) {
                b = $("#run_chart_5vpm_m_table_wrapper").find(".dataTables_scrollBody");
                var c = b.height();
                b.prop("scrollHeight") > c || (c = a._datatable_5vpm_m.page.info(), c.page === c.pages - 1 && a._requestToGetTicksInTradeDay(), b.prop("scrollTop", 0))
            });
        $('input[name="run_chart_5vpm_p_radios"]').on("change", function () {
            switch ($(this).attr("id")) {
                case "run_chart_5vpm_p_radios_p":
                    $("#run_chart_5vpm_p_table_wrapper").show();
                    $("#run_chart_5vpm_p_query_table_wrapper").hide();
                    $("#run_chart_5vpm_p_query_options").hide();
                    break;
                case "run_chart_5vpm_p_radios_p_query":
                    $("#run_chart_5vpm_p_table_wrapper").hide(), $("#run_chart_5vpm_p_query_table_wrapper").show(), $("#run_chart_5vpm_p_query_options").show()
            }
            a.resizeAll()
        }).filter("[checked]").trigger("change");
        $('input[name="run_chart_5vpm_m_radios"]').on("change", function () {
            switch ($(this).attr("id")) {
                case "run_chart_5vpm_m_radios_m":
                    $("#run_chart_5vpm_m_table_wrapper").show();
                    $("#run_chart_5vpm_m_query_table_wrapper").hide();
                    $("#run_chart_5vpm_m_query_options").hide();
                    break;
                case "run_chart_5vpm_m_radios_m_query":
                    $("#run_chart_5vpm_m_table_wrapper").hide(), $("#run_chart_5vpm_m_query_table_wrapper").show(), $("#run_chart_5vpm_m_query_options").show()
            }
            a.resizeAll()
        }).filter("[checked]").trigger("change");
        d = c = "";
        for (b = 0; 24 > b; ++b) {
            var e = b.toString();
            2 > e.length && (e = "0" + e);
            c += '<option value="' + b + '">' + e + "</option>"
        }
        $("#run_chart_5vpm_p_query_options_hour").html(c);
        $("#run_chart_5vpm_m_query_options_hour").html(c);
        for (b = 0; 60 > b; ++b)
            e = b.toString(), 2 > e.length && (e = "0" + e), d +=
                '<option value="' + b + '">' + e + "</option>";
        $("#run_chart_5vpm_p_query_options_minute").html(d);
        $("#run_chart_5vpm_m_query_options_minute").html(d);
        $("#run_chart_5vpm_p_table_wrapper").find(".dataTables_scrollBody").on("scroll", function () {
            var b = $(this);
            if (b.is(":visible")) {
                var c = b.scrollTop(), d = b.prop("scrollHeight");
                b.height() + c >= d && (b = a._datatable_5vpm_p.page.info(), b.page == b.pages - 1 && a._requestToGetTicksInTradeDay())
            }
        }).prop("tabindex", -1).on("keydown", function (b) {
            switch (b.keyCode ? b.keyCode : b.which) {
                case 37:
                    a._datatable_5vpm_p.page("previous").draw(!1);
                    break;
                case 39:
                    a._datatable_5vpm_p.page("next").draw(!1)
            }
        });
        $("#run_chart_5vpm_m_table_wrapper").find(".dataTables_scrollBody").on("scroll", function () {
            var b = $(this);
            if (b.is(":visible")) {
                var c = b.scrollTop(), d = b.prop("scrollHeight");
                b.height() + c >= d && (b = a._datatable_5vpm_m.page.info(), b.page == b.pages - 1 && a._requestToGetTicksInTradeDay())
            }
        }).prop("tabindex", -1).on("keydown", function (b) {
            switch (b.keyCode ? b.keyCode : b.which) {
                case 37:
                    a._datatable_5vpm_m.page("previous").draw(!1);
                    break;
                case 39:
                    a._datatable_5vpm_m.page("next").draw(!1)
            }
        });
        $("#run_chart_5vpm_p_query_request").on("click", function () {
            var b = a._core, c = a._instrument_full_id, d = parseInt($("#run_chart_5vpm_m_query_options_hour").val()), e = parseInt($("#run_chart_5vpm_m_query_options_minute").val());
            b.requestToGetMinuteTicksInPeriodOfTradeDay(c, this._local_trade_date, d, e, 59999, !0, function (b) {
                a._handleQuery5VPMTicks_P(b.ticks)
            })
        });
        $("#run_chart_5vpm_m_query_request").on("click", function () {
            var b = a._core, c = a._instrument_full_id, d = parseInt($("#run_chart_5vpm_m_query_options_hour").val()),
                e = parseInt($("#run_chart_5vpm_m_query_options_minute").val());
            b.requestToGetMinuteTicksInPeriodOfTradeDay(c, this._local_trade_date, d, e, 59999, !1, function (b) {
                a._handleQuery5VPMTicks_M(b.ticks)
            })
        });
        for (b = 0; 5 > b; ++b)
            this._jquery_best_5_buy_price_doms[b] = $("#run_chart_5vpm_5_buy_price_" + b), this._jquery_best_5_buy_volume_doms[b] = $("#run_chart_5vpm_5_buy_volume_" + b), this._jquery_best_5_sell_price_doms[b] = $("#run_chart_5vpm_5_sell_price_" + b), this._jquery_best_5_sell_volume_doms[b] = $("#run_chart_5vpm_5_sell_volume_" +
            b);
        c = function (b) {
            var c = a.getInstrumentFullId();
            if (null != c) {
                var d = $(this), e = !d.data("is_best_buy"), d = d.data("rank"), l = a._core.getInstrumentByFullId(c).getBest5()[e ? "sell" : "buy"][d];
                a._fireEvent("ui", {
                    name: "bestRankItem",
                    operation: "click",
                    event: b,
                    value: {instrumentFullId: c, isAsk: e, rank: d, price: l.price, volume: l.volume}
                })
            }
        };
        for (b = 0; 5 > b; ++b)
            $("#run_chart_5vpm_5_buy_price_" + b + ", #run_chart_5vpm_5_buy_volume_" + b).data("is_best_buy", !1).data("rank", b).on("click", c);
        for (b = 0; 5 > b; ++b)
            $("#run_chart_5vpm_5_sell_price_" +
            b + ", #run_chart_5vpm_5_sell_volume_" + b).data("is_best_buy", !0).data("rank", b).on("click", c);
        b = $("#" + this._5vpm_selected);
        $("#run_chart_5vpm").append(b)
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px");
        this.resizeAll()
    }, changeTheme: function (a) {
        var b = this;
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), b._run_chart.repaint(), $("body").css("visibility", ""))
        })
    },
    changeI18NLocale: function (a) {
        var b = this;
        this._core.loadAndApplyI18N(a, $, document, function (a) {
            a && b.resizeAll()
        })
    }, resizeAll: function () {
        var a = $(window.frameElement);
        this._resize5vpm();
        this._resizeRunChart(a)
    }, tryToResizeAll: function () {
        if (this._resizing_is_pending)
            return !1;
        this._resizing_is_pending = !0;
        var a = this;
        setTimeout(function () {
            a.resizeAll();
            a._resizing_is_pending = !1
        })
    }, _resize5vpm: function () {
        $("#run_chart_5vpm").children().hide();
        "run_chart_5vpm_v" === this._5vpm_selected ? this._datatable_5vpm_v.draw(!1) :
            "run_chart_5vpm_p" === this._5vpm_selected ? (this._datatable_5vpm_p.draw(!1), this._datatable_5vpm_p_query.draw(!1)) : "run_chart_5vpm_m" === this._5vpm_selected && (this._datatable_5vpm_m.draw(!1), this._datatable_5vpm_m_query.draw(!1));
        $("#run_chart_5vpm").children().show()
    }, _resizeRunChart: function (a) {
        var b = a.innerHeight() - 10;
        $("#run_chart_5vpm").height(b);
        if ("run_chart_5vpm_v" == this._5vpm_selected) {
            var c = $("#run_chart_5vpm_v_table_wrapper");
            if ("none" != c.css("display")) {
                c.height(b);
                var d = c.height(), e = c.find(".dataTables_scrollHead").outerHeight(),
                    f = c.find(".dataTables_paginate").outerHeight();
                c.find(".dataTables_scrollBody").height(d - e - f);
                this._datatable_5vpm_v.columns.adjust().draw(!1)
            }
        }
        if ("run_chart_5vpm_p" == this._5vpm_selected) {
            var g = $("#run_chart_5vpm_p_toolbar").innerHeight(), c = $("#run_chart_5vpm_p_table_wrapper");
            "none" != c.css("display") && (c.height(b), d = c.height(), e = c.find(".dataTables_scrollHead").outerHeight(), f = c.find(".dataTables_paginate").outerHeight(), c.find(".dataTables_scrollBody").height(d - g - e - f), this._datatable_5vpm_p.columns.adjust().draw(!1));
            c = $("#run_chart_5vpm_p_query_table_wrapper");
            "none" != c.css("display") && (c.height(b), d = c.innerHeight(), e = c.find(".dataTables_scrollHead").outerHeight(), f = c.find(".dataTables_paginate").outerHeight(), c.find(".dataTables_scrollBody").height(d - g - e - f), this._datatable_5vpm_p_query.columns.adjust().draw(!1))
        }
        "run_chart_5vpm_m" == this._5vpm_selected && (g = $("#run_chart_5vpm_m_toolbar").innerHeight(), c = $("#run_chart_5vpm_m_table_wrapper"), "none" != c.css("display") && (c.height(b), d = c.innerHeight(), e = c.find(".dataTables_scrollHead").outerHeight(),
            f = c.find(".dataTables_paginate").outerHeight(), c.find(".dataTables_scrollBody").height(d - g - e - f), this._datatable_5vpm_m.columns.adjust().draw(!1)), c = $("#run_chart_5vpm_m_query_table_wrapper"), "none" != c.css("display") && (c.height(b), d = c.innerHeight(), e = c.find(".dataTables_scrollHead").outerHeight(), f = c.find(".dataTables_paginate").outerHeight(), c.find(".dataTables_scrollBody").height(d - g - e - f), this._datatable_5vpm_m_query.columns.adjust().draw(!1)));
        a = a.innerWidth();
        c = $("#run_chart_ohlc")[0].offsetWidth;
        d = $("#run_chart_5vpm")[0].offsetWidth;
        e = $("#run_chart_5vpm_switch")[0].offsetWidth;
        a = a - c - d - e - 25;
        0 > a && (a = 0);
        c = $("#run_chart_graph")[0];
        c.width = a;
        c.height = b;
        this._run_chart.resizeAndPaint()
    }, setStatesForAreaOfInfos: function (a) {
        a ? $("#area_infos").show() : $("#area_infos").hide()
    }, setStatesForAreaOfTicks: function (a) {
        a ? $("#area_ticks").show() : $("#area_ticks").hide()
    }, setStatesForButtonOfBestRank: function (a, b) {
        return this._setStatesForButton($("#run_chart_5vpm_5_switch"), a, b)
    }, setStatesForButtonOfVolumeByPrice: function (a,
                                                    b) {
        return this._setStatesForButton($("#run_chart_5vpm_v_switch"), a, b)
    }, setStatesForButtonOfTicksByPrice: function (a, b) {
        return this._setStatesForButton($("#run_chart_5vpm_p_switch"), a, b)
    }, setStatesForButtonOfAllTicks: function (a, b) {
        return this._setStatesForButton($("#run_chart_5vpm_m_switch"), a, b)
    }, _setStatesForButton: function (a, b, c) {
        if (!a.has("ui-button"))
            return !1;
        a.button(b ? "enabled" : "disable");
        c ? a.show() : a.hide();
        return !0
    }, switchInfoArea: function (a) {
        switch (a) {
            case "bestRank":
                a = this._func2SwitchRunChart5vpm("run_chart_5vpm_5");
                break;
            case "volumeByPrice":
                a = this._func2SwitchRunChart5vpm("run_chart_5vpm_v");
                break;
            case "ticksByPrice":
                a = this._func2SwitchRunChart5vpm("run_chart_5vpm_p");
                break;
            case "allTicks":
                a = this._func2SwitchRunChart5vpm("run_chart_5vpm_m");
                break;
            default:
                return !1
        }
        a && a();
        return !0
    }, _func2SwitchRunChart5vpm: function (a) {
        var b = this;
        return function (c) {
            switch (a) {
                case "run_chart_5vpm_5":
                    b._fireEvent("ui", {name: "switchBestRank", operation: "click", event: c});
                    break;
                case "run_chart_5vpm_v":
                    b._fireEvent("ui", {
                        name: "switchVolumeByPrice",
                        operation: "click", event: c
                    });
                    break;
                case "run_chart_5vpm_p":
                    b._fireEvent("ui", {name: "switchTicksByPrice", operation: "click", event: c});
                    break;
                case "run_chart_5vpm_m":
                    b._fireEvent("ui", {name: "switchAllTicks", operation: "click", event: c})
            }
            $("#hidden_div").append($("#run_chart_5vpm").children());
            c = $("#" + a);
            $("#run_chart_5vpm").append(c);
            b._5vpm_selected = a;
            b.resizeAll()
        }
    }, _setOhlcDealPrice: function (a) {
        $("#run_chart_dealPrice").text(a)
    }, _setOhlcFluctuation: function (a) {
        $("#run_chart_fluctuation").text(a)
    }, _setOhlcFluctuationPercent: function (a) {
        $("#run_chart_fluctuationPercent").text(a)
    },
    _setOhlcPrevClosePrice: function (a) {
        $("#run_chart_prevClosePrice").text(a)
    }, _setOhlcOpenPrice: function (a) {
        $("#run_chart_openPrice").text(a)
    }, _setOhlcHighPrice: function (a) {
        $("#run_chart_highPrice").text(a)
    }, _setOhlcLowPrice: function (a) {
        $("#run_chart_lowPrice").text(a)
    }, _setOhlcTotalVolume: function (a) {
        $("#run_chart_totalVolume").text(a)
    }, _set5vpmBest5: function (a) {
        for (var b = this._instrument_full_id, c = this._core.getInstrumentByFullId(b).getPriceFormatter(), d = 0, e = 0, f = {}, g = {}, h = a.buy, k = h.length, l = 0; l < k; ++l) {
            var m =
                this._jquery_best_5_buy_price_doms[l], n = this._jquery_best_5_buy_volume_doms[l], q = h[l].price;
            if ("" == q)
                m.text("---"), n.text("---"), f[l] = [null, null];
            else {
                var p = c.format(q), r = h[l].volume, s;
                m.data("price") != q && (m.data("price", q), m.text(p), s = !0);
                n.data("volume") != r && (n.data("volume", r), n.text(1E3 <= r ? Math.floor(r / 1E3) + "k" : r), s = !0);
                s && (f[l] = [p, r]);
                d += r
            }
        }
        a = a.sell;
        h = a.length;
        for (l = 0; l < h; ++l)
            k = this._jquery_best_5_sell_price_doms[l], m = this._jquery_best_5_sell_volume_doms[l], q = a[l].price, "" == q ? (k.text("---"),
                m.text("---"), g[l] = [null, null]) : (p = c.format(q), r = a[l].volume, k.data("price") != q && (k.data("price", q), k.text(p), s = !0), m.data("volume") != r && (m.data("volume", r), m.text(1E3 <= r ? Math.floor(r / 1E3) + "k" : r), s = !0), s && (g[l] = [p, r]), e += r);
        (new VolTriangle("run_chart_5vpm_5_vol_triangle")).setVols(d, e);
        this._fireEvent("best_rank_change", {operation: "update", instrumentFullId: b, data: {ask: f, bid: g}})
    }, _handle5VPMTicks_P: function (a, b) {
        for (var c = this._instrument_full_id, d = this._datatable_5vpm_p.page.info().pages, e = [], f =
            a; f < b.length; ++f) {
            var g = b[f], g = [g._index, g._timeString, g._price_string, Utility.prototype.numberFormat(g._volume)];
            e.push(g)
        }
        0 == a ? this._datatable_5vpm_p.clear() : (f = this._datatable_5vpm_p.page.info().page, this._datatable_5vpm_p.row("tr:last").remove(), this._datatable_5vpm_p.page(f));
        this._datatable_5vpm_p.rows.add(e);
        this._datatable_5vpm_p.draw(!1);
        d != this._datatable_5vpm_p.page.info().pages && this.resizeAll();
        this._fireEvent("ticks_by_price_change", {operation: "init", instrumentFullId: c, data: e})
    }, _handle5VPMTicks_M: function (a,
                                     b) {
        for (var c = this._instrument_full_id, d = this._datatable_5vpm_m.page.info().pages, e = [], f = a; f < b.length; ++f) {
            var g = b[f], g = [g._index, g._timeString, g._price_string, Utility.prototype.numberFormat(g._volume)];
            e.push(g)
        }
        0 == a && this._datatable_5vpm_m.clear();
        this._datatable_5vpm_m.rows.add(e);
        this._datatable_5vpm_m.draw(!1);
        d != this._datatable_5vpm_m.page.info().pages && this.resizeAll();
        this._fireEvent("all_ticks_change", {operation: "init", instrumentFullId: c, data: e})
    }, _new5VPMTick_V: function (a, b, c) {
        if (this._local_trade_date ==
            a) {
            a = this._instrument_full_id;
            var d = this._datatable_5vpm_v.page.info().pages, e = "#runchart_5vpm_v_" + Utility.prototype.escapeJquerySelector(b), e = this._datatable_5vpm_v.cell(e, 1);
            c = Utility.prototype.numberFormat(c);
            0 < e.length ? e.data(c) : this._datatable_5vpm_v.row.add([b, c]);
            this._datatable_5vpm_v.draw(!1);
            d != this._datatable_5vpm_v.page.info().pages && this.resizeAll();
            this._fireEvent("volume_by_price_change", {operation: "new", instrumentFullId: a, data: [b, c]})
        }
    }, _new5VPMTick_P: function (a, b, c) {
        if (this._local_trade_date ==
            a) {
            a = this._instrument_full_id;
            var d = this._datatable_5vpm_p.page.info().pages;
            b = [b._index, b._timeString, b._price_string, Utility.prototype.numberFormat(b._volume)];
            c ? this._datatable_5vpm_p.row("tr:first").data(b) : this._datatable_5vpm_p.row.add(b);
            this._datatable_5vpm_p.draw(!1);
            d != this._datatable_5vpm_p.page.info().pages && this.resizeAll();
            this._fireEvent("ticks_by_price_change", {operation: "new", instrumentFullId: a, data: b})
        }
    }, _new5VPMTick_M: function (a, b) {
        if (this._local_trade_date == a) {
            var c = this._instrument_full_id,
                d = this._datatable_5vpm_m.page.info().pages, e = [b._index, b._timeString, b._price_string, Utility.prototype.numberFormat(b._volume)];
            this._datatable_5vpm_m.row.add(e);
            this._datatable_5vpm_m.draw(!1);
            d != this._datatable_5vpm_m.page.info().pages && this.resizeAll();
            this._fireEvent("all_ticks_change", {operation: "new", instrumentFullId: c, data: e})
        }
    }, requestInterpolation: function (a, b) {
        if (a >= b || null == this._instrument_full_id)
            return !1;
        var c = new Date(a), d = new Date(b);
        console.log("\u8acb\u6c42\u63d2\u88dc: " + c + " ~ " +
        d);
        var e = this;
        this._core.requestToGetMinuteTicksInPeriod(this._instrument_full_id, this._local_trade_date, c, d, !1, function (a) {
            e._handleTicksInterpolation(a.trade_date, a.ticks)
        });
        return !0
    }, _onClientEvents: function (a, b) {
        switch (a) {
            case Core.prototype.CLIENT_EVENTS.Reset:
                console.log("reset runchart.");
                this.resetInstrument(this._instrument_full_id, this._local_trade_date, !0);
                break;
            case Core.prototype.CLIENT_EVENTS.Instrument_Init:
                this._instrument_full_id == b.instrument_full_id && this._handleReset();
                break;
            case Core.prototype.CLIENT_EVENTS.Runchart_Interpolate_Ticks:
                this._handleTicksInterpolation(b.trade_date,
                    b.ticks);
                break;
            case Core.prototype.CLIENT_EVENTS.Runchart_Update_5vpm_5:
                var c = this._core.getInstrumentByFullId(b.inst_full_id);
                this._set5vpmBest5(c.getBest5());
                break;
            case Core.prototype.CLIENT_EVENTS.Runchart_New_Tick_5vpm_v:
                this._new5VPMTick_V(b.trade_date, b.price, b.volume);
                break;
            case Core.prototype.CLIENT_EVENTS.Runchart_New_Tick_5vpm_p:
                this._new5VPMTick_P(b.trade_date, b.tick, b.is_merged);
                break;
            case Core.prototype.CLIENT_EVENTS.Runchart_New_Tick_5vpm_m:
                this._new5VPMTick_M(b.trade_date, b.tick)
        }
    },
    _handleReset: function () {
        var a = this;
        this._datatable_5vpm_v.clear();
        this._datatable_5vpm_p.clear();
        this._datatable_5vpm_p_query.clear();
        this._datatable_5vpm_m.clear();
        this._datatable_5vpm_m_query.clear();
        this._datatable_5vpm_v.clear();
        this._datatable_5vpm_p.clear();
        this._datatable_5vpm_p_query.clear();
        this._datatable_5vpm_m.clear();
        this._datatable_5vpm_m_query.clear();
        for (var b in this._jquery_best_5_buy_price_doms)
            this._jquery_best_5_buy_price_doms[b].data("price", null);
        for (b in this._jquery_best_5_sell_price_doms)
            this._jquery_best_5_sell_price_doms[b].data("price",
                null);
        var c = this._instrument_full_id;
        b = this._core.getInstrumentByFullId(c);
        null == this._local_trade_date && (this._local_trade_date = b.getTradeDate());
        b = b.getTimezoneOffsetInMinutes();
        this._run_chart.setTimezoneOffsetInMinutes(b);
        this._core.requestToGetMinuteTicksInTradeDay(c, this._local_trade_date, function (b) {
            c == a._instrument_full_id && (a._handleInit(c, b.kticks), a._requestToGetTicksInTradeDay(), window.widgetLoadingProgress && window.widgetLoadingProgress.hide())
        });
        this._core.requestToGetPriceVolumeDataInTradeDay(c,
            this._local_trade_date, function (b) {
                c == a._instrument_full_id && b.trade_date == a._local_trade_date && a._init5VPMTicks_V(c, b.volume_ticks)
            });
        this._fireEvent("best_rank_change", {operation: "reset", instrumentFullId: c});
        this._fireEvent("all_ticks_change", {operation: "reset", instrumentFullId: c});
        this._fireEvent("ticks_by_price_change", {operation: "reset", instrumentFullId: c});
        this._fireEvent("volume_by_price_change", {operation: "reset", instrumentFullId: c})
    }, _handleInit: function (a, b) {
        var c = this._core.getInstrumentByFullId(a),
            d = c.getPriceFormatter();
        this._setOhlcDealPrice(d.format(c.getLastPrice()));
        this._setOhlcFluctuation(c.getUpdown());
        this._setOhlcFluctuationPercent(c.getUpdownPercent());
        this._setOhlcPrevClosePrice(d.format(c.getPrevClosePrice()));
        this._setOhlcOpenPrice(d.format(c.getOpenPrice()));
        this._setOhlcHighPrice(d.format(c.getHighestPrice()));
        this._setOhlcLowPrice(d.format(c.getLowestPrice()));
        this._setOhlcTotalVolume(Utility.prototype.numberFormat(c.getTotalVolume()));
        this._run_chart.setElementalData(c.getDisplayName(),
            c.getDecimalDigits(), c.getOt1(), c.getCt2() || c.getCt1(), c.getPrevClosePrice());
        var d = [], e;
        for (e in b) {
            var f = b[e];
            d.push(new RunChartInitTick(f.time.getTime(), f.open, f.close, f.volume))
        }
        this._run_chart.initTicks(d);
        this._run_chart.repaint();
        this._set5vpmBest5(c.getBest5());
        this.resizeAll()
    }, _handleTicksInterpolation: function (a, b) {
        this._local_trade_date == a && this._run_chart.interpolate(b)
    }, _init5VPMTicks_V: function (a, b) {
        this._datatable_5vpm_v.clear();
        for (var c = this._core.getInstrumentByFullId(a).getPriceFormatter(),
                 d = [], e = Object.keys(b).sort(), f = e.length, g = 0; g < f; ++g) {
            var h = e[g], k = b[h], k = [c.format(h), Utility.prototype.numberFormat(k)], l = this._datatable_5vpm_v.row.add(k).node();
            $(l).attr("id", "runchart_5vpm_v_" + h);
            d.push(k)
        }
        this._datatable_5vpm_v.draw(!1);
        this._fireEvent("volume_by_price_change", {operation: "init", data: d})
    }, _handleQuery5VPMTicks_P: function (a) {
        this._datatable_5vpm_p_query.clear();
        for (var b = [], c = a.length, d = 0; d < c; ++d) {
            var e = a[d], e = [e._timeString, e._price_string, Utility.prototype.numberFormat(e._volume)];
            b.push(e)
        }
        this._datatable_5vpm_p_query.rows.add(b);
        this._datatable_5vpm_p_query.draw(!1)
    }, _handleQuery5VPMTicks_M: function (a) {
        this._datatable_5vpm_m_query.clear();
        for (var b = [], c = a.length, d = 0; d < c; ++d) {
            var e = a[d], e = [e._timeString, e._price_string, Utility.prototype.numberFormat(e._volume)];
            b.push(e)
        }
        this._datatable_5vpm_m_query.rows.add(b);
        this._datatable_5vpm_m_query.draw(!1)
    }, _requestToGetTicksInTradeDay: function () {
        var a = this;
        this._core.requestToGetTicksToMakeUpAllInTradeDay(this._instrument_full_id,
            this._local_trade_date, a._number_of_request_tick, function (b) {
                var c = b.start_index_of_merged_ticks, d = b.merged_ticks;
                a._handle5VPMTicks_M(b.start_index_of_ticks, b.ticks);
                a._handle5VPMTicks_P(c, d)
            })
    }, resetInstrument: function (a, b, c) {
        if (null == a)
            throw 'Invalid instrument full id - "' + a + '".';
        if (!c && this._instrument_full_id === a)
            return !1;
        window.widgetLoadingProgress && window.widgetLoadingProgress.show();
        var d = this;
        c = this._core;
        null != this._instrument_full_id && c.unsubscribeInstrument(this, this._instrument_full_id);
        this._local_trade_date = b;
        c.subscribeInstrument(this, a, !0, !0, !0, function (a) {
            d._core.toDoWhenInstrumentTapeHadGot(a, function () {
                d._handleReset()
            })
        });
        this._instrument_full_id = a
    }, setEnabledForInnerSort: function (a) {
        a ? $("#run_chart_sortable").sortable().sortable("enable").disableSelection() : $("#run_chart_sortable").sortable("disable").enableSelection()
    }, _setEvent: function (a, b) {
        this._events[a] = b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfUI: function (a) {
        this._setEvent("ui",
            a)
    }, registerEventOfBestRankChange: function (a) {
        this._setEvent("best_rank_change", a)
    }, registerEventOfVolumeByPriceChange: function (a) {
        this._setEvent("volume_by_price_change", a)
    }, registerEventOfTicksByPriceChange: function (a) {
        this._setEvent("ticks_by_price_change", a)
    }, registerEventOfAllTicksChange: function (a) {
        this._setEvent("all_ticks_change", a)
    }
};
var FQClient_ClientTape = function () {
    this._events = {};
    this._style_tape_updown_no = "rgb( 255, 255, 255)";
    this._style_tape_updown_up = "rgb( 220, 0, 0)";
    this._style_tape_updown_down = "rgb( 0, 220, 0)";
    this._last_focus_instrument_full_id = null;
    this._pending_refresh_instrument_table = !1;
    this._instrument_full_id_list = [];
    this._column_name_list = [];
    this._map_event_name_to_callback = {};
    this._initLayout()
};
FQClient_ClientTape.prototype = {
    _initStockClient: function (a, b) {
        this._core = a;
        this._client_id = b;
        this._locale = a.getLocale();
        this.changeI18NLocale(this._core.getLocale())
    }, _releaseStockClient: function () {
    }, _initLayout: function () {
        var a = this;
        $("body").on("contextmenu", function (a) {
            return !1
        });
        $("body").on("mousedown", function (b) {
            2 == b.button && a._fireEvent("ui", {name: "contextmenu", operation: "contextmenu", event: b})
        })
    }, getClientId: function () {
        return this._client_id
    }, getColumnDefinitions: function () {
        return FQClient_ClientTape.prototype.COLUMN_DEFINITIONS
    },
    getLastFocusInstrumentFullId: function () {
        return this._last_focus_instrument_full_id
    }, getInstrumentList: function () {
        return this._instrument_full_id_list.slice(0)
    }, resetInstrumentList: function (a) {
        var b = this._core;
        0 < a.length && window.widgetLoadingProgress && window.widgetLoadingProgress.show();
        for (var c in this._instrument_full_id_list) {
            var d = this._instrument_full_id_list[c];
            b.unsubscribeInstrument(this, d)
        }
        this._instrument_full_id_list = a;
        this._rebuildInstrumentTable(this._column_name_list, this._instrument_full_id_list);
        for (c in this._instrument_full_id_list)
            d = this._instrument_full_id_list[c], b.subscribeInstrument(this, d, !0, !0, !1);
        this._fireEvent("instrument_state", {idList: a.slice(0), type: "resetAll"})
    }, resetColumnNameList: function (a) {
        this._column_name_list = a;
        this._rebuildInstrumentTable(this._column_name_list, this._instrument_full_id_list)
    }, setFontWeightToBold: function (a) {
        $("body").css("font-weight", a ? "bold" : "")
    }, setFontSize: function (a) {
        $("body").css("font-size", a + "px");
        this.refreshInstrumentTable(!0)
    }, setColumnPadding: function (a) {
        a =
            "#instruments td { padding: " + a + "px !important;}";
        $("#instruments_table_styling").text(a);
        this.refreshInstrumentTable(!0)
    }, changeTheme: function (a) {
        this._core.loadThemeCSS(a, function (a) {
            a && ($("#css-app").html(a.app), $("#css-jquery_ui").html(a.jquery_ui), $("body").css("visibility", ""))
        })
    }, changeI18NLocale: function (a) {
        var b = this;
        this._core.loadAndApplyI18N(a, $, document, function (a) {
            a && b.refreshInstrumentTable(!1)
        })
    }, _rebuildInstrumentTable: function (a, b) {
        for (var c = this, d = this._core.getInstrumentInfos(),
                 e = [], f = [], g = b.length, h = 0; h < g; ++h) {
            var k = b[h], l = k.split(":"), m = d[l[0]].symbols[l[1]];
            m ? (e.push(k), f.push(m)) : console.warn('The info of instrument "' + k + '" is not existing.')
        }
        k = [{title: "index", name: "index", orderable: !0, targets: 0, visible: !1}];
        d = a.length;
        for (h = 0; h < d; ++h) {
            var n = a[h], q = FQClient_ClientTape.prototype.COLUMN_DEFINITIONS[n];
            q && k.push({
                title: '&nbsp<span data-i18n="' + q["name-i18n"] + '"></span>&nbsp',
                name: n,
                orderable: !0,
                targets: h + 1,
                className: "instrument-" + n
            })
        }
        g = $("#instruments");
        g.hasClass("dataTable") &&
        (g.DataTable().destroy(), g.html(""));
        var l = [0, "asc"], p = g.DataTable({
            jQueryUI: !0,
            paging: !1,
            order: l,
            scrollX: "100%",
            scrollY: "100%",
            dom: "t",
            columnDefs: k,
            preDrawCallback: function (a) {
                a = $(this);
                var b = a.data("scroll_body");
                b || (b = a.closest(".dataTables_scrollBody"), a.data("scroll_body", b));
                b = b.prop("scrollTop");
                a.data("orig_scroll_top", b)
            },
            drawCallback: function (a) {
                var b = $(this);
                a = b.data("scroll_body");
                b = b.data("orig_scroll_top");
                a.prop("scrollTop", b)
            }
        });
        $("#instruments_wrapper").find(".DataTables_sort_icon").remove();
        var n = this._core, r;
        for (r in f) {
            for (var m = f[r], s = [r], h = 0; h < d; ++h)
                if (n = a[h], q = FQClient_ClientTape.prototype.COLUMN_DEFINITIONS[n])
                    switch (n) {
                        case "display_name":
                            s.push(m.displayName);
                            break;
                        default:
                            s.push("")
                    }
            k = m.exchangeId + ":" + m.symbolId;
            h = p.row.add(s).node();
            m = $(h);
            h = "instrument_" + k;
            m.attr("id", h);
            m.data("instrument_full_id", k);
            m.data("ordering_index", r);
            for (var s = m.find("td"), w = h + "_", h = 0; h < d; ++h)
                if (n = a[h], q = FQClient_ClientTape.prototype.COLUMN_DEFINITIONS[n]) {
                    var u = $(s[h]);
                    u.attr("id", w + n);
                    u.data("instrument_full_id",
                        k);
                    (function (a, b) {
                        var d = c.getColumnDefinitions(), e = {instrumentId: a, columnName: b, columnDefs: d};
                        u.on("click", function (a) {
                            e.cellValue = $(this).text();
                            c._fireEvent("ui", {name: "column", operation: "click", event: a, value: e})
                        });
                        u.on("mouseover", function (a) {
                            e.cellValue = $(this).text();
                            c._fireEvent("ui", {name: "column", operation: "mouseover", event: a, value: e})
                        });
                        u.on("mouseout", function (a) {
                            e.cellValue = $(this).text();
                            c._fireEvent("ui", {name: "column", operation: "mouseout", event: a, value: e})
                        })
                    })(k, n)
                }
            m.on("mousedown",
                function () {
                    var a = $(this).data("instrument_full_id");
                    c._last_focus_instrument_full_id = a
                })
        }
        p.draw();
        n = this._core;
        for (h in e)
            k = e[h], n.getInstrumentByFullId(k) && this._updateInstrumentTableByFullId(k);
        this.refreshInstrumentTable(!1);
        this.changeI18NLocale(this._locale);
        var v = a.slice(0);
        g.data("ordering_column_index", l[0]);
        g.data("ordering_column_dir", l[1]);
        g.on("order.dt", function (a, b, d, e) {
            b = $(this);
            e = d[0];
            d = e.col;
            e = e.dir;
            var f = b.data("ordering_column_index"), g = b.data("ordering_column_dir");
            if (f != d || g !=
                e)
                b.data("ordering_column_index", d), b.data("ordering_column_dir", e), c._fireEvent("ui", {
                    name: "column",
                    operation: "order",
                    event: a,
                    value: {columnName: v[d], dir: e}
                })
        });
        return !0
    }, _rebuildInstrumentTableBySettings: function () {
        var a = $("#setup_selected_columns").find("option").map(function () {
            return this.value
        }).get(), b = this.getUsedCustomInstrumentList();
        this._rebuildInstrumentTable(a, b ? b : [])
    }, refreshInstrumentTable: function (a) {
        if (!$.fn.DataTable.isDataTable("#instruments"))
            return !1;
        var b = $("#instruments").DataTable();
        a && b.columns.adjust();
        a = $("#instruments_wrapper");
        a.css("height", "100%");
        a.find(".dataTables_scroll:first").css("height", "100%");
        var c = a.find(".dataTables_scrollHead:first").height(), d = a.find(".dataTables_scrollFoot:first").height();
        a.find(".dataTables_scrollBody:first").css("height", a.height() - c - d);
        b.draw();
        return !0
    }, _updateInstrumentTableByFullId: function (a) {
        var b = this._core.getInstrumentByFullId(a);
        if (null == b)
            console.warn("Update instrument for tape but instrumet is not existing.");
        else {
            var c =
                $("#instruments");
            c.hasClass("dataTable") || this._rebuildInstrumentTableBySettings();
            var c = c.DataTable(), d = "#instrument_" + Utility.prototype.escapeJquerySelector(a), e = c.row(d);
            if (0 == e.length)
                console.warn("There's no row of instrument, instrument full ID is \"" + a + '".');
            else {
                for (var f = e.nodes().to$(), c = this._column_name_list, d = c.length, g = [f.data("ordering_index")], h = this._core.getInstrumentInfos(), k = 0; k < d; ++k) {
                    var l = c[k], m = FQClient_ClientTape.prototype.COLUMN_DEFINITIONS[l];
                    if (m) {
                        m = m.getValueFromInstrument.call(this,
                            b);
                        switch (l) {
                            case "exchange_id":
                                m = (l = h[m]) ? l.displayName : null
                        }
                        null == m && (m = "");
                        g.push(m)
                    }
                }
                try {
                    e.data(g)
                } catch (n) {
                    console.error(n);
                    console.warn('instrument updating was ignored, instrument full ID - "' + a + '".');
                    return
                }
                a = parseFloat(b.getPrevClosePrice());
                f = f.find("td");
                for (k = 0; k < d; ++k) {
                    l = c[k];
                    e = $(f[k]);
                    g = null;
                    switch (l) {
                        case "display_name":
                        case "market_state":
                            e = $(f[k]);
                            1 == this._getMarketStatesForInstrument(b) ? e.removeClass("untradable") : e.addClass("untradable");
                            break;
                        case "last_price":
                        case "updown":
                        case "updown_percent":
                            l =
                                parseFloat(b.getUpdown());
                            e.removeClass("tape_style_updown_no");
                            e.removeClass("tape_style_updown_up");
                            e.removeClass("tape_style_updown_down");
                            0 == l ? e.addClass("tape_style_updown_no") : 0 < l ? e.addClass("tape_style_updown_up") : e.addClass("tape_style_updown_down");
                            break;
                        case "volume":
                            e.addClass("tape_style_volume");
                            break;
                        case "total_volume":
                            e.addClass("tape_style_total_volume");
                            break;
                        case "bid_price":
                            l = parseFloat(b.getBidPrice());
                            g = l - a;
                            break;
                        case "ask_price":
                            l = parseFloat(b.getAskPrice());
                            g = l - a;
                            break;
                        case "last_price":
                            l =
                                parseFloat(b.getLastPrice());
                            g = l - a;
                            break;
                        case "open_price":
                            l = parseFloat(b.getOpenPrice());
                            g = l - a;
                            break;
                        case "highest_price":
                            l = parseFloat(b.getHighestPrice());
                            g = l - a;
                            break;
                        case "lowest_price":
                            l = parseFloat(b.getLowestPrice()), g = l - a
                    }
                    null != g && (0 < g ? e.removeClass("tape_style_updown_no tape_style_updown_down").addClass("tape_style_updown_up") : 0 > g ? e.removeClass("tape_style_updown_no tape_style_updown_up").addClass("tape_style_updown_down") : e.removeClass("tape_style_updown_up tape_style_updown_down").addClass("tape_style_updown_no"))
                }
                window.widgetLoadingProgress &&
                window.widgetLoadingProgress.hide()
            }
        }
    }, _getNumberOfOpenedPositionsOfInstrument: function (a) {
        var b = 0, c = 0, d = this._core.getAccountData().getAccountList();
        if (null == d)
            return null;
        var d = d[0].getTickets(), e;
        for (e in d) {
            var f = d[e];
            "G:" + f.getSymbolId() == a && ("B" === f.getBuySell() ? ++b : ++c)
        }
        return {"short": c, "long": b}
    }, _getMarketStatesForInstrument: function (a) {
        var b = a.getFullId().split(":")[1];
        return 1 == this._core.getAccountData().getSymbol(b).getTradeStatus() ? a.getCfdMarketOpen() ? 1 : 0 : -1
    }, _setEvent: function (a, b) {
        this._events[a] =
            b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfUI: function (a) {
        this._setEvent("ui", a)
    }, registerEventOfInstrumentState: function (a) {
        this._setEvent("instrument_state", a)
    }, _onClientEvents: function (a, b) {
        switch (a) {
            case Core.prototype.CLIENT_EVENTS.Reset:
                console.log("reset tape.");
                this.resetInstrumentList(this._instrument_full_id_list);
                break;
            case Core.prototype.CLIENT_EVENTS.Instrument_Init:
                var c = b.instrument_full_id;
                this._updateInstrumentTableByFullId(c);
                this._fireEvent("instrument_state",
                    {id: c, type: "init"});
                break;
            case Core.prototype.CLIENT_EVENTS.Instrument_Update:
                c = b.instrument_full_id, this._updateInstrumentTableByFullId(c), this._fireEvent("instrument_state", {
                    id: c,
                    type: "update"
                })
        }
    }
};
FQClient_ClientTape.prototype.COLUMN_DEFINITIONS = {
    exchange_id: {
        "name-i18n": "Instruments_Table_Column_ExchangeId", getValueFromInstrument: function (a) {
            return a.getExchangeId()
        }
    }, symbol_id: {
        "name-i18n": "Instruments_Table_Column_SymbolId", getValueFromInstrument: function (a) {
            return a.getId()
        }
    }, display_name: {
        "name-i18n": "Instruments_Table_Column_DisplayName", getValueFromInstrument: function (a) {
            return a.getDisplayName()
        }
    }, month: {
        "name-i18n": "Instruments_Table_Column_Month", getValueFromInstrument: function (a) {
            a =
                a.getFullId().split(":")[1];
            return this._core.getAccountData().getSymbol(a).getMonthCode().replace(/(.{4})(.{2})/, "$2")
        }
    }, number_of_short_positions: {
        "name-i18n": "Instruments_Table_Column_NumberOfShortPositions", getValueFromInstrument: function (a) {
            a = a.getFullId();
            return (a = this._getNumberOfOpenedPositionsOfInstrument(a)) ? (a = a["short"], 0 < a ? a : "") : ""
        }
    }, number_of_long_positions: {
        "name-i18n": "Instruments_Table_Column_NumberOfLongPositions", getValueFromInstrument: function (a) {
            a = a.getFullId();
            return (a = this._getNumberOfOpenedPositionsOfInstrument(a)) ?
                (a = a["long"], 0 < a ? a : "") : ""
        }
    }, bid_price: {
        "name-i18n": "Instruments_Table_Column_BidPrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getBidPrice())
        }
    }, ask_price: {
        "name-i18n": "Instruments_Table_Column_AskPrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getAskPrice())
        }
    }, last_price: {
        "name-i18n": "Instruments_Table_Column_LastPrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getLastPrice())
        }
    }, total_volume: {
        "name-i18n": "Instruments_Table_Column_Total_Volume",
        getValueFromInstrument: function (a) {
            return Utility.prototype.numberFormat(a.getTotalVolume())
        }
    }, updown: {
        "name-i18n": "Instruments_Table_Column_Updown", getValueFromInstrument: function (a) {
            return a.getUpdown()
        }
    }, updown_percent: {
        "name-i18n": "Instruments_Table_Column_UpdownPercent", getValueFromInstrument: function (a) {
            return a.getUpdownPercent()
        }
    }, open_price: {
        "name-i18n": "Instruments_Table_Column_OpenPrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getOpenPrice())
        }
    }, highest_price: {
        "name-i18n": "Instruments_Table_Column_HighestPrice",
        getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getHighestPrice())
        }
    }, lowest_price: {
        "name-i18n": "Instruments_Table_Column_LowestPrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getLowestPrice())
        }
    }, settlement_price: {
        "name-i18n": "Instruments_Table_Column_SettlementPrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getPrevClosePrice())
        }
    }, prev_close_price: {
        "name-i18n": "Instruments_Table_Column_PrevClosePrice", getValueFromInstrument: function (a) {
            return a.getPriceFormatter().format(a.getSettlementPrice())
        }
    },
    market_state: {
        "name-i18n": "Instruments_Table_Column_MarketState", getValueFromInstrument: function (a) {
            switch (this._getMarketStatesForInstrument(a)) {
                case 1:
                    return "\u6b63\u5e38\u4ea4\u6613";
                case 0:
                    return "\u672a\u958b\u76e4";
                case -1:
                    return "\u4e0d\u53ef\u4ea4\u6613"
            }
        }
    }, order_rule: {
        "name-i18n": "Instruments_Table_Column_OrderRule", getValueFromInstrument: function (a) {
            switch (a.getCfdForceCloseOrStopOrderStatus()) {
                case "0":
                    a = "\u6b63\u5e38";
                    break;
                case "1":
                    a = "\u7981\u65b0";
                    break;
                case "2":
                    a = "\u5f37\u5e73";
                    break;
                default:
                    a = ""
            }
            return a
        }
    }, trade_date: {
        "name-i18n": "Instruments_Table_Column_TradeDate", getValueFromInstrument: function (a) {
            return a.getTradeDate().replace(/(.{4})(.{2})(.{2})/, "$1-$2-$3")
        }
    }, time: {
        "name-i18n": "Instruments_Table_Column_Time", getValueFromInstrument: function (a) {
            return a.getTime()
        }
    }, expiry_date: {
        "name-i18n": "Instruments_Table_Column_ExpiryDate", getValueFromInstrument: function (a) {
            a = a.getFullId().split(":")[1];
            return (a = this._core.getAccountData().getSymbol(a).getLastTradeDate()) ? a.replace(/(.{4})(.{2})(.{2})/,
                "$1-$2-$3") : ""
        }
    }
};
var FQWidget_LoadingProgress = function () {
    this._initLayout()
};
FQWidget_LoadingProgress.prototype = {
    _initLayout: function () {
        $("body").css("visibility", "");
        $("body").on("contextmenu", function () {
            return !1
        });
        $(frameElement).css({position: "absolute", left: "0", top: "0", width: "100%", height: "100%", border: "0"});
        $(frameElement).hide()
    }, show: function () {
        $(frameElement).fadeIn(250)
    }, hide: function () {
        $(frameElement).fadeOut(450)
    }
};
var FQClientManager = function (a) {
    this._events = {};
    this._core = new Core(this, a);
    this._client_id_serial_number = 0;
    this._url_of_query_websocket_server = this._url_of_quote_websocket_server = this._url_of_tick_websocket_server = this._url_of_instrument_infos = this._timezone_minutes = this._locale = this._market_data = null;
    this._is_post_for_ajax = !1;
    this.setTimezoneMinutes(this.utility.getClientTimezoneMinutes())
};
FQClientManager.prototype = {
    isBrowserSupported: function () {
        return this._core.isBrowserSupported()
    }, isPostForAjax: function () {
        return this._is_post_for_ajax
    }, getLocale: function () {
        return this._locale
    }, getTimezoneMinutes: function () {
        return this._timezone_minutes
    }, getUrlOfTickWebSocketServer: function () {
        return this._url_of_tick_websocket_server
    }, getUrlOfQuoteWebSocketServer: function () {
        return this._url_of_quote_websocket_server
    }, getUrlOfQueryWebSocketServer: function () {
        return this._url_of_query_websocket_server
    },
    getExchangeList: function () {
        return this._exchange_list
    }, getInstrumentInfos: function () {
        return this._core.getInstrumentInfos()
    }, getInstrumentMarketData: function (a) {
        var b = a.split(":");
        a = b[0];
        b = b[1];
        a = this._core.getInstrumentInfos()[a];
        b = a.symbols[b];
        if (void 0 === b)
            return null;
        var c = a.icInfos[b.ic];
        return {
            timezoneOffsetInMinutes: a ? a.timezoneOffsetInMinutes : null,
            instrument: b ? b : null,
            exchangeName: a ? a.displayName : null,
            icDisplayName: c ? c.displayName : null
        }
    }, getInstrumentData: function (a) {
        a = this._core.getAllInstruments()[a];
        return null == a ? null : {
            instrumentFullId: a.getFullId(),
            exchangeId: a.getExchangeId(),
            industryClassification: a.getIc(),
            symbolId: a.getId(),
            displayName: a.getDisplayName(),
            bidPrice: a.getBidPrice(),
            askPrice: a.getAskPrice(),
            lastPrice: a.getLastPrice(),
            volume: a.getVolume(),
            totalVolume: a.getTotalVolume(),
            upDown: a.getUpdown(),
            upDownPercent: a.getUpdownPercent(),
            highOfOHLC: a.getHighestPrice(),
            lowOfOHLC: a.getLowestPrice(),
            bidVolume: a.getBidVolume(),
            askVolume: a.getAskVolume(),
            openPrice: a.getOpenPrice(),
            closeOfOHLC: a.getPrevClosePrice(),
            settlementPrice: a.getSettlementPrice(),
            expiryDate: a.getExpiryDate(),
            tradeDate: a.getTradeDate(),
            time: a.getTime(),
            openingTime1: a.getOt1(),
            closingTime1: a.getCt1(),
            openingTime2: a.getOt2(),
            closingTime2: a.getCt2(),
            bestRank: {ask: a.getBest5().buy.slice(0), bid: a.getBest5().sell.slice(0)},
            decimalDigits: a.getDecimalDigits(),
            cfdMarketOpen: a.getCfdMarketOpen(),
            cfdForceCloseOrStopOrderStatus: a.getCfdForceCloseOrStopOrderStatus()
        }
    }, getAccountData: function () {
        return this._core.getAccountData()
    }, setLocale: function (a) {
        this._core.setLocale(a)
    },
    setMarketData: function (a) {
        this._core.setMarketData(a)
    }, setTimezoneMinutes: function (a) {
        this._timezone_minutes = a
    }, setUrlOfTickWebSocketServer: function (a) {
        this._url_of_tick_websocket_server = a
    }, setUrlOfQuoteWebSocketServer: function (a) {
        this._url_of_quote_websocket_server = a
    }, setUrlOfQueryWebSocketServer: function (a) {
        this._url_of_query_websocket_server = a
    }, setPostForAjax: function (a) {
        this._is_post_for_ajax = a
    }, setExchangeList: function (a) {
        this._exchange_list = a.slice(0)
    }, _setEvent: function (a, b) {
        this._events[a] =
            b
    }, _fireEvent: function (a, b) {
        var c = this._events[a];
        c && c.call(this, b)
    }, registerEventOfProgressForMarketDataQuerying: function (a) {
        this._setEvent("progress_for_market_data_querying", a)
    }, registerEventOfConnecting: function (a) {
        var b = this;
        this._core.registerEventOfConnecting(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfConnected: function (a) {
        var b = this;
        this._core.registerEventOfConnected(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfDisconnected: function (a) {
        var b = this;
        this._core.registerEventOfDisconnected(function () {
            a.apply(b,
                arguments)
        })
    }, registerEventOfConnectionFailed: function (a) {
        var b = this;
        this._core.registerEventOfConnectionFailed(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfInstrumentRegistered: function (a) {
        var b = this;
        this._core.registerEventOfInstrumentRegistered(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfGotTapeInstrument: function (a) {
        var b = this;
        this._core.registerEventOfGotTapeInstrument(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfLoginComplete: function (a) {
        var b = this;
        this._core.registerEventOfLoginComplete(function () {
            a.apply(b,
                arguments)
        })
    }, registerEventOfServerTimeReceived: function (a) {
        var b = this;
        this._core.registerEventOfServerTimeReceived(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfSubAccount: function (a) {
        var b = this;
        this._core.registerEventOfSubAccount(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfStatement: function (a) {
        var b = this;
        this._core.registerEventOfStatement(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfOrder: function (a) {
        var b = this;
        this._core.registerEventOfOrder(function () {
            a.apply(b, arguments)
        })
    },
    registerEventOfTicket: function (a) {
        var b = this;
        this._core.registerEventOfTicket(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfAccount: function (a) {
        var b = this;
        this._core.registerEventOfAccount(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfAccSymbol: function (a) {
        var b = this;
        this._core.registerEventOfAccSymbol(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfBankbook: function (a) {
        var b = this;
        this._core.registerEventOfBankbook(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfActiveSymbol: function (a) {
        var b =
            this;
        this._core.registerEventOfActiveSymbol(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfMarketClose: function (a) {
        var b = this;
        this._core.registerEventOfMarketClose(function () {
            a.apply(b, arguments)
        })
    }, registerEventOfOrderReport: function (a) {
        var b = this;
        this._core.registerEventOfOrderReport(function () {
            a.apply(b, arguments)
        })
    }, start: function (a, b, c, d) {
        var e = this;
        a = new a(this);
        b && a.setOptions(b);
        a.queryMarketData(function (a) {
            if (a)
                e._market_data = a, e._core.start(a, c, d);
            else
                debugger
        }, function (a, b) {
            e._fireEvent("progress_for_market_data_querying",
                {progressValue: a, progressMax: b})
        })
    }, reconnect: function (a, b) {
        if (null == this._market_data)
            return !1;
        this._core.start(this._market_data, a, b);
        return !0
    }, stop: function () {
        this._core.closeSessions()
    }, bindClient: function (a) {
        this._core.bindClient(a)
    }, unbindClient: function (a) {
        this._core.unbindClient(a)
    }, changeThemeForAllClient: function (a) {
        this._core.changeThemeForAllClient(a)
    }, requestToQueryOrders: function () {
        this._core.requestToQueryOrders()
    }, requestToQueryTickets: function () {
        this._core.requestToQueryTickets()
    },
    postToHTTPServiceAsync: function (a, b, c, d, e, f) {
        return this._core.postToHTTPServiceAsync.apply(this, arguments)
    }, downloadMarketData: function (a) {
        if (null == this._market_data)
            return !1;
        this.utility.downloadObjectAsJson(a, this._market_data);
        return !0
    }, utility: {
        getClientTimezoneMinutes: function () {
            return -(new Date).getTimezoneOffset()
        }, downloadObjectAsJson: function (a, b) {
            var c = new Blob([JSON.stringify(b)]), c = URL.createObjectURL(c), d = document.createElement("a");
            d.href = c;
            d.download = a;
            d.click()
        }
    }, getAccountData: function () {
        return this._core.getAccountData()
    },
    placeOrder: function (a, b, c, d, e, f, g, h, k, l, m, n, q) {
        var p = b + ":" + c;
        b = this._core.getInstrumentByFullId(p);
        if (void 0 == b)
            throw "Instrument not exists: " + p;
        var p = void 0 != k, r;
        r = "B" == d ? b.getAskPrice() : "S" == d ? b.getBidPrice() : 0;
        var s;
        s = 0 < l || 0 < m ? 0 < l ? "L" : "S" : 0 < n ? 0 < q ? "O" : "L" : 0 < q ? "S" : "M";
        a = [c, b.getQuoteIndex(), p ? "C" : "O", s, d, this._core.getHouseId(), this._core.getUserId(), a, this._core.getUserId(), this._core.getUserId(), r, e, l, m, n, q, b.getBidPrice(), b.getAskPrice(), void 0 != k ? k : null, null, this._core.getSessionReference(),
            null, f, g, h, p ? "0" : null, p ? "0" : null];
        a = this._core.getTelegramFactory().genTelegramToPlaceOrder(this._core.getUserId(), a);
        this._core.getQuerySessionWrapper().send(a)
    }, modifyOrder: function (a, b, c, d, e, f, g, h, k, l, m, n, q) {
        var p = b + ":" + c;
        b = this._core.getInstrumentByFullId(p);
        if (void 0 == b)
            throw "Instrument not exists: " + p;
        var p = "B" == d ? b.getAskPrice() : "S" == d ? b.getBidPrice() : 0, r;
        r = null != n || null != l ? null != q || null != m ? "O" : "L" : null != q || null != m ? "S" : "M";
        var s;
        if (0 < l || 0 < m)
            s = !1;
        else if (0 < n || 0 < q)
            s = !0;
        else if (0 < p)
            s = !0;
        else
            debugger;
        a = [c, b.getQuoteIndex(), s ? "C" : "O", r, d, this._core.getHouseId(), this._core.getUserId(), a, this._core.getUserId(), this._core.getUserId(), p, e, l, m, n, q, b.getBidPrice(), b.getAskPrice(), void 0 != k ? k : null, null, this._core.getSessionReference(), null, f, g, h, null, null];
        a = this._core.getTelegramFactory().genTelegramToModifyOrder(this._core.getUserId(), a);
        this._core.getQuerySessionWrapper().send(a)
    }, deleteOrder: function (a) {
        a = [a, this._core.getSessionReference()];
        a = this._core.getTelegramFactory().genTelegramToDeleteOrder(this._core.getUserId(),
            a);
        this._core.getQuerySessionWrapper().send(a)
    }
};
