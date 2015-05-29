var Client = function()
{
    this._theme_resource_loaders = {};
    this._dom_fading_bar = document.getElementById( 'fadingBarsG');
    this._dom_reconnect_button = document.getElementById( 'btnReconect');
    this._dom_loading_progress_container = document.getElementById( 'loadingProgressContainer');
    this._dom_loading_progress_percent = document.getElementById( 'loadingProgressPercent');
    this._dom_loading_progress_caption = document.getElementById( 'loadingProgressCaption');

    // 核心模組。
    this._dom_frame_fq_client_manager = window.frames['fq_client_manager'];
    this._fq_client_manager = this._dom_frame_fq_client_manager.fqClientManager;
    this._utility = this._dom_frame_fq_client_manager.Utility.prototype;


    // 模組 - Tooltip。
    this._dom_frame_fq_client_tooltips = window.frames['fq_client_tooltips'];
    this._fq_client_tooltips = this._dom_frame_fq_client_tooltips.fqClient;

    // 模組 - 右鍵選單。
    this._dom_frame_fq_client_contextmenus = window.frames['fq_client_contextmenus'];
    this._fq_client_contextmenus = this._dom_frame_fq_client_contextmenus.fqClient;

    // 模組 - 自訂HTML Dialog。
    this._dom_frame_fq_client_dialog_html = window.frames['fq_client_dialog_html'];
    this._fq_client_dialog_html = this._dom_frame_fq_client_dialog_html.fqClient;

    // 模組 - 自訂欄位Dialog。
    this._dom_frame_fq_client_dialog_custom_columns = window.frames['fq_client_dialog_custom_columns'];
    this._fq_client_dialog_custom_columns = this._dom_frame_fq_client_dialog_custom_columns.fqClient;

    // 模組 - K線指標設置Dialog。
    this._dom_frame_fq_client_dialog_kgraph_indicators = window.frames['fq_client_dialog_kgraph_indicators'];
    this._fq_client_dialog_kgraph_indicators = this._dom_frame_fq_client_dialog_kgraph_indicators.fqClient;

    // 模組 - 盤面。
    this._dom_frame_fq_client_tape = window.frames['fq_client_tape'];
    this._fq_client_tape = this._dom_frame_fq_client_tape.fqClient;

    // 模組 - 走勢圖。
    this._dom_frame_fq_client_runchart = window.frames['fq_client_runchart'];
    this._fq_client_runchart = this._dom_frame_fq_client_runchart.fqClient;

    // 模組 - K線圖。
    this._dom_frame_fq_client_kgraph = window.frames['fq_client_kgraph'];
    this._fq_client_kgraph = this._dom_frame_fq_client_kgraph.fqClient;

    // 模組 - K線工具列。
    this._dom_frame_fq_client_kgraph_toolkits = window.frames['fq_client_kgraph_toolkits'];
    this._fq_client_kgraph_toolkits = this._dom_frame_fq_client_kgraph_toolkits.fqClient;

    // 核心模組 - 設置地區語言。
    this._fq_client_manager.setLocale( 'zh-TW');

    this._current_symbol_id = null;

    // dataTable表格.
    this._datatable_account_info = null;
    this._datatable_instruments = null;
    this._datatable_tick_details = null;
    this._datatable_volume_by_price = null;
    this._datatable_orders = null;
    this._datatable_opened_positions = null;
    this._datatable_closed_positions = null;
    this._datatable_summary = null;

    this._datatable_tick_details_is_pending = false;

    //this._jquery_instrument_cells = {};
    this._tick_volume_bars_max_volume = null;
    this._tick_volume_bars_max_volume_price = null;

    /*
     this._tape_columns = {
     'display_name': { 'title': '商品'},
     'operations': { 'title': ''},
     'number_of_buying': { 'title': '多'},
     'number_of_selling': { 'title': '空'},
     'bid_price': { 'title': '委買'},
     'ask_price': { 'title': '委賣'},
     'last_price': { 'title': '成交價'},
     'updown': { 'title': '漲跌'},
     'updown_percent': { 'title': '漲跌幅'},
     'total_volume': { 'title': '成交量'},
     'open_price': { 'title': '開盤價'},
     'highest_price': { 'title': '最高價'},
     'lowest_price': { 'title': '最低價'},
     'settlement_price': { 'title': '昨結價'},
     'prev_close_price': { 'title': '昨收價'},
     'market_state': { 'title': '交易類型'},
     'order_rule': { 'title': '禁新強平'},
     'time': { 'title': '更新時間'},
     'expiry_date': { 'title': '最後交易日'},
     };
     this._tape_column_name_list = ['display_name', 'operations', 'number_of_buying', 'number_of_selling', 'bid_price', 'ask_price', 'last_price', 'updown', 'updown_percent', 'total_volume', 'open_price', 'highest_price', 'lowest_price', 'settlement_price', 'prev_close_price', 'market_state', 'order_rule', 'time', 'expiry_date'];
     */
    this._tick_details_columns = {
        'time': { 'title': '時間'},
        'volume': { 'title': '單量'},
        'updown': { 'title': '漲跌'},
        'settlement': { 'title': '成交價'},
    };
    this._tick_details_name_list = ['time', 'volume', 'updown', 'settlement'];

    this._tick_volume_by_price_columns = {
        'price': { 'title': '價格', 'width': '25%'},
        'volume_bar': { 'title': '', 'width': '45%'}, // 數量(柱狀)
        'volume': { 'title': '數量', 'width': '25%'},
    };
    this._tick_volume_by_price_column_name_list = ['price', 'volume_bar', 'volume'];

    this._order_columns = {
        'operation': { 'title': '動作'},
        'order_no': { 'title': '訂單號碼'},
        'display_name': { 'title': '商品'},
        'buy_price': { 'title': '多'},
        'sell_price': { 'title': '空'},
        'contract_type': { 'title': '種類'},
        'lots': { 'title': '口數'},
        'stop_loss': { 'title': '停損'},
        'take_profit': { 'title': '停利'},
        'order_time': { 'title': '下單時間'},
        'update_time': { 'title': '更新時間'},
        'order_action': { 'title': '型別'},
        'order_status': { 'title': '訂單狀態'},
        'open_close': { 'title': '新/平'},
        'order_type': { 'title': '訂單類型'},
        'order_account': { 'title': '下單帳號'},
        'orignal': { 'title': '來源單'},
    };
    this._order_column_name_list = ['operation', 'order_no', 'display_name', 'buy_price', 'sell_price', 'contract_type', 'lots', 'stop_loss', 'take_profit', 'order_time', 'update_time', 'order_action', 'order_status', 'open_close', 'order_type', 'order_account', 'orignal',];

    this._opened_position_columns = {
        'operation': { 'title': '平倉'},
        'symbol': { 'title': '商品'},
        'dir': { 'title': '多/空'},
        'open_price': { 'title': '開倉價'},
        'lot': { 'title': '口數'},
        'stop_loss': { 'title': '停損'},
        'take_profit': { 'title': '停利'},
        'profit_pip': { 'title': '點數'},
        'fee': { 'title': '手續費'},
        'pl': { 'title': '淨盈虧'},
        'over_night_days': { 'title': '留倉天數'},
        'open_time': { 'title': '開倉時間'},
        'ticket_no': { 'title': '合約號碼'},
        'order_no': { 'title': '訂單號碼'},
        'order_account': { 'title': '帳號'},
    };
    this._opened_position_column_name_list = ['operation', 'symbol', 'dir', 'open_price', 'lot', 'stop_loss', 'take_profit', 'profit_pip', 'fee', 'pl', 'over_night_days', 'open_time', 'ticket_no', 'order_no', 'order_account'];

    this._closed_position_columns = {
        'symbol': { 'title': '商品'},
        'dir': { 'title': '多/空'},
        'contract': { 'title': '大中小'},
        'lot': { 'title': '口數'},
        'open_price': { 'title': '開倉價'},
        'clsoe_price': { 'title': '平倉價'},
        'profit_pip': { 'title': '點數'},
        'fee': { 'title': '手續費'},
        'pl': { 'title': '淨盈虧'},
        'open_order_type': { 'title': '開倉型別'},
        'close_order_type': { 'title': '平倉型別'},
        'open_time': { 'title': '開倉時間'},
        'close_time': { 'title': '平倉時間'},
        'open_order_no': { 'title': '開倉訂單'},
        'close_order_no': { 'title': '平倉訂單'},
        'ticket_no': { 'title': '合約號碼'},
    };
    this._closed_position_column_name_list = ['symbol', 'dir', 'contract', 'lot', 'open_price', 'clsoe_price', 'profit_pip', 'fee', 'pl', 'open_order_type', 'close_order_type', 'open_time', 'close_time', 'open_order_no', 'close_order_no', 'ticket_no'];

    this._summary_columns = {
        'symbol': { 'title': '商品名稱'},
        'total_buy': { 'title': '總多'},
        'total_sell': { 'title': '總空'},
        'total_opened': { 'title': '未平倉'},
        'total_amount': { 'title': '總口數'},
        'total_fee': { 'title': '手續費總計'},
        'total_pl': { 'title': '損益'},
    };
    this._summary_column_name_list = ['symbol', 'total_buy', 'total_sell', 'total_opened', 'total_amount', 'total_fee', 'total_pl'];

    this._pre_draw_callback = function( IN_settings)
    {
        var L_self = $( this);
        var L_jquery_scroll_body = L_self.data( 'scroll_body');
        if (! L_jquery_scroll_body) {
            L_jquery_scroll_body = L_self.closest( '.dataTables_scrollBody');
            L_self.data( 'scroll_body', L_jquery_scroll_body);
        }

        var L_original_scroll_top = L_jquery_scroll_body.prop( 'scrollTop');
        L_self.data( 'orig_scroll_top', L_original_scroll_top);
    };

    this._draw_callback = function( IN_settings)
    {
        var L_self = $( this);
        var L_jquery_scroll_body = L_self.data( 'scroll_body');
        var L_original_scroll_top = L_self.data( 'orig_scroll_top');
        L_jquery_scroll_body.prop( 'scrollTop', L_original_scroll_top);
    };

    this._theme_name = null;

    // 資料.
    this._account_id = null;
};

Client.prototype.ERROR_MESSAGES =
{
    '3000': '輸入錯誤',
    '3001': '下單失敗',
    '3002': '錯誤的商品',
    '3003': '錯誤的定單號',
    '3004': '下單失敗',
    '3005': '商品錯誤',
    '3006': '下單失敗',
    '3007': '市場已關閉!',
    '3008': '改單/刪單失敗',
    '3009': '下單失敗',
    '3010': '下單失敗',
    '3011': '下單失敗',
    '3012': '市場價格已變',
    '3013': '下單失敗',
    '3014': '下單失敗',
    '3015': '帳號已被休眠,請聯絡客服',
    '3016': '保證金不足',
    '3017': '找不到頭寸',
    '3018': '鎖單失敗',
    '3019': '市場價格已變',
    '3020': '訂單價位異常',
    '3021': '請聯繫系統支援中心.',
    '3022': '定單已存在. 請刷新畫面.',
    '3023': '下單拒絕',
    '3024': '市場已關閉!',
    '3025': '此帳號無法下閃電單',
    '3026': '此帳號無法代客下單',
    '3027': '無法交易',
    '3028': '無法下停損單',
    '3029': '無法下停利單',
    '3030': '無法下市價單',
    '3031': '口數超過當日最大口數',
    '3032': '口數超過單筆最大口數',
    '3033': '超過極輸極贏限制',
    '3034': '系統過帳中',
    '3035': '商品已過期',
    '3036': '商品交易狀態: 禁止新單',
    '3037': '市價單口數超過可下口數',
    '3038': '反手單超過最大口數',
    '3039': '收盤價設定失敗',
    '3040': '此帳號不允許收盤價',
    '3041': '停損停利單已存在',
    '3042': '網速太慢',
    '3043': '價位超過當天最高最低限制',

    '3100': '登入ID 和 密码不符',
    '3101': '密碼重試超過5次,帳號被鎖,請致電客服',
    '3102': '登入ID 和 密码不符',
    '3103': '超過允許最大同時登入次數',
    '3104': '帳號已被休眠,請聯絡客服',
    '3105': '新舊密碼不符',
};

