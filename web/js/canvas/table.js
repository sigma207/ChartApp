/**
 * Created by user on 2015/6/9.
 */
var CanvasTable = {
    BASE_LAYER_INDEX: 0,
    VALUE_LAYER_INDEX: 1,
    HEADER_LAYER_INDEX: 2,
    MOUSE_LAYER_INDEX: 3,
    createNew: function (canvas) {
        var table = DataSourceRenderer.createNew();
        //var ctx = canvas.getContext("2d");
        table.canvas = canvas;
        table.animationId = undefined;
        table.reRenderHeader = true;
        table.reRenderContent = true;
        table.reRenderVerticalScroll = true;
        table.columns = [];
        table.columnSize = 0;
        table.columnsWidth = 0;
        table.rowHeight = 25;
        table.rowMiddle = table.rowHeight / 2;
        table.layerManager = LayerManager.createNew();
        table.layerManager.addBaseLayer(canvas);
        table.layerManager.addLayer("tableValueLayer");
        table.layerManager.addLayer("tableHeaderLayer");
        table.layerManager.addLayer("tableMouseLayer");
        table.mouse = CanvasTableMouse.createNew(table);
        table.renderRowIndex = -1;
        table.renderRowMap = {};
        table.renderRowList = [];
        table.contentHeight = 0;
        table.rowStartIndex = 0;
        table.verticalScrollWidth = 15;
        table.verticalScrollHeight = 0;
        table.verticalScrollX = 0;
        table.verticalScrollY = 0;
        table.columnCanUseWidth = 0;
        table.horizontalLockCount = 0;
        table.horizontalScrollWidth = 0;
        table.horizontalScrollHeight = 15;
        table.horizontalScrollX = 0;
        table.horizontalScrollY = 0;

        table.addColumn = function (column) {
            column.index = table.columns.length;
            table.columns.push(column);
            table.columnSize++;
        };

        table.stop = function () {
            cancelAnimationFrame(table.animationId);
        };

        table.setDataSource = function (newData) {
            table.data = newData;
            table.dataSize = table.data.length;
            table.reRenderHeader = true;
            table.reRenderContent = true;
            table.reRenderVerticalScroll = true;
            table.calculate();
            if (typeof table.animationId !== typeof undefined) {
                table.stop();
            }
            table.animationId = requestAnimationFrame(table.render);
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
            if (table.calculateRowColumnWidth(rowIndex)) {
                table.reRenderHeader = true;
            }

            if (rowIndex >= table.rowStartIndex && rowIndex <= table.rowEndIndex) {
                table.renderRowMap[rowIndex] = table.rowStartY + (rowIndex - table.rowStartIndex) * table.rowHeight;
                table.reRenderContent = true;
            }
        };

        table.render = function () {
            if (table.reRenderHeader) {
                logTime("table.renderHeader()");
                table.renderHeader();
                table.reRenderHeader = false;
                logTimeEnd("table.renderHeader()");
            }

            if (table.reRenderHeader || table.reRenderHorizontalScroll || table.reRenderVerticalScroll || table.reRenderContent) {
                logTime("table.renderContent()");
                table.renderContent();
                logTimeEnd("table.renderContent()");
                table.reRenderContent = false;
                table.renderRowMap = {};
            }

            if (table.reRenderVerticalScroll || table.reRenderHorizontalScroll) {
                table.layerManager.clearLayer(CanvasTable.MOUSE_LAYER_INDEX);
                //if (table.reRenderVerticalScroll) {
                table.renderVerticalScroll(table.layerManager.getLayer(CanvasTable.MOUSE_LAYER_INDEX).ctx);
                table.reRenderVerticalScroll = false;
                //}

                //if (table.reRenderHorizontalScroll) {
                table.renderHorizontalScroll(table.layerManager.getLayer(CanvasTable.MOUSE_LAYER_INDEX).ctx);
                table.reRenderHorizontalScroll = false;
                //}
            }

            table.animationId = requestAnimationFrame(table.render);

        };

        table.renderHeader = function () {
            table.layerManager.clearLayer(CanvasTable.HEADER_LAYER_INDEX);
            var ctx = table.layerManager.getLayer(CanvasTable.HEADER_LAYER_INDEX).ctx;
            table.renderHeadRowBackground(ctx);
            var column = undefined;
            for (var colIndex = table.colStartIndex; colIndex <= table.colEndIndex; colIndex++) {
                column = table.columns[colIndex];
                column.renderHeadBackground(ctx);
                column.renderHeadContent(ctx, column.titleX - table.horizontalMoveX, column);
                //log("index=%s,title=%s", colIndex, column.title);
                //log("column.titleX=%s,table.horizontalMoveX=%s",column.titleX,table.horizontalMoveX);
            }
        };

        table.renderContent = function () {
            var backgroundCtx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var ctx = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;
            var column = undefined;
            var colIndex, rowIndex;
            var y = table.rowStartY;
            var rowData = undefined;

            if (table.reRenderHeader || table.reRenderVerticalScroll || JsonTool.length(table.renderRowMap) == 0) {
                table.layerManager.clearLayer(CanvasTable.BASE_LAYER_INDEX);
                table.layerManager.clearLayer(CanvasTable.VALUE_LAYER_INDEX);
                for (rowIndex = table.rowStartIndex; rowIndex <= table.rowEndIndex; rowIndex++) {
                    rowData = table.data[rowIndex];
                    table.renderBodyRowBackground(backgroundCtx, y, rowData, rowIndex);

                    for (colIndex = table.colStartIndex; colIndex <= table.colEndIndex; colIndex++) {
                        column = table.columns[colIndex];
                        column.renderCellContent(ctx, column.x + column.width - table.horizontalMoveX, y + table.rowMiddle, column, rowData, rowIndex);
                    }
                    y += table.rowHeight;
                }
            } else {
                for (rowIndex in table.renderRowMap) {
                    log("render rowIndex=%s", rowIndex);
                    rowData = table.data[rowIndex];
                    y = table.renderRowMap[rowIndex];
                    backgroundCtx.clearRect(0, y, ctx.canvas.width, table.rowHeight);
                    ctx.clearRect(0, y, ctx.canvas.width, table.rowHeight);
                    table.renderBodyRowBackground(backgroundCtx, y, rowData, rowIndex);
                    for (colIndex = table.colStartIndex; colIndex <= table.colEndIndex; colIndex++) {
                        column = table.columns[colIndex];
                        column.renderCellContent(ctx, column.x + column.width - table.horizontalMoveX, y + table.rowMiddle, column, rowData, rowIndex);
                    }
                }
            }
        };

        table.renderHorizontalScroll = function (ctx) {
            ctx.save();
            ctx.fillStyle = "blue";
            ctx.fillRect(table.horizontalScrollX, table.horizontalScrollY, table.horizontalScrollWidth, table.horizontalScrollHeight);
            ctx.restore();
        };

        table.renderVerticalScroll = function (ctx) {
            ctx.save();
            ctx.fillStyle = "blue";
            ctx.fillRect(table.verticalScrollX, table.verticalScrollY + table.rowHeight, table.verticalScrollWidth, table.verticalScrollHeight);
            ctx.restore();
        };

        table.calculate = function () {
            table.calculateColumn();
            table.calculateHorizontalScrollSize();
            table.calculateVerticalScrollSize();
        };

        table.calculateColumn = function () {
            table.calculateColumnsWidth();
            table.allocateColumnsWidth();
        };

        table.calculateBase = function () {
            table.contentHeight = 0;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                table.contentHeight += table.rowHeight;
                //log("rowIndex=%s",rowIndex);
            }
            //scroll Height
            //table.canUseContentHeight = canvas.height - table.rowHeight;
            table.canUseContentHeight = canvas.height - table.rowHeight - ((table.horizontalScrollWidth > 0) ? table.horizontalScrollHeight : 0);
            table.columnCanUseWidth = canvas.width - table.verticalScrollWidth;

        };

        table.calculateHorizontalScrollSize = function () {
            var overWidth = table.columnsWidth - table.columnCanUseWidth;
            log("table.columnsWidth=%s", table.columnsWidth);
            log("table.columnCanUseWidth=%s", table.columnCanUseWidth);
            log("overWidth=%s", overWidth);
            if (overWidth > 0) {
                table.horizontalScrollX = 0;
                table.horizontalScrollY = canvas.height - table.horizontalScrollHeight;

                table.horizontalScrollWidth = table.columnCanUseWidth * (table.columnCanUseWidth / table.columnsWidth);
                table.horizontalScrollMoveRange = table.columnCanUseWidth - table.horizontalScrollWidth;
                table.horizontalScrollMoveStep = overWidth / table.horizontalScrollMoveRange;

                log("table.horizontalScrollWidth=%s", table.horizontalScrollWidth);
                log("table.horizontalScrollMoveRange=%s", table.horizontalScrollMoveRange);
                log("table.horizontalScrollMoveStep=%s", table.horizontalScrollMoveStep);
            } else {
                table.horizontalScrollWidth = 0;
            }
            table.calculateHorizontalScroll();
        };

        table.calculateHorizontalScroll = function () {
            if (table.horizontalScrollWidth > 0) {
                //var moveX = table.horizontalScrollX * table.horizontalScrollMoveStep;
                table.horizontalMoveX = table.horizontalScrollX * table.horizontalScrollMoveStep;
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
                        if(table.horizontalMoveX + table.columnCanUseWidth < column.x){
                            table.colEndIndex = colIndex-1;
                            break;
                        }
                    }
                }
                if(table.colEndIndex==-1){
                    table.colEndIndex = table.columnSize - 1;
                }

                table.reRenderHeader = true;
                table.reRenderHorizontalScroll = true;
                table.reRenderContent = true;
            } else {
                table.colStartX = 0;
                table.colStartIndex = 0;

                table.colEndIndex = table.columnSize - 1;
            }
            //log("table.horizontalScrollX=%s", table.horizontalScrollX);
            //log("table.horizontalMoveX=%s", table.horizontalMoveX);
            //log("table.horizontalMoveX+table.columnCanUseWidth=%s", table.horizontalMoveX + table.columnCanUseWidth);
            //log("table.colStartX=%s,table.colStartIndex=%s,table.colEndIndex=%s", table.colStartX, table.colStartIndex, table.colEndIndex);
        };

        table.calculateVerticalScrollSize = function () {
            table.contentHeight = 0;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                table.contentHeight += table.rowHeight;
                //log("rowIndex=%s",rowIndex);
            }
            //scroll Height
            //table.canUseContentHeight = canvas.height - table.rowHeight;
            table.canUseContentHeight = canvas.height - table.rowHeight - ((table.horizontalScrollWidth > 0) ? table.horizontalScrollHeight : 0);
            var overHeight = table.contentHeight - table.canUseContentHeight;
            if (overHeight > 0) {
                table.verticalScrollX = table.columnCanUseWidth;
                //table.verticalScrollHeight = table.canUseContentHeight - overHeight;
                table.verticalScrollHeight = table.canUseContentHeight * (table.canUseContentHeight / table.contentHeight);
                table.verticalScrollMoveRange = table.canUseContentHeight - table.verticalScrollHeight;
                table.verticalScrollMoveStep = overHeight / table.verticalScrollMoveRange;
                log("table.canUseContentHeight=%s", table.canUseContentHeight);
                log("overHeight=%s", overHeight);
                log("table.verticalScrollHeight=%s", table.verticalScrollHeight);
                log("table.verticalScrollMoveRange=%s", table.verticalScrollMoveRange);
                log("table.verticalScrollMoveStep=%s", table.verticalScrollMoveStep);
            } else {
                table.verticalScrollHeight = 0;
            }
            table.calculateVerticalScroll();
        };

        table.calculateVerticalScroll = function () {
            if (table.verticalScrollHeight > 0) {
                var moveY = table.verticalScrollY * table.verticalScrollMoveStep;
                table.rowStartY = Math.round(table.rowHeight - (moveY % table.rowHeight));//y要4捨5入，不然會因為小數點計算時而有空白產生
                table.rowStartIndex = Math.floor(moveY / table.rowHeight);

                var count = Math.ceil((table.canUseContentHeight + (table.rowHeight - table.rowStartY)) / table.rowHeight);
                table.rowEndIndex = table.rowStartIndex + count - 1;
                table.reRenderVerticalScroll = true;
                table.reRenderHorizontalScroll = true;//
                table.reRenderContent = true;
                log("table.verticalScrollY=%s,rowStartY=%s,count=%s", table.verticalScrollY, table.rowStartY, count);
                //console.log("rowStartY=%s,moveY=%s,rowStartIndex=%s", table.rowStartY, moveY, table.rowStartIndex);
            } else {
                table.rowStartY = table.rowHeight;
                table.rowStartIndex = 0;
                table.rowEndIndex = table.dataSize - 1;
            }
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
            var colIndex, rowIndex, contentWidth;

            for (colIndex = 0; colIndex < table.columnSize; colIndex++) {
                column = table.columns[colIndex];
                column.titleWidth = ctx.measureText(column.title).width;
                column.contentMaxWidth = column.titleWidth;
                column.contentMaxWidthList.push(-1);
                for (rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                    contentWidth = ctx.measureText(column.getValue(table.data[rowIndex])).width;
                    column.calculateMaxWidth(contentWidth, rowIndex);
                }
            }

            //logTimeEnd("table.calculateColumnWidth()");
        };

        table.allocateColumnsWidth = function () {
            table.columnsWidth = 0;
            var column = undefined;
            var i;
            var x = 0;

            var orgAllColumnWidth = 0;
            for (i = 0; i < table.columnSize; i++) {
                orgAllColumnWidth += table.columns[i].contentMaxWidth;
            }

            log("table.columnCanUseWidth=%s", table.columnCanUseWidth);
            log("orgAllColumnWidth=%s", orgAllColumnWidth);
            var fillTotalWidth = table.columnCanUseWidth - orgAllColumnWidth;
            if (fillTotalWidth <= 0) {
                for (i = 0; i < table.columnSize; i++) {
                    column = table.columns[i];
                    column.x = x;
                    column.width = column.paddingLeft+column.contentMaxWidth+column.paddingRight;
                    column.titleX = column.x + (column.width / 2) - (column.titleWidth / 2);
                    x += column.width;
                    table.columnsWidth += column.width;
                    //log("column.x=%s,column.end=%s",column.x,column.x+column.width);
                }
            } else {
                var tempWidth = fillTotalWidth;
                var avgFillWidth = fillTotalWidth / table.columnSize;

                for (i = 0; i < table.columnSize; i++) {
                    column = table.columns[i];
                    column.x = x;
                    if (avgFillWidth > tempWidth) {
                        column.width = column.contentMaxWidth + tempWidth;
                    } else {
                        column.width = column.contentMaxWidth + avgFillWidth;
                        tempWidth = tempWidth - avgFillWidth;
                    }

                    column.titleX = column.x + (column.width / 2) - (column.titleWidth / 2);
                    x += column.width;
                    //log("column.width=%s", column.width);
                    //log("table.columnsWidth=%s", table.columnsWidth);
                    table.columnsWidth += column.width;
                }
            }

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
                table.calculateVerticalScroll();//table.reRenderScroll = true;
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
            $(document).trigger("rowClick", [rowData]);
        };

        return table;
    }
};

