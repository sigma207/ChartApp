/**
 * Created by user on 2015/6/10.
 */
var FutureTableStyle = {
    VOLUME_COLOR: "lightskyblue",
    CODE_COLOR: "#ffb70a",
    DEFAULT_COLOR: "white",
    upDownColor: function (rowData) {
        return (rowData.upDown > 0) ? "#ad0000" : "#00a900";
    },
    createNew: function (table) {
        var ds = {};
        var baseCtx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
        var headerCtx = table.layerManager.getLayer(CanvasTable.HEADER_LAYER_INDEX).ctx;
        var contentCtx = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;
        baseCtx.font = "16px Helvetica";
        headerCtx.font = "16px Helvetica";
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

        ds.headContent = function (ctx, x, column) {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.textBaseline = "middle";
            ctx.fillText(column.title, x, table.rowMiddle);
            ctx.restore();
        };

        ds.cellContent = function (ctx, x, y, column, rowData, rowIndex) {
            ctx.save();
            ctx.fillStyle = column.getFillStyle(rowData);
            ctx.textBaseline = "middle";
            ctx.textAlign = "right";
            ctx.fillText(column.getValue(rowData), x, y);
            ctx.restore();
        };

        return ds;
    }

};