Client.prototype.init = function()
{
    this._initLayout();

    var L_this = this;
    //var userId = 'A127798135';
    //var userId = 'A123456789';
    //var userId = 'R001';
    //var userAuth = 'b59c67bf196a4758191e42f76670ceba';
    //var userId = 'EUR00002';
    //var userAuth = '202cb962ac59075b964b07152d234b70'; // it md5 hash of '123'
    //var hash = CryptoJS.MD5( '123');
    //var userAuth = hash.toString().toUpperCase();
    var userId = null;
    var userAuth = null;
    var constMaxOfZIndex = 2147483647;
    var constNumberOfKTick = 5000;
    var clientsHadBound = false;

    // 核心模組 - 設置交易所清單。
    this._fq_client_manager.setExchangeList(
        [
            FQMarket_Capital.prototype.EXCHANGE_NAME_TO_IDC_CODE['NYSE'],
            FQMarket_Capital.prototype.EXCHANGE_NAME_TO_IDC_CODE['NASDAQ'],
            FQMarket_Capital.prototype.EXCHANGE_NAME_TO_IDC_CODE['AMEX'],
            FQMarket_Capital.prototype.EXCHANGE_NAME_TO_IDC_CODE['HKSE'],
            FQMarket_Capital.prototype.EXCHANGE_NAME_TO_IDC_CODE['SSE'],
            FQMarket_Capital.prototype.EXCHANGE_NAME_TO_IDC_CODE['SZSE']
        ]
    );

    // 核心模組 - 正在連線。
    this._fq_client_manager.registerEventOfConnecting(
        function( msg)
        {
            L_this._dom_loading_progress_caption.innerHTML = '正在連線至報價伺服器';
            L_this._dom_loading_progress_percent.innerHTML = '請稍候';
            L_this._dom_loading_progress_container.style['display'] = 'block';
        }
    );

    // 核心模組 - 連線成功。
    this._fq_client_manager.registerEventOfConnected(
        function( msg)
        {
            var serviceType = msg['serviceType'];
            if (serviceType == null) {
                // 綁定stock client。
                bindStockClients();

                Ready();

                L_this._dom_loading_progress_container.style['display'] = 'none';
            }
            else {
                // 部分服務接上線，由於目前只有tick與quote兩個服務，所以一定是50%。
                L_this._dom_loading_progress_percent.innerHTML = '50%';
            }
        }
    );

    // 核心模組 - 連線中斷或者一個嘗試連線至遠端伺服器的WebSocket失敗。
    this._fq_client_manager.registerEventOfDisconnected(
        function( msg)
        {
            var errorHasOccurred = msg['errorHasOccurred'];
            if (errorHasOccurred == false) { // 非因錯誤發生的連線中斷。
                L_this._dom_loading_progress_caption.innerHTML = '與伺服器連線中斷';
                L_this._dom_loading_progress_percent.innerHTML = '';
                L_this._dom_loading_progress_container.style['display'] = 'block';
                L_this._dom_reconnect_button.style['display'] = '';
                L_this._dom_fading_bar.style['display'] = 'none';
            }
        }
    );

    // 核心模組 - 連線失敗。
    this._fq_client_manager.registerEventOfConnectionFailed(
        function( msg)
        {
            L_this._dom_loading_progress_caption.innerHTML = '無法連線至報價伺服器';
            L_this._dom_loading_progress_percent.innerHTML = '';
            L_this._dom_loading_progress_container.style['display'] = 'block';
        }
    );

    // 核心模組 - 註冊商品成功時的事件。
    this._fq_client_manager.registerEventOfInstrumentRegistered(
        function( msg)
        {
            // ...
        }
    );

    // 核心模組 - 註冊拿到某商品盤面的事件。
    this._fq_client_manager.registerEventOfGotTapeInstrument(
        function( msg)
        {
            var localTradeDate = null; // Depend on tape.

            var L_instrument_full_id = msg['instrumentFullId'];
            if (this._current_symbol_id == null) {
                var L_instrument_full_id_arr = L_instrument_full_id.split( ':');
                var L_symbol_id = L_instrument_full_id_arr[1];
                L_this.changeCurrentSymbol( L_symbol_id);
                L_this.updateTapeInstrumentInfo( L_symbol_id);
                L_this.updateOpenedPositionsOfInstrument( L_instrument_full_id);
                L_this.updateClosedPositionsOfInstrument( L_instrument_full_id);
                L_this.updateOrdersOfInstrument( L_instrument_full_id);
            }

            // 預設連動第一檔拿到盤面的商品。
            if (! L_this._fq_client_runchart.getInstrumentFullId()) {
                L_this._fq_client_runchart.resetInstrument( L_instrument_full_id, localTradeDate);
            }

            // 預設連動第一檔拿到盤面的商品。
            if (! L_this._fq_client_kgraph.getInstrumentFullId()) {
                L_this._fq_client_kgraph.resetInstrument( L_instrument_full_id, 'm1', localTradeDate, constNumberOfKTick);
            }
        }
    );

    // 收到Server時間
    this._fq_client_manager.registerEventOfServerTimeReceived(
        function( msg) {
            var L_server_time = msg['serverTime'];
            var L_server_time_matches = L_server_time.match( /(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/);
            var L_year = L_server_time_matches[1];
            var L_month = L_server_time_matches[2];
            var L_day = L_server_time_matches[3];
            var L_hour = L_server_time_matches[4];
            var L_minute = L_server_time_matches[5];
            var L_second = L_server_time_matches[6];

            var L_server_date = new Date();
            L_server_date.setUTCFullYear( L_year);
            L_server_date.setUTCMonth( L_month);
            L_server_date.setUTCDate( L_day);
            L_server_date.setUTCHours( L_hour);
            L_server_date.setUTCMinutes( L_minute);
            L_server_date.setUTCSeconds( L_second);

            var L_client_date = new Date();
            var L_diff_timm_msec = L_server_date.getTime() - L_client_date.getTime();

            setInterval(
                function() {
                    var L_server_date = new Date( Date.now() + L_diff_timm_msec);
                    var L_hour = L_server_date.getUTCHours().toString();
                    var L_minte = L_server_date.getUTCMinutes().toString();
                    var L_second = L_server_date.getUTCSeconds().toString();
                    if (L_hour.length == 1) L_hour = '0' + L_hour;
                    if (L_minte.length == 1) L_minte = '0' + L_minte;
                    if (L_second.length == 1) L_second = '0' + L_second;

                    var L_time_string = L_hour + ':' + L_minte + ':' + L_second;

                    $( '#server_time').text( L_time_string);
                },
                1000
            );
        }
    );

    // 收到子帳戶列表更新
    this._fq_client_manager.registerEventOfSubAccount(
        function( IN_account_data)
        {

        }
    );

    // 收到帳戶資金摘要更新
    this._fq_client_manager.registerEventOfStatement(
        function()
        {
            L_this.updateStatement();
        }
    ) ;

    // 收到訂單更新
    this._fq_client_manager.registerEventOfOrder(
        function( msg)
        {
            // 先不論如何全部刷新。
            L_this.updateOrders();
        }
    );

    // 收到倉位更新
    this._fq_client_manager.registerEventOfTicket(
        function()
        {
            L_this.updateOpenedPositions();
            L_this.updateClosedPositions();

            L_this._updateStatementBalance();
        }
    );

    // 收到帳戶屬性更新
    this._fq_client_manager.registerEventOfAccount(
        function()
        {
            //debugger;
        }
    );

    // 收到帳戶商品屬性更新
    this._fq_client_manager.registerEventOfAccSymbol(
        function()
        {
            //debugger;
        }
    );

    // 收到資金明細更新
    this._fq_client_manager.registerEventOfBankbook(
        function()
        {
            //debugger;
        }
    );

    // 收到商品屬性更新
    this._fq_client_manager.registerEventOfActiveSymbol(
        function()
        {
            //debugger;
        }
    );

    // 收盤事件更新
    this._fq_client_manager.registerEventOfMarketClose(
        function()
        {
            //debugger;
        }
    );

    // 下單回報事件
    this._fq_client_manager.registerEventOfOrderReport(
        function( msg)
        {
            var L_error_code = msg['errorCode'];
            var L_error_msg = msg['errorMsg'];
            var L_display_error_msg =  Client.prototype.ERROR_MESSAGES[L_error_code];
            if (L_display_error_msg != null) {
                L_this._fq_client_dialog_html.setTitle( '錯誤');
                L_this._fq_client_dialog_html.setResizable( false);
                L_this._fq_client_dialog_html.setSize( 'auto', 'auto');
                L_this._fq_client_dialog_html.resetHTML( '<span>' + L_display_error_msg + '</span><hr/><span>Error code: ' + L_error_code + '</span><br/><span>' + L_error_msg + '</span>');
                L_this._fq_client_dialog_html.showDialog( true);
            }
            else {
                // 理論上server應該要主動回覆委託單給我，然後在 registerEventOfOrder 事件中處理，但是這個功能還有問題。
                // 現在先主動跟server重新要一次。
                L_this._fq_client_manager.requestToQueryOrders();
            }
        }
    );

    // 核心模組 - 註冊登入成功事件.
    this._fq_client_manager.registerEventOfLoginComplete(
        function( IN_account_data)
        {
            // 登入成功後開始執行整個程式.
            L_this.run();

            // 更新所有資訊.
            L_this.updateStatement();

            // 已下幾行有商品盤面資料的相依性問題。
            // 是不是應該先進可能的顯示，然後依賴到的資料在表格中顯示 "---"。
            // L_this.updateOpenedPositions();
            // L_this.updateClosedPositions();
            // L_this.updateOrders();
            // L_this.updateSummaryForAllInstruments();

            //L_this.updateAllInstrumentNumberOfOpenedPositions();
        }
    );

    // 測試斷線行為用。
    /*
     setTimeout(
     function()
     {
     L_this._fq_client_manager.stop();
     },
     15000
     );
     */

    // 設置重新連線按鈕事件。
    this._dom_reconnect_button.addEventListener(
        'click',
        function()
        {
            L_this._dom_reconnect_button.style['display'] = 'none';
            L_this._dom_fading_bar.style['display'] = '';

            L_this._fq_client_manager.reconnect( userId, userAuth);
        }
    );


    // 預設使用空的市場資料。
    var stockMarketConstructor = FQMarket_Snapshot;
    var stockMarketOptions = { 'url': '../market_data_of_future_snapshot.json'};

    this._dom_loading_progress_container.style['display'] = 'none';

    // 模塊綁定 - HTML Dialog。
    this._fq_client_manager.bindClient( this._fq_client_dialog_html);

    // HTML Dialog - 註冊Dialog顯示之前的事件。
    this._fq_client_dialog_html.registerEventOfShowing(
        function()
        {
            L_this._dom_frame_fq_client_dialog_html.frameElement.style['zIndex'] = constMaxOfZIndex;
        }
    );

    // HTML Dialog - 註冊Dialog關閉之後的事件。
    this._fq_client_dialog_html.registerEventOfClosed(
        function()
        {
            L_this._dom_frame_fq_client_dialog_html.frameElement.style['zIndex'] = -1;
        }
    );

    this._showLoginDialog(
        function( IN_user_id, IN_user_pwd, IN_server_index)
        {
            // 準備開始執行服務。
            L_this._dom_loading_progress_caption.innerHTML = '正在驗證身份';
            L_this._dom_loading_progress_percent.innerHTML = '請稍候';
            L_this._dom_loading_progress_container.style['display'] = 'block';

            // 核心模組 - 設置伺服器的URL。
            switch (IN_server_index)
            {
                case 0: // Futures - JChart.
                    this._fq_client_manager.setUrlOfTickWebSocketServer( 'ws://122.152.162.81:10891/websocket');
                    this._fq_client_manager.setUrlOfQuoteWebSocketServer( 'ws://122.152.162.81:10890/websocket');
                    this._fq_client_manager.setUrlOfQueryWebSocketServer( 'ws://122.152.162.81:10892/websocket');
                    break;
            }

            var L_user_auth = CryptoJS.MD5( IN_user_pwd).toString().toUpperCase();
            L_this._fq_client_manager.start( stockMarketConstructor, stockMarketOptions, IN_user_id, L_user_auth);

            // 保留帳號密碼給reconnect用。
            userId = IN_user_id;
            userAuth = L_user_auth;
        }
    );

    function bindStockClients() // Named closure function.
    {
        if (clientsHadBound) {
            return;
        }

        clientsHadBound = true;
        var settingTapeFontSize; // 盤面模組字型大小。
        var settingTapeColumnPaddingSize; // 盤面模組欄距大小。
        var settingFontSize; // 其他模組字型大小。

        var funcResetSettings = function()
        {
            // 設置預設樣式。
            settingTapeFontSize = 14;
            settingTapeColumnPaddingSize = 3;
            settingFontSize = 14;

            L_this._fq_client_tape.setFontSize( settingTapeFontSize);
            L_this._fq_client_tape.setColumnPadding( settingTapeColumnPaddingSize);

            funcSetFontSize();
        };

        var funcSetFontSize = function()
        {
            L_this._fq_client_runchart.setFontSize( settingFontSize);
            L_this._fq_client_kgraph.setFontSize( settingFontSize);
            L_this._fq_client_kgraph_toolkits.setFontSize( settingFontSize);
            L_this._fq_client_contextmenus.setFontSize( settingFontSize);
            L_this._fq_client_tooltips.setFontSize( settingFontSize);
            L_this._fq_client_dialog_html.setFontSize( settingFontSize);
            L_this._fq_client_dialog_kgraph_indicators.setFontSize( settingFontSize);
        };

        var funcModifySettingOfTapeFontSize = function( fontSize)
        {
            settingTapeFontSize = fontSize;
            if (settingTapeFontSize > 40) {
                settingTapeFontSize = 40;
            }
            else if (settingTapeFontSize < 10) {
                settingTapeFontSize = 10;
            }
        };

        var funcModifySettingOfTapeColumnPadding = function( columnPaddingSize)
        {
            settingTapeColumnPaddingSize = columnPaddingSize;
            if (settingTapeColumnPaddingSize > 30) {
                settingTapeColumnPaddingSize = 30;
            }
            else if (settingTapeColumnPaddingSize < 0) {
                settingTapeColumnPaddingSize = 0;
            }
        };

        var funcModifySettingOfFontSize = function( fontSize)
        {
            settingFontSize = fontSize;
            if (settingFontSize > 40) {
                settingFontSize = 40;
            }
            else if (settingFontSize < 10) {
                settingFontSize = 10;
            }
        };

        if (false === L_this._fq_client_manager.isBrowserSupported()) {
            alert( '瀏覽器並不支援部分必要的HTML5功能，將會有部分功能無法使用。\n\n請使用完整支援HTML5的瀏覽器：\n\tChrome 31以上\n\tSafari 6以上\n\tIE 10以上\n\tOpera 25以上');
        }

        // 模塊綁定 - 右鍵選單。
        L_this._fq_client_manager.bindClient( L_this._fq_client_tooltips);

        // 模塊綁定 - 右鍵選單。
        L_this._fq_client_manager.bindClient( L_this._fq_client_contextmenus);

        // 模塊綁定 - 盤面欄位。
        L_this._fq_client_manager.bindClient( L_this._fq_client_dialog_custom_columns);

        // 模塊綁定 - K線指標設置Dialog。
        L_this._fq_client_manager.bindClient( L_this._fq_client_dialog_kgraph_indicators);

        // 模塊綁定 - 盤面。
        L_this._fq_client_manager.bindClient( L_this._fq_client_tape);

        // 模塊綁定 - 走勢圖。
        L_this._fq_client_manager.bindClient( L_this._fq_client_runchart);

        // 模塊綁定 - K線圖。
        L_this._fq_client_manager.bindClient( L_this._fq_client_kgraph);

        // 模塊綁定 - K線圖工具列。
        L_this._fq_client_manager.bindClient( L_this._fq_client_kgraph_toolkits);

        // 右鍵選單 - 顯示之前的事件。
        L_this._fq_client_contextmenus.registerEventOfShowing(
            function()
            {
                L_this._dom_frame_fq_client_contextmenus.frameElement.style['zIndex'] = constMaxOfZIndex;
            }
        );

        // 右鍵選單 - 關閉之後的事件。
        L_this._fq_client_contextmenus.registerEventOfClosed(
            function()
            {
                L_this._dom_frame_fq_client_contextmenus.frameElement.style['zIndex'] = -1;
            }
        );

        // 自訂欄位的Dialog - 註冊Dialog顯示之前的事件。
        L_this._fq_client_dialog_custom_columns.registerEventOfShowing(
            function()
            {
                L_this._fq_client_dialog_custom_columns.frameElement.style['zIndex'] = constMaxOfZIndex;
            }
        );

        // 自訂欄位的Dialog - 註冊Dialog關閉之後的事件。
        L_this._fq_client_dialog_custom_columns.registerEventOfClosed(
            function()
            {
                L_this._fq_client_dialog_custom_columns.frameElement.style['zIndex'] = -1;
            }
        );

        // 自訂欄位的Dialog - 提交時的事件。
        L_this._fq_client_dialog_custom_columns.registerEventOfCommit(
            function( msg)
            {
                var selectedColumnNameList = msg['selectedColumnNameList'];
                L_this._fq_client_tape.resetColumnNameList( selectedColumnNameList);

                // 儲存設定。
                localStorage['customColumns'] = JSON.stringify({
                    'selected': selectedColumnNameList
                });
            }
        );

        // 自訂欄位的Dialog - 顯示。
        var columnDefinitions = L_this._fq_client_tape.getColumnDefinitions(); // 取得盤面中所有的欄位定義。

        var availableColumnNameList = [ // 可用欄位。
            //'exchange_id', // 交易所。
            //'symbol_id', // 股號。
            'display_name', // 股票名稱。
            'month', // 月份。
            'number_of_long_positions', // 多。
            'number_of_short_positions', // 空。
            'bid_price', // 委買價。
            'ask_price', // 委賣價。
            'last_price', // 成交價。
            'updown', // 漲跌價。
            'updown_percent', // 漲跌幅。
            // 'volume', // 單量。
            'total_volume', // 成交量。
            'open_price', // 開盤價。
            'highest_price', // 最高價。
            'lowest_price', // 最低價。
            'settlement_price', // 結算價。
            'prev_close_price', // 昨收價。
            // 'bid_volume', // 買量。
            // 'ask_volume', // 賣量。
            'market_state', // 交易類型。
            'order_rule', // 禁新強平。
            //'trade_date', // 交易日。
            'time', // 時間。
            'expiry_date' // 最後交易日。
        ];
        var localCustomColumns = localStorage['customColumns'];
        var selectedColumnNameList;
        var unselectedColumnNameList;
        if (localCustomColumns != null) {
            console.log( 'load selected columns from localStorage.');

            // 使用儲存的設定。
            try {
                localCustomColumns = JSON.parse( localCustomColumns);
                selectedColumnNameList = localCustomColumns['selected'];
                console.log( 'selected columns: ');
                console.log( selectedColumnNameList);
            }
            catch (err) {
                console.error( 'parse custom columns failed.');
            }
        }

        if (selectedColumnNameList == null) {
            var selectedColumnNameList = [ // 預設選取的欄位。
                'display_name', // 股票名稱。
                'month', // 月份。
                'number_of_long_positions', // 多。
                'number_of_short_positions', // 空。
                'bid_price', // 委買價。
                'ask_price', // 委賣價。
                'last_price', // 成交價。
                'updown', // 漲跌價。
                'updown_percent', // 漲跌幅。
                'total_volume', // 成交量。
                'open_price', // 開盤價。
                'highest_price', // 最高價。
                'lowest_price', // 最低價。
                'settlement_price', // 結算價。
                'prev_close_price', // 昨收價。
                'market_state', // 交易類型。
                'order_rule', // 禁新強平。
                'time', // 時間。
                'expiry_date' // 最後交易日。
            ];
            unselectedColumnNameList = ['settlement_price']; // 預設未選取的欄位。
        }

        // 找出未選擇的欄位。
        if (unselectedColumnNameList == null) {
            unselectedColumnNameList = [];
            var numberOfAvailableColumnName = availableColumnNameList.length;
            var numberOfSelectedColumnNameList = selectedColumnNameList.length;
            var isSelected;
            for (var i = 0; i < numberOfAvailableColumnName; ++i) {
                var availableColumnName = availableColumnNameList[i];
                isSelected = false;
                for (var n = 0; n < numberOfSelectedColumnNameList; ++n) {
                    var selectedName = selectedColumnNameList[n];
                    if (availableColumnName == selectedName) {
                        isSelected = true;
                        break;
                    }
                }
                if (isSelected !== true) {
                    unselectedColumnNameList.push( availableColumnName);
                }
            }
        }

        // 把欄位定義與預設選擇與非選擇的欄位都設定至"自訂欄位Dialog"。
        L_this._fq_client_dialog_custom_columns.resetColumns( columnDefinitions, selectedColumnNameList, unselectedColumnNameList);

        var defaultShowDialogOfCustomColumn = false;
        if (defaultShowDialogOfCustomColumn) {
            // 顯示Dialog讓使用者決定欄位。
            L_this._fq_client_dialog_custom_columns.showDialog();
        }
        else {
            // 預設讓盤面顯示所有欄位。
            L_this._fq_client_tape.resetColumnNameList( selectedColumnNameList);
        }

        // K線圖技術指標設置Dialog - 註冊Dialog顯示之前的事件。
        L_this._fq_client_dialog_kgraph_indicators.registerEventOfShowing(
            function()
            {
                L_this._dom_frame_fq_client_dialog_kgraph_indicators.frameElement.style['zIndex'] = constMaxOfZIndex;
            }
        );

        // K線圖技術指標設置Dialog - 註冊Dialog關閉之後的事件。
        L_this._fq_client_dialog_kgraph_indicators.registerEventOfClosed(
            function()
            {
                L_this._dom_frame_fq_client_dialog_kgraph_indicators.frameElement.style['zIndex'] = -1;
            }
        );

        // K線圖技術指標設置Dialog - 提交時的事件。
        L_this._fq_client_dialog_kgraph_indicators.registerEventOfCommit(
            function( msg)
            {
                var id = msg['id'];
                var params = msg['params'];
                L_this._fq_client_kgraph.setParamsForIndicator( id, params);
            }
        );

        // 盤面 - 註冊UI事件。
        L_this._fq_client_tape.registerEventOfUI(
            function( msg)
            {
                var name = msg['name'];
                var operation = msg['operation'];
                var value = msg['value'];
                var event = msg['event'];

                if (operation === 'click') {
                    if (name === 'column') {
                        // 依欄位類型註冊事件。
                        var L_instrument_full_id = value['instrumentId'];
                        var L_column_name = value['columnName'];
                        var L_cell_value = value['cellValue'];

                        var L_local_trade_date = null; // Depend on tape.
                        var L_instrument_full_id_arr = L_instrument_full_id.split( ':');
                        var L_symbol_id = L_instrument_full_id_arr[1];

                        // 更換所選擇的商品。
                        if (false === $( '#lock_current_symol').prop( 'checked')) {
                            L_this.changeCurrentSymbol( L_symbol_id);
                        }

                        // 更新畫面正上方的商品資訊。
                        L_this.updateTapeInstrumentInfo( L_symbol_id);

                        // 連動RunChart。
                        L_this._fq_client_runchart.resetInstrument( L_instrument_full_id, L_local_trade_date);

                        // 連動KGraph。
                        var L_kgraph_type = L_this._fq_client_kgraph_toolkits.getKType() || 'm1';
                        L_this._fq_client_kgraph.resetInstrument( L_instrument_full_id, L_kgraph_type, L_local_trade_date, constNumberOfKTick);
                    }
                }
            }
        );

        // 盤面 - 註冊商品事件。
        L_this._fq_client_tape.registerEventOfInstrumentState(
            function( IN_msg)
            {
                var L_type = IN_msg['type'];
                if (L_type === 'update' || L_type === 'init') {
                    // 商品資料更新。
                    var L_instrument_full_id = IN_msg['id'];
                    var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
                    if (L_instrument_data === null) {
                        return;
                    }

                    //var L_previous_last_price = L_jquery_cells['last_price'].data( 'previous_value');

                    //if (L_instrument_data['lastPrice'] !== L_previous_last_price) {
                    //L_jquery_cells['last_price'].data( 'previous_value', L_instrument_data['lastPrice']);

                    // 更新每個部位.
                    // var L_instrument_full_id_arr = L_instrument_full_id.split( ':')
                    // var L_symbol_id = L_instrument_full_id_arr[1];
                    var L_account_data = L_this._fq_client_manager.getAccountData();
                    var L_account = L_account_data.getAccount( L_this._account_id);
                    var L_tickets = L_account.getTickets();
                    for (var L_ticket_no in L_tickets) {
                        var L_ticket = L_tickets[L_ticket_no];
                        var L_ticket_symbol_id = L_ticket.getSymbolId();
                        var L_ticket_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
                        if (L_instrument_full_id === L_ticket_instrument_full_id) {
                            L_this.updateOpenedPositionFloatingProfit( L_account, L_ticket);
                        }
                    }

                    // 更新此商品的匯總(浮動損益可能發生改變).
                    L_this.updateSummaryForInstrument( L_account, L_instrument_full_id);

                    // 更新帳戶餘額(其實是淨值).
                    L_this._updateStatementBalance();
                    //}
                }
            }
        );
        /*
         // 盤面 - 註冊商品事件。
         L_this._fq_client_tape.registerEventOfInstrumentState(
         function( IN_msg)
         {
         var L_type = IN_msg['type'];
         if (L_type === 'update' || L_type === 'init') {
         // 商品資料更新。
         var L_instrument_full_id = IN_msg['id'];
         var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
         if (L_instrument_data === null) {
         return;
         }

         var L_jquery_cells = L_this._jquery_instrument_cells[L_instrument_full_id];
         var L_instrument_full_id_arr = L_instrument_full_id.split( ':')
         var L_symbol_id = L_instrument_full_id_arr[1];
         var L_account_data = L_this._fq_client_manager.getAccountData();
         var L_symbol = L_account_data.getSymbol( L_symbol_id);

         // 交易類型。
         var L_trade_status = L_symbol.getTradeStatus();
         var L_trader_status_str;
         if (L_trade_status == 1) {
         if (L_instrument_data['cfdMarketOpen']) {
         L_trader_status_str = '正常交易';
         L_jquery_cells['display_name'].removeClass( 'untradable');
         L_jquery_cells['market_state'].removeClass( 'untradable');
         }
         else {
         L_trader_status_str = '未開盤';
         L_jquery_cells['display_name'].addClass( 'untradable');
         L_jquery_cells['market_state'].addClass( 'untradable');
         }
         }
         else {
         L_trader_status_str = '不可交易';
         L_jquery_cells['display_name'].addClass( 'untradable');
         L_jquery_cells['market_state'].addClass( 'untradable');
         }

         // 禁新強平。
         var L_forceOrStopStr;
         switch (L_instrument_data['cfdForceCloseOrStopOrderStatus'])
         {
         case '0': L_forceOrStopStr = '正常'; break;
         case '1': L_forceOrStopStr = '禁新'; break;
         case '2': L_forceOrStopStr = '強平'; break;
         default: L_forceOrStopStr = '';
         }

         var L_updown = parseFloat( L_instrument_data['upDown']);
         var L_updown_str;
         if (L_updown < 0) L_updown_str = '▼' + L_updown;
         else if (L_updown > 0) L_updown_str = '▲' + L_updown;
         else L_updown_str = L_updown;

         //L_this._utility.anchorProfile();
         var L_datatable_instruments = L_this._datatable_instruments;
         L_datatable_instruments.cell( L_jquery_cells['display_name']).data( L_instrument_data['displayName']);
         L_datatable_instruments.cell( L_jquery_cells['operations']).data( '');
         //L_datatable_instruments.cell( L_jquery_cells['number_of_buying']).data( ''); // TODO.
         //L_datatable_instruments.cell( L_jquery_cells['number_of_selling']).data( ''); // TODO.
         L_datatable_instruments.cell( L_jquery_cells['bid_price']).data( L_instrument_data['bidPrice']);
         L_datatable_instruments.cell( L_jquery_cells['ask_price']).data( L_instrument_data['askPrice']);
         L_datatable_instruments.cell( L_jquery_cells['last_price']).data( L_instrument_data['lastPrice']);
         L_datatable_instruments.cell( L_jquery_cells['updown']).data( L_updown_str);
         L_datatable_instruments.cell( L_jquery_cells['updown_percent']).data( L_instrument_data['upDownPercent']);
         L_datatable_instruments.cell( L_jquery_cells['total_volume']).data( L_instrument_data['totalVolume']);
         L_datatable_instruments.cell( L_jquery_cells['open_price']).data( L_instrument_data['openPrice']);
         L_datatable_instruments.cell( L_jquery_cells['highest_price']).data( L_instrument_data['highOfOHLC']);
         L_datatable_instruments.cell( L_jquery_cells['lowest_price']).data( L_instrument_data['lowOfOHLC']);
         L_datatable_instruments.cell( L_jquery_cells['settlement_price']).data( L_instrument_data['closeOfOHLC']); // CFD特殊規則，昨結價跟昨收價在UI上要對掉，好像是因為投資人容易誤解。
         L_datatable_instruments.cell( L_jquery_cells['prev_close_price']).data( L_instrument_data['settlementPrice']); // CFD特殊規則，昨結價跟昨收價在UI上要對掉，好像是因為投資人容易誤解。
         L_datatable_instruments.cell( L_jquery_cells['market_state']).data( L_trader_status_str);
         L_datatable_instruments.cell( L_jquery_cells['order_rule']).data( L_forceOrStopStr);
         L_datatable_instruments.cell( L_jquery_cells['time']).data( L_instrument_data['time']);
         L_datatable_instruments.cell( L_jquery_cells['expiry_date']).data( L_symbol.getLastTradeDate().replace( /(.{4})(.{2})(.{2})/, '$1-$2-$3'));
         //console.log( 'Time spent: ' + L_this._utility.anchorProfile());

         // 設置漲跌標色(與昨結價比)。
         var L_jquery_updown_targets = $()
         .add( L_jquery_cells['updown'])
         .add( L_jquery_cells['updown_percent']);

         // 漲跌幅。
         if (L_instrument_data['upDown'] > 0) {
         L_jquery_updown_targets.removeClass( 'instrument_style_updown_flat instrument_style_updown_down').addClass( 'instrument_style_updown_up');
         }
         else if (L_instrument_data['upDown'] < 0) {
         L_jquery_updown_targets.removeClass( 'instrument_style_updown_flat instrument_style_updown_up').addClass( 'instrument_style_updown_down');
         }
         else {
         L_jquery_updown_targets.removeClass( 'instrument_style_updown_up instrument_style_updown_down').addClass( 'instrument_style_updown_flat');
         }

         // 處理各別價格相對於某價格漲跌的函式。
         function processUpdownStyle( IN_jquery_obj, IN_lv, IN_rv)
         {
         if (IN_lv > IN_rv) {
         // 上漲。
         IN_jquery_obj.removeClass( 'instrument_style_updown_flat instrument_style_updown_down').addClass( 'instrument_style_updown_up');
         }
         else if (IN_lv < IN_rv) {
         // 下跌。
         IN_jquery_obj.removeClass( 'instrument_style_updown_flat instrument_style_updown_up').addClass( 'instrument_style_updown_down');
         }
         else {
         // 持平。
         IN_jquery_obj.removeClass( 'instrument_style_updown_up instrument_style_updown_down').addClass( 'instrument_style_updown_flat');
         }
         }

         var L_updown_ref_price = L_instrument_data['closeOfOHLC'];
         processUpdownStyle( L_jquery_cells['bid_price'], L_instrument_data['bidPrice'], L_updown_ref_price); // 賣價。
         processUpdownStyle( L_jquery_cells['ask_price'], L_instrument_data['askPrice'], L_updown_ref_price); // 買價。
         processUpdownStyle( L_jquery_cells['last_price'], L_instrument_data['lastPrice'], L_updown_ref_price); // 成交價。
         processUpdownStyle( L_jquery_cells['open_price'], L_instrument_data['openPrice'], L_updown_ref_price); // 開盤價。
         processUpdownStyle( L_jquery_cells['highest_price'], L_instrument_data['highOfOHLC'], L_updown_ref_price); // 最高價。
         processUpdownStyle( L_jquery_cells['lowest_price'], L_instrument_data['lowOfOHLC'], L_updown_ref_price); // 最低價。


         var L_previous_last_price = L_jquery_cells['last_price'].data( 'previous_value');

         if (L_instrument_data['lastPrice'] !== L_previous_last_price) {
         L_jquery_cells['last_price'].data( 'previous_value', L_instrument_data['lastPrice']);

         // 更新每個部位.
         var L_account = L_account_data.getAccount( L_this._account_id);
         var L_tickets = L_account.getTickets();
         for (var L_ticket_no in L_tickets) {
         var L_ticket = L_tickets[L_ticket_no];
         var L_ticket_symbol_id = L_ticket.getSymbolId();
         var L_ticket_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
         if (L_instrument_full_id === L_ticket_instrument_full_id) {
         L_this.updateOpenedPositionFloatingProfit( L_account, L_ticket);
         }
         }

         // 更新此商品的匯總(浮動損益可能發生改變).
         L_this.updateSummaryForInstrument( L_account, L_symbol_id);

         // 更新帳戶餘額(其實是淨值).
         L_this._updateStatementBalance();
         }
         }
         else if (L_type === 'resetAll') { // type is 'resetAll'
         // 所有商品重設，重新建立商品表格。
         L_this._datatable_instruments.clear();
         var L_instrument_full_id_list = IN_msg['idList'];
         var L_number_of_instrument_full_id = L_instrument_full_id_list.length;
         for (var i = 0; i < L_number_of_instrument_full_id; ++i) {
         var L_instrument_full_id = L_instrument_full_id_list[i];
         var L_instrument_market_data = L_this._fq_client_manager.getInstrumentMarketData( L_instrument_full_id);
         if (L_instrument_market_data === null) {
         continue;
         }

         var L_instrument = L_instrument_market_data['instrument'];
         var L_row_id = 'row_instrument_' + L_instrument_full_id;

         // 加入商品名稱至表格。
         var L_row = [
         L_instrument['displayName'], // 商品
         '', // (K線按鈕)
         '', // 多
         '', // 空
         '', // 委買
         '', // 委賣
         '', // 成交價
         '', // 漲跌
         '', // 漲跌幅
         '', // 成交量
         '', // 開盤價
         '', // 最高價
         '', // 最低價
         '', // 昨結價
         '', // 昨收價
         '', // 交易類型
         '', // 禁新強平
         '', // 更新時間
         '' // 最後交易日
         ];

         // Setup ID for row.
         var L_dom_of_row = L_this._datatable_instruments.row.add( L_row).node();
         var L_jquery_row = $( L_dom_of_row);
         L_jquery_row.attr( 'id', L_row_id);
         L_jquery_row.data( 'instrument_full_id', L_instrument_full_id);
         L_jquery_row.on(
         'click',
         function()
         {
         var L_instrument_full_id = $( this).data( 'instrument_full_id');
         var L_local_trade_date = null; // Depend on tape.
         var L_instrument_full_id_arr = L_instrument_full_id.split( ':');
         var L_symbol_id = L_instrument_full_id_arr[1];

         // 更換所選擇的商品。
         if (false === $( '#lock_current_symol').prop( 'checked')) {
         L_this.changeCurrentSymbol( L_symbol_id);
         }

         // 更新畫面正上方的商品資訊。
         L_this.updateTapeInstrumentInfo( L_symbol_id);

         // 連動RunChart。
         L_this._fq_client_runchart.resetInstrument( L_instrument_full_id, L_local_trade_date);

         // 連動KGraph。
         var L_kgraph_type = L_this._fq_client_kgraph_toolkits.getKType() || 'm1';
         L_this._fq_client_kgraph.resetInstrument( L_instrument_full_id, L_kgraph_type, L_local_trade_date, constNumberOfKTick);
         }
         );

         // Setup ID for columns.
         var L_columns = L_this._tape_columns;
         var L_column_name_list = L_this._tape_column_name_list;
         var L_jquery_columns = L_jquery_row.find( 'td');
         var L_number_of_column = L_jquery_columns.length;
         if (L_number_of_column != L_column_name_list.length) {
         console.error( 'Number of column was not matched.');
         }
         else {
         var L_jquery_cells = L_this._jquery_instrument_cells[L_instrument_full_id] = {};
         for (var c = 0; c < L_number_of_column; ++c) {
         var L_dom_column = L_jquery_columns[c];
         var L_jquery_column = $( L_dom_column);
         var L_column_name = L_column_name_list[c];
         var L_column_id = 'col_instrument-' + L_column_name + '_' + L_instrument_full_id;
         L_jquery_column.attr( 'id', L_column_id);
         L_jquery_cells[L_column_name] = L_jquery_column;
         }
         }
         }
         L_this._datatable_instruments.draw();
         }
         else {
         console.error( 'Unknown type ' + L_type);
         }
         }
         );
         */
        // 走勢圖 - 註冊最佳五檔事件。
        L_this._fq_client_runchart.registerEventOfBestRankChange(
            function( IN_msg)
            {
                var L_operation = IN_msg['operation'];
                switch (L_operation)
                {
                    case 'reset':
                        for (var i = 0; i < 5; ++i) {
                            var L_rank = i + 1;
                            $( '#best_rank_' + L_rank + '_ask_price').text( '');
                            $( '#best_rank_' + L_rank + '_ask_volume').text( '');
                            $( '#best_rank_' + L_rank + '_ask_volume_bar').find( '.ask_volume_bar').css( 'width', '0%');

                            $( '#best_rank_' + L_rank + '_bid_price').text( '');
                            $( '#best_rank_' + L_rank + '_bid_volume').text( '');
                            $( '#best_rank_' + L_rank + '_bid_volume_bar').find( '.bid_volume_bar').css( 'width', '0%');
                        }

                        $( '#col_ask_total_volume').text( '');
                        $( '#col_bid_total_volume').text( '');

                        var L_jquery_best_rank_volume_rate = $( '#best_rank_volume_rate');
                        L_jquery_best_rank_volume_rate.find( '.ask_volume_bar').css( 'width', '0%');
                        L_jquery_best_rank_volume_rate.find( '.bid_volume_bar').css( 'width', '0%');
                        break;

                    case 'update':
                        // Calc total volume.
                        var L_instrument_full_id = this.getInstrumentFullId();
                        var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
                        if (L_instrument_data === null) {
                            return;
                        }

                        var L_total_ask_volume = 0;
                        var L_total_bid_volume = 0;
                        var L_best_rank = L_instrument_data['bestRank'];
                        var L_best_rank_of_ask = L_best_rank['ask'];
                        var L_best_rank_of_bid = L_best_rank['bid'];
                        for (var i = 0; i < 5; ++i) {
                            L_total_ask_volume += L_best_rank_of_ask[i]['volume'];
                            L_total_bid_volume += L_best_rank_of_bid[i]['volume'];
                        }

                        // Update text for changed best ranks.
                        var L_data = IN_msg['data'];
                        var L_best_rank_of_ask = L_data['ask'];
                        var L_best_rank_of_bid = L_data['bid'];
                        for (var i = 0; i < 5; ++i) {
                            var L_rank = i + 1;
                            var L_the_best_of_ask = L_best_rank_of_ask[i];
                            if (L_the_best_of_ask) {
                                var L_price = L_the_best_of_ask[0];
                                var L_volume = L_the_best_of_ask[1];
                                $( '#best_rank_' + L_rank + '_ask_price').text( L_price != null ? parseFloat( L_price) : '');
                                $( '#best_rank_' + L_rank + '_ask_volume').text( L_volume != null ? L_volume : '');
                            }

                            var L_the_best_of_bid = L_best_rank_of_bid[i];
                            if (L_the_best_of_bid) {
                                var L_price = L_the_best_of_bid[0];
                                var L_volume = L_the_best_of_bid[1];
                                $( '#best_rank_' + L_rank + '_bid_price').text( L_price != null ? parseFloat( L_price) : '');
                                $( '#best_rank_' + L_rank + '_bid_volume').text( L_volume != null ? L_volume : '');
                            }
                        }

                        // Update volume bar for changed best ranks.
                        var L_width_of_volume_bar = 100; // Percentage.
                        var L_pixel_per_volume_of_ask = L_width_of_volume_bar / L_total_ask_volume;
                        var L_pixel_per_volume_of_bid = L_width_of_volume_bar / L_total_bid_volume;
                        for (var i = 0; i < 5; ++i) {
                            var L_rank = i + 1;
                            var L_the_best_of_ask = L_best_rank_of_ask[i];
                            if (L_the_best_of_ask) {
                                var L_volume = L_the_best_of_ask[1];
                                var L_jquery_volume_bar = $( '#best_rank_' + L_rank + '_ask_volume_bar').find( '.ask_volume_bar');
                                L_jquery_volume_bar.css( 'width', (L_volume != null ? Math.floor( L_volume * L_pixel_per_volume_of_ask) : '0') + '%');
                            }

                            var L_the_best_of_bid = L_best_rank_of_bid[i];
                            if (L_the_best_of_bid) {
                                var L_volume = L_the_best_of_bid[1];
                                var L_jquery_volume_bar = $( '#best_rank_' + L_rank + '_bid_volume_bar').find( '.bid_volume_bar');
                                L_jquery_volume_bar.css( 'width', (L_volume != null ? Math.floor( L_volume * L_pixel_per_volume_of_bid) : '0') + '%');
                            }
                        }

                        $( '#col_ask_total_volume').text( L_total_ask_volume);
                        $( '#col_bid_total_volume').text( L_total_bid_volume);

                        // Total volume rate bar.
                        var L_jquery_best_rank_volume_rate = $( '#best_rank_volume_rate');
                        var L_total_volume = L_total_ask_volume + L_total_bid_volume;
                        if (L_total_volume > 0) {
                            var L_total_volume_percentable = 100 / L_total_volume;
                            var L_ask_volume_rate = L_total_ask_volume * L_total_volume_percentable;
                            var L_bid_volume_rate = L_total_bid_volume * L_total_volume_percentable;
                            L_jquery_best_rank_volume_rate.find( '.ask_volume_bar').css( 'width', L_ask_volume_rate + '%');
                            L_jquery_best_rank_volume_rate.find( '.bid_volume_bar').css( 'width', L_bid_volume_rate + '%');
                        }
                        else {
                            L_jquery_best_rank_volume_rate.find( '.ask_volume_bar').css( 'width', '0%');
                            L_jquery_best_rank_volume_rate.find( '.bid_volume_bar').css( 'width', '0%');
                        }
                        break;
                }
            }
        );

        // 走勢圖 - 註冊價量Tick事件。
        L_this._fq_client_runchart.registerEventOfVolumeByPriceChange(
            function( IN_msg)
            {
                var L_operation = IN_msg['operation'];
                switch (L_operation)
                {
                    case 'reset':
                        L_this._datatable_volume_by_price.clear().draw();
                        break;

                    case 'init':
                        var L_ticks = IN_msg['data'];
                        var L_number_of_tick = L_ticks.length;
                        var L_max_volume = 0;
                        var L_tick_volumes = [];
                        for (var i = 0; i < L_number_of_tick; ++i) {
                            var L_tick = L_ticks[i];
                            var L_volume = parseInt( L_tick[1]);
                            L_tick_volumes.push( L_volume);

                            if (L_volume > L_max_volume) {
                                L_max_volume = L_volume;

                                var L_price = L_tick[0];
                                this._tick_volume_bars_max_volume = L_volume;
                                this._tick_volume_bars_max_volume_price = L_price;
                            }
                        }

                        for (var i = 0; i < L_number_of_tick; ++i) {
                            var L_tick = L_ticks[i];
                            var L_price = L_tick[0];
                            var L_volume = L_tick_volumes[i];
                            var L_volume_percent = Math.floor( L_volume / L_max_volume * 100);
                            var L_row = [
                                parseFloat( L_price), // Price.
                                '<span class="volume_bar" style="width:' + L_volume_percent + '%"></span>', // Volume stick.
                                L_volume // Volume.
                            ];

                            var L_dom_row = L_this._datatable_volume_by_price.row.add( L_row).node();
                            var L_jquery_row = $( L_dom_row);
                            L_jquery_row.attr( 'id', 'row_tick_volumne_by_price_' + L_price.replace( '.', '_'));
                            L_jquery_row.data( 'volume', L_volume).data( 'volume_bar', L_jquery_row.find( '.volume_bar'));
                        }
                        L_this._datatable_volume_by_price.draw();
                        break;

                    case 'new':
                        var L_tick = IN_msg['data'];
                        var L_price = L_tick[0];
                        var L_volume = L_tick[1];
                        var L_row_selector = '#row_tick_volumne_by_price_' + L_price.replace( '.', '_');
                        var L_column_selector = 2; // Column of volume.
                        var L_cell = L_this._datatable_volume_by_price.cell( L_row_selector, L_column_selector);
                        if (L_cell.length > 0) {
                            L_cell.data( L_volume);
                        }
                        else {
                            L_this._datatable_volume_by_price.row.add( [parseFloat( L_price), '', L_volume]).draw( false);
                        }

                        // Volume bar.
                        if (this._tick_volume_bars_max_volume_price === L_price) {
                            var L_max_volume = this._tick_volume_bars_max_volume = L_volume;

                            // Update all volume bars by new max volume.
                            var L_jquery_rows = L_this._datatable_volume_by_price.rows().nodes().to$();
                            var L_number_of_row = L_jquery_rows.length;
                            for (var i = 0; i < L_number_of_row; ++i) {
                                var L_jquery_row = $( L_jquery_rows[i]);
                                var L_jquery_volume_bar = L_jquery_row.data( 'volume_bar');
                                var L_row_volume = L_jquery_row.data( 'volume');
                                var L_volume_percent = Math.floor( L_row_volume / L_max_volume * 100);
                                L_jquery_volume_bar.css( 'width', L_volume_percent + '%');
                            }
                        }
                        break;
                }
            }
        );

        // 走勢圖 - 註冊Tick明細事件。
        L_this._fq_client_runchart.registerEventOfAllTicksChange(
            function( IN_msg)
            {
                var L_operation = IN_msg['operation'];
                var L_instrument_full_id = IN_msg['instrumentFullId'];

                switch (L_operation)
                {
                    case 'reset':
                        L_this._datatable_tick_details.clear().draw();
                        break;

                    case 'init':
                        var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
                        var L_prev_close_price = parseFloat( L_instrument_data['closeOfOHLC']);

                        var L_ticks = IN_msg['data'];
                        var L_number_of_tick = L_ticks.length;
                        for (var i = 0; i < L_number_of_tick; ++i) {
                            var L_tick = L_ticks[i];
                            //var L_index = L_tick[0];
                            var L_time = L_tick[1];
                            var L_price = L_tick[2];
                            var L_volume = L_tick[3];
                            var L_updown = L_price - L_prev_close_price;
                            var L_updown_str = parseFloat( L_updown);
                            if (L_updown < 0) L_updown_str = '▼' + L_updown_str;
                            else if (L_updown > 0) L_updown_str = '▲' + L_updown_str;

                            var L_row = [L_time, L_volume, L_updown_str, parseFloat( L_price)];
                            var L_dom_row = L_this._datatable_tick_details.row.add( L_row).node();
                            var L_jquery_cells = $( L_dom_row).find( '.updown,.settlement');
                            if (L_updown > 0) {
                                L_jquery_cells.removeClass( 'instrument_style_updown_flat instrument_style_updown_down').addClass( 'instrument_style_updown_up');
                            }
                            else if (L_updown < 0) {
                                L_jquery_cells.removeClass( 'instrument_style_updown_flat instrument_style_updown_up').addClass( 'instrument_style_updown_down');
                            }
                            else {
                                L_jquery_cells.removeClass( 'instrument_style_updown_down instrument_style_updown_up').addClass( 'instrument_style_updown_flat');
                            }
                        }

                        L_this._datatable_tick_details.draw( false);
                        break;

                    case 'new':
                        var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
                        var L_prev_close_price = parseFloat( L_instrument_data['closeOfOHLC']);

                        var L_tick = IN_msg['data'];
                        //var L_index = L_tick[0];
                        var L_time = L_tick[1];
                        var L_price = L_tick[2];
                        var L_volume = L_tick[3];
                        var L_updown = L_price - L_prev_close_price;
                        var L_updown_str = parseFloat( L_updown); // (<updown> = <price> - <settlement price>).
                        if (L_updown < 0) L_updown_str = '▼' + L_updown_str;
                        else if (L_updown > 0) L_updown_str = '▲' + L_updown_str;

                        var L_row = [L_time, L_volume, L_updown_str, parseFloat( L_price)];
                        var L_dom_row = L_this._datatable_tick_details.row.add( L_row).node();
                        var L_jquery_cells = $( L_dom_row).find( '.updown,.settlement');
                        if (L_updown > 0) {
                            L_jquery_cells.removeClass( 'instrument_style_updown_flat instrument_style_updown_down').addClass( 'instrument_style_updown_up');
                        }
                        else if (L_updown < 0) {
                            L_jquery_cells.removeClass( 'instrument_style_updown_flat instrument_style_updown_up').addClass( 'instrument_style_updown_down');
                        }
                        else {
                            L_jquery_cells.removeClass( 'instrument_style_updown_down instrument_style_updown_up').addClass( 'instrument_style_updown_flat');
                        }

                        if (false == L_this._datatable_tick_details_is_pending) {
                            L_this._datatable_tick_details_is_pending = true;

                            L_this._utility.requestAnimationFrame(
                                function()
                                {
                                    L_this._datatable_tick_details.draw( false);
                                    L_this._datatable_tick_details_is_pending = false;
                                }
                            );
                        }
                        else {
                            console.log( ' ignored.');
                        }
                        break;
                }
            }
        );

        L_this._fq_client_runchart.setStatesForAreaOfInfos( false);
        L_this._fq_client_runchart.setStatesForAreaOfTicks( false);
        L_this._fq_client_runchart.setStatesForButtonOfBestRank( false, false);
        L_this._fq_client_runchart.setStatesForButtonOfVolumeByPrice( false, false);
        L_this._fq_client_runchart.setStatesForButtonOfTicksByPrice( false, false);
        L_this._fq_client_runchart.setStatesForButtonOfAllTicks( false, false);

        // K線圖 - 註冊UI事件。
        L_this._fq_client_kgraph.registerEventOfUI(
            function( msg)
            {
                var name = msg['name'];
                var operation = msg['operation'];
                var value = msg['value'];
                var event = msg['event'];
                switch (name)
                {
                    case 'indicatorRemoved': // 使用者點選移除某個技術指標。
                        break;

                    case 'indicatorConfigure': // 使用者點選設置某個技術指標。
                        var configurationStates = value;
                        L_this._fq_client_dialog_kgraph_indicators.resetIndicatorConfiguration( configurationStates);
                        L_this._fq_client_dialog_kgraph_indicators.showDialog();
                        break;

                    case 'contextmenu': // 右鍵選單。
                        var absolutePosition = getAbsoluteCursorPositionFromEvent( event);
                        L_this._fq_client_contextmenus.showContextMenu( 'kgraph', absolutePosition['x'], absolutePosition['y']);
                        break;
                }
            }
        );

        // K線工具列 - 啟用自動寬度修正(依內容占用大小撐開iframe)。
        L_this._fq_client_kgraph_toolkits.setEnabledForAutoWidthFixing( true);

        // 複寫樣式。
        var L_jquery_proxy = L_this._fq_client_kgraph_toolkits.getJQuery();
        L_jquery_proxy( '#kgraph_zoom_in').css(
            {
                'background-image': 'url("../img/icon_kLine_room_in_normal.png")',
                'background-repeat': 'no-repeat',
            }
        ).attr( 'data-i18n', '').attr( 'value', '');

        L_jquery_proxy( '#kgraph_zoom_out').css(
            {
                'background-image': 'url("../img/icon_kLine_room_out_normal.png")',
                'background-repeat': 'no-repeat',
            }
        ).attr( 'data-i18n', '').attr( 'value', '');

        // K線圖工具列 - 註冊UI事件
        L_this._fq_client_kgraph_toolkits.registerEventOfUI(
            function( msg)
            {
                var name = msg['name'];
                var operation = msg['operaiton'];
                var event = msg['event'];
                var value = event['value'];
                switch (name)
                {
                    case 'ktype': // K線時間類型。
                        var currentTarget = event['currentTarget'];
                        var kType = currentTarget.options[currentTarget.selectedIndex].value;
                        var localTradeDate = null; // Depend on tape.
                        L_this._fq_client_kgraph.resetInstrument( L_this._fq_client_kgraph.getInstrumentFullId(), kType, localTradeDate, constNumberOfKTick);
                        L_this._fq_client_kgraph_toolkits.setKType( kType);
                        break;

                    case 'reload': // 歷史。
                        var json = localStorage['kgraphStates'];
                        if (json) {
                            L_this._fq_client_kgraph.restoreStatesFromJson( json);
                        }
                        break;

                    case 'restore': // 儲存。
                        var json = L_this._fq_client_kgraph.saveStatesToJson();
                        localStorage['kgraphStates'] = json;
                        break;

                    case 'indicator': // 指標。
                        var absolutePosition = getAbsoluteCursorPositionFromEvent( event);
                        L_this._fq_client_contextmenus.showContextMenu( 'kgraph_indicators', absolutePosition['x'], absolutePosition['y']);
                        break;

                    case 'zoomIn': // +
                        L_this._fq_client_kgraph.zoomIn();
                        break;

                    case 'zoomOut': // -
                        L_this._fq_client_kgraph.zoomOut();
                        break;

                    case 'print': // 列印。
                        L_this._fq_client_kgraph.print();
                        break;

                    case 'enterFullscreen': // 全畫面。
                        L_this._fq_client_kgraph.enterFullscreen();
                        break;
                }
            }
        );

        // 設置K線。
        var areaId;

        // Short MA.
        areaId = L_this._fq_client_kgraph.addIndicator( 'MA');
        L_this._fq_client_kgraph.setParamsForIndicator( areaId, { 'period': 13, 'color': 'rgba( 64, 128, 255, 1)'});

        // Long MA.
        areaId = L_this._fq_client_kgraph.addIndicator( 'MA');
        L_this._fq_client_kgraph.setParamsForIndicator( areaId, { 'period': 26, 'color': 'rgba( 220, 96, 240, 1)'});

        // Indicators.
        L_this._fq_client_kgraph.addIndicator( 'VOL');

        var contextMenusOfIndicators = {
            'item_add_ti_volume': { 'nameI18N': 'KGraph_Tech_Volume' },
            'item_add_ti_ma': { 'nameI18N': 'KGraph_Tech_MA' },
            'item_add_ti_bband': { 'nameI18N': 'KGraph_Tech_BBand' },
            'item_add_ti_ao': { 'nameI18N': 'KGraph_Tech_AO' },
            'item_add_ti_arbr': { 'nameI18N': 'KGraph_Tech_AR_And_BR' },
            'item_add_ti_atr': { 'nameI18N': 'KGraph_Tech_ATR' },
            'item_add_ti_bias': { 'nameI18N': 'KGraph_Tech_Bias' },
            'item_add_ti_bias36': { 'nameI18N': 'KGraph_Tech_3-6Bias' },
            'item_add_ti_cci': { 'nameI18N': 'KGraph_Tech_CCI' },
            'item_add_ti_dmi': { 'nameI18N': 'KGraph_Tech_DMI' },
            'item_add_ti_kdj': { 'nameI18N': 'KGraph_Tech_KDJ' },
            'item_add_ti_macd': { 'nameI18N': 'KGraph_Tech_MACD' },
            'item_add_ti_mtm': { 'nameI18N': 'KGraph_Tech_MTM' },
            'item_add_ti_obv': { 'nameI18N': 'KGraph_Tech_OBV' },
            'item_add_ti_psy': { 'nameI18N': 'KGraph_Tech_PSY' },
            'item_add_ti_roc': { 'nameI18N': 'KGraph_Tech_ROC' },
            'item_add_ti_rsi': { 'nameI18N': 'KGraph_Tech_RSI' },
            'item_add_ti_rsi_smooth': { 'nameI18N': 'KGraph_Tech_RSI_Smooth' },
            'item_add_ti_vr': { 'nameI18N': 'KGraph_Tech_VR' },
            'item_add_ti_wr': { 'nameI18N': 'KGraph_Tech_WR' }
        };

        var funcContextMenuSwitchForIndicators = function( itemKey)
        {
            switch (itemKey)
            {
                case 'item_add_ti_volume': L_this._fq_client_kgraph.addIndicator( 'VOL'); break;
                case 'item_add_ti_ma': L_this._fq_client_kgraph.addIndicator( 'MA'); break;
                case 'item_add_ti_bband': L_this._fq_client_kgraph.addIndicator( 'BOLLINGER_BAND'); break;
                case 'item_add_ti_ao': L_this._fq_client_kgraph.addIndicator( 'AO'); break;
                case 'item_add_ti_arbr': L_this._fq_client_kgraph.addIndicator( 'ARBR'); break;
                case 'item_add_ti_atr': L_this._fq_client_kgraph.addIndicator( 'ATR'); break;
                case 'item_add_ti_bias': L_this._fq_client_kgraph.addIndicator( 'BIAS'); break;
                case 'item_add_ti_bias36': L_this._fq_client_kgraph.addIndicator( 'BIAS36'); break;
                case 'item_add_ti_cci': L_this._fq_client_kgraph.addIndicator( 'CCI'); break;
                case 'item_add_ti_dmi': L_this._fq_client_kgraph.addIndicator( 'DMI'); break;
                case 'item_add_ti_kdj': L_this._fq_client_kgraph.addIndicator( 'KDJ'); break;
                case 'item_add_ti_macd': L_this._fq_client_kgraph.addIndicator( 'MACD'); break;
                case 'item_add_ti_mtm': L_this._fq_client_kgraph.addIndicator( 'MTM'); break;
                case 'item_add_ti_obv': L_this._fq_client_kgraph.addIndicator( 'OBV'); break;
                case 'item_add_ti_psy': L_this._fq_client_kgraph.addIndicator( 'PSY'); break;
                case 'item_add_ti_roc': L_this._fq_client_kgraph.addIndicator( 'ROC'); break;
                case 'item_add_ti_rsi': L_this._fq_client_kgraph.addIndicator( 'RSI'); break;
                case 'item_add_ti_rsi_smooth': L_this._fq_client_kgraph.addIndicator( 'RSI Smooth'); break;
                case 'item_add_ti_vr': L_this._fq_client_kgraph.addIndicator( 'VR'); break;
                case 'item_add_ti_wr': L_this._fq_client_kgraph.addIndicator( 'WR'); break;
            }
        };

        var allContextMenuItems = {
            'system': { // 系統。
                'title': '',
                'titleI18N': '',
                'items': {
                    'modify_password': { 'name': '修改密碼'},
                    'exit': { 'name': '退出'},
                }
            },
            'infos': { // 資訊。
                'title': '',
                'titleI18N': '',
                'items': {
                    'query': { 'name': '查詢'},
                    'member_info': { 'name': '會員資訊'},
                    'market_info': { 'name': '交易時間'},
                },
                'callback': function( itemKey, itemStatus)
                {
                    switch (itemKey)
                    {
                        case 'query':
                            L_this._fq_client_dialog_html.setTitle( '查詢');
                            L_this._fq_client_dialog_html.setResizable( false);
                            L_this._fq_client_dialog_html.setMinSize( 800, 600);
                            L_this._fq_client_dialog_html.setSize( 800, 600);
                            L_this._fq_client_dialog_html.resetHTML( '<iframe src="http://122.152.162.81:8080/cfdcreativeboview/report/html/tick.html?css=black" style="width: 100%; height: 100%;" onload="fqClient.showDialog(); fqClient.repositionDialog();" onmousedown="event.preventDefault(); return false;">');
                            //L_this._fq_client_dialog_html.setSize( '640px', 'auto');
                            break;

                        case 'market_info':
                            var L_css = '';
                            switch (L_this._theme_name)
                            {
                                case 'blue':
                                    break;

                                case 'red':
                                    L_css = '-ms-filter: hue-rotate(155deg); -moz-filter: hue-rotate(155deg); -webkit-filter: hue-rotate(155deg); filter: hue-rotate(155deg);';
                                    break;

                                case 'black':
                                    L_css = '-ms-filter: hue-rotate( 190deg) saturate( 0.7); -moz-filter: hue-rotate( 190deg) saturate( 0.7); -webkit-filter: hue-rotate( 190deg) saturate( 0.7); filter: hue-rotate( 190deg) saturate( 0.7);';
                                    break;
                            }

                            L_this._fq_client_dialog_html.setTitle( '交易時間');
                            L_this._fq_client_dialog_html.setSize( 'auto', 'auto');
                            L_this._fq_client_dialog_html.resetHTML( '<img style="background-color: white;' + L_css + '" src="http://122.116.70.189/cj/tradeTime.png" onload="fqClient.showDialog(); fqClient.repositionDialog();" onmousedown="event.preventDefault(); return false;">');
                            L_this._fq_client_dialog_html.setResizable( false);
                            break;
                    }
                },
            },
            'kgraph': {
                'title': '',
                'titleI18N': 'KGraph_Operations',
                'items': {
                    'item-setup_ti': {
                        'nameI18N': 'KGraph_Menu_Add_Tech',
                        'items': contextMenusOfIndicators,
                    },
                    'item_add_type': {
                        'nameI18N': 'KGraph_Menu_Set_Type',
                        'items': {
                            'item-setup_type_1_minute': { 'nameI18N': 'KGraph_Type_Minute_1'},
                            'item-setup_type_2_minutes': { 'nameI18N': 'KGraph_Type_Minute_2'},
                            'item-setup_type_3_minutes': { 'nameI18N': 'KGraph_Type_Minute_3'},
                            'item-setup_type_5_minutes': { 'nameI18N': 'KGraph_Type_Minute_5'},
                            'item-setup_type_10_minutes': { 'nameI18N': 'KGraph_Type_Minute_10'},
                            'item-setup_type_15_minutes': { 'nameI18N': 'KGraph_Type_Minute_15'},
                            'item-setup_type_20_minutes': { 'nameI18N': 'KGraph_Type_Minute_20'},
                            'item-setup_type_30_minutes': { 'nameI18N': 'KGraph_Type_Minute_30'},
                            'item-setup_type_60_minutes': { 'nameI18N': 'KGraph_Type_Minute_60'},
                            'item-setup_type_day': { 'nameI18N': 'KGraph_Type_Day_1'},
                            'item-setup_type_week': { 'nameI18N': 'KGraph_Type_Week_1'},
                            'item-setup_type_month': { 'nameI18N': 'KGraph_Type_Month_1'},
                        },
                    },
                    // 'item-weight_reducation': { 'nameI18N': 'KGraph_Menu_Switch_To_Weight_Reduction_KLine'}, 目前沒有還原權值圖。
                    'item-zoom_in': { 'nameI18N': 'KGraph_Menu_Zoom_In'},
                    'item-zoom_out': { 'nameI18N': 'KGraph_Menu_Zoom_Out'},
                    'item-splitter_1': '-',
                    'item-ta_line': { 'nameI18N': 'KGraph_Menu_Draw_Line'},
                    'item-ta_price_tangent': { 'nameI18N': 'KGraph_Menu_Draw_Price_Tangent'},
                    'item-ta_horizontal': { 'nameI18N': 'KGraph_Menu_Draw_Horizontal'},
                    'item-ta_channel': { 'nameI18N': 'KGraph_Menu_Draw_Channel'},
                    'item-ta_golden_section': { 'nameI18N': 'KGraph_Menu_Draw_Golden_Section'},
                    'item-ta_golden_bands': { 'nameI18N': 'KGraph_Menu_Draw_Golden_Bands'},
                    'item-ta_golden_circles': { 'nameI18N': 'KGraph_Menu_Draw_Golden_Circles'},
                    'item-ta_clear': { 'nameI18N': 'KGraph_Menu_Draw_Clear'},
                    'item-splitter_2': '-',
                    'item-cancel': { 'nameI18N': 'KGraph_Menu_Cancel'},
                },
                'callback': function( itemKey)
                {
                    var kType;
                    switch (itemKey)
                    {
                        case 'item-weight_reducation': return false;
                        case 'item-zoom_in': L_this._fq_client_kgraph.zoomIn(); return false;
                        case 'item-zoom_out': L_this._fq_client_kgraph.zoomOut(); return false;
                        case 'item-ta_line': L_this._fq_client_kgraph.startToDrawLine(); break;
                        case 'item-ta_price_tangent': L_this._fq_client_kgraph.startToDrawPriceTangent(); break;
                        case 'item-ta_horizontal': L_this._fq_client_kgraph.startToDrawHorizontal(); break;
                        case 'item-ta_channel': L_this._fq_client_kgraph.startToDrawChannel(); break;
                        case 'item-ta_golden_section': L_this._fq_client_kgraph.startToDrawGoldenSection(); break;
                        case 'item-ta_golden_bands': L_this._fq_client_kgraph.startToDrawGoldenBands(); break;
                        case 'item-ta_golden_circles': L_this._fq_client_kgraph.startToDrawGoldenCircles(); break;
                        case 'item-ta_clear': L_this._fq_client_kgraph.removeAllDrawns(); break;
                        case 'item-cancel': break;

                        // K-Types.
                        case 'item-setup_type_1_minute': kType = 'm1'; break;
                        case 'item-setup_type_2_minutes': kType = 'm2'; break;
                        case 'item-setup_type_3_minutes': kType = 'm3'; break;
                        case 'item-setup_type_5_minutes': kType = 'm5'; break;
                        case 'item-setup_type_10_minutes': kType = 'm10'; break;
                        case 'item-setup_type_15_minutes': kType = 'm15'; break;
                        case 'item-setup_type_20_minutes': kType = 'm20'; break;
                        case 'item-setup_type_30_minutes': kType = 'm30'; break;
                        case 'item-setup_type_60_minutes': kType = 'm60'; break;
                        case 'item-setup_type_day': kType = 'D'; break;
                        case 'item-setup_type_week': kType = 'W'; break;
                        case 'item-setup_type_month': kType = 'M'; break;
                        default:
                            funcContextMenuSwitchForIndicators( itemKey);
                    }

                    if (kType != null) {
                        var localTradeDate = null; // Depend on tape.
                        L_this._fq_client_kgraph.resetInstrument( L_this._fq_client_kgraph.getInstrumentFullId(), kType, localTradeDate, constNumberOfKTick);
                        L_this._fq_client_kgraph_toolkits.setKType( kType);
                    }
                }
            },
            'kgraph_indicators': {
                'title': '',
                'titleI18N': '',
                'items': contextMenusOfIndicators,
                'callback': funcContextMenuSwitchForIndicators,
            },
            'orders': {
                'title': '',
                'titleI18N': '',
                'items': {
                    'item-refresh': {
                        'nameI18N': 'Orders_Menu_Refresh',
                    },
                },
                'callback': function( itemKey, itemStatus)
                {
                    switch (itemKey)
                    {
                        case 'item-refresh':
                            L_this._fq_client_manager.requestToQueryOrders();
                            break;
                    }
                }
            },
            'opened_positions': {
                'title': '',
                'titleI18N': '',
                'items': {
                    'item-refresh': {
                        'nameI18N': 'Opened_Positions_Menu_Refresh',
                    },
                },
                'callback': function( itemKey, itemStatus)
                {
                    switch (itemKey)
                    {
                        case 'item-refresh':
                            L_this._fq_client_manager.requestToQueryTickets();
                            break;
                    }
                }
            }
        };

        // 加入右鍵選單.
        for (var contextMenuId in allContextMenuItems) {
            var contextMenu = allContextMenuItems[contextMenuId];
            var contextMenuTitle = contextMenu['title'];
            var contextMenuTitleI18N = contextMenu['titleI18N'];
            var contextMenuItems = contextMenu['items'];
            var contextMenuCallback = contextMenu['callback'];

            L_this._fq_client_contextmenus.addContextMenu(
                contextMenuId,          // 選單ID。
                contextMenuTitle,       // 選單標題。
                contextMenuTitleI18N,   // 選單標題(I18N)。
                contextMenuItems,       // 選單項目。
                contextMenuCallback     // 回呼函式。
            );
        }

        // 加入Tooltip.
        L_this._fq_client_tooltips.addTooltip( 'order_buy', '下單買進');
        L_this._fq_client_tooltips.addTooltip( 'order_sell', '下單賣出');

        funcResetSettings();

        // 預設色彩主題。
        L_this._fq_client_manager.changeThemeForAllClient( 'black');
    };

    function Ready()
    {
        /*
         var tapeInstrumentList = L_this._fq_client_tape.getInstrumentList();
         if (tapeInstrumentList.length === 0) {
         // 自訂商品的Dialog - 顯示。
         var selectedIndexOfCustomInstruments = 0;
         L_this._fq_client_dialog_custom_instruments.showDialog( selectedIndexOfCustomInstruments);
         }*/
    }
};

Client.prototype._initLayout = function()
{
    var L_this = this;
    var L_layout_spacing_open = 4;
    var L_layout_spacing_closed = 0;
    var L_layout_defaults = {
        'fxName': 'none',
        'maskIframesOnResize': true,
        'spacing_open': 0,
        'spacing_closed': 0,
        'closable':  false,
        'resizable': false,
        'onhide_start': function()
        {
            // Return false 以防止視窗被縮得很小時該layout會自動被隱藏。
            return false;
        },
    };

    $( 'body').layout(
        {
            'defaults': L_layout_defaults,
            'center': {

            },
            'north': { // 系統資訊與選單。

            },
            'south': { // 伺服器資訊。

            },
            'west': {
                'spacing_open': L_layout_spacing_open,
                'spacing_closed': L_layout_spacing_open,
                'resizable': true,
                'size': '15%',
            },
            'center__childOptions': {
                'defaults': L_layout_defaults,
                'center': {

                },
                'north': { // 盤面商品區塊。
                    'spacing_open': L_layout_spacing_open,
                    'spacing_closed': L_layout_spacing_open,
                    'resizable': true,
                    'size': '35%',
                    'onresize': function()
                    {
                        var L_jquery_datatable_instruments = $( '#table_instruments');
                        L_this._refreshDatatable( L_jquery_datatable_instruments, true, false);
                    }
                },
                'south': { // 下單操作區塊。
                    'size': 'auto',
                },
                'center__childOptions': {
                    'defaults': L_layout_defaults,
                    'center': { // 交易資訊區塊。
                        'spacing_open': L_layout_spacing_open,
                        'spacing_closed': L_layout_spacing_open,
                        'resizable': false,
                        'size': 'auto',
                        'onresize': function()
                        {
                            var L_jquery_datatable_orders = $( '#table_orders');
                            L_this._refreshDatatable( L_jquery_datatable_orders, true, false);

                            var L_jquery_datatable_opened_positions = $( '#table_opened_positions');
                            L_this._refreshDatatable( L_jquery_datatable_opened_positions, true, false);

                            var L_jquery_datatable_closed_positions = $( '#table_closed_positions');
                            L_this._refreshDatatable( L_jquery_datatable_closed_positions, true, false);

                            var L_jquery_datatable_summary = $( '#table_summary');
                            L_this._refreshDatatable( L_jquery_datatable_summary, true, false);
                        },
                    },
                    'north': { // 交易資訊選項。

                    }
                },
            },
            'west__childOptions': {
                'defaults': L_layout_defaults,
                'center': { // 帳戶資訊。
                    'onresize': function()
                    {
                        var L_jquery_datatable_account_info = $( '#table_account_info');
                        L_this._refreshDatatable( L_jquery_datatable_account_info, true, false);
                    }
                },
                'south': {
                    'spacing_open': L_layout_spacing_open,
                    'spacing_closed': L_layout_spacing_open,
                    'resizable': true,
                    'size': '70%',
                },
                'south__childOptions': {
                    'defaults': L_layout_defaults,
                    'center': {  // 明細與價量表顯示區塊。
                        'spacing_open': L_layout_spacing_open,
                        'spacing_closed': L_layout_spacing_open,
                        'resizable': false,
                        'size': 'auto',
                        'onresize': function()
                        {
                            L_this._refreshTabTicks();
                        },
                    },
                    'north': { // 明細與價量表選項按鈕。

                    }
                },
            },
        }
    );

    $( '#tab_runchart').layout(
        {
            'defaults': L_layout_defaults,
            'center': {},
            'east': {
                'spacing_open': L_layout_spacing_open,
                'spacing_closed': L_layout_spacing_open,
                'resizable': true,
                'size': '25%',
            }
        }
    );

    // 主選單。
    $( '.main_menu').button().on(
        'click',
        function( IN_event)
        {
            var L_id = $( this).attr( 'id');
            var L_contextmenu_id;
            switch (L_id)
            {
                case 'btn_menu_system':
                    L_contextmenu_id = 'system';
                    break;

                case 'btn_menu_info':
                    L_contextmenu_id = 'infos';
                    break;

                case 'btn_menu_rules':
                    var L_css = '';
                    switch (L_this._theme_name)
                    {
                        case 'blue':
                            break;

                        case 'red':
                            L_css = '-ms-filter: hue-rotate(155deg); -moz-filter: hue-rotate(155deg); -webkit-filter: hue-rotate(155deg); filter: hue-rotate(155deg);';
                            break;

                        case 'black':
                            L_css = '-ms-filter: hue-rotate( 190deg) saturate( 0.7); -moz-filter: hue-rotate( 190deg) saturate( 0.7); -webkit-filter: hue-rotate( 190deg) saturate( 0.7); filter: hue-rotate( 190deg) saturate( 0.7);';
                            break;
                    }

                    L_this._fq_client_dialog_html.setTitle( '規則');
                    L_this._fq_client_dialog_html.setSize( 'auto', 'auto');
                    L_this._fq_client_dialog_html.resetHTML( '<img style="background-color: white;' + L_css + '" src="http://122.116.70.189/cj/rule.png" onload="fqClient.showDialog(); fqClient.repositionDialog();" onmousedown="event.preventDefault(); return false;">');
                    L_this._fq_client_dialog_html.setResizable( false);
                    break;

                case 'btn_menu_remote': // 遠端。
                    window.open( 'http://downloadus2.teamviewer.com/download/TeamViewer_Setup_zhtw-ckq.exe');
                    break;
            }

            if (L_contextmenu_id) {
                var L_dom_target = IN_event.target;
                var L_target_rect = L_dom_target.getBoundingClientRect();
                var L_x = L_target_rect.left;
                var L_y = L_target_rect.bottom;
                L_this._fq_client_contextmenus.hideAllContextMenus();
                L_this._fq_client_contextmenus.showContextMenu( L_contextmenu_id, L_x, L_y);
            }
        }
    );

    $( '#btn_theme_blue').on(
        'click',
        function()
        {
            L_this.changeTheme( 'blue');
        }
    );

    $( '#btn_theme_red').on(
        'click',
        function()
        {
            L_this.changeTheme( 'red');
        }
    );

    $( '#btn_theme_black').on(
        'click',
        function()
        {
            L_this.changeTheme( 'black');
        }
    );

    $( '#btn_order_buy').on(
        'click',
        function()
        {
            L_this.orderCurrentSymbol( true);
        }
    );

    $( '#btn_order_sell').on(
        'click',
        function()
        {
            L_this.orderCurrentSymbol( false);
        }
    );

    $( '#btns_contract_type').buttonset();

    $( '#tabs_of_tick').buttonset();
    $( '#tabs_of_tick').children( 'input').on(
        'change',
        function()
        {
            var id = $( this).attr( 'id');
            $( '.tabs_of_tick').hide();
            switch (id)
            {
                case 'btn_tab_tick_details':
                    $( '#tab_tick_details').show();
                    L_this._refreshDatatable( $( '#table_tick_details'), true, false);
                    break; // 走勢圖

                case 'btn_tab_tick_volume_by_price':
                    $( '#tab_tick_volume_by_price').show();
                    L_this._refreshDatatable( $( '#table_tick_volume_by_price'), true, false);
                    break; // K線圖
            }
        }
    );

    $( '#tabs_of_trading').buttonset();
    $( '#tabs_of_trading').children( 'input').on(
        'change',
        function()
        {
            var id = $( this).attr( 'id');
            $( '.tabs_of_trading').hide();
            switch (id)
            {
                case 'btn_tab_runchart': // 走勢圖。
                    $( '#tab_runchart').show();
                    L_this._fq_client_runchart.resizeAll();
                    $( '#tab_runchart').layout().resizeAll();
                    break;

                case 'btn_tab_kgraph': // K線圖。
                    $( '#tab_kgraph').show();
                    break;

                case 'btn_tab_orders': // 訂單。
                    $( '#tab_orders').show();
                    L_this._refreshDatatable( $( '#table_orders'), true, true);
                    break;

                case 'btn_tab_opened_positions': // 未平倉。
                    $( '#tab_opened_positions').show();
                    L_this._refreshDatatable( $( '#table_opened_positions'), true, true);
                    break;

                case 'btn_tab_closed_positions': // 已平倉。
                    $( '#tab_closed_positions').show();
                    L_this._refreshDatatable( $( '#table_closed_positions'), true, true);
                    break;

                case 'btn_tab_summary': // 統計。
                    $( '#tab_summary').show();
                    L_this._refreshDatatable( $( '#table_summary'), true, true);
                    break;

                case 'btn_tab_consultor_msg': // 投顧信息。
                    $( '#tab_consultor_msg').show();
                    break;
            }
        }
    );

    $( '.btn_lots').button().on(
        'click',
        function()
        {
            $( '#spinner_order_lots').spinner( 'value', $( this).val());
        }
    );

    $( '.btn_contract').button();


    $( '#spinner_order_lots').spinner(
        {
            'min': 1,
            'step': 1,
            'numberFormat': 'n',
        }
    ).spinner( 'value', 1);

    $( '#spinner_order_pending_price').spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
        }
    ).spinner( 'value', 0);

    $( '#spinner_order_take_profit').spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
        }
    ).spinner( 'value', 0);

    $( '#spinner_order_stop_loss').spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
        }
    ).spinner( 'value', 0);


    $( 'input[name="order_type"]').on(
        'change',
        function()
        {
            var L_order_type = $( this).val();
            var L_jquery_order_limit_input = $( '#order_limit_input');
            if (L_order_type == 'limit') {
                L_jquery_order_limit_input.show();

                // 價格使用當前此商品的成交價。
                if (L_this._current_symbol_id != null) {
                    var L_instrument_full_id = 'G' + ':' + L_this._current_symbol_id;
                    var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
                    $( '#spinner_order_pending_price').spinner( 'value', L_instrument_data['lastPrice']);
                }
            }
            else {
                L_jquery_order_limit_input.hide();
            }
        }
    ).trigger( 'change');

    $( 'input[name="order_operation"]').on(
        'change',
        function()
        {
            var L_type = $( this).val();
            switch (L_type)
            {
                case 'normal': // 一般下單。
                    $( '.non_easy').show();
                    break;

                case 'easy': // 閃電下單。
                    $( '.non_easy').hide();
                    break;
            }
        }
    );

    $( '#btn_close_all_selected_opened_positions').on( // 全部平倉(開倉列表)
        'click',
        function()
        {
            var L_account_data = L_this._fq_client_manager.getAccountData();
            var L_account = L_account_data.getAccount( L_this._account_id);

            var L_selected_ticket_no = [];
            $( '.checkBoxForOpenedPosition').each(
                function()
                {
                    var L_self = $( this);
                    if (L_self.prop( 'checked')) {
                        var L_ticket_no = L_self.data( 'ticket_no');
                        L_selected_ticket_no.push( L_ticket_no);
                    }
                }
            );

            var L_tickets = L_account.getTickets();
            for (var i in L_selected_ticket_no) {
                var L_ticket_no = L_selected_ticket_no[i];
                var L_ticket = L_tickets[L_ticket_no];
                L_this.placeOrderToClosePosition( L_account, L_ticket);
            }
        }
    );

    $( '#btn_select_all_opened_positions').on( // 全部選取(開倉列表)
        'click',
        function()
        {
            $( '.checkBoxForOpenedPosition').prop( 'checked', true);
        }
    );

    $( '#btn_unselect_all_opened_positions').on( // 取消選取(開倉列表)
        'click',
        function()
        {
            $( '.checkBoxForOpenedPosition').prop( 'checked', false);
        }
    );

    this._initLayoutForAccountInfo();
    //this._initLayoutForInstruments();
    this._initLayoutForTickDetails();
    this._initLayoutForTickVolumeByPrice();
    this._initLayoutForOrders();
    this._initLayoutForOpenedPositions();
    this._initLayoutForClosedPosition();
    this._initLayoutForSummary();

    this.changeTheme( 'black');
};

