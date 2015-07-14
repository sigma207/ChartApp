/**
 * Created by user on 2015/6/9.
 */
var CanvasTable = {
    BASE_LAYER_INDEX: 0,//VALUE_FLOAT_BACKGROUND_INDEX=0
    VALUE_LAYER_INDEX: 1,
    HEADER_LAYER_INDEX: 2,
    MOUSE_LAYER_INDEX: 3,

    VALUE_FLOAT_LAYER_INDEX: 1,
    VALUE_STATIONARY_BACKGROUND_INDEX: 2,
    VALUE_STATIONARY_LAYER_INDEX: 3,
    HEADER_FLOAT_LAYER_INDEX: 4,
    HEADER_STATIONARY_LAYER_INDEX: 5,
    STATIONARY_MOUSE_LAYER_INDEX: 6,
    createNew: function (canvas) {
        var table = DataSourceRenderer.createNew();
        //var ctx = canvas.getContext("2d");
        table.canvas = canvas;
        table.initLayer = false;
        table.animationId = undefined;
        table.sortable = true;
        table.reCalculateContent = true;
        table.reCalculateHeader = true;
        table.reRenderHeader = true;
        table.reRenderVerticalScroll = true;
        table.columns = [];
        table.columnSize = 0;
        table.columnsWidth = 0;
        table.rowHeight = 0;
        table.rowMiddle = 0;
        table.headerHeight = 0;
        table.headerMiddle = 0;
        table.layerManager = LayerManager.createNew();
        table.layerManager.addBaseLayer(canvas);
        table.renderRowIndex = -1;
        table.renderRowMap = {};
        table.renderRowMapSize = 0;
        table.renderRowList = [];
        table.useVerticalScroll = false;
        table.useHorizontalScroll = false;
        table.contentHeight = 0;
        table.rowStartIndex = 0;
        table.verticalScrollWidth = 15;
        table.verticalScrollHeight = 0;
        table.verticalScrollX = 0;
        table.verticalScrollY = 0;
        table.canUseContentHeight = 0;
        table.canUseContentWidth = 0;
        table.horizontalLockCount = 0;
        table.horizontalScrollWidth = 0;
        table.horizontalScrollHeight = 15;
        table.horizontalScrollX = 0;
        table.horizontalScrollY = 0;
        table.lockColumnCount = 0;
        table.lockColumnsWidth = 0;

        table.addLayer = function () {
            if (table.lockColumnCount == 0) {
                table.layerManager.addLayer("tableValueLayer");
                table.layerManager.addLayer("tableHeaderLayer");
                table.layerManager.addLayer("tableMouseLayer");
                table.mouse = CanvasTableMouse.createNew(table, table.layerManager.getLayer(CanvasTable.MOUSE_LAYER_INDEX));
            } else {
                //table.layerManager.addLayer("tableValueFloatBackgroundLayer");
                table.layerManager.addLayer("tableValueFloatLayer");
                table.layerManager.addLayer("tableValueStationaryBackgroundLayer");
                table.layerManager.addLayer("tableValueStationaryLayer");
                table.layerManager.addLayer("tableHeaderFloatLayer");
                table.layerManager.addLayer("tableHeaderStationaryLayer");
                table.layerManager.addLayer("tableMouseLayer");
                table.mouse = CanvasTableMouse.createNew(table, table.layerManager.getLayer(CanvasTable.STATIONARY_MOUSE_LAYER_INDEX));
            }
        };

        table.updateTableRowHeight = function (height) {
            table.rowHeight = height;
            table.rowMiddle = table.rowHeight / 2;
        };

        table.updateTableHeaderHeight = function (height) {
            table.headerHeight = height;
            table.headerMiddle = table.headerHeight / 2;
        };

        table.updateLockColumnCount = function (lockColumnCount) {
            table.lockColumnCount = lockColumnCount;
        };

        table.addColumn = function (column) {
            column.index = table.columns.length;
            table.columns.push(column);
            table.columnSize++;
            table.reCalculateHeader = true;
            return column;
        };

        table.stop = function () {
            cancelAnimationFrame(table.animationId);
        };

        table.start = function () {
            table.animationId = requestAnimationFrame(table.render);
        };

        table.setDataSource = function (newData) {
            if (typeof table.animationId !== typeof undefined) {
                table.stop();
            }
            table.data = newData;
            table.updateDataSize();

            //table.calculateColumnsWidth();
            //table.calculate();
            //table.animationId = requestAnimationFrame(table.render);
            table.start();
        };

        table.updateDataSize = function () {
            var orgDataSize = table.dataSize;
            table.dataSize = table.data.length;
            if (orgDataSize != table.dataSize) {
                table.reCalculateContent = true;
                table.reRenderContent = false;
            } else {
                table.reRenderContent = true;
            }
        };

        table.setColumnHeadContentRender = function (renderFunction) {
            var column = undefined;
            for (var i = 0; i < table.columnSize; i++) {
                column = table.columns[i];
                column.renderHeadContent = renderFunction;
            }
        };

        table.setColumnCellContentRender = function (renderFunction) {
            var column = undefined;
            for (var i = 0; i < table.columnSize; i++) {
                column = table.columns[i];
                column.renderCellContent = renderFunction;
            }
        };

        table.renderStroke = function () {
            //var context = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
        };

        table.renderValue = function () {
            //var context = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;
        };

        table.renderHeadRowBackground = function (ctx) {
        };

        table.renderBodyRowBackground = function (ctx, rowData, rowIndex) {
        };

        table.updateSortColumn = function (sortIndex, orderBy) {
            table.clearSortColumn();
            table.columns[sortIndex][Sort.ORDER_BY] = orderBy;
        };

        table.clearSortColumn = function () {
            for (var colIndex = 0; colIndex < table.columnSize; colIndex++) {
                table.columns[colIndex][Sort.ORDER_BY] = undefined;
            }
        };

        table.renderRow = function (rowIndex) {
            //must recalculate row column width change
            //if (table.calculateRowColumnWidth(rowIndex)) {
            //    table.reRenderHeader = true;
            //}

            //要改成在render裡的calculate之後排除不用的rowIndex,這裡只要把rowIndex記錄下來便可
            table.renderRowMap[rowIndex] = 0;
        };

        table.render = function () {
            if (table.reCalculateHeader) {
                table.calculateColumnsWidth();
                table.reCalculateHeader = false;
            }
            if (table.reCalculateContent) {
                table.calculate();
                table.reCalculateContent = false;
            }
            if (table.reRenderHeader) {
                //log("reRenderHeader");
                table.renderHeader();
                table.renderContent();
                if (table.lockColumnsWidth > 0) {
                    table.renderStationaryHeader();
                    table.renderStationaryContent();
                }
                if (table.useVerticalScroll || table.useHorizontalScroll) {
                    table.renderScroll();
                } else {
                    table.clearScroll();
                }

                table.reRenderHeader = false;
                table.reRenderVerticalScroll = false;
                table.reRenderHorizontalScroll = false;
                table.renderRowMap = {};
                //logTimeEnd("reRenderHeader");
            } else if (table.reRenderHorizontalScroll || table.reRenderVerticalScroll) {
                //logTime("renderScroll");
                if (table.reRenderHorizontalScroll) {
                    table.renderHeader();
                }
                if (table.lockColumnsWidth > 0) {
                    table.renderStationaryContent();
                }
                table.renderContent();
                table.renderScroll();
                table.reRenderVerticalScroll = false;
                table.reRenderHorizontalScroll = false;
                table.renderRowMap = {};
                //logTimeEnd("renderScroll");
            } else if (table.reRenderContent) {
                //logTime("reRenderContent");
                if (table.lockColumnsWidth > 0) {
                    table.renderStationaryContent();
                }
                table.renderContent();
                table.reRenderContent = false;
                //logTimeEnd("reRenderContent");
            } else {
                table.renderRowMapSize = 0;
                for (var rowIndex in table.renderRowMap) {
                    if (rowIndex >= table.rowStartIndex && rowIndex <= table.rowEndIndex) {
                        table.renderRowMapSize++;
                        table.renderRowMap[rowIndex] = table.rowStartY + (rowIndex - table.rowStartIndex) * table.rowHeight;
                        //log("rowIndex=%s,table.renderRowMap[rowIndex]=%s",rowIndex,table.renderRowMap[rowIndex]);
                    } else {
                        delete table.renderRowMapSize[rowIndex];
                    }
                }
                if (table.renderRowMapSize > 0) {
                    //logTime("renderRowMapSize");
                    table.clearRowContent();
                    table.renderRowContent();
                    table.renderRowMap = {};
                    //logTimeEnd("renderRowMapSize");
                }
            }
            table.columnHasChange = false;
            table.animationId = requestAnimationFrame(table.render);
        };

        table.renderStationaryHeader = function () {
            table.layerManager.clearLayer(CanvasTable.HEADER_STATIONARY_LAYER_INDEX);
            var ctx = table.layerManager.getLayer(CanvasTable.HEADER_STATIONARY_LAYER_INDEX).ctx;
            table.renderHeadRowBackground(ctx, 0, 0, table.lockColumnsWidth, table.headerHeight);
            var column = undefined;
            for (var colIndex = 0; colIndex < table.lockColumnCount; colIndex++) {
                column = table.columns[colIndex];
                column.renderHeadBackground(ctx);
                column.renderHeadContent(ctx, column.titleX, column);
            }
        };

        table.renderHeader = function () {
            var layerIndex = (table.lockColumnsWidth > 0) ? CanvasTable.HEADER_FLOAT_LAYER_INDEX : CanvasTable.HEADER_LAYER_INDEX;

            table.layerManager.clearLayer(layerIndex);
            var ctx = table.layerManager.getLayer(layerIndex).ctx;
            table.renderHeadRowBackground(ctx, table.lockColumnsWidth, 0, ctx.canvas.width - table.lockColumnsWidth, table.headerHeight);
            var column = undefined;

            for (var colIndex = table.colStartIndex; colIndex <= table.colEndIndex; colIndex++) {
                column = table.columns[colIndex];
                column.renderHeadBackground(ctx);
                column.renderHeadContent(ctx, table.lockColumnsWidth + column.titleX - table.horizontalMoveX, column);
                //log("index=%s,title=%s", colIndex, column.title);
                //log("column.titleX=%s,table.horizontalMoveX=%s",column.titleX,table.horizontalMoveX);
            }
        };

        table.renderStationaryContent = function () {
            var backgroundCtx = table.layerManager.getLayer(CanvasTable.VALUE_STATIONARY_BACKGROUND_INDEX).ctx;
            table.layerManager.clearLayer(CanvasTable.VALUE_STATIONARY_BACKGROUND_INDEX);
            table.layerManager.clearLayer(CanvasTable.VALUE_STATIONARY_LAYER_INDEX);
            var ctx = table.layerManager.getLayer(CanvasTable.VALUE_STATIONARY_LAYER_INDEX).ctx;

            var column = undefined;
            var colIndex, rowIndex, rowData = undefined;
            var y = table.rowStartY;
            var useContentHeight = 0;
            for (rowIndex = table.rowStartIndex; rowIndex <= table.rowEndIndex; rowIndex++) {
                rowData = table.data[rowIndex];
                table.renderBodyRowBackground(backgroundCtx, 0, y, table.lockColumnsWidth, table.rowHeight, rowData, rowIndex);
                for (colIndex = 0; colIndex < table.lockColumnCount; colIndex++) {
                    column = table.columns[colIndex];
                    column.renderCellContent(ctx, column.x + column.width, y + table.rowMiddle, column, rowData, rowIndex);
                }
                y += table.rowHeight;
                useContentHeight += table.rowHeight;
            }

            while (useContentHeight < table.canUseContentHeight) {
                table.renderBodyRowBackground(backgroundCtx, 0, y, table.lockColumnsWidth, table.rowHeight, undefined, rowIndex);
                //table.renderBodyRowBackground(backgroundCtx, table.lockColumnsWidth, y, backgroundCtx.canvas.width - table.lockColumnsWidth, table.rowHeight, undefined, rowIndex);
                rowIndex++;
                y += table.rowHeight;
                useContentHeight += table.rowHeight;
            }
        };

        table.renderContent = function () {

            var backgroundLayerIndex = CanvasTable.BASE_LAYER_INDEX;
            var backgroundCtx = table.layerManager.getLayer(backgroundLayerIndex).ctx;
            var valueLayerIndex = (table.lockColumnsWidth > 0) ? CanvasTable.VALUE_FLOAT_LAYER_INDEX : CanvasTable.VALUE_LAYER_INDEX;
            var ctx = table.layerManager.getLayer(valueLayerIndex).ctx;
            var colIndex, rowIndex, rowData = undefined, column = undefined;
            var y = table.rowStartY;
            var useContentHeight = 0;

            table.layerManager.clearLayer(backgroundLayerIndex);
            table.layerManager.clearLayer(valueLayerIndex);

            for (rowIndex = table.rowStartIndex; rowIndex <= table.rowEndIndex; rowIndex++) {
                rowData = table.data[rowIndex];
                table.renderBodyRowBackground(backgroundCtx, table.lockColumnsWidth, y, backgroundCtx.canvas.width - table.lockColumnsWidth, table.rowHeight, rowData, rowIndex);

                for (colIndex = table.colStartIndex; colIndex <= table.colEndIndex; colIndex++) {
                    column = table.columns[colIndex];
                    column.renderCellContent(ctx, table.lockColumnsWidth + column.x + column.width - table.horizontalMoveX, y + table.rowMiddle, column, rowData, rowIndex);
                }
                y += table.rowHeight;
                useContentHeight += table.rowHeight;
            }
            //log("useContentHeight="+useContentHeight+",table.canUseContentHeight="+table.canUseContentHeight);
            while (useContentHeight < table.canUseContentHeight) {
                table.renderBodyRowBackground(backgroundCtx, table.lockColumnsWidth, y, backgroundCtx.canvas.width - table.lockColumnsWidth, table.rowHeight, undefined, rowIndex);
                rowIndex++;
                y += table.rowHeight;
                useContentHeight += table.rowHeight;
            }
        };

        table.clearRowContent = function () {
            //var backgroundCtx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var valueCtxList = [];
            if (table.lockColumnsWidth > 0) {
                valueCtxList.push(table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx);
                valueCtxList.push(table.layerManager.getLayer(CanvasTable.VALUE_FLOAT_LAYER_INDEX).ctx);
            } else {
                valueCtxList.push(table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx);
                valueCtxList.push(table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx);
            }
            var y, ctxIndex, ctxSize = valueCtxList.length;
            for (var rowIndex in table.renderRowMap) {
                y = table.renderRowMap[rowIndex];
                for (ctxIndex = 0; ctxIndex < ctxSize; ctxIndex++) {
                    valueCtxList[ctxIndex].clearRect(0, y, canvas.width, table.rowHeight);
                }
            }
        };

        table.renderRowContent = function () {
            var backgroundLayerIndex = CanvasTable.BASE_LAYER_INDEX;
            var backgroundCtx = table.layerManager.getLayer(backgroundLayerIndex).ctx;
            var valueLayerIndex = (table.lockColumnsWidth > 0) ? CanvasTable.VALUE_FLOAT_LAYER_INDEX : CanvasTable.VALUE_LAYER_INDEX;
            var ctx = table.layerManager.getLayer(valueLayerIndex).ctx;
            var y, colIndex, rowIndex, rowData = undefined, column = undefined;

            for (rowIndex in table.renderRowMap) {
                //log("render rowIndex=%s,valueLayerIndex=%s", rowIndex, valueLayerIndex);
                rowData = table.data[rowIndex];
                y = table.renderRowMap[rowIndex];
                table.renderBodyRowBackground(backgroundCtx, table.lockColumnsWidth, y, canvas.width - table.lockColumnsWidth, table.rowHeight, rowData, rowIndex);
                for (colIndex = table.colStartIndex; colIndex <= table.colEndIndex; colIndex++) {
                    column = table.columns[colIndex];
                    column.renderCellContent(ctx, table.lockColumnsWidth + column.x + column.width - table.horizontalMoveX, y + table.rowMiddle, column, rowData, rowIndex);
                }
            }
        };

        table.renderStationaryRowContent = function () {
            var backgroundCtx = table.layerManager.getLayer(CanvasTable.VALUE_STATIONARY_BACKGROUND_INDEX).ctx;
            //table.layerManager.clearLayer(CanvasTable.VALUE_STATIONARY_LAYER_INDEX);
            var ctx = table.layerManager.getLayer(CanvasTable.VALUE_STATIONARY_LAYER_INDEX).ctx;

            var column = undefined;
            var y, colIndex, rowIndex, rowData = undefined;

            for (rowIndex in table.renderRowMap) {
                log("render Stationary rowIndex=%s", rowIndex);
                rowData = table.data[rowIndex];
                y = table.renderRowMap[rowIndex];
                table.renderBodyRowBackground(backgroundCtx, 0, y, table.lockColumnsWidth, table.rowHeight, rowData, rowIndex);
                for (colIndex = 0; colIndex < table.lockColumnCount; colIndex++) {
                    column = table.columns[colIndex];
                    column.renderCellContent(ctx, column.x + column.width, y + table.rowMiddle, column, rowData, rowIndex);
                }
                y += table.rowHeight;
            }
        };

        table.renderScroll = function () {
            var scrollCtx = table.clearScroll();

            if (table.useVerticalScroll) table.renderVerticalScroll(scrollCtx);
            if (table.useHorizontalScroll) table.renderHorizontalScroll(scrollCtx);
            if (table.useVerticalScroll && table.useHorizontalScroll)table.renderScrollCorner(scrollCtx);
        };

        table.clearScroll = function () {
            var scrollIndex = (table.lockColumnsWidth > 0) ? CanvasTable.STATIONARY_MOUSE_LAYER_INDEX : CanvasTable.MOUSE_LAYER_INDEX;
            var scrollCtx = table.layerManager.getLayer(scrollIndex).ctx;
            table.layerManager.clearLayer(scrollIndex);
            return scrollCtx;
        };

        table.renderHorizontalScroll = function (ctx) {
            ctx.save();
            ctx.fillStyle = "#4B4E55";
            ctx.fillRect(0, table.horizontalScrollY, table.horizontalScrollBackgroundWidth, table.horizontalScrollHeight);

            ctx.fillStyle = "#9FA2AA";
            ctx.fillRect(table.horizontalScrollX, table.horizontalScrollY, table.horizontalScrollWidth, table.horizontalScrollHeight);
            ctx.fillStyle = "#3A3C40";
            ctx.fillRect(table.horizontalScrollX + 2, table.horizontalScrollY + 2, table.horizontalScrollWidth - 4, table.horizontalScrollHeight - 4);
            ctx.restore();
        };

        table.renderVerticalScroll = function (ctx) {
            ctx.save();
            ctx.fillStyle = "#4B4E55";
            ctx.fillRect(table.verticalScrollX, table.headerHeight, table.verticalScrollWidth, table.verticalScrollBackgroundHeight);

            ctx.fillStyle = "#9FA2AA";
            ctx.fillRect(table.verticalScrollX, table.verticalScrollTop, table.verticalScrollWidth, table.verticalScrollHeight);
            ctx.fillStyle = "#3A3C40";
            ctx.fillRect(table.verticalScrollX + 2, table.verticalScrollTop + 2, table.verticalScrollWidth - 4, table.verticalScrollHeight - 4);
            ctx.restore();
        };

        table.renderScrollCorner = function (ctx) {
            ctx.save();
            ctx.fillStyle = "#4B4E55";
            ctx.fillRect(table.verticalScrollX, table.horizontalScrollY, table.verticalScrollWidth, table.horizontalScrollHeight);
            ctx.restore();
        };


        table.calculate = function () {
            //logTime("calculate:%s", canvas.id);
            table.calculateContent();
            if (table.columnHasChange) {
                table.fillColumnsWidth();
            }
            table.calculateHorizontalScrollSize();
            table.calculateVerticalScrollSize();
            //logTimeEnd("calculate:%s", canvas.id);
        };

        table.calculateContentHeight = function () {
            //所有資料佔用的高(筆數*行高)
            table.contentHeight = table.dataSize * table.rowHeight;
            //顯示範圍的高(=canvas高-header高-水平捲軸高)
            table.canUseContentHeight = canvas.height - table.headerHeight - ((table.useHorizontalScroll) ? table.horizontalScrollHeight : 0);
            //超過顯示範圍的高(=所有資料佔用的高-顯示範圍的高)
            table.overHeight = table.contentHeight - table.canUseContentHeight;
            if (table.overHeight > 0) {
                table.useVerticalScroll = true;
            }
        };

        table.calculateContentWidth = function () {
            //顯示範圍的寬(=canvas寬-垂直捲軸寬)
            table.canUseContentWidth = canvas.width - ((table.useVerticalScroll) ? table.verticalScrollWidth : 0);
            //超過顯示範圍的寬(=所有欄位寬-顯示範圍的寬)
            table.overWidth = table.columnsWidth - table.canUseContentWidth;
            if (table.overWidth > 0) {
                table.useHorizontalScroll = true;
                table.lockColumnsWidth = table.orgLockColumnWidth;
            } else {
                //如果overWidth沒有>0就不用凍結欄位
                table.lockColumnsWidth = 0;
            }
        };

        /**
         * 計算顯示範圍的寬高
         * 計算2次是因為要先確認是否有使用scroll後要再重算一次(canUseContentHeight會因為有HorizontalScroll而需要重算,canUseContentWidth同理)
         */
        table.calculateContent = function () {
            table.useVerticalScroll = false;
            table.useHorizontalScroll = false;
            table.calculateContentHeight();
            table.calculateContentWidth();
            table.calculateContentHeight();
            table.calculateContentWidth();
            //log("table.useHorizontalScroll=%s", table.useHorizontalScroll);
            //log("table.overHeight=%s", table.overHeight);
            //log("table.canUseContentWidth=%s", table.canUseContentWidth);
            //log("table.canUseContentHeight=%s", table.canUseContentHeight);
            //table.canUseContentHeight = canvas.height - table.rowHeight - ((table.horizontalScrollWidth > 0) ? table.horizontalScrollHeight : 0);
        };

        table.fillColumnsWidth = function () {
            var i, x = 0, column = undefined;
            //var fillTotalWidth = table.columnsWidth - table.orgColumnsWidth;
            var fillTotalWidth = table.canUseContentWidth - table.orgColumnsWidth;
            if (fillTotalWidth > 0) {
                //log("fillTotalWidth=%s", fillTotalWidth);
                table.columnsWidth = 0;
                var tempWidth = fillTotalWidth;
                var avgFillWidth = tempWidth / table.columnSize;

                for (i = 0; i < table.columnSize; i++) {
                    column = table.columns[i];
                    column.x = x;
                    if (avgFillWidth > tempWidth) {
                        column.width = column.orgWidth + tempWidth;
                    } else {
                        column.width = column.orgWidth + avgFillWidth;
                        tempWidth = tempWidth - avgFillWidth;
                    }
                    column.titleX = column.x + (column.width / 2) - (column.titleWidth / 2);
                    x += column.width;
                    table.columnsWidth += column.width;
                }
                //log("table.columnsWidth after fill=%s", table.columnsWidth);
                return true;
            }
            return false;
        };

        table.calculateHorizontalScrollSize = function () {
            if (table.useHorizontalScroll) {
                table.horizontalScrollY = canvas.height - table.horizontalScrollHeight;
                //if (table.overHeight < 0) {
                //    table.horizontalScrollY += table.overHeight;
                //}
                table.horizontalScrollWidth = table.canUseContentWidth * (table.canUseContentWidth / table.columnsWidth);
                table.horizontalScrollMoveRange = table.canUseContentWidth - table.horizontalScrollWidth;
                table.horizontalScrollMoveStep = table.overWidth / table.horizontalScrollMoveRange;
                table.horizontalScrollBackgroundWidth = canvas.width - ((table.useVerticalScroll) ? table.verticalScrollWidth : 0);
            } else {
                table.horizontalScrollWidth = 0;
                table.horizontalScrollBackgroundWidth = 0;
            }
            //log("table.horizontalScrollWidth=%s", table.horizontalScrollWidth);
            table.calculateHorizontalScroll();
        };

        table.calculateVerticalScrollSize = function () {
            if (table.useVerticalScroll) {
                table.verticalScrollX = canvas.width - table.verticalScrollWidth;
                table.verticalScrollHeight = table.canUseContentHeight * (table.canUseContentHeight / table.contentHeight);
                table.verticalScrollMoveRange = table.canUseContentHeight - table.verticalScrollHeight;
                table.verticalScrollMoveStep = table.overHeight / table.verticalScrollMoveRange;
                table.verticalScrollBackgroundHeight = canvas.height - table.headerHeight - ((table.useHorizontalScroll) ? table.horizontalScrollHeight : 0);
            } else {
                table.verticalScrollHeight = 0;
                table.verticalScrollBackgroundHeight = 0;
            }
            table.calculateVerticalScroll();
        };

        table.calculateHorizontalScroll = function () {
            if (table.useHorizontalScroll) {
                //var moveX = table.horizontalScrollX * table.horizontalScrollMoveStep;
                table.horizontalMoveX = table.lockColumnsWidth + table.horizontalScrollX * table.horizontalScrollMoveStep;
                table.colStartX = Math.round(table.horizontalMoveX);
                var column = undefined;
                var colIndex;
                var hasFindStartCol = false;
                table.colEndIndex = -1;
                for (colIndex = 0; colIndex < table.columnSize; colIndex++) {
                    column = table.columns[colIndex];
                    //log("colIndex=%s,table.horizontalMoveX=%s,column.x=%s,column.end", colIndex, table.horizontalMoveX, column.x, column.x + column.width);
                    if (table.horizontalMoveX >= column.x && table.horizontalMoveX <= column.x + column.width) {
                        table.colStartIndex = colIndex;
                        table.colStartX = -table.colStartX;
                        hasFindStartCol = true;
                        //log("hasFindStartCol = true, on colIndex=%s", colIndex);
                    } else {
                        if (!hasFindStartCol) {
                            table.colStartX -= column.width;
                        }
                    }
                    if (hasFindStartCol) {
                        if (table.horizontalMoveX + table.canUseContentWidth < column.x) {
                            table.colEndIndex = colIndex - 1;
                            break;
                        }
                    }
                }
                if (table.colEndIndex == -1) {
                    table.colEndIndex = table.columnSize - 1;
                }

                table.reRenderHorizontalScroll = true;
            } else {
                table.horizontalMoveX = 0;
                table.colStartX = 0;
                table.colStartIndex = 0;
                table.colEndIndex = table.columnSize - 1;
            }
            table.horizontalScrollLeft = table.horizontalScrollX;
            table.horizontalScrollRight = table.horizontalScrollLeft + table.horizontalScrollWidth;
            //log("table.horizontalMoveX=%s", table.horizontalMoveX);
            //log("table.colStartIndex=%s", table.colStartIndex);
            //log("table.colEndIndex=%s", table.colEndIndex);
        };

        table.calculateVerticalScroll = function () {
            if (table.verticalScrollHeight > 0) {
                table.verticalMoveY = table.verticalScrollY * table.verticalScrollMoveStep;
                table.rowStartY = Math.round(table.headerHeight - (table.verticalMoveY % table.rowHeight));//y要4捨5入，不然會因為小數點計算時而有空白產生
                table.rowStartIndex = Math.floor(table.verticalMoveY / table.rowHeight);

                var count = Math.ceil((table.canUseContentHeight + (table.headerHeight - table.rowStartY)) / table.rowHeight);
                table.rowEndIndex = table.rowStartIndex + count - 1;
                table.reRenderVerticalScroll = true;
                //log("table.verticalScrollY=%s,rowStartY=%s,count=%s", table.verticalScrollY, table.rowStartY, count);
            } else {
                table.verticalMoveY = 0;
                table.rowStartY = table.headerHeight;
                table.rowStartIndex = 0;
                table.rowEndIndex = table.dataSize - 1;
            }
            table.verticalScrollTop = table.verticalScrollY + table.headerHeight;
            table.verticalScrollBottom = table.verticalScrollTop + table.verticalScrollHeight;
        };

        table.calculateRowColumnWidth = function (rowIndex) {
            var ctx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var column = undefined;
            var colIndex, contentWidth, maxWidthHasChange, rowMakeWidthChange = false;
            for (colIndex = 0; colIndex < table.columnSize; colIndex++) {
                column = table.columns[colIndex];
                contentWidth = ctx.measureText(column.getValue(table.data[rowIndex])).width;
                maxWidthHasChange = column.calculateMaxWidth(contentWidth, rowIndex);
                if (maxWidthHasChange) {
                    rowMakeWidthChange = true;
                }
            }
            return rowMakeWidthChange;
        };

        table.calculateColumnsWidth = function () {
            //logTime("table.calculateColumnWidth()");
            var ctx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var column = undefined;
            var colIndex, rowIndex, contentWidth, x = 0;
            table.columnsWidth = 0;
            table.orgColumnsWidth = 0;
            table.orgLockColumnWidth = 0;

            for (colIndex = 0; colIndex < table.columnSize; colIndex++) {
                column = table.columns[colIndex];
                column.titleWidth = ctx.measureText(column.title).width;
                column.contentMaxWidth = column.titleWidth;
                column.contentMaxWidthList.push(-1);
                for (rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {//以後要改成只算有顯示的區塊就好,不然資料筆數太多會算太久
                    contentWidth = ctx.measureText(column.getValue(table.data[rowIndex])).width;
                    column.calculateMaxWidth(contentWidth, rowIndex);
                }

                column.x = x;
                column.orgWidth = column.paddingLeft + column.contentMaxWidth + column.paddingRight;
                column.width = column.orgWidth;
                column.titleX = column.x + (column.width / 2) - (column.titleWidth / 2);
                x += column.width;
                table.orgColumnsWidth += column.orgWidth;

                if (colIndex < table.lockColumnCount) {//if lockColumnCount bigger than zero,
                    table.orgLockColumnWidth += column.width;
                }
                //log("column.x=%s,column.width=%s", column.x, column.width);
            }
            table.columnsWidth = table.orgColumnsWidth;
            //log("table.columnsWidth=%s", table.columnsWidth);
            table.reCalculateContent = true;
            table.reRenderHeader = true;
            table.columnHasChange = true;
            //logTimeEnd("table.calculateColumnWidth()");
        };

        table.mouseWheel = function (delta) {
            if (table.verticalScrollHeight > 0) {
                table.addVerticalScrollY(-delta);
            }
        };

        table.addHorizontalScrollX = function (delta) {
            var x = table.horizontalScrollX + delta;
            if (x < 0) {
                x = 0;
            } else if (x > table.horizontalScrollMoveRange) {
                x = table.horizontalScrollMoveRange;
            }
            if (x != table.horizontalScrollX) {
                table.horizontalScrollX = x;
                table.calculateHorizontalScroll();//table.reRenderScroll = true;
            }
        };

        table.addVerticalScrollY = function (delta) {
            var y = table.verticalScrollY + delta;
            if (y < 0) {
                y = 0;
            } else if (y > table.verticalScrollMoveRange) {
                y = table.verticalScrollMoveRange;
            }
            if (y != table.verticalScrollY) {
                table.verticalScrollY = y;
                table.calculateVerticalScroll();
            }
        };

        table.sortColumnClick = function (colIndex) {
            if (table.dataSize > 0) {
                table.sortOrderBy(colIndex, true);
            }
        };

        table.sortOrderBy = function (sortIndex, changeOrderBy) {
            var column = table.columns[sortIndex];
            var currentOrderBy = column[Sort.ORDER_BY];
            //log("sortOrderBy=%s,currentOrderBy=%s", sortIndex, currentOrderBy);
            currentOrderBy = (currentOrderBy == Sort.ASC || typeof currentOrderBy === typeof undefined) ? Sort.ASC : Sort.DESC;
            if (changeOrderBy) {
                currentOrderBy = (currentOrderBy == Sort.ASC) ? Sort.DESC : Sort.ASC;
            }
            table.dsr.sortData(sortIndex, column.field, currentOrderBy, column.type);
        };

        table.rowClick = function (rowIndex) {
            var rowData = table.data[rowIndex];
            $(document).trigger("rowClick", [canvas.id, rowData]);
        };

        table.resizeCall = function () {
            table.reCalculateHeader = true;
        };

        table.updateTableRowHeight(25);
        table.updateTableHeaderHeight(25);

        table.layerManager.resizeCall = table.resizeCall;

        return table;
    }
};

var CanvasTableMouse = {
    tableMouseList: [],
    tableMouseSize: 0,
    lastX: 0,
    lastY: 0,
    add: function (tableMouse) {
        CanvasTableMouse.tableMouseList.push(tableMouse);
        CanvasTableMouse.tableMouseSize++;
        if (CanvasTableMouse.tableMouseSize == 1) {
            CanvasTableMouse.init();
        }
    },
    init: function () {
        $(document).mousemove(CanvasTableMouse.onMouseMove);
    },
    /**
     * 讓滑鼠就算移動到canvas外,也能保持table的scroll能繼續移動
     * @param e
     */
    onMouseMove: function (e) {
        var tm = undefined;
        var temp = undefined;
        var lastTemp = undefined;
        for (var i = 0; i < CanvasTableMouse.tableMouseSize; i++) {
            tm = CanvasTableMouse.tableMouseList[i];
            var cc = $(tm.table.canvas);
            if (tm.verticalScrollerDragging) {
                //檢查有在canvas範圍外才捲動
                if (e.clientX < cc.offset().left || e.clientX > cc.offset().left + parseFloat(cc.attr("width").replace("px", ""))) {
                    temp = tm.mouse.windowToCanvas(e.clientX, e.clientY);
                    lastTemp = tm.mouse.windowToCanvas(CanvasTableMouse.lastX, CanvasTableMouse.lastY);
                    tm.verticalScroll(temp.y, lastTemp.y);
                }
                break;
            } else if (tm.horizontalScrollerDragging) {
                temp = tm.mouse.windowToCanvas(e.clientX, e.clientY);
                //檢查有在canvas範圍外才捲動
                if ( e.clientY < cc.offset().top ||  e.clientY > cc.offset().top + parseFloat(cc.attr("height").replace("px", ""))) {
                    temp = tm.mouse.windowToCanvas(e.clientX, e.clientY);
                    lastTemp = tm.mouse.windowToCanvas(CanvasTableMouse.lastX, CanvasTableMouse.lastY);
                    tm.horizontalScroll(temp.x, lastTemp.x);
                }
                break;
            }
        }
        CanvasTableMouse.lastX = e.clientX;
        CanvasTableMouse.lastY = e.clientY;
    },
    createNew: function (table, layer) {
        var tableMouse = {};
        tableMouse.table = table;
        tableMouse.layer = layer;
        tableMouse.mouse = CanvasMouse.createNew(tableMouse.layer.canvas);
        tableMouse.verticalScrollerDragging = false;
        tableMouse.horizontalScrollerDragging = false;
        CanvasTableMouse.add(tableMouse);

        tableMouse.reset = function () {
            tableMouse.mouseColumnIndex = -1;
            tableMouse.mouseRowIndex = -1;
            tableMouse.mouseInHead = false;
        };

        tableMouse.verticalScroll = function (y, lastY) {
            if (y > lastY) {
                table.addVerticalScrollY(y - lastY);
            } else if (y < lastY) {
                table.addVerticalScrollY(y - lastY);
            }
        };

        tableMouse.horizontalScroll = function (x, lastX) {
            if (x > lastX) {
                table.addHorizontalScrollX(x - lastX);
            } else if (x < lastX) {
                table.addHorizontalScrollX(x - lastX);
            }
        };

        tableMouse.mouseMove = function () {
            if (tableMouse.verticalScrollerDragging) {
                tableMouse.verticalScroll(tableMouse.mouse.y , tableMouse.mouse.lastY);
            } else if (tableMouse.horizontalScrollerDragging) {
                tableMouse.horizontalScroll(tableMouse.mouse.x , tableMouse.mouse.lastX);
            } else {
                tableMouse.onVerticalScroller = false;
                tableMouse.aboveVerticalScroller = false;
                tableMouse.underVerticalScroller = false;
                tableMouse.onHorizontalScroller = false;
                tableMouse.leftHorizontalScroller = false;//right side
                tableMouse.rightHorizontalScroller = false;//left side
                tableMouse.mouseInHead = !(tableMouse.mouse.y > table.headerHeight);
                if (tableMouse.mouse.x > table.canUseContentWidth) {
                    tableMouse.mouseColumnIndex = -1;
                    tableMouse.inColumnArea = false;

                    if (!tableMouse.mouseInHead) {
                        if (tableMouse.mouse.y >= table.verticalScrollTop && tableMouse.mouse.y <= table.verticalScrollBottom) {
                            tableMouse.onVerticalScroller = true;
                        } else if (tableMouse.mouse.y < table.verticalScrollTop) {
                            tableMouse.aboveVerticalScroller = true;
                        } else if (tableMouse.mouse.y > table.verticalScrollBottom) {
                            if (table.useHorizontalScroll) {
                                if (tableMouse.mouse.y < table.horizontalScrollY)tableMouse.underVerticalScroller = true;
                            } else {
                                tableMouse.underVerticalScroller = true;
                            }
                        }
                    }
                } else {
                    if (table.horizontalScrollWidth > 0 && tableMouse.mouse.y > table.horizontalScrollY) {
                        if (tableMouse.mouse.x >= table.horizontalScrollLeft && tableMouse.mouse.x <= table.horizontalScrollRight) {
                            tableMouse.onHorizontalScroller = true;
                        } else if (tableMouse.mouse.x < table.horizontalScrollLeft) {
                            tableMouse.leftHorizontalScroller = true;
                        } else if (tableMouse.mouse.x > table.horizontalScrollRight) {
                            tableMouse.rightHorizontalScroller = true;
                        }
                    } else {
                        //有空可以改用2分法
                        for (var colIndex = table.columnSize - 1; colIndex >= 0; colIndex--) {
                            if (tableMouse.mouse.x > table.columns[colIndex].x) {
                                tableMouse.mouseColumnIndex = colIndex;
                                break;
                            }
                        }
                    }

                    tableMouse.inColumnArea = true;
                }
                if (!tableMouse.mouseInHead) {
                    //tableMouse.mouseRowIndex = Math.floor((tableMouse.mouse.y - table.rowHeight) / table.rowHeight);
                    if (table.horizontalScrollWidth > 0) {
                        if (tableMouse.mouse.y < table.horizontalScrollY) {
                            tableMouse.mouseRowIndex = table.rowStartIndex + Math.floor((tableMouse.mouse.y - table.rowStartY) / table.rowHeight);
                        } else {
                            tableMouse.mouseRowIndex = -1;
                        }
                    } else {
                        tableMouse.mouseRowIndex = table.rowStartIndex + Math.floor((tableMouse.mouse.y - table.rowStartY) / table.rowHeight);
                    }
                }

                if (tableMouse.mouseInHead && table.sortable) {
                    document.body.style.cursor = 'pointer';
                } else {
                    document.body.style.cursor = 'default';
                }
            }

        };

        tableMouse.mouseDown = function () {
            if (tableMouse.inColumnArea) {
                if (tableMouse.mouseInHead) {
                    if (table.sortable)table.sortColumnClick(tableMouse.mouseColumnIndex);
                } else {
                    if (tableMouse.mouseRowIndex != -1) {
                        table.rowClick(tableMouse.mouseRowIndex);
                    } else {
                        if (tableMouse.onHorizontalScroller) {
                            tableMouse.horizontalScrollerDragging = true;
                        } else if (tableMouse.leftHorizontalScroller) {

                            table.addHorizontalScrollX(tableMouse.mouse.x - table.horizontalScrollLeft);
                        } else if (tableMouse.rightHorizontalScroller) {
                            table.addHorizontalScrollX(tableMouse.mouse.x - table.horizontalScrollRight);
                        }
                    }
                }
            } else {//verticalScroller area
                if (tableMouse.mouseInHead) {
                    //do not thing
                } else {
                    if (tableMouse.onVerticalScroller) {
                        tableMouse.verticalScrollerDragging = true;
                    } else if (tableMouse.aboveVerticalScroller) {
                        table.addVerticalScrollY(tableMouse.mouse.y - table.verticalScrollTop);
                    } else if (tableMouse.underVerticalScroller) {
                        table.addVerticalScrollY(tableMouse.mouse.y - table.verticalScrollBottom);
                    }
                }
            }
        };

        tableMouse.mouseUp = function () {
            if (tableMouse.verticalScrollerDragging) {
                tableMouse.verticalScrollerDragging = false;
            }
            if (tableMouse.horizontalScrollerDragging) {
                tableMouse.horizontalScrollerDragging = false;
            }
        };

        tableMouse.mouseOver = function () {
            tableMouse.reset();
        };

        tableMouse.mouseOut = function () {
            tableMouse.reset();
            document.body.style.cursor = 'default';
        };

        tableMouse.mouseWheel = function (delta) {
            table.mouseWheel(delta);
        };

        tableMouse.reset();

        $(document).mouseup(tableMouse.mouseUp);//在canvas範圍外放開滑鼠
        tableMouse.mouse.onOverCall = tableMouse.mouseOver;
        tableMouse.mouse.onMoveCall = tableMouse.mouseMove;
        tableMouse.mouse.onDownCall = tableMouse.mouseDown;
        tableMouse.mouse.onUpCall = tableMouse.mouseUp;
        tableMouse.mouse.onOutCall = tableMouse.mouseOut;
        tableMouse.mouse.onWheelCall = tableMouse.mouseWheel;

        return tableMouse;
    }
};

var CanvasColumn = {
    TEXT_FILL_STYLE: "textFillStyle",
    TEXT_FILL_STYLE_FUNCTION: "textFillStyleFunction",
    createNew: function (field, title, attribute) {
        var column = {};
        column.field = field;
        column.title = title;
        column.index = -1;
        column.orgWidth = 0;
        column.width = 0;
        column.titleWidth = 0;
        column.titleWidthRearrangement = true;
        column.contentMaxWidth = 0;
        column.contentMaxWidthList = [];
        column.contentSecondWidth = 0;
        column.contentSecondWidthList = [];
        column.x = 0;
        column.paddingRight = 5;
        column.paddingLeft = 5;
        column.type = ColumnType.TEXT;

        if (typeof attribute !== typeof undefined) {
            if (typeof attribute[CanvasColumn.TEXT_FILL_STYLE] !== typeof undefined) {
                column[CanvasColumn.TEXT_FILL_STYLE] = attribute[CanvasColumn.TEXT_FILL_STYLE];
            } else {
                column[CanvasColumn.TEXT_FILL_STYLE] = "black";
            }
            column[CanvasColumn.TEXT_FILL_STYLE_FUNCTION] = attribute[CanvasColumn.TEXT_FILL_STYLE_FUNCTION];
        }

        column.getFillStyle = function (rowData) {
            if (typeof column[CanvasColumn.TEXT_FILL_STYLE_FUNCTION] !== typeof undefined) {
                return column[CanvasColumn.TEXT_FILL_STYLE_FUNCTION].call(column, rowData);
            } else {
                return column[CanvasColumn.TEXT_FILL_STYLE];
            }
        };

        column.getValue = function (rowData) {
            return rowData[column.field];
        };

        column.renderHeadBackground = function (ctx) {
        };

        column.renderCellBackground = function (ctx, rowData, rowIndex) {
        };

        column.renderHeadStroke = function (ctx) {
        };

        column.renderCellStroke = function (ctx, rowData, rowIndex) {
        };

        column.renderHeadContent = function (ctx) {
        };

        column.renderCellContent = function () {

        };

        column.calculateMaxWidth = function (contentWidth, rowIndex) {
            var maxWidthHasChange = false;
            if (contentWidth > column.contentMaxWidth) {
                column.contentSecondWidth = column.contentMaxWidth;
                column.contentSecondWidthList = column.contentMaxWidthList.slice(0);
                column.contentMaxWidth = contentWidth;
                column.contentMaxWidthList = [];
                column.contentMaxWidthList.push(rowIndex);
                maxWidthHasChange = true;
            } else if (contentWidth == column.contentMaxWidth) {
                column.contentMaxWidthList.push(rowIndex);
            } else if (contentWidth < column.contentMaxWidth) {
                if (column.contentMaxWidthList.length == 1 && column.contentMaxWidthList[0] == rowIndex) {
                    if (contentWidth > column.contentSecondWidth) {
                        column.contentMaxWidth = contentWidth;
                        column.contentMaxWidthList = [];
                        column.contentMaxWidthList.push(rowIndex);
                    } else {
                        column.contentMaxWidth = column.contentSecondWidth;
                        column.contentMaxWidthList = column.contentSecondWidthList.slice(0);
                        column.contentSecondWidth = contentWidth;
                        column.contentSecondWidth = [];
                        column.contentSecondWidth.push(rowIndex);
                    }
                    maxWidthHasChange = true;
                } else {
                    if (contentWidth > column.contentSecondWidth) {
                        column.contentSecondWidth = column.contentMaxWidth;
                        column.contentSecondWidthList = [];
                        column.contentSecondWidthList.push(rowIndex);
                    } else if (contentWidth == column.contentSecondWidth) {
                        column.contentSecondWidthList.push(rowIndex);
                    }
                }
            }

            return maxWidthHasChange;
        };

        return column;
    }
};

var CanvasNumberColumn = {
    DECIMAL: "decimal",
    PERCENT: "percent",
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = ColumnType.NUMBER;

        column.getValue = function (rowData) {
            var value = (column[CanvasNumberColumn.PERCENT]) ? rowData[column.field] / 100 : rowData[column.field];
            if (column.format == "") {
                var format = JsonTool.numeralFormat(rowData[column[CanvasNumberColumn.DECIMAL]]);
                return numeral(value).format(format);
            } else {
                return numeral(value).format(column.format);
            }
        };

        column.updateDecimal = function (decimal) {
            column.decimal = decimal;
            column.format = "";
            if (JsonTool.isInt(decimal)) {
                column.format = JsonTool.numeralFormat(decimal);
                if (typeof column[CanvasNumberColumn.PERCENT] !== typeof undefined && column[CanvasNumberColumn.PERCENT] == true) {
                    column.type = ColumnType.RATE;
                    column.format += "%";
                }
            }
        };

        if (typeof attribute !== typeof undefined) {
            column[CanvasNumberColumn.PERCENT] = attribute[CanvasNumberColumn.PERCENT];
            var decimal = attribute[CanvasNumberColumn.DECIMAL];
            if (typeof decimal !== typeof undefined) {
                column.updateDecimal(decimal);
            }
        }
        return column;
    }
};

var CanvasDateColumn = {
    ORG_FORMAT: "orgFormat",
    DISPLAY_FORMAT: "displayFormat",
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = ColumnType.DATE;
        if (typeof attribute !== typeof undefined) {
            column[CanvasDateColumn.ORG_FORMAT] = attribute[CanvasDateColumn.ORG_FORMAT];
            column[CanvasDateColumn.DISPLAY_FORMAT] = attribute[CanvasDateColumn.DISPLAY_FORMAT];
        }

        column.getValue = function (rowData) {
            return moment(rowData[column.field], column[CanvasDateColumn.ORG_FORMAT]).format(column[CanvasDateColumn.DISPLAY_FORMAT]);
        };
        return column;
    }
};

var CanvasTimeColumn = {
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = ColumnType.TIME;
        return column;
    }
};