var CanvasTableMouse = {
    createNew: function (table) {
        var tableMouse = {};
        tableMouse.layer = table.layerManager.getLayer(CanvasTable.MOUSE_LAYER_INDEX);
        tableMouse.mouse = CanvasMouse.createNew(tableMouse.layer.canvas);
        tableMouse.verticalScrollerDragging = false;
        tableMouse.horizontalScrollerDragging = false;

        tableMouse.reset = function () {
            tableMouse.mouseColumnIndex = -1;
            tableMouse.mouseRowIndex = -1;
            tableMouse.mouseInHead = false;
        };

        tableMouse.mouseMove = function () {
            if (tableMouse.verticalScrollerDragging) {

                if (tableMouse.mouse.y > tableMouse.mouse.lastY) {
                    table.addVerticalScrollY(tableMouse.mouse.y - tableMouse.mouse.lastY);
                } else if (tableMouse.mouse.y < tableMouse.mouse.lastY) {
                    table.addVerticalScrollY(tableMouse.mouse.y - tableMouse.mouse.lastY);
                }
            } else if (tableMouse.horizontalScrollerDragging) {
                if (tableMouse.mouse.x > tableMouse.mouse.lastX) {
                    table.addHorizontalScrollX(tableMouse.mouse.x-tableMouse.mouse.lastX);
                } else if (tableMouse.mouse.x < tableMouse.mouse.lastX) {
                    table.addHorizontalScrollX(tableMouse.mouse.x-tableMouse.mouse.lastX);
                }
            } else {
                tableMouse.onVerticalScroller = false;
                tableMouse.aboveVerticalScroller = false;
                tableMouse.underVerticalScroller = false;
                tableMouse.onHorizontalScroller = false;
                tableMouse.leftHorizontalScroller = false;//right side
                tableMouse.rightHorizontalScroller = false;//left side
                tableMouse.mouseInHead = !(tableMouse.mouse.y > table.rowHeight);
                if (tableMouse.mouse.x > table.columnCanUseWidth) {
                    tableMouse.mouseColumnIndex = -1;
                    tableMouse.inColumnArea = false;

                    if (!tableMouse.mouseInHead) {
                        if (tableMouse.mouse.y >= table.verticalScrollY + table.rowHeight && tableMouse.mouse.y <= table.verticalScrollY + table.verticalScrollHeight) {
                            tableMouse.onVerticalScroller = true;
                        } else if (tableMouse.mouse.y < table.verticalScrollY + table.rowHeight) {
                            tableMouse.aboveVerticalScroller = true;
                        } else if (tableMouse.mouse.y > table.verticalScrollY + table.verticalScrollHeight) {
                            tableMouse.underVerticalScroller = true;
                        }
                    }
                } else {
                    if (table.horizontalScrollWidth > 0 && tableMouse.mouse.y > table.horizontalScrollY) {
                        if (tableMouse.mouse.x >= table.horizontalScrollX && tableMouse.mouse.x <= table.horizontalScrollX + table.horizontalScrollWidth) {
                            tableMouse.onHorizontalScroller = true;
                        } else if (tableMouse.mouse.x < table.horizontalScrollX) {
                            tableMouse.leftHorizontalScroller = true;
                        } else if (tableMouse.mouse.x > table.horizontalScrollX + table.horizontalScrollWidth) {
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

                if (tableMouse.mouseInHead) {
                    document.body.style.cursor = 'pointer';
                } else {
                    document.body.style.cursor = 'default';
                }
            }

        };

        tableMouse.mouseDown = function () {
            if (tableMouse.inColumnArea) {
                if (tableMouse.mouseInHead) {
                    table.sortColumnClick(tableMouse.mouseColumnIndex);
                } else {
                    if (tableMouse.mouseRowIndex != -1) {
                        table.rowClick(tableMouse.mouseRowIndex);
                    } else {
                        if (tableMouse.onHorizontalScroller) {
                            tableMouse.horizontalScrollerDragging = true;
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
                        table.addVerticalScrollY(-5);
                    } else if (tableMouse.underVerticalScroller) {
                        table.addVerticalScrollY(5);
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

        if (typeof attribute !== typeof undefined) {
            column[CanvasNumberColumn.PERCENT] = attribute[CanvasNumberColumn.PERCENT];
            var decimal = attribute[CanvasNumberColumn.DECIMAL];
            if (typeof decimal !== typeof undefined) {
                column.decimal = decimal;
                column.format = "";
                if (JsonTool.isInt(decimal)) {
                    column.format = JsonTool.numeralFormat(decimal);
                    if (typeof column[CanvasNumberColumn.PERCENT] !== typeof undefined && column[CanvasNumberColumn.PERCENT] == true) {
                        column.type = ColumnType.RATE;
                        column.format += "%";
                    }
                }
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