Client.prototype._initLayoutForAccountInfo = function()
{
    // 帳戶資訊。
    var L_jquery_datatable_account_info = $( '#table_account_info');
    this._datatable_account_info = L_jquery_datatable_account_info.DataTable(
        {
            'jQueryUI': true,
            'paging': false,
            'order': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': [
                {
                    'orderable': false,
                    'targets': 0,
                },
                {
                    'orderable': false,
                    'targets': 1,
                }
            ],
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );

    this._refreshDatatable( L_jquery_datatable_account_info, true, true);
};
/*
 Client.prototype._initLayoutForInstruments = function()
 {
 // 商品。
 var L_columns_decl = this._tape_columns;
 var L_column_name_list = this._tape_column_name_list;
 var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
 var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

 var L_jquery_datatable_instruments = $( '#table_instruments');
 L_jquery_datatable_instruments.find( 'thead:first').html( L_html_of_thead);
 this._datatable_instruments = L_jquery_datatable_instruments.DataTable(
 {
 //'destroy': true,
 'jQueryUI': true,
 'paging': false,
 'ordering':  true,
 'order': [ 0, 'asc' ],
 'scrollX': '100%',
 'scrollY': '100%',
 'dom': 't',
 'columnDefs': L_column_defs,
 'preDrawCallback': this._pre_draw_callback,
 'drawCallback': this._draw_callback,
 }
 );

 new $.fn.dataTable.ColReorder( this._datatable_instruments);

 // Remove icon.
 $( '#table_instruments_wrapper').find( '.DataTables_sort_icon').remove();

 var L_this = this;
 L_jquery_datatable_instruments.on(
 'contextmenu',
 function( event)
 {
 var absolutePosition = getAbsoluteCursorPositionFromEvent( event);
 L_this._fq_client_contextmenus.showContextMenu( 'tape', absolutePosition['x'], absolutePosition['y']);
 }
 );

 this._refreshDatatable( L_jquery_datatable_instruments, true, true);
 };
 */
