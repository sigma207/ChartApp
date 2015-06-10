/**
 * Created by user on 2015/6/9.
 */
var CanvasTable = {
    BASE_LAYER_INDEX: 0,
    VALUE_LAYER_INDEX: 1,
    createNew: function (canvas) {
        var table = {};
        //var ctx = canvas.getContext("2d");
        table.columns = [];
        table.data = [];
        table.dataSize = table.data.length;
        table.rowHeight = 25;
        table.rowMiddle = table.rowHeight / 2;
        table.layerManager = LayerManager.createNew();
        table.layerManager.addBaseLayer(canvas);
        table.layerManager.addLayer("tableValueLayer");

        table.addColumn = function (column) {
            column.index = table.columns.length;
            table.columns.push(column);
        };

        table.setDataSource = function (newData) {
            table.data = newData;
            table.dataSize = table.data.length;
        };

        table.setColumnHeadContentRender = function (renderFunction) {
            var count = table.columns.length;
            var column = undefined;
            for (var i = 0; i < count; i++) {
                column = table.columns[i];
                column.renderHeadContent = renderFunction;
            }
        };

        table.setColumnCellContentRender = function (renderFunction) {
            var count = table.columns.length;
            var column = undefined;
            for (var i = 0; i < count; i++) {
                column = table.columns[i];
                column.renderCellContent = renderFunction;
            }
        };

        table.render = function () {
            table.calculate();
            table.renderHead();
            table.renderBody();
        };

        table.renderBackground = function () {
            var context = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            table.renderHeadRowBackground(context);
            table.renderBodyRowBackground(context);
            var count = table.columns.length;
            var column = undefined;
            for (var i = 0; i < count; i++) {
                column = table.columns[i];
                column.renderHeadBackground(context);
                column.renderCellBackground(context);
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

        table.renderHead = function (ctx) {
            var baseCtx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var contentCtx = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;
            table.renderHeadRowBackground(baseCtx);
            var count = table.columns.length;
            var column = undefined;
            for (var i = 0; i < count; i++) {
                column = table.columns[i];
                column.renderHeadBackground(baseCtx);
                column.renderHeadContent(contentCtx, column);
            }
        };

        table.renderBody = function () {
            var baseCtx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var contentCtx = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;
            var column = undefined;
            var count = table.columns.length;
            var y = table.rowHeight;
            var rowData = undefined;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                rowData = table.data[rowIndex];
                table.renderBodyRowBackground(baseCtx, y, rowData, rowIndex);
                for (var colIndex = 0; colIndex < count; colIndex++) {
                    column = table.columns[colIndex];
                    column.renderCellContent(contentCtx, y, column, rowData, rowIndex);
                }
                y += table.rowHeight;
            }
        };

        table.calculate = function () {
            var ctx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
            var count = table.columns.length;
            var canvasWidth = canvas.width;
            var column = undefined;
            var i;

            for (i = 0; i < count; i++) {
                column = table.columns[i];
                column.titleWidth = ctx.measureText(column.title).width;
                column.contentMaxWidth = column.titleWidth;
            }
            var contentWidth = 0;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                for (var colIndex = 0; colIndex < count; colIndex++) {
                    column = table.columns[colIndex];
                    contentWidth = ctx.measureText(column.getValueFunction.call(table, table.data[rowIndex])).width;
                    if (contentWidth > column.contentMaxWidth) {
                        column.contentMaxWidth = contentWidth;
                    }
                }
            }

            var allContentWidth = 0;
            for (i = 0; i < count; i++) {
                allContentWidth += table.columns[i].contentMaxWidth;
            }
            //var allColumnWidth = x;
            var fillTotalWidth = canvasWidth - allContentWidth;
            var tempWidth = fillTotalWidth;
            var avgFillWidth = fillTotalWidth / count;
            var x = 0;
            for (i = 0; i < count; i++) {
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

        return table;
    }
};

var CanvasColumnType = {
    TEXT: "text",
    NUMBER: "number",
    DATE: "date",
    TIME: "time"
};

var CanvasTableElement = {
    createNew: function () {
        var element = {};
        element.renderBackground = function (ctx) {

        };
        return element;
    }
};

var CanvasColumn = {
    TEXT_FILL_STYLE: "textFillStyle",
    createNew: function (field, title, attribute) {
        var column = {};
        column.field = field;
        column.title = title;
        column.index = -1;
        column.width = 0;
        column.titleWidth = 0;
        column.contentMaxWidth = 0;
        column.x = 0;
        column.type = CanvasColumnType.TEXT;

        if (typeof attribute !== typeof undefined) {
            if (typeof attribute[CanvasColumn.TEXT_FILL_STYLE] !== typeof undefined) {
                column[CanvasColumn.TEXT_FILL_STYLE] = attribute[CanvasColumn.TEXT_FILL_STYLE];
            } else {
                column[CanvasColumn.TEXT_FILL_STYLE] = "black";
            }
        }
        column.getValue = function (rowData) {
            return rowData[column.field];
        };
        column.getValueFunction = column.getValue;

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
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = CanvasColumnType.NUMBER;

        column.getValue = function (rowData) {
            if (column.format == "") {
                var format = JsonTool.numeralFormat(rowData[column[CanvasNumberColumn.DECIMAL]]);
                return numeral(rowData[column.field]).format(format);
            } else {
                return numeral(rowData[column.field]).format(column.format);
            }
        };

        if (typeof attribute !== typeof undefined) {
            var decimal = attribute[CanvasNumberColumn.DECIMAL];
            if (typeof decimal !== typeof undefined) {
                column.decimal = decimal;
                column.format = "";
                if (JsonTool.isInt(decimal)) {
                    column.format = JsonTool.numeralFormat(decimal);
                }
                column.getValueFunction = column.getValue;
            }
        }
        return column;
    }
};

var CanvasDateColumn = {
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = CanvasColumnType.DATE;
        return column;
    }
};

var CanvasTimeColumn = {
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = CanvasColumnType.TIME;
        return column;
    }
};