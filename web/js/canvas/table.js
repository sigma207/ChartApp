/**
 * Created by user on 2015/6/9.
 */
var CanvasTable = {
    createNew: function (canvas) {
        var table = {};
        var ctx = canvas.getContext("2d");
        table.columns = [];
        table.data = [];
        table.dataSize = table.data.length;

        table.addColumn = function (column) {
            column.index = table.columns.length;
            table.columns.push(column);
        };

        table.setDataSource = function (newData) {
            table.data = newData;
            table.dataSize = table.data.length;
        };

        table.render = function () {
            ctx.fillStyle = "gray";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            table.calculate();
            table.renderHead();
        };

        table.renderHead = function () {
            var count = table.columns.length;
            var column = undefined;
            for (var i = 0; i < count; i++) {
                column = table.columns[i];
                ctx.fillStyle = "lightblue";
                ctx.fillRect(column.x, 0, column.width, 30);
                ctx.strokeRect(column.x, 0, column.width, 30);
                ctx.fillStyle = "black";
                ctx.fillText(column.title, column.titleX, 15);
                //ctx.fillText(column.name, column.x , 15);
            }
        };

        table.calculate = function () {
            var count = table.columns.length;
            var canvasWidth = canvas.width;
            var column = undefined;
            var i;

            for (i = 0; i < count; i++) {
                column = table.columns[i];
                column.titleWidth = ctx.measureText(column.title).width;
                column.width = column.titleWidth;
            }
            var contentWidth = 0;
            for (var rowIndex = 0; rowIndex < table.dataSize; rowIndex++) {
                for (var colIndex = 0; colIndex < count; colIndex++) {
                    column = table.columns[colIndex];
                    //log(table.data[rowIndex][column.field]);
                    contentWidth = ctx.measureText(table.data[rowIndex][column.field]).width;
                    if (contentWidth > column.width) {
                        column.width = contentWidth;
                    }
                }
            }

            var allColumnWidth = 0;
            for (i = 0; i < count; i++) {
                column = table.columns[i];

                allColumnWidth += column.width;
            }

            for (i = 0; i < count; i++) {
                column = table.columns[i];
                column.percentWidth = column.width / allColumnWidth;
            }
            //var allColumnWidth = x;
            var fillTotalWidth = canvasWidth - allColumnWidth;
            var tempWidth = canvasWidth - allColumnWidth;
            var fillWidth = 0;
            var x = 0;
            var t = 0;
            for (i = 0; i < count; i++) {
                column = table.columns[i];
                column.x = x;
                log(column.percentWidth);
                t += column.percentWidth;
                fillWidth = fillTotalWidth * column.percentWidth;
                log("fillWidth=%s", fillWidth);
                log("column.width=%s", column.width);
                if (fillWidth > tempWidth) {
                    column.width += fillWidth;
                    tempWidth = tempWidth - fillWidth;
                } else {
                    column.width += tempWidth;
                }
                column.titleX = column.x + (column.width / 2) - (column.titleWidth / 2);
                x += column.width;
            }
            log("t=%s", t);
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

var CanvasColumn = {
    createNew: function (field, title, attribute) {
        var column = {};
        column.field = field;
        column.title = title;
        column.index = -1;
        column.width = 0;
        column.titleWidth = 0;
        column.maxWidth = 0;
        column.x = 0;
        column.type = CanvasColumnType.TEXT;
        return column;
    }
};

var CanvasNumberColumn = {
    createNew: function (field, title, attribute) {
        var column = CanvasColumn.createNew(field, title, attribute);
        column.type = CanvasColumnType.NUMBER;
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