Client.prototype._initLayoutForTickDetails = function()
{
    // 明細。
    var L_columns_decl = this._tick_details_columns;
    var L_column_name_list = this._tick_details_name_list;
    var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
    var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

    var L_jquery_datatable_tick_details = $( '#table_tick_details');
    L_jquery_datatable_tick_details.find( 'thead:first').html( L_html_of_thead);
    this._datatable_tick_details = L_jquery_datatable_tick_details.DataTable(
        {
            //'destroy': true,
            'searching': false,
            'jQueryUI': true,
            'paging': true,
            'pageLength': 500,
            'ordering':  true,
            'order': [0, 'desc'],
            'orderClasses': false,
            'stripeClasses': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': L_column_defs,
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );

    this._refreshDatatable( L_jquery_datatable_tick_details, true, true);
};

Client.prototype._initLayoutForTickVolumeByPrice = function()
{
    // 量價表。
    var L_columns_decl = this._tick_volume_by_price_columns;
    var L_column_name_list = this._tick_volume_by_price_column_name_list;
    var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
    var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

    L_column_defs[0]['orderable'] = true;
    L_column_defs[1]['className'] = 'tick_details-volume_bar';
    L_column_defs[2]['orderable'] = true;

    var L_jquery_datatable_volume_by_price = $( '#table_tick_volume_by_price');
    L_jquery_datatable_volume_by_price.find( 'thead:first').html( L_html_of_thead);
    this._datatable_volume_by_price = L_jquery_datatable_volume_by_price.DataTable(
        {
            //'destroy': true,
            'searching': false,
            'jQueryUI': true,
            'paging': false,
            'ordering':  true,
            'order': [0, 'desc'],
            'orderClasses': false,
            'stripeClasses': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': L_column_defs,
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );
    this._refreshDatatable( L_jquery_datatable_volume_by_price, true, true);
};

Client.prototype._initLayoutForOrders = function()
{
    // 訂單。
    var L_columns_decl = this._order_columns;
    var L_column_name_list = this._order_column_name_list;
    var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
    var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

    var L_jquery_datatable_orders = $( '#table_orders');
    L_jquery_datatable_orders.find( 'thead:first').html( L_html_of_thead);
    this._datatable_orders = L_jquery_datatable_orders.DataTable(
        {
            //'destroy': true,
            'searching': false,
            'jQueryUI': true,
            'paging': false,
            'ordering':  true,
            'order': [0, 'desc'],
            'orderClasses': false,
            'stripeClasses': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': L_column_defs,
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );
    this._refreshDatatable( L_jquery_datatable_orders, true, true);

    var L_this = this;
    L_jquery_datatable_orders.closest( '.dataTables_wrapper').on(
        'contextmenu',
        function( event)
        {
            var absolutePosition = getAbsoluteCursorPositionFromEvent( event);
            L_this._fq_client_contextmenus.showContextMenu( 'orders', absolutePosition['x'], absolutePosition['y']);
        }
    );
};

Client.prototype._initLayoutForOpenedPositions = function()
{
    // 未平倉。
    var L_columns_decl = this._opened_position_columns;
    var L_column_name_list = this._opened_position_column_name_list;
    var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
    var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

    var L_jquery_datatable_opened_positions = $( '#table_opened_positions');
    L_jquery_datatable_opened_positions.find( 'thead:first').html( L_html_of_thead);
    this._datatable_opened_positions = L_jquery_datatable_opened_positions.DataTable(
        {
            'searching': false,
            'jQueryUI': true,
            'paging': false,
            'ordering':  true,
            'order': [],
            'orderClasses': false,
            'stripeClasses': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': L_column_defs,
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );
    this._refreshDatatable( this._datatable_opened_positions, true, true);

    var L_this = this;
    L_jquery_datatable_opened_positions.closest( '.dataTables_wrapper').on(
        'contextmenu',
        function( event)
        {
            var absolutePosition = getAbsoluteCursorPositionFromEvent( event);
            L_this._fq_client_contextmenus.showContextMenu( 'opened_positions', absolutePosition['x'], absolutePosition['y']);
        }
    );
};

Client.prototype._initLayoutForClosedPosition = function()
{
    // 已平倉。
    var L_columns_decl = this._closed_position_columns;
    var L_column_name_list = this._closed_position_column_name_list;
    var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
    var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

    var L_jquery_datatable_closed_positions = $( '#table_closed_positions');
    L_jquery_datatable_closed_positions.find( 'thead:first').html( L_html_of_thead);
    this._datatable_closed_positions = L_jquery_datatable_closed_positions.DataTable(
        {
            'searching': false,
            'jQueryUI': true,
            'paging': false,
            'ordering':  true,
            'order': [],
            'orderClasses': false,
            'stripeClasses': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': L_columns_decl,
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );
    this._refreshDatatable( this._datatable_closed_positions, true, true);
};

Client.prototype._initLayoutForSummary = function()
{
    // 統計。
    var L_columns_decl = this._summary_columns;
    var L_column_name_list = this._summary_column_name_list;
    var L_column_defs = this._composeColumnDefForDataTable( L_columns_decl, L_column_name_list);
    var L_html_of_thead = this._composeTableHeadForColumns( L_columns_decl, L_column_name_list);

    var L_jquery_datatable_summary = $( '#table_summary');
    L_jquery_datatable_summary.find( 'thead:first').html( L_html_of_thead);
    this._datatable_summary = L_jquery_datatable_summary.DataTable(
        {
            'searching': false,
            'jQueryUI': true,
            'paging': false,
            'ordering':  true,
            'order': [],
            'orderClasses': false,
            'stripeClasses': [],
            'scrollX': '100%',
            'scrollY': '100%',
            'dom': 't',
            'columnDefs': L_column_defs,
            'preDrawCallback': this._pre_draw_callback,
            'drawCallback': this._draw_callback,
        }
    );
    this._refreshDatatable( this._datatable_summary, true, true);
};

Client.prototype._composeColumnDefForDataTable = function( IN_columns_decl, IN_column_name_list)
{
    var L_column_defs = [];
    var L_number_of_column_name = IN_column_name_list.length;
    for (var i = 0; i < L_number_of_column_name; ++i) {
        var L_column_name = IN_column_name_list[i];
        var L_column = IN_columns_decl[L_column_name];
        if (L_column === undefined) {
            continue;
        }

        var L_column_title = L_column['title'];
        var L_column_width = L_column['width'];
        var L_column_def = {
            'title': '&nbsp<span>' + L_column_title + '</span>&nbsp',
            'orderable': false,
            'targets': i,
            'name': L_column_name,
            'className': L_column_name,
        };

        if (L_column_width != null) {
            L_column_def['width'] = L_column_width;
        }

        L_column_defs.push( L_column_def);
    }
    return L_column_defs;
};

Client.prototype._composeTableHeadForColumns = function( IN_columns_decl, IN_column_name_list)
{
    var L_html = '<tr>';
    for (var i in IN_column_name_list) {
        var L_column_name = IN_column_name_list[i];
        var L_the_column_decl = IN_columns_decl[L_column_name];
        L_html += '<th>' + L_the_column_decl['title'] + '</th>';
    }

    L_html += '</tr>';
    return L_html;
};

Client.prototype._loadThemeCSS = function( IN_theme_name, IN_callback)
{
    var L_resource_loader = this._theme_resource_loaders[IN_theme_name];
    if (L_resource_loader === undefined) {
        L_resource_loader = this._theme_resource_loaders[IN_theme_name] = new this._dom_frame_fq_client_manager.ResourceLoader();
        L_resource_loader.addResource( 'main_app', '../css/themes/app_' + IN_theme_name + '-pc.css', 'text');
        L_resource_loader.addResource( 'app', './css/themes/app_' + IN_theme_name + '-pc.css', 'text');
        L_resource_loader.addResource( 'jquery_ui', './3rdParty/jquery-ui-1.11.0/themes/' + IN_theme_name + '/jquery-ui.min.css', 'text');
    }

    L_resource_loader.loadAndQuery( IN_callback);
};

Client.prototype._refreshDatatable = function( IN_jquery_datatable, IN_resize_columns, IN_redraw)
{
    if ( ! $.fn.DataTable.isDataTable( IN_jquery_datatable)) {
        return false;
    }

    var L_data_table_api = IN_jquery_datatable.DataTable();

    if (IN_resize_columns) {
        L_data_table_api.columns.adjust(); // Slow performance;
    }

    var L_jquery_instruments_wrapper = IN_jquery_datatable.closest( '.dataTables_wrapper');
    L_jquery_instruments_wrapper.css( 'height', '100%');
    L_jquery_instruments_wrapper.find( '.dataTables_scroll:first').css( 'height', '100%');

    var L_height_of_thead = L_jquery_instruments_wrapper.find( '.dataTables_scrollHead:first').height();
    var L_height_of_tfoot = L_jquery_instruments_wrapper.find( '.dataTables_scrollFoot:first').height();
    L_jquery_instruments_wrapper.find( '.dataTables_scrollBody:first').css( 'height', L_jquery_instruments_wrapper.height() - L_height_of_thead - L_height_of_tfoot);

    if (IN_redraw) {
        L_data_table_api.draw();
    }
    return true;
};

/**
 * 開始執行.
 */
Client.prototype.run = function()
{
    // 建立Market data.
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account_symbol_list = L_account_data.getSymbolList();
    var L_symbol_display_name = {
        'TWICC': '加權指',
        'TXCC': '台指期',
        'TWCC': '摩台期',
        'TECC': '電子期',
        'TFCC': '金融期',
        'HSICC': '恆生期',
        'NKCC': '日經期',
        'IFCC': '滬深期',
        '6ECC': '歐元期',
        'YMCC': '道瓊期',
        'NQCC': '那斯達',
        'CLCC': '輕油期',
        'GCCC': '黃金期',
        'SICC': '白銀期',
    };

    // Build market data.
    var L_instrument_list = [];
    var L_instrument_info_symbols = {};

    for (var i in L_account_symbol_list) {
        var L_symbol = L_account_symbol_list[i];
        var L_symbol_id = L_symbol.getId();
        // var L_open_time = L_symbol['openTime_'];
        // var L_close_time = L_symbol['closeTime1_'];
        var L_open_time = L_symbol.getOpenTime()
        var L_close_time = L_symbol.getCloseTime1();

        if (L_open_time == null) {
            // 可能是2025電文沒收到此商品的資料。
            console.error( '沒有商品 ' + L_symbol_id + ' 的開盤時間資料。');
            continue;
        }

        if (L_close_time == null) {
            // 可能是2025電文沒收到此商品的資料。
            console.error( '沒有商品 ' + L_symbol_id + ' 的收盤時間資料。');
            continue;
        }

        var L_open_time_1_matches = L_open_time.match( /(.{2})(.{2})(.{2})/);
        var L_close_time_2_matches = L_close_time.match( /(.{2})(.{2})(.{2})/);
        L_instrument_info_symbols[L_symbol_id] = {
            'exchangeId': 'G',
            'symbolId': L_symbol_id,
            'displayName': L_symbol_display_name[L_symbol_id], // 寫死.
            'ic': null,
            'openTimeHour': parseInt( L_open_time_1_matches[1]),
            'openTimeMinute': parseInt( L_open_time_1_matches[2]),
            'closeTimeHour': parseInt( L_close_time_2_matches[1]),
            'closeTimeMinute': parseInt( L_close_time_2_matches[2]),
            'status': L_symbol.getTradeStatus(), // L_symbol['tradeStatus_'],
        };

        var L_instrument_id = 'G' + ':' + L_symbol_id;
        L_instrument_list.push( L_instrument_id);
    }

    var L_market_data = {
        'instrumentInfos': {
            'G': { // 期貨CFD商品.
                'timezoneOffsetInMinutes': 480, // +0800.
                'symbols': L_instrument_info_symbols,
                'icInfos': {},
            },
        }
    };

    this._fq_client_manager.setMarketData( L_market_data);

    // 選擇預設的子帳戶.
    var L_account_list = L_account_data.getAccountList();
    var L_default_account_id = this._account_id = L_account_list[0].getAccountId();
    $( '#current_account').text( L_default_account_id);
    $( '#current_account_hint').text( L_default_account_id);

    // 更新子帳戶combobox.
    var L_html = '';
    for (var i in L_account_list)  {
        var L_account_id = L_account_list[i];
        L_html += '<option value="' + L_account_id + '">' + L_account_id + '</option>';
    }
    $( '#sub_accounts').html( L_html);

    // 重設盤面商品.
    this._fq_client_tape.resetInstrumentList( L_instrument_list);
};

Client.prototype._funcDatetimeReplacer = function( $0, IN_year, IN_month, IN_day, IN_hour, IN_minute, IN_second)
{
    return IN_hour + ':' + IN_minute + ':' + IN_second;
};

Client.prototype.changeCurrentSymbol = function( IN_symbol_id)
{
    this._current_symbol_id = IN_symbol_id;
    var L_current_symbol_id = this._current_symbol_id;
    var L_instrument_full_id = 'G' + ':' + L_current_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];

    $( '#order_symbol_display_name').text( L_symbol_display_name);

    if ($( '#order_type_limit').prop( 'checked')) {
        // 限價價格使用當前此商品的成交價。
        var L_jquery_order_limit_input = $( '#order_limit_input');
        if (L_current_symbol_id != null) {
            // 限價Spinner.
            $( '#spinner_order_pending_price').spinner( 'value', L_instrument_data['lastPrice']);
        }
    }
};

Client.prototype.updateTapeInstrumentInfo = function( IN_symbol_id)
{
    var L_instrument_full_id = 'G' + ':' + IN_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_prev_close_price = parseFloat( L_instrument_data['closeOfOHLC']);
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account_symbol_settings = L_account_data.getAccSymbolSettings( this._account_id, IN_symbol_id);

    // 商品.
    var L_symbol_display_name = L_instrument_data['displayName'];
    $( '#symbol_name').text( L_symbol_display_name);

    // 最後交易日.
    var L_symbol = L_account_data.getSymbol( IN_symbol_id);
    var L_last_trade_date = L_symbol.getLastTradeDate();;
    $( '#last_trade_date').text( L_last_trade_date.replace( /(.{4})(.{2})(.{2})/, '$1-$2-$3'));

    // 禁新.
    var L_trade_stop_order_gap = parseFloat( L_account_symbol_settings.getTradeStopOrderGap()) / 100;
    var L_stop_order_high = Math.round( L_prev_close_price * (1 + L_trade_stop_order_gap));
    var L_stop_order_low = Math.round( L_prev_close_price * (1 - L_trade_stop_order_gap));
    $( '#stop_order_high').text( L_stop_order_high);
    $( '#stop_order_low').text( L_stop_order_low);

    // 強平.
    var L_trade_force_close_gap = parseFloat( L_account_symbol_settings.getTradeForceCloseGap()) / 100;
    var L_force_close_high = Math.round( L_prev_close_price * (1 + L_trade_force_close_gap));
    var L_force_close_low = Math.round( L_prev_close_price * (1 - L_trade_force_close_gap));
    $( '#force_close_high').text( L_force_close_high);
    $( '#force_close_low').text( L_force_close_low);
};

Client.prototype.orderCurrentSymbol = function( IN_is_buying)
{
    var L_symbol_id = this._current_symbol_id;
    if (L_symbol_id == null) {
        return;
    }

    var L_order_operation = $( 'input[name="order_operation"]:checked').val();
    var L_is_thunder_ordering = L_order_operation !== 'normal';
    var L_lots = $( '#spinner_order_lots').val();
    var L_instrument_full_id = 'G' + ':' + L_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];
    var L_buy_sell_str = IN_is_buying ? '多': '空';
    var L_contract_type = $( '#btns_contract_type').find( 'input:checked').val();
    var L_contract_type_str;
    switch (L_contract_type)
    {
        case 'big': L_contract_type_str = '大'; break;
        case 'middle': L_contract_type_str = '中'; break;
        case 'small': L_contract_type_str = '小'; break;
        default: debugger; return;
    }

    var L_order_type = $( 'input[name="order_type"]:checked').val();
    var L_price_str;
    if (L_order_type === 'limit') {
        L_price_str = $( '#spinner_order_pending_price').val();
    }
    else {
        L_price_str = '市價';
    }

    var L_this = this;
    var L_func_submit = function()
    {
        L_this._fq_client_dialog_html.hideDialog();
        var L_order_action; // 一般市(0)/一般限(1)/閃電市(2)/手動單(3)/系統砍倉(4)/批分單(5).
        var L_open_limit_price;
        var L_open_stop_price;

        if (L_is_thunder_ordering) {
            L_order_action = 3;
            L_open_limit_price = null;
            L_open_stop_price = null;
        }
        else {
            switch (L_order_type)
            {
                case 'market':
                    L_order_action = 0;
                    L_open_limit_price = null;
                    L_open_stop_price = null;
                    break;

                case 'limit':
                    L_order_action = 1;
                    L_open_limit_price = $( '#spinner_order_pending_price').spinner( 'value');
                    L_open_stop_price = null;
                    break;

                case 'minute': // 批分單。
                    L_order_action = 5;
                    L_open_limit_price = null;
                    L_open_stop_price = null;
                    break;

                default:
                    debugger;
                    return;
            }
        }

        var L_contract_type_code;
        switch (L_contract_type)
        {
            case 'big': L_contract_type_code = 'B'; break;
            case 'middle': L_contract_type_code = 'M'; break;
            case 'small': L_contract_type_code = 'S'; break;
            default:
                debugger;
                return;
        }

        // 下單.
        var L_instrument_full_id = 'G' + ':' + L_symbol_id;
        var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
        //var L_settlement_price = parseFloat( L_instrument_data['settlementPrice']);
        var L_exchange_id = 'G';
        var L_close_when_mc = 0;
        var L_ticket_no = null;

        // 停損停利。
        var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
        var L_ask_price = parseFloat( L_instrument_data['askPrice']);
        var L_bid_price = parseFloat( L_instrument_data['bidPrice']);
        var L_account_data = L_this._fq_client_manager.getAccountData();
        var L_account_symbol_settings = L_account_data.getAccSymbolSettings( L_this._account_id, L_symbol_id);
        var L_pip_to_price = parseFloat( L_account_symbol_settings.getTickUnit());

        var L_order_price;
        if (L_open_limit_price > 0) {
            L_order_price = L_open_limit_price;
        }
        else {
            if (IN_is_buying) {
                L_order_price = parseFloat( L_instrument_data['askPrice']);
            }
            else {
                L_order_price = parseFloat( L_instrument_data['bidPrice']);
            }
        }

        var L_close_stop_price;
        var L_trade_stop_pip = $( '#spinner_order_stop_loss').spinner( 'value');
        if (L_trade_stop_pip > 0) {
            var L_stop_loss_must_be_greater = ! IN_is_buying;
            var L_stop_loss_pip_gap_price = L_trade_stop_pip * L_pip_to_price;
            if (false == L_stop_loss_must_be_greater) {
                L_stop_loss_pip_gap_price *= -1;
            }
            L_close_stop_price = Math.floor( L_order_price + L_stop_loss_pip_gap_price);
        }
        else {
            L_close_stop_price = null;
        }

        var L_close_limit_price;
        var L_trade_limit_pip = $( '#spinner_order_take_profit').spinner( 'value');
        if (L_trade_limit_pip > 0) {
            var L_take_profit_must_be_greater = IN_is_buying;
            var L_take_profit_pip_gap_price = L_trade_limit_pip * L_pip_to_price;
            if (false == L_take_profit_must_be_greater) {
                L_take_profit_pip_gap_price *= -1;
            }
            L_close_limit_price = Math.floor( L_order_price + L_take_profit_pip_gap_price);
        }
        else {
            L_close_limit_price = null;
        }

        L_this._fq_client_manager.placeOrder(
            L_this._account_id,
            'G',
            L_symbol_id,
            IN_is_buying ? 'B' : 'S',
            L_lots,
            L_contract_type_code,
            L_order_action,
            L_close_when_mc,
            L_ticket_no,
            L_open_limit_price,
            L_open_stop_price,
            L_close_limit_price,
            L_close_stop_price
        );
    };

    if (L_is_thunder_ordering) {
        // 閃電下單。
        L_func_submit();
    }
    else {
        // 一般下單。
        if ($( '#order_option_do_not_confirm_when_order').prop( 'checked')) {
            // 下單不確認。
            L_func_submit();
        }
        else {
            // 下單確認。
            var L_html = [
                '<table border="1" style="width: 100%; height: 100%;">',
                '<tr style="white-space: norwap;"><td>帳號</td><td>商品</td><td>種類</td><td>口數</td><td>訂單類別</td><td>價位</td></tr>',
                '<tr style="white-space: norwap;"><td>' + this._account_id + '</td><td>' + L_symbol_display_name + '</td><td>' + L_contract_type_str + '</td><td>' + L_lots + '</td><td>' + L_buy_sell_str + '</td><td>' + L_price_str + '</td></tr>',
                '</table>',
                '<div style="float: right;"><input type="button" name="submit" value="確定" /><input type="button" name="cancel" value="取消" /></div>',
                '<div style="clear: both;"></div>'
            ].join( '');

            this._fq_client_dialog_html.setTitle( '下單確認');
            this._fq_client_dialog_html.resetHTML( L_html);
            this._fq_client_dialog_html.repositionDialog();
            this._fq_client_dialog_html.setResizable( false);
            this._fq_client_dialog_html.showDialog( true);

            // 註冊事件。
            var L_dom_dialog = this._fq_client_dialog_html.getDialog();
            var L_jquery_dialog = $(L_dom_dialog);
            L_jquery_dialog.find( 'input[name="submit"]').button().on( 'click', L_func_submit);

            L_jquery_dialog.find( 'input[name="cancel"]').button().on(
                'click',
                function()
                {
                    L_this._fq_client_dialog_html.hideDialog();
                }
            );
        }
    }
};

Client.prototype.getFloatingPLForOpenedPosition = function( IN_ticket)
{
    // Profit pip.
    var L_ticket_symbol_id = IN_ticket.getSymbolId();
    var L_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    if (L_instrument_data == null) {
        return null;
    }

    var L_ticket_contract_type = IN_ticket.getContractType();
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account_symbol_settings = L_account_data.getAccSymbolSettings( this._account_id, L_ticket_symbol_id);
    var L_tick_unit = parseFloat( L_account_symbol_settings.getTickUnit());
    var L_step = L_account_symbol_settings.getStep();

    var L_profit_pip;
    L_ticket_open_price = IN_ticket.getOpenPrice();
    L_profit_pip = (parseFloat( L_instrument_data['lastPrice']) - parseFloat( L_ticket_open_price));

    var L_is_buying = IN_ticket.getBuySell() === 'B';
    if (L_is_buying == false) {
        L_profit_pip *= -1;
    }

    // Profit price.
    var L_pip_cost;
    switch (L_ticket_contract_type)
    {
        case 'S': L_pip_cost = L_account_symbol_settings.getSettingSmallPipCost(); break;
        case 'M': L_pip_cost = L_account_symbol_settings.getSettingMedPipCost(); break;
        case 'B': L_pip_cost = L_account_symbol_settings.getSettingBigPipCost(); break;
        default: return;
    }

    var L_profit_price = L_pip_cost * L_profit_pip / (L_tick_unit * L_step);
    return {
        'pip': parseFloat( L_profit_pip.toFixed( 5)),
        'pl': parseFloat( L_profit_price.toFixed( 5)),
    };
};

/**
 * 更新資金狀態
 */
Client.prototype.updateStatement = function()
{
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);

    var L_initial_margin = parseFloat( L_account.getInitialMargin());
    var L_profit = parseFloat( L_account.getProfit());
    var L_service_person = L_account.getServicePerson();
    var L_service_number = L_account.getServiceNumber();

    this._datatable_account_info.cell( '#margin').data( this._utility.numberFormat( L_initial_margin));
    this._datatable_account_info.cell( '#profit').data( this._utility.numberFormat( L_profit));
    this._datatable_account_info.cell( '#contact_person').data( L_service_person);
    this._datatable_account_info.cell( '#contact_phone_number').data( L_service_number);

    this._updateStatementBalance();
    this._datatable_account_info.draw();
};

/*
 * 更新帳戶餘額(會因為開倉部位的總浮動損益而改變)
 */
Client.prototype._updateStatementBalance = function()
{
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_balance = parseFloat( L_account.getBalance());

    // 計算部位的總浮動損益.
    var L_total_floating_pl = 0;
    var L_total_pl_today = 0;
    var L_tickets = L_account.getTickets();
    for (var L_ticket_no in L_tickets) {
        var L_ticket = L_tickets[L_ticket_no];
        var L_is_opening = L_ticket.getOpenClose() === 'O';

        if (L_is_opening) {
            var L_ticket_symbol_id = L_ticket.getSymbolId();
            var L_floating_pl = this.getFloatingPLForOpenedPosition( L_ticket);
            if (L_floating_pl == null) {
                continue;
            }

            var L_profit_price = L_floating_pl['pl'];
            L_total_floating_pl += L_profit_price;
            L_total_pl_today += L_profit_price;
        }
        else {
            L_total_floating_pl += parseFloat( L_ticket.getProfit());

        }
    }

    var equity = L_balance + L_total_pl_today;

    this._datatable_account_info.cell( '#balance').data( this._utility.numberFormat( parseFloat( equity.toFixed( 5))));
    this._datatable_account_info.cell( '#profit').data( this._utility.numberFormat( parseFloat( L_total_floating_pl.toFixed( 5))));
};

/**
 * 更新所有某商品的委託單
 */
Client.prototype.updateOrdersOfInstrument = function( IN_instrument_full_id)
{
    this._datatable_orders.clear().draw(); // Draw() will remove all dom.

    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_orders = L_account.getOrders();
    for (var L_order_no in L_orders) {
        var L_order = L_orders[L_order_no];
        var L_symbol_id = L_order.getSymbolId();
        var L_instrument_full_id = 'G' + ':' + L_symbol_id;
        if (L_instrument_full_id == IN_instrument_full_id) {
            this.updateOrder( L_account, L_order);
        }
    }

    this._datatable_orders.draw();
    console.log( L_orders);
};

/**
 * 更新所有委託單
 */
Client.prototype.updateOrders = function()
{
    this._datatable_orders.clear().draw(); // Draw() will remove all dom.

    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_orders = L_account.getOrders();
    for (var L_order_no in L_orders) {
        var L_order = L_orders[L_order_no];
        this.updateOrder( L_account, L_order);
    }

    this._datatable_orders.draw();
    console.log( L_orders);
};

/**
 * 更新委託單
 */
Client.prototype.updateOrder = function( IN_account, IN_order)
{
    var L_order_status = IN_order.getOrderStatus();
    var L_order_status_str;
    switch (L_order_status)
    {
        case 'T': // Traded.
        case 'D': // Deleted.
        case 'C': // Canceled.
            return;

        case 'A': // Active.
        case 'W': // Wait.
        case 'U': // Update.
        case 'S': // Waiting.
        case 'L': // Try to cancel.
        case 'M': // Trying to modify.
        default:
            L_order_status_str = '等待';
    }

    var L_this = this;
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_symbol_id = IN_order.getSymbolId();
    var L_order_no = IN_order.getOrderNo();
    var L_open_close = IN_order.getOpenClose(); // O, C
    var L_is_opening = L_open_close === 'O';
    var L_close_when_mc = IN_order.getCloseWhenMc();

    if (! L_is_opening) {
        // 附掛單.
        var L_original_ticket_no = IN_order.getOriginalTicketNo();
        var L_tickets = IN_account.getTickets();
        var L_ticket = L_tickets[L_original_ticket_no];
        if (L_ticket) {
            this.updateOpenedPositionStopLimitPrice( IN_account, IN_order, L_ticket);
        }

        if (L_order_type != 'M') {
            // 非市價平倉的單都不顯示在此列表。
            return;
        }
    }

    var L_order_lots = parseFloat( IN_order.getOrderLots());
    var L_order_open_limit_price = parseFloat( IN_order.getOpenLimitPrice());
    var L_order_open_stop_price = parseFloat( IN_order.getOpenStopPrice());
    var L_order_close_limit_price = parseFloat( IN_order.getCloseLimitPrice());
    var L_order_close_stop_price = parseFloat( IN_order.getCloseStopPrice());

    // 主單.
    var L_instrument_full_id = 'G' + ':' + L_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];
    var L_is_buying = IN_order.getBuySell() === 'B';
    var L_buy_price;
    var L_sell_price;
    if (L_is_buying) {
        L_buy_price = L_order_open_limit_price > 0 ? L_order_open_limit_price : parseFloat( IN_order.getPrice());
        L_sell_price = '';
    }
    else {
        L_buy_price = '';
        L_sell_price = L_order_open_stop_price > 0 ? L_order_open_stop_price : parseFloat( IN_order.getPrice());
    }

    var L_contract_type;
    switch (IN_order.getContractType())
    {
        case 'B': L_contract_type = '大'; break;
        case 'M': L_contract_type = '中'; break;
        case 'S': L_contract_type = '小'; break;
        default: L_contract_type = ''; break;
    }

    var L_order_receive_time = IN_order.getReceiveTime().replace( /(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/, this._funcDatetimeReplacer);
    var L_order_update_time = IN_order.getUpdateTime().replace( /(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/, this._funcDatetimeReplacer);

    var L_order_type = IN_order.getOrderType().toUpperCase();
    var L_order_type_str;
    switch (L_order_type)
    {
        case 'M':
            L_order_type_str = '市價';
            break;

        case 'S':
        case 'L':
            if (L_is_opening) { // 開倉都叫限價單。
                L_order_type_str = '限價';
            }
            else { // 平倉看是哪一種。
                if (L_order_close_stop_price > 0) {
                    L_order_type_str = '停損';
                }
                else if (L_order_close_limit_price > 0) {
                    L_order_type_str = '停利';
                }
                else {
                    L_order_type_str = '市價';
                }
            }
            break;

        case 'O':
            L_order_type_str = '停損停利';
            break;

        default:
            L_order_type_str = '';
            break;
    }

    var L_order_action = IN_order.getOrderAction();
    var L_order_action_str;
    switch (L_order_action)
    {
        case '0': L_order_action_str = '一般市'; break;
        case '1': L_order_action_str = '一般限'; break;
        case '2': L_order_action_str = '閃電市'; break;
        case '3': L_order_action_str = '手動單'; break;
        case '4': L_order_action_str = '系統砍倉'; break;
        case '5': L_order_action_str = '批分單'; break;
        default: L_order_action_str = ''; break;
    }

    var L_command_html;
    if (L_order_type == 'M') {
        L_command_html = ''; // 市價單不能改單也不能刪單。
    }
    else {
        L_command_html = '<input type="button" name="op_delete" value="刪">';
    }

    var L_columns = [
        L_command_html, // 動作.
        L_order_no,
        L_symbol_display_name,
        L_is_opening ? L_buy_price : '',
        L_is_opening ? L_sell_price : '',
        L_contract_type,
        L_order_lots,
        L_order_close_stop_price > 0 ? L_order_close_stop_price : '',
        L_order_close_limit_price > 0 ? L_order_close_limit_price : '',
        L_order_receive_time,
        L_order_update_time,
        L_order_action_str,
        L_order_status_str,
        L_is_opening ? '新倉' : '平倉',
        L_order_type_str,
        IN_order.getAccountId(),
        IN_order.getOriginalTicketNo()
    ];

    var L_row_id = 'order_' + L_order_no;
    var L_jquery_row = $( '#' + L_row_id);
    if (L_jquery_row.length === 0) {
        // New.
        var L_dom_row = this._datatable_orders.row.add( L_columns).node();
        var L_jquery_row = $( L_dom_row);
        L_jquery_row.attr( 'id', L_row_id);

        L_jquery_row.find( '[name="op_delete"]').on(
            'click',
            function()
            {
                // 刪單.
                L_this.deleteOrder( L_account, IN_order);
            }
        );

        L_jquery_row.find( '.stop_loss').on(
            'click',
            function()
            {
                L_this._showOrderModificationDialog( L_order_no);
            }
        );

        L_jquery_row.find( '.take_profit').on(
            'click',
            function()
            {
                L_this._showOrderModificationDialog( L_order_no);
            }
        );
    }
    else {
        // Update.
        this._datatable_orders.row( L_jquery_row).data( L_columns);
    }
};

/*
 Client.prototype.updateAllInstrumentNumberOfOpenedPositions = function()
 {
 var L_account_data = this._fq_client_manager.getAccountData();
 var L_account = L_account_data.getAccount( this._account_id);
 var L_account_symbol_list = L_account_data.getSymbolList();
 for (var i in L_account_symbol_list) {
 var L_symbol = L_account_symbol_list[i];
 var L_symbol_id = L_symbol.getId();
 var L_instrument_full_id = 'G' + ':' + L_symbol_id;
 this.updateInstrumentNumberOfOpenedPositions( L_instrument_full_id);
 }
 };
 */

/**
 * 更新某商品的開倉部位數量
 */
/*
 Client.prototype.updateInstrumentNumberOfOpenedPositions = function( IN_instrument_full_id)
 {
 var L_datatable_instruments = this._datatable_instruments;
 var L_jquery_cells = this._jquery_instrument_cells[IN_instrument_full_id];
 if (L_jquery_cells == null) {
 console.warn( 'updateInstrumentNumberOfOpenedPositions(): there\'s no instrument, id is "' + IN_instrument_full_id + '"');
 return;
 }

 var L_number_of_buying = 0;
 var L_number_of_selling = 0;

 var L_account_data = this._fq_client_manager.getAccountData();
 var L_account = L_account_data.getAccount( this._account_id);
 var L_tickets = L_account.getTickets();
 for (var L_ticket_no in L_tickets) {
 var L_ticket = L_tickets[L_ticket_no];
 var L_ticket_symbol_id = L_ticket.getSymbolId();
 var L_ticket_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
 if (L_ticket_instrument_full_id != IN_instrument_full_id) {
 continue;
 }

 var L_ticket_buy_sell = L_ticket.getBuySell();
 var L_is_buying = L_ticket_buy_sell === 'B';
 if (L_is_buying) {
 ++L_number_of_buying;
 }
 else {
 ++L_number_of_selling;
 }
 }

 L_datatable_instruments.cell( L_jquery_cells['number_of_buying']).data( L_number_of_buying > 0 ? L_number_of_buying : '');
 L_datatable_instruments.cell( L_jquery_cells['number_of_selling']).data( L_number_of_selling > 0 ? L_number_of_selling : '');
 };
 */

/**
 * 更新所有特定商品的開倉部位.
 */
Client.prototype.updateOpenedPositionsOfInstrument = function( IN_instrument_full_id)
{
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_tickets = L_account.getTickets();
    for (var L_ticket_no in L_tickets) {
        var L_ticket = L_tickets[L_ticket_no];
        var L_symbol_id = L_ticket.getSymbolId();
        var L_instrument_full_id = 'G' + ':' + L_symbol_id;
        if (L_instrument_full_id == IN_instrument_full_id) {
            this.updateOpenedPosition( L_account, L_ticket);
        }
    }
};

/**
 * 更新所有開倉部位.
 */
Client.prototype.updateOpenedPositions = function()
{
    this._datatable_opened_positions.clear().draw(); // Draw() will remove all dom.

    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_tickets = L_account.getTickets();
    for (var L_ticket_no in L_tickets) {
        var L_ticket = L_tickets[L_ticket_no];
        this.updateOpenedPosition( L_account, L_ticket);
    }
};

/**
 * 更新開倉部位.
 */
Client.prototype.updateOpenedPosition = function( IN_account, IN_ticket)
{
    var L_is_opening = IN_ticket.getOpenClose() === 'O';
    if (false == L_is_opening) {
        return;
    }

    //var L_orders = L_account.getOrders();
    var L_ticket_no = IN_ticket.getTicketNo();
    var L_ticket_symbol_id = IN_ticket.getSymbolId();
    var L_ticket_buy_sell = IN_ticket.getBuySell();
    var L_ticket_open_price = parseFloat( IN_ticket.getOpenPrice());
    var L_ticket_left_lots =parseFloat(  IN_ticket.getLeftLots());
    var L_ticket_fee = parseFloat( IN_ticket.getFee());
    //var L_ticket_profit = parseFloat( IN_ticket.getProfit());
    //var L_ticket_net_profit = IN_ticket.getNetProfit();
    var L_ticket_over_night_day_count = IN_ticket.getOverNightDayCount();
    var L_ticket_open_time = IN_ticket.getOpenTime();
    var L_ticket_open_order_no = IN_ticket.getOpenOrderNo();
    var L_ticket_account = IN_ticket.getAccountId();
    var L_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];
    var L_is_buying = L_ticket_buy_sell === 'B';

    var L_columns = [
        '<input type="checkbox" name="select" class="checkBoxForOpenedPosition" style="vertical-align: middle;" data-ticket_no="' + L_ticket_no + '" /><input type="button" name="close" value="平倉" />',
        L_symbol_display_name,
        L_is_buying ? '多': '空',
        L_ticket_open_price,
        L_ticket_left_lots,
        '', // 停損 - 延遲設置.
        '', // 停利 - 延遲設置.
        '', // 浮動損益點數 - 延遲設置.
        L_ticket_fee,
        '', // 浮動損益 - 延遲設置.
        L_ticket_over_night_day_count,
        L_ticket_open_time.replace( /(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/, this._funcDatetimeReplacer),
        L_ticket_no,
        L_ticket_open_order_no,
        L_ticket_account
    ];

    var L_opened_position_dom_id = '#opened_position_' + L_ticket_no;
    var L_jquery_row = $( L_opened_position_dom_id);
    if (L_jquery_row.length === 0) {
        // Add row.
        var L_dom_of_row = this._datatable_opened_positions.row.add( L_columns).node();
        var L_jquery_row = $( L_dom_of_row);
        L_jquery_row.attr( 'id', 'opened_position_' + L_ticket_no);

        // Cache all cell.
        L_jquery_row.data( 'profit_pip', L_jquery_row.find( '.profit_pip'));
        L_jquery_row.data( 'pl', L_jquery_row.find( '.pl'));

        // 停損停利修改事件。
        L_jquery_row.find( '.stop_loss,.take_profit').on(
            'click',
            function( IN_event)
            {
                L_this._showOpenedPositionModificationDialog( L_ticket_no);
            }
        );
    }
    else {
        // Update.

    }

    var L_jquery_column_operaton = L_jquery_row.find( '.operation');
    var L_this = this;
    L_jquery_column_operaton.find( 'input[name="close"]').on(
        'click',
        function()
        {
            // 跳出確認視窗。
            var L_html = [
                '<table style="min-width: 240px; min-height: 150px;">',
                '<tr><td>商品</td><td>' + L_symbol_display_name + '</td><td><input type="button" name="ok" value="確定" /></td></tr>',
                '<tr><td>多/空</td><td>' + (L_is_buying ? '多': '空') + '</td><td><input type="button" name="cancel" value="取消" /></td></tr>',
                '<tr><td>口數</td><td>' + L_ticket_left_lots + '</td><td></td></tr>',
                '</table>'
            ].join( '');

            L_this._fq_client_dialog_html.setTitle( '平倉');
            L_this._fq_client_dialog_html.setSize( 'auto', 'auto');
            L_this._fq_client_dialog_html.setResizable( false);
            L_this._fq_client_dialog_html.resetHTML( L_html);
            L_this._fq_client_dialog_html.showDialog( true);

            // Register events.
            var L_dom_dialog = L_this._fq_client_dialog_html.getDialog();
            var L_jquery_dialog = $(L_dom_dialog);
            L_jquery_dialog.find( 'input[name="ok"]').button().on(
                'click',
                function()
                {
                    // 平倉。
                    var L_tickets = IN_account.getTickets();
                    var L_ticket = L_tickets[L_ticket_no];
                    L_this.placeOrderToClosePosition( IN_account, L_ticket);
                    L_this._fq_client_dialog_html.hideDialog();
                }
            );

            L_jquery_dialog.find( 'input[name="cancel"]').button().on(
                'click',
                function()
                {
                    L_this._fq_client_dialog_html.hideDialog();
                }
            );
        }
    );

    this._datatable_opened_positions.draw();

    // 處理有關此部位的附掛止損止盈單.
    var L_orders = IN_account.getOrders();
    for (var L_order_no in L_orders) {
        var L_order = L_orders[L_order_no];
        if (L_order.getOriginalTicketNo() === L_ticket_no) {
            this.updateOrder( IN_account, L_order);
            this._datatable_orders.draw();
            break;
        }
    }

    this.updateOpenedPositionFloatingProfit( IN_account, IN_ticket);
    this.updateSummaryForInstrument( IN_account, L_instrument_full_id);
};

Client.prototype.updateOpenedPositionStopLimitPrice = function( IN_account, IN_order, IN_ticket)
{
    var L_ticket_no = IN_ticket.getTicketNo();
    var L_opened_position_dom_id = '#opened_position_' + L_ticket_no;
    var L_jquery_row = $( L_opened_position_dom_id);
    if (L_jquery_row.length === 0) {
        return;
    }

    var L_stop_loss_price = parseFloat( IN_order.getCloseStopPrice());
    var L_take_profit_price = parseFloat( IN_order.getCloseLimitPrice());
    if (L_take_profit_price == 6003) debugger;
    this._datatable_opened_positions.cell( L_jquery_row.find( '.stop_loss')).data( L_stop_loss_price != 0 ? L_stop_loss_price : '');
    this._datatable_opened_positions.cell( L_jquery_row.find( '.take_profit')).data( L_take_profit_price != 0 ? L_take_profit_price : '');
};

Client.prototype.updateOpenedPositionFloatingProfit = function( IN_account, IN_ticket)
{
    var L_ticket_no = IN_ticket.getTicketNo();
    var L_opened_position_dom_id = '#opened_position_' + L_ticket_no;
    var L_jquery_row = $( L_opened_position_dom_id);
    if (L_jquery_row.length === 0) {
        return;
    }

    var L_floating_pl = this.getFloatingPLForOpenedPosition( IN_ticket);
    if (L_floating_pl == null) {
        return;
    }

    var L_jquery_column_profit_pip = L_jquery_row.data( 'profit_pip');
    var L_jquery_column_pl = L_jquery_row.data( 'pl');

    var L_profit_pip = L_floating_pl['pip'];
    var L_profit_price = L_floating_pl['pl'];

    this._datatable_opened_positions.cell( L_jquery_column_profit_pip).data( L_profit_pip);
    this._datatable_opened_positions.cell( L_jquery_column_pl).data( L_profit_price);
};

Client.prototype.updateClosedPositionsOfInstrument = function( IN_instrument_full_id)
{
    //this._datatable_closed_positions.clear();
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_tickets = L_account.getTickets();
    for (var L_ticket_no in L_tickets) {
        var L_ticket = L_tickets[L_ticket_no];
        var L_symbol_id = L_ticket.getSymbolId();
        var L_instrument_full_id = 'G' + ':' + L_symbol_id;
        if (L_instrument_full_id == IN_instrument_full_id) {
            this.updateClosedPosition( L_account, L_ticket);
        }
    }

    console.log( L_tickets);
};

Client.prototype.updateClosedPositions = function()
{
    this._datatable_closed_positions.clear();

    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_tickets = L_account.getTickets();
    for (var L_ticket_no in L_tickets) {
        var L_ticket = L_tickets[L_ticket_no];
        this.updateClosedPosition( L_account, L_ticket);
    }

    console.log( L_tickets);
};

Client.prototype.updateClosedPosition = function( IN_account, IN_ticket)
{
    var L_is_opening = IN_ticket.getOpenClose() === 'O';
    if (L_is_opening) {
        return;
    }

    //var L_orders = L_account.getOrders();
    var L_ticket_no = IN_ticket.getTicketNo();
    var L_ticket_symbol_id = IN_ticket.getSymbolId();
    var L_ticket_buy_sell = IN_ticket.getBuySell();
    var L_ticket_open_price = parseFloat( IN_ticket.getOpenPrice());
    var L_ticket_close_price = parseFloat( IN_ticket.getClosePrice());
    var L_ticket_contract_type = IN_ticket.getContractType();
    var L_ticket_left_lots = parseFloat( IN_ticket.getLeftLots());
    var L_ticket_fee = parseFloat( IN_ticket.getFee());
    //var L_ticket_profit = IN_ticket.getProfit();
    var L_ticket_net_profit = parseFloat( IN_ticket.getNetProfit());
    var L_ticket_open_order_type = IN_ticket.getOpenOrderType();
    var L_ticket_clsoe_order_type = IN_ticket.getCloseOrderType();
    var L_ticket_open_time = IN_ticket.getOpenTime();
    var L_ticket_close_time = IN_ticket.getCloseTime();
    var L_ticket_open_order_no = IN_ticket.getOpenOrderNo();
    var L_ticket_close_order_no = IN_ticket.getCloseOrderNo();
    //var L_ticket_account = IN_ticket.getAccountId();

    var L_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];
    var L_is_buying = L_ticket_buy_sell === 'B';

    var L_order_type_to_str = {
        '0': '一般市',
        '1': '一般限',
        '2': '閃電市',
        '3': '人工單',
        '4': '系統', // Out of spec.
        '5': '批分', // Out of spec.
    };

    var L_order_open_type = L_order_type_to_str[L_ticket_open_order_type];
    var L_order_close_type = L_order_type_to_str[L_ticket_clsoe_order_type];

    if (L_order_open_type === undefined) {
        L_order_open_type = 'Unknown';
    }

    if (L_order_close_type === undefined) {
        L_order_open_type = 'Unknown';
    }

    var L_contract_type;
    switch (L_ticket_contract_type)
    {
        case 'B': L_contract_type = '大'; break;
        case 'M': L_contract_type = '中'; break;
        case 'S': L_contract_type = '小'; break;
        default: L_contract_type = ''; break;
    }

    var L_columns = [
        L_symbol_display_name,
        L_is_buying ? '多': '空',
        L_contract_type,
        L_ticket_left_lots,
        L_ticket_open_price,
        L_ticket_close_price,
        parseFloat( (L_ticket_close_price - L_ticket_open_price).toFixed( 5)),
        L_ticket_fee,
        L_ticket_net_profit,
        L_order_open_type,
        L_order_close_type,
        L_ticket_open_time.replace( /(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/, this._funcDatetimeReplacer),
        L_ticket_close_time.replace( /(.{4})(.{2})(.{2})(.{2})(.{2})(.{2})/, this._funcDatetimeReplacer),
        L_ticket_open_order_no,
        L_ticket_close_order_no,
        L_ticket_no
    ];

    var L_dom_of_row = this._datatable_closed_positions.row.add( L_columns).node();
    this._datatable_closed_positions.draw();

    this.updateSummaryForInstrument( IN_account, L_instrument_full_id);
};

Client.prototype.updateSummaryForAllInstruments = function()
{
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_account_symbol_list = L_account_data.getSymbolList();

    for (var i in L_account_symbol_list) {
        var L_symbol = L_account_symbol_list[i];
        var L_symbol_id = L_symbol.getId();
        var L_instrument_full_id = 'G' + ':' + L_symbol_id;
        this.updateSummaryForInstrument( L_account, L_instrument_full_id);
    }
};

Client.prototype.updateSummaryForInstrument = function( IN_account, IN_instrument_full_id)
{
    var L_total_buy = 0;
    var L_total_sell = 0;
    var L_total_opened = 0;
    var L_total_amount = 0;
    var L_total_fee = 0;
    var L_total_pl = 0;

    // 從部位中依商品統計。
    var L_tickets = IN_account.getTickets();
    for (var L_ticket_no in L_tickets) {
        var L_ticket = L_tickets[L_ticket_no];
        var L_ticket_symbol_id = L_ticket.getSymbolId();
        var L_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
        if (L_instrument_full_id !== IN_instrument_full_id) {
            // 非此商品，略過。
            continue;
        }

        // 將此部位列入統計.
        var L_is_buying = L_ticket.getBuySell() === 'B';
        if (L_is_buying) {
            ++L_total_buy;
        }
        else {
            ++L_total_sell;
        }

        var L_ticket_fee = parseFloat( L_ticket.getFee());
        L_total_fee += L_ticket_fee;

        var L_is_opening = L_ticket.getOpenClose() === 'O';
        if (L_is_opening) {
            var L_floating_pl = this.getFloatingPLForOpenedPosition( L_ticket);
            if (L_floating_pl != null) {
                var L_profit_price = L_floating_pl['pl'];
                L_total_pl += L_profit_price;
            }

            ++L_total_opened;
        }
        else {
            var L_ticket_net_profit = parseFloat( L_ticket.getNetProfit());
            L_total_pl += L_ticket_net_profit;
        }

        var L_lots = parseFloat( L_ticket.getLeftLots());
        L_total_amount += L_lots;
    }

    var L_instrument_data = this._fq_client_manager.getInstrumentData( IN_instrument_full_id);
    var L_display_name = L_instrument_data['displayName'];
    var L_row = [
        L_display_name,
        L_total_buy,
        L_total_sell,
        L_total_opened,
        L_total_amount,
        L_total_fee,
        L_total_pl
    ];

    // 新增 / 更新商品統計。
    var L_row_id = 'summary_' + IN_instrument_full_id;
    var L_jquery_row = $( '#' + this._utility.escapeJquerySelector( L_row_id));
    if (L_jquery_row.length === 0) {
        // Init.
        var L_dom_row = this._datatable_summary.row.add( L_row).node();

        var L_jquery_row = $( L_dom_row);
        L_jquery_row.attr( 'id', L_row_id);

        this._datatable_summary.draw( false);
    }
    else {
        // Update.
        this._datatable_summary.row( L_jquery_row).data( L_row);
    }
};

/**
 登入Dialog。
 */
Client.prototype._showLoginDialog = function( IN_callback)
{
    var L_html_of_options = [
        '<select class="server_index">',
        '<option value="0">測試伺服器</option>',
        '</select>'
    ];

    var L_html = [
        '<table>',
        '<tr><td>帳號</td><td><input type="text" class="user_id" value="EUR00002" /></td></tr>',
        '<tr><td>密碼</td><td><input type="password" class="user_pwd" value="123" /></td></tr>',
        '<tr><td colspan="2"><hr/></td></tr>',
        '<tr><td>伺服器</td><td>' + L_html_of_options + '<div style="float: right;"><input type="button" value="確定" class="ok" /></div></td></tr>',
        '</table>',
    ].join( '');

    this._fq_client_dialog_html.setTitle( '登入');
    this._fq_client_dialog_html.setResizable( false);
    this._fq_client_dialog_html.setSize( 'auto', 'auto');
    this._fq_client_dialog_html.resetHTML( L_html);
    this._fq_client_dialog_html.showDialog( false);

    var L_this = this;
    var L_jquery_dialog = $( this._fq_client_dialog_html.getDialog());
    L_jquery_dialog.find( '.ok').button().on(
        'click',
        function()
        {
            var L_user_id = L_jquery_dialog.find( '.user_id').val();
            var L_user_pwd = L_jquery_dialog.find( '.user_pwd').val();
            var L_server_index = parseInt( L_jquery_dialog.find( '.server_index').val());
            IN_callback.call( L_this, L_user_id, L_user_pwd, L_server_index);

            L_this._fq_client_dialog_html.hideDialog();
        }
    );
};

/**
 改單Dialog。
 */
Client.prototype._showOrderModificationDialog = function( IN_order_no)
{
    var L_this = this;
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_orders = L_account.getOrders();
    var L_order = L_orders[IN_order_no];
    var L_symbol_id = L_order.getSymbolId();
    var L_instrument_full_id = 'G' + ':' + L_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];
    var L_open_limit_price = parseFloat( L_order.getOpenLimitPrice());
    var L_open_stop_price = parseFloat( L_order.getOpenStopPrice());
    var L_close_limit_price = parseFloat( L_order.getCloseLimitPrice());
    var L_close_stop_price = parseFloat( L_order.getCloseStopPrice());
    var L_is_buying = L_order.getBuySell() === 'B';
    var L_take_profit_must_be_greater = L_is_buying;
    var L_stop_loss_must_be_greater = ! L_is_buying;
    var L_lots = L_order.getLeftLots();

    // 產生Dialog。
    var L_html = [
        '<table>',
        '<tr><td>商品</td><td>' + L_symbol_display_name + '</td><td><input name="submit" type="button" value="確定" /></td></tr>',
        '<tr><td>多/空</td><td>' + (L_is_buying ? '多' : '空') + '</td><td><input name="cancel" type="button" value="取消" /></td></tr>',
        '<tr><td>口數</td><td><input name="amount" disabled /></td><td></td></tr>',
        '<tr><td><input type="checkbox" name="useStopLoss">停損</td><td><input name="stopLossPrice" />' + (L_stop_loss_must_be_greater ? '>=' : '<=') + '<span name="stopLossBase"></span></td><td></td></tr>',
        '<tr><td>點數</td><td><input name="stopLossPips" /></td><td></td></tr>',
        '<tr><td><input type="checkbox" name="useTakeProfit">停利</td><td><input name="takeProfitPrice" />' + (L_take_profit_must_be_greater ? '>=' : '<=') + '<span name="takeProfitBase"></span></td><td></td></tr>',
        '<tr><td>點數</td><td><input name="takeProfitPips" /></td><td></td></tr>',
        '</table>'
    ];

    this._fq_client_dialog_html.setTitle( '改單');
    this._fq_client_dialog_html.setResizable( false);
    this._fq_client_dialog_html.setSize( 'auto', 'auto');
    this._fq_client_dialog_html.resetHTML( L_html);

    var L_dom_dialog = this._fq_client_dialog_html.getDialog();
    var L_jquery_dialog = $( L_dom_dialog);
    var L_jquery_submit = L_jquery_dialog.find( 'input[name="submit"]');
    var L_jquery_cancel = L_jquery_dialog.find( 'input[name="cancel"]');
    var L_jquery_amount = L_jquery_dialog.find( 'input[name="amount"]');
    var L_jquery_use_stop_loss = L_jquery_dialog.find( 'input[name="useStopLoss"]');
    var L_jquery_use_take_profit = L_jquery_dialog.find( 'input[name="useTakeProfit"]');
    var L_jquery_stop_loss_price = L_jquery_dialog.find( 'input[name="stopLossPrice"]');
    var L_jquery_take_profit_price = L_jquery_dialog.find( 'input[name="takeProfitPrice"]');
    var L_jquery_stop_loss_pips = L_jquery_dialog.find( 'input[name="stopLossPips"]');
    var L_jquery_take_profit_pips = L_jquery_dialog.find( 'input[name="takeProfitPips"]');
    var L_jquery_stop_loss_base = L_jquery_dialog.find( 'span[name="stopLossBase"]');
    var L_jquery_take_profit_base = L_jquery_dialog.find( 'span[name="takeProfitBase"]');

    var L_account_symbol_settings = L_account_data.getAccSymbolSettings( this._account_id, L_symbol_id);
    var L_trade_stop_pip_gap = L_stop_loss_must_be_greater ? L_account_symbol_settings.getTradeStopPipGap() : -L_account_symbol_settings.getTradeStopPipGap();
    var L_trade_limit_pip_gap = L_take_profit_must_be_greater ? L_account_symbol_settings.getTradeLimitPipGap() : -L_account_symbol_settings.getTradeLimitPipGap();

    var L_pip_to_price = parseFloat( L_account_symbol_settings.getTickUnit());

    var L_order_price;
    if (L_open_limit_price > 0) {
        L_order_price = L_open_limit_price;
    }
    else if (L_open_stop_price > 0) {
        L_order_price = L_open_stop_price;
    }
    else {
        L_order_price = parseFloat( L_order.getPrice());
    }

    var L_take_profit_price = parseFloat( L_order.getCloseLimitPrice());
    var L_stop_loss_price = parseFloat( L_order.getCloseStopPrice());
    var L_stop_loss_pip_gap_price = L_trade_stop_pip_gap * L_pip_to_price;
    var L_take_profit_pip_gap_price = L_trade_limit_pip_gap * L_pip_to_price;
    var L_stop_loss_base = Math.floor( L_order_price + L_stop_loss_pip_gap_price);
    var L_take_profit_base = Math.floor( L_order_price + L_take_profit_pip_gap_price);
    var L_stop_loss_pips = L_stop_loss_price > 0 ? Math.abs( L_stop_loss_base - L_stop_loss_price) : 0;
    var L_take_profit_pips = L_take_profit_price > 0 ? Math.abs( L_take_profit_price - L_take_profit_base) : 0;

    L_jquery_stop_loss_base.text( L_stop_loss_base);
    L_jquery_take_profit_base.text( L_take_profit_base);


    // 依方向給予不同的邊界限制。
    var L_func_reset_bound_for_stop_loss = function()
    {
        if (L_stop_loss_must_be_greater) {
            L_jquery_stop_loss_price.spinner( 'option', 'min', L_stop_loss_base);
            L_jquery_stop_loss_price.spinner( 'option', 'max', Infinity);
        }
        else {
            L_jquery_stop_loss_price.spinner( 'option', 'min', 0);
            L_jquery_stop_loss_price.spinner( 'option', 'max', L_stop_loss_base);
        }
    };

    var L_func_reset_bound_for_take_profit = function()
    {
        if (L_take_profit_must_be_greater) {
            L_jquery_take_profit_price.spinner( 'option', 'min', L_take_profit_base);
            L_jquery_take_profit_price.spinner( 'option', 'max', Infinity);
        }
        else {
            L_jquery_take_profit_price.spinner( 'option', 'min', 0);
            L_jquery_take_profit_price.spinner( 'option', 'max', L_take_profit_base);
        }
    };

    L_jquery_amount.spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
        }
    ).spinner( 'value', L_lots).spinner( 'disable');

    L_jquery_use_stop_loss.prop( 'checked', L_stop_loss_price > 0);
    L_jquery_use_take_profit.prop( 'checked', L_take_profit_price > 0);

    L_jquery_use_stop_loss.on(
        'change',
        function()
        {
            var L_checked = $( this).prop( 'checked');
            L_jquery_stop_loss_price.spinner( L_checked ? 'enable' : 'disable');
            L_jquery_stop_loss_pips.spinner( L_checked ? 'enable' : 'disable');
            if (L_jquery_stop_loss_price.val() == 0) {
                L_jquery_stop_loss_price.val( L_stop_loss_base);
                L_func_reset_bound_for_stop_loss();
            }
        }
    );

    L_jquery_use_take_profit.on(
        'change',
        function()
        {
            var L_checked = $( this).prop( 'checked');
            L_jquery_take_profit_price.spinner( L_checked ? 'enable' : 'disable');
            L_jquery_take_profit_pips.spinner( L_checked ? 'enable' : 'disable');
            if (L_jquery_take_profit_price.val() == 0) {
                L_jquery_take_profit_price.val( L_take_profit_base);
                L_func_reset_bound_for_take_profit();
            }
        }
    );

    L_jquery_stop_loss_price.spinner(
        {
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = $( this).val();
                L_jquery_stop_loss_pips.val( Math.abs( L_stop_loss_base - L_value));
            }
        }
    ).spinner( 'value', L_stop_loss_price).spinner( L_stop_loss_price > 0 ? 'enable' : 'disable');

    L_jquery_take_profit_price.spinner(
        {
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = $( this).val();
                L_jquery_take_profit_pips.val( Math.abs( L_value - L_take_profit_base));
            }
        }
    ).spinner( 'value', L_take_profit_price).spinner( L_take_profit_price > 0 ? 'enable' : 'disable');

    L_jquery_stop_loss_pips.spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = parseFloat( $( this).val());
                L_jquery_stop_loss_price.val( L_stop_loss_must_be_greater ? L_stop_loss_base + L_value : L_stop_loss_base - L_value);
            }
        }
    ).spinner( 'value', L_stop_loss_pips).spinner( L_stop_loss_price > 0 ? 'enable' : 'disable');

    L_jquery_take_profit_pips.spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = parseFloat( $( this).val());
                L_jquery_take_profit_price.val( L_take_profit_must_be_greater ? L_take_profit_base + L_value : L_take_profit_base - L_value);
            }
        }
    ).spinner( 'value', L_take_profit_pips).spinner( L_take_profit_price > 0 ? 'enable' : 'disable');

    L_jquery_submit.button().on(
        'click',
        function()
        {
            // 提交改單。
            var L_use_stop_loss = L_jquery_use_stop_loss.prop( 'checked');
            var L_use_take_profit = L_jquery_use_take_profit.prop( 'checked');
            var L_close_limit_price = L_jquery_take_profit_price.val();
            var L_close_stop_price = L_jquery_stop_loss_price.val();

            L_this.modifyOrder( L_account, L_order, L_use_take_profit ? L_close_limit_price : null, L_use_stop_loss ? L_close_stop_price : null);
            L_this._fq_client_dialog_html.hideDialog();
        }
    );

    L_jquery_cancel.button().on(
        'click',
        function()
        {
            // 取消。
            L_this._fq_client_dialog_html.hideDialog();
        }
    );

    L_jquery_use_stop_loss.trigger( 'change');
    L_jquery_use_take_profit.trigger( 'change');

    this._fq_client_dialog_html.showDialog( true);
};

