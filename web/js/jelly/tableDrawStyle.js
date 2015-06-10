/**
 * Created by user on 2015/6/10.
 */
var FutureTableDrawStyle = {
    VOLUME_COLOR: "lightskyblue",
    CODE_COLOR: "#ffb70a",
    DEFAULT_COLOR: "white",
    createNew: function (table) {
        var ds = {};
        var contentCtx = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;
        contentCtx.font = "16px Helvetica";

        ds.headBackground = function (ctx) {
            var lg = ctx.createLinearGradient(0, 0, 0, table.rowHeight);
            lg.addColorStop(0, '#5c5f66');
            lg.addColorStop(1, '#000000');
            ctx.fillStyle = lg;
            ctx.fillRect(0, 0, ctx.canvas.width, table.rowHeight);
        };

        ds.bodyRowBackground = function (ctx, y, rowData, rowIndex) {
            ctx.save();
            if (rowIndex % 2 == 0) {
                ctx.fillStyle = "#272727";
            } else {
                ctx.fillStyle = "#0f0f0f";
            }
            ctx.fillRect(0, y, ctx.canvas.width, table.rowHeight);
            ctx.restore();
        };

        ds.headContent = function (ctx, column) {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.textBaseline = "middle";
            ctx.fillText(column.title, column.titleX, table.rowMiddle);
            ctx.restore();
        };

        ds.cellContent = function (ctx, y, column, rowData, rowIndex) {
            ctx.save();
            //ctx.fillStyle = "white";
            ctx.fillStyle = column[CanvasColumn.TEXT_FILL_STYLE];
            ctx.textBaseline = "middle";
            ctx.textAlign = "right";
            //ctx.fillText(column.getValueFunction.call(table,rowData), column.x+column.width-5, y+table.rowMiddle);
            ctx.fillText(column.getValue(rowData), column.x + column.width - 5, y + table.rowMiddle);
            //ctx.fillText(column.title, column.titleX, table.rowMiddle);
            ctx.restore();
        };

        ds.cellContentFillStyle = function (rowData) {
            if (rowData.upDown > 0) {
                return "#ad0000";
            } else {
                return "#00a900";
            }
        };

        return ds;
    }

};