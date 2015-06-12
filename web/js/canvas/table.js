/**
 * Created by user on 2015/6/9.
 */
var CanvasTable = {
    BASE_LAYER_INDEX: 0,
    VALUE_LAYER_INDEX: 1,
    createNew: function (canvas) {
        var table = DataSourceRenderer.createNew();
        //var ctx = canvas.getContext("2d");
        table.columns = [];
        table.coumnSize = 0;
        table.rowHeight = 25;
        table.rowMiddle = table.rowHeight / 2;
        table.layerManager = LayerManager.createNew();
        table.layerManager.addBaseLayer(canvas);
        table.layerManager.addLayer("tableValueLayer");
        table.mouse = CanvasTableMouse.createNew(table);

        table.addColumn = function (column) {
            column.index = table.columns.length;
            table.columns.push(column);
            table.coumnSize++;
        };

        table.setDataSource = function (newData) {
            table.data = newData;
            table.dataSize = table.data.length;
        };

        table.setColumnHeadContentRender = function (renderFunction) {
            var column = undefined;
            for (var i = 0; i < table.coumnSize; i++) {
                column = table.columns[i];
                column.renderHeadContent = renderFunction;
            }
        };

        table.setColumnCellContentRender = function (renderFunction) {
            var column = undefined;
            for (var i = 0; i < table.coumnSize; i++) {
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

        table.render = function () {
            table.calculate();
            if (table.columnWidthChanged) {
                table.layerManager.clearLayer(CanvasTable.BASE_LAYER_INDEX);
                table.renderBase(table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx);
            }
            table.layerManager.clearLayer(CanvasTable.VALUE_LAYER_INDEX);
            table.renderContent(table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx);
        };

        table.renderBase = function (ctx) {
            table.renderHeadRowBackground(ctx);
            var column = undefined;
            for (var i = 0; i < table.coumnSize; i++) {
                column = table.columns[i];
                column.renderHeadBackground(ctx);
                column.renderHeadContent(ctx, column);
            }
            var rowData = undefined;
            var y = table.rowHeight;
            if (table.columnWidthChanged) {
                for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                    rowData = table.data[rowIndex];
                    table.renderBodyRowBackground(ctx, y, rowData, rowIndex);
                    y += table.rowHeight;
                }
            }
        };

        table.renderContent = function (ctx) {
            var column = undefined;
            var y = table.rowHeight;
            var rowData = undefined;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                rowData = table.data[rowIndex];
                for (var colIndex = 0; colIndex < table.coumnSize; colIndex++) {
                    column = table.columns[colIndex];
                    column.renderCellContent(ctx, y, column, rowData, rowIndex);
                }
                y += table.rowHeight;
            }
        };

        table.calculate = function () {
            table.calculateColumnWidth();
            if (table.columnWidthChanged) {
                table.allocateColumnWidth();
            }
        };

        table.calculateColumnWidth = function () {
            var ctx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var column = undefined;
            var i;

            for (i = 0; i < table.coumnSize; i++) {
                column = table.columns[i];
                column.titleWidth = ctx.measureText(column.title).width;
                column.contentMaxWidth = column.titleWidth;
            }
            var contentWidth = 0;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                for (var colIndex = 0; colIndex < table.coumnSize; colIndex++) {
                    column = table.columns[colIndex];
                    contentWidth = ctx.measureText(column.getValue(table.data[rowIndex])).width;
                    if (contentWidth > column.contentMaxWidth) {
                        column.contentMaxWidth = contentWidth;
                    }
                }
            }

            var oldTableColumnContentWidth = table.columnContentWidth;
            table.columnContentWidth = 0;
            for (i = 0; i < table.coumnSize; i++) {
                table.columnContentWidth += table.columns[i].contentMaxWidth;
            }
            table.columnWidthChanged = (table.columnContentWidth != oldTableColumnContentWidth);
        };

        table.allocateColumnWidth = function () {
            var canvasWidth = canvas.width;
            var column = undefined;
            var i;

            var fillTotalWidth = canvasWidth - table.columnContentWidth;
            var tempWidth = fillTotalWidth;
            var avgFillWidth = fillTotalWidth / table.coumnSize;
            var x = 0;
            for (i = 0; i < table.coumnSize; i++) {
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
            currentOrderBy = (currentOrderBy == Sort.ASC || typeof currentOrderBy === typeof undefined) ? Sort.ASC : Sort.DESC;
            if (changeOrderBy) {
                currentOrderBy = (currentOrderBy == Sort.ASC) ? Sort.DESC : Sort.ASC;
            }
            table.dsr.sortData(sortIndex, column.field, currentOrderBy, column.type);
        };

        return table;
    }
};

var CanvasTableMouse = {
    createNew: function (table) {
        var tableMouse = {};
        tableMouse.layer = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX);
        tableMouse.mouse = CanvasMouse.createNew(tableMouse.layer.canvas);

        tableMouse.reset = function () {
            tableMouse.mouseColumnIndex = -1;
            tableMouse.mouseRowIndex = -1;
            tableMouse.mouseInHead = false;
        };

        tableMouse.mouseMove = function () {
            //有空可以改用2分法
            for (var colIndex = table.coumnSize - 1; colIndex >= 0; colIndex--) {
                if (tableMouse.mouse.x > table.columns[colIndex].x) {
                    tableMouse.mouseColumnIndex = colIndex;
                    break;
                }
            }
            tableMouse.mouseInHead = !(tableMouse.mouse.y > table.rowHeight);
            if (!tableMouse.mouseInHead) {
                tableMouse.mouseRowIndex = Math.floor((tableMouse.mouse.y - table.rowHeight) /table.rowHeight);
            }

            if(tableMouse.mouseInHead){
                document.body.style.cursor = 'pointer';
            }else{
                document.body.style.cursor = 'default';
            }
        };

        tableMouse.mouseDown = function () {
            if(tableMouse.mouseInHead){
                table.sortColumnClick(tableMouse.mouseColumnIndex);
            }
        };

        tableMouse.mouseOver = function () {
            tableMouse.reset();
        };

        tableMouse.mouseOut = function () {
            tableMouse.reset();
            document.body.style.cursor = 'default';
        };

        tableMouse.reset();

        tableMouse.mouse.onOverCall = tableMouse.mouseOver;
        tableMouse.mouse.onMoveCall = tableMouse.mouseMove;
        tableMouse.mouse.onDownCall = tableMouse.mouseDown;
        tableMouse.mouse.onOutCall = tableMouse.mouseOut;

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
        column.contentMaxWidth = 0;
        column.x = 0;
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