/**
 改倉Dialog。
 */
Client.prototype._showOpenedPositionModificationDialog = function( IN_ticket_no)
{
    var L_this = this;
    var L_account_data = this._fq_client_manager.getAccountData();
    var L_account = L_account_data.getAccount( this._account_id);
    var L_tickets = L_account.getTickets();
    var L_ticket = L_tickets[IN_ticket_no];
    var L_ticket_symbol_id = L_ticket.getSymbolId();
    var L_ticket_buy_sell = L_ticket.getBuySell();
    var L_instrument_full_id = 'G' + ':' + L_ticket_symbol_id;
    var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_symbol_display_name = L_instrument_data['displayName'];
    var L_is_buying = L_ticket_buy_sell === 'B';
    var L_take_profit_must_be_greater = L_is_buying;
    var L_stop_loss_must_be_greater = ! L_is_buying;
    var L_lots = L_ticket.getLeftLots();

    var L_instrument_data = L_this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    var L_last_price = parseFloat( L_instrument_data['lastPrice']);
    var L_ask_price = parseFloat( L_instrument_data['askPrice']);
    var L_bid_price = parseFloat( L_instrument_data['bidPrice']);
    //var L_close_market_price = L_is_buying ? L_bid_price : L_ask_price;
    var L_close_market_price = L_last_price;
    var L_market_open_price = parseFloat( L_instrument_data['openPrice']);
//    var L_open_price = parseFloat( L_ticket.getOpenPrice());

    var L_account_symbol_settings = L_account_data.getAccSymbolSettings( this._account_id, L_ticket_symbol_id);
    var L_trade_stop_pip_gap = L_stop_loss_must_be_greater ? L_account_symbol_settings.getTradeStopPipGap() : -L_account_symbol_settings.getTradeStopPipGap();
    var L_trade_limit_pip_gap = L_take_profit_must_be_greater ? L_account_symbol_settings.getTradeLimitPipGap() : -L_account_symbol_settings.getTradeLimitPipGap();

    var L_pip_to_price = parseFloat( L_account_symbol_settings.getTickUnit());

    // 找出此倉位對應的停損停利單。
    var L_relative_order;
    var L_orders = L_account.getOrders();
    for (var L_order_no in L_orders) {
        var L_order = L_orders[L_order_no];
        var L_original_ticket_no = L_order.getOriginalTicketNo();
        if (L_original_ticket_no == IN_ticket_no) {
            switch (L_order.getOrderStatus())
            {
                case 'T': // Traded.
                case 'D': // Deleted.
                case 'C': // Canceled.
                    continue;
            }

            L_relative_order = L_order;
            break;
        }
    }

    var L_take_profit_price;
    var L_stop_loss_price;
    if (L_relative_order) {
        L_take_profit_price = L_relative_order.getCloseLimitPrice();
        L_stop_loss_price = L_relative_order.getCloseStopPrice();
    }
    else {
        L_take_profit_price = 0;
        L_stop_loss_price = 0;
    }

    // 產生Dialog。
    var L_html = [
        '<table>',
        '<tr><td>商品</td><td>' + L_symbol_display_name + '</td><td><input name="submit" type="button" value="確定" /></td></tr>',
        '<tr><td>多/空</td><td>' + (L_is_buying ? '多' : '空') + '</td><td><input name="cancel" type="button" value="取消" /></td></tr>',
        '<tr><td>口數</td><td><input name="amount" disabled /></td><td></td></tr>',
        '<tr><td><input type="checkbox" name="useStopLoss">停損</td><td><input name="stopLossPrice" />' + (L_stop_loss_must_be_greater ? '>=' : '<=') + '<span name="stopLossBase"></span></td><td></td></tr>',
        '<tr><td>點數</td><td><input name="stopLossPips" /></td><td></td></tr>',
        '<tr><td><input type="checkbox" name="useTakeProfit">停利</td><td><input name="takeProfitPrice" />' + (L_take_profit_must_be_greater ? '>=' : '<=') + '<span name="takeProfitBase"></span></td><td></td></tr>',
        '<tr><td>點數</td><td><input name="takeProfitPips" /></td><td></td></tr>',
        '</table>'
    ];

    this._fq_client_dialog_html.setTitle( '改單');
    this._fq_client_dialog_html.setResizable( false);
    this._fq_client_dialog_html.setSize( 'auto', 'auto');
    this._fq_client_dialog_html.resetHTML( L_html);

    var L_dom_dialog = this._fq_client_dialog_html.getDialog();
    var L_jquery_dialog = $( L_dom_dialog);
    var L_jquery_submit = L_jquery_dialog.find( 'input[name="submit"]');
    var L_jquery_cancel = L_jquery_dialog.find( 'input[name="cancel"]');
    var L_jquery_amount = L_jquery_dialog.find( 'input[name="amount"]');
    var L_jquery_use_stop_loss = L_jquery_dialog.find( 'input[name="useStopLoss"]');
    var L_jquery_use_take_profit = L_jquery_dialog.find( 'input[name="useTakeProfit"]');
    var L_jquery_stop_loss_price = L_jquery_dialog.find( 'input[name="stopLossPrice"]');
    var L_jquery_take_profit_price = L_jquery_dialog.find( 'input[name="takeProfitPrice"]');
    var L_jquery_stop_loss_pips = L_jquery_dialog.find( 'input[name="stopLossPips"]');
    var L_jquery_take_profit_pips = L_jquery_dialog.find( 'input[name="takeProfitPips"]');
    var L_jquery_stop_loss_base = L_jquery_dialog.find( 'span[name="stopLossBase"]');
    var L_jquery_take_profit_base = L_jquery_dialog.find( 'span[name="takeProfitBase"]');
    // var L_stop_loss_base = L_close_market_price + L_trade_stop_pip_gap * L_pip_to_price;
    // var L_take_profit_base = L_close_market_price + L_trade_limit_pip_gap * L_pip_to_price;
    var L_stop_loss_base = L_market_open_price + L_trade_stop_pip_gap * L_pip_to_price; // 20150424 - Alan: 用開盤價作為參考價格。
    var L_take_profit_base = L_market_open_price + L_trade_limit_pip_gap * L_pip_to_price; // 20150424 - Alan: 用開盤價作為參考價格。
    var L_stop_loss_pips = L_stop_loss_price > 0 ? Math.abs( L_stop_loss_base - L_stop_loss_price) : 0;
    var L_take_profit_pips = L_take_profit_price > 0 ? Math.abs( L_take_profit_price - L_take_profit_base) : 0;

    L_jquery_stop_loss_base.text( L_stop_loss_base);
    L_jquery_take_profit_base.text( L_take_profit_base);


    // 依方向給予不同的邊界限制。
    var L_func_reset_bound_for_stop_loss = function()
    {
        if (L_stop_loss_must_be_greater) {
            L_jquery_stop_loss_price.spinner( 'option', 'min', L_stop_loss_base);
            L_jquery_stop_loss_price.spinner( 'option', 'max', Infinity);
        }
        else {
            L_jquery_stop_loss_price.spinner( 'option', 'min', 0);
            L_jquery_stop_loss_price.spinner( 'option', 'max', L_stop_loss_base);
        }
    };

    var L_func_reset_bound_for_take_profit = function()
    {
        if (L_take_profit_must_be_greater) {
            L_jquery_take_profit_price.spinner( 'option', 'min', L_take_profit_base);
            L_jquery_take_profit_price.spinner( 'option', 'max', Infinity);
        }
        else {
            L_jquery_take_profit_price.spinner( 'option', 'min', 0);
            L_jquery_take_profit_price.spinner( 'option', 'max', L_take_profit_base);
        }
    };

    L_jquery_amount.spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
        }
    ).spinner( 'value', L_lots).spinner( 'disable');

    L_jquery_use_stop_loss.prop( 'checked', L_stop_loss_price > 0);
    L_jquery_use_take_profit.prop( 'checked', L_take_profit_price > 0);

    L_jquery_use_stop_loss.on(
        'change',
        function()
        {
            var L_checked = $( this).prop( 'checked');
            L_jquery_stop_loss_price.spinner( L_checked ? 'enable' : 'disable');
            L_jquery_stop_loss_pips.spinner( L_checked ? 'enable' : 'disable');
            if (L_jquery_stop_loss_price.val() == 0) {
                L_jquery_stop_loss_price.val( L_stop_loss_base);
                L_func_reset_bound_for_stop_loss();
            }
        }
    );

    L_jquery_use_take_profit.on(
        'change',
        function()
        {
            var L_checked = $( this).prop( 'checked');
            L_jquery_take_profit_price.spinner( L_checked ? 'enable' : 'disable');
            L_jquery_take_profit_pips.spinner( L_checked ? 'enable' : 'disable');
            if (L_jquery_take_profit_price.val() == 0) {
                L_jquery_take_profit_price.val( L_take_profit_base);
                L_func_reset_bound_for_take_profit();
            }
        }
    );

    L_jquery_stop_loss_price.spinner(
        {
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = parseFloat( $( this).val());
                L_jquery_stop_loss_pips.val( Math.abs( L_stop_loss_base - L_value));
            }
        }
    ).spinner( 'value', L_stop_loss_price).spinner( L_stop_loss_price > 0 ? 'enable' : 'disable');

    L_jquery_take_profit_price.spinner(
        {
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = parseFloat( $( this).val());
                L_jquery_take_profit_pips.val( Math.abs( L_value - L_take_profit_base));
            }
        }
    ).spinner( 'value', L_take_profit_price).spinner( L_take_profit_price > 0 ? 'enable' : 'disable');

    L_jquery_stop_loss_pips.spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = parseFloat( $( this).val());
                L_jquery_stop_loss_price.val( L_stop_loss_must_be_greater ? L_stop_loss_base + L_value : L_stop_loss_base - L_value);
            }
        }
    ).spinner( 'value', L_stop_loss_pips).spinner( L_stop_loss_price > 0 ? 'enable' : 'disable');

    L_jquery_take_profit_pips.spinner(
        {
            'min': 0,
            'step': 1,
            'numberFormat': 'n',
            'stop': function()
            {
                var L_value = parseFloat( $( this).val());
                L_jquery_take_profit_price.val( L_take_profit_must_be_greater ? L_take_profit_base + L_value : L_take_profit_base - L_value);
            }
        }
    ).spinner( 'value', L_take_profit_pips).spinner( L_take_profit_price > 0 ? 'enable' : 'disable');

    L_jquery_submit.button().on(
        'click',
        function()
        {
            // 提交改單。
            var L_use_stop_loss = L_jquery_use_stop_loss.prop( 'checked');
            var L_use_take_profit = L_jquery_use_take_profit.prop( 'checked');
            var L_close_limit_price = L_jquery_take_profit_price.val();
            var L_close_stop_price = L_jquery_stop_loss_price.val();

            if (L_relative_order) {
                // 已經有停損停利單。
                if (L_use_take_profit || L_use_stop_loss) {
                    // 價位變動，直接改單
                    L_this.modifyOrder( L_account, L_relative_order, L_use_take_profit ? L_close_limit_price : null, L_use_stop_loss ? L_close_stop_price : null);
                }
                else {
                    // 取消停潠停利單，直接刪單。
                    L_this.deleteOrder( L_account, L_relative_order);
                }
            }
            else {
                // 尚未有停損停利單，下新單。
                L_this.placeOrderToModifyPosition( L_account, L_ticket, L_use_take_profit ? L_close_limit_price : null, L_use_stop_loss ? L_close_stop_price : null);
            }

            L_this._fq_client_dialog_html.hideDialog();
        }
    );

    L_jquery_cancel.button().on(
        'click',
        function()
        {
            // 取消。
            L_this._fq_client_dialog_html.hideDialog();
        }
    );

    L_jquery_use_stop_loss.trigger( 'change');
    L_jquery_use_take_profit.trigger( 'change');

    this._fq_client_dialog_html.showDialog( true);
};

/**
 * 平倉
 */
Client.prototype.placeOrderToClosePosition = function( IN_account, IN_ticket)
{
    //var L_instrument_data = this._fq_client_manager.getInstrumentData( L_instrument_full_id);
    //var L_settlement_price = parseFloat( L_instrument_data['settlementPrice']);
    var L_exchange_id = 'G';
    var L_close_when_mc = 0;
    var L_ticket_no = IN_ticket.getTicketNo();
    var L_ticket_symbol_id = IN_ticket.getSymbolId();
    var L_lots = IN_ticket.getLeftLots();
    var L_contract_type = IN_ticket.getContractType();
    var L_order_action = 0; // 平倉
    var L_ticket_buy_sell = IN_ticket.getBuySell();
    var L_open_limit_price = 0;
    var L_open_stop_price = 0;
    var L_close_limit_price = 0;
    var L_close_stop_price = 0;
    var L_contract_type_code;
    var L_is_buying = L_ticket_buy_sell == "B";

    this._fq_client_manager.placeOrder(
        this._account_id,
        L_exchange_id,
        L_ticket_symbol_id,
        L_is_buying ? 'S' : 'B', // 平倉，反方向。
        L_lots,
        L_contract_type,
        L_order_action,
        L_close_when_mc,
        L_ticket_no,
        L_open_limit_price,
        L_open_stop_price,
        L_close_limit_price,
        L_close_stop_price
    );
};

/**
 改倉
 */
Client.prototype.placeOrderToModifyPosition = function( IN_account, IN_ticket, IN_close_limit_price, IN_close_stop_price)
{
    var L_exchange_id = 'G';
    var L_close_when_mc = 0;
    var L_ticket_no = IN_ticket.getTicketNo();
    var L_ticket_symbol_id = IN_ticket.getSymbolId();
    var L_lots = IN_ticket.getLeftLots();
    var L_contract_type = IN_ticket.getContractType();
    var L_order_action = 0; // 平倉
    var L_ticket_buy_sell = IN_ticket.getBuySell();
    var L_open_limit_price = 0;
    var L_open_stop_price = 0;
    var L_close_limit_price = IN_close_limit_price;
    var L_close_stop_price = IN_close_stop_price;
    var L_contract_type_code;
    var L_is_buying = L_ticket_buy_sell == "B";

    this._fq_client_manager.placeOrder(
        this._account_id,
        L_exchange_id,
        L_ticket_symbol_id,
        L_is_buying ? 'S' : 'B', // 附掛平倉用的Limit / Stop，反方向。
        L_lots,
        L_contract_type,
        L_order_action,
        L_close_when_mc,
        L_ticket_no,
        L_open_limit_price,
        L_open_stop_price,
        L_close_limit_price,
        L_close_stop_price
    );
};

/**
 改單

 目前改單只給改：
 closeLimitPrcie
 closeStopPrice
 */
Client.prototype.modifyOrder = function( IN_account, IN_order, IN_close_limit_price, IN_close_stop_price)
{
    var L_exchange_id = 'G';
    var L_symbol_id = IN_order.getSymbolId();
    var L_is_buying = IN_order.getBuySell() === 'B';
    var L_lots = IN_order.getOrderLots();
    var L_contract_type = IN_order.getContractType();
    var L_order_action = IN_order.getOrderAction();
    var L_close_when_mc = IN_order.getCloseWhenMc();
    var L_order_no = IN_order.getOrderNo();
    var L_open_limit_price = IN_order.getOpenLimitPrice();
    var L_open_stop_price = IN_order.getOpenStopPrice();
    var L_close_limit_price = IN_close_limit_price; //IN_order.getCloseLimitPrice();
    var L_close_stop_price = IN_close_stop_price; //IN_order.getCloseStopPrice();

    this._fq_client_manager.modifyOrder(
        this._account_id,
        L_exchange_id,
        L_symbol_id,
        L_is_buying ? 'B' : 'S', // 改這張附掛的Limit/Stop，方向不變。
        L_lots,
        L_contract_type,
        L_order_action,
        L_close_when_mc,
        L_order_no,
        L_open_limit_price,
        L_open_stop_price,
        L_close_limit_price,
        L_close_stop_price
    );
};

/**
 刪單
 */
Client.prototype.deleteOrder = function( IN_account, IN_order)
{
    var L_order_no = IN_order.getOrderNo();
    this._fq_client_manager.deleteOrder( L_order_no);
};


/*
 Client.prototype._tryToRefreshDatatable = function( IN_jquery_datatable)
 {
 if (IN_jquery_datatable.data( 'refresh_pending')) {
 return;
 }
 else {
 IN_jquery_datatable.data( 'refresh_pending', true);
 }

 var L_this = this;
 setTimeout(
 function()
 {
 L_this._refreshDatatable( IN_jquery_datatable, true, true);
 IN_jquery_datatable.data( 'refresh_pending', null);
 }
 );
 };
 */
Client.prototype._refreshTabTicks = function()
{
    if ($( '#tab_tick_details').css( 'display') != 'none') {
        this._refreshDatatable( $( '#table_tick_details'), true, false);
    }
    else if ($( '#tab_tick_volume_by_price').css( 'display') != 'none') {
        this._refreshDatatable( $( '#table_tick_volume_by_price'), true, false);
    }
};

Client.prototype.changeTheme = function( IN_theme_name)
{
    var L_this = this;
    this._loadThemeCSS(
        IN_theme_name,
        function( IN_resource)
        {
            if (IN_resource) {
                L_this._fq_client_manager.changeThemeForAllClient( IN_theme_name);
                $( '#css-main_app').html( IN_resource['main_app']);
                $( '#css-app').html( IN_resource['app']);
                $( '#css-jquery_ui').html( IN_resource['jquery_ui']);
                $( 'body').css( 'visibility', 'visible');

                setTimeout(
                    function()
                    {
                        L_this._refreshTabTicks();
                    }
                );

                $( '#iframe_consultor_msg').attr( 'src', 'http://122.152.162.81:8080/cfdcreativeboview/report/html/brokerinfo.html?css=' + IN_theme_name);
                L_this._theme_name = IN_theme_name;
            }
        }
    );
};

window.onload = function()
{
    var L_client = new Client();
    L_client.init();
};

/*
 * 取得滑鼠游標的絕對位置。(for contextmenus)
 */
function getAbsoluteCursorPositionFromEvent( event)
{
    var currentTarget = event['currentTarget'];
    var targetDocument = currentTarget.ownerDocument;
    var targetWindow = targetDocument.defaultView || targetDocument.parentWindow;
    var targetIFrame = targetWindow.frameElement;
    if (targetIFrame) {
        var targetIFrameRect = targetIFrame.getBoundingClientRect();
        return {
            'x': targetIFrameRect.left + event.clientX,
            'y': targetIFrameRect.top + event.clientY
        };
    }
    else {
        return {
            'x': event.clientX,
            'y': event.clientY
        };
    }
}/**
 * Created by user on 2015/5/29.
 */
