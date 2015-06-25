/**
 * Created by user on 2015/6/10.
 */
var FutureTableStyle = {
    VOLUME_COLOR: "lightskyblue",
    CODE_COLOR: "#ffb70a",
    DEFAULT_COLOR: "white",
    upDownColor: function (rowData) {
        if(rowData.upDown==0){
            return "#ffffff";
        } else {
            return (rowData.upDown > 0) ? "#ad0000" : "#00a900";
        }
    },
    createNew: function (table) {
        var ds = {};
        var baseCtx = table.layerManager.getLayer(CanvasTable.BASE_LAYER_INDEX).ctx;
        var headerCtx = table.layerManager.getLayer(CanvasTable.HEADER_LAYER_INDEX).ctx;
        var contentCtx = table.layerManager.getLayer(CanvasTable.VALUE_LAYER_INDEX).ctx;

        var valueFloatCtx = table.layerManager.getLayer(CanvasTable.VALUE_FLOAT_LAYER_INDEX).ctx;
        var valueStationaryCtx = table.layerManager.getLayer(CanvasTable.VALUE_STATIONARY_LAYER_INDEX).ctx;
        var headerFloatCtx = table.layerManager.getLayer(CanvasTable.HEADER_FLOAT_LAYER_INDEX).ctx;
        var headerStationary = table.layerManager.getLayer(CanvasTable.HEADER_STATIONARY_LAYER_INDEX).ctx;
        baseCtx.font = "16px Helvetica";
        if (typeof headerCtx !== typeof undefined) {
            headerCtx.font = "16px Helvetica";
        }
        if (typeof contentCtx !== typeof undefined) {
            contentCtx.font = "16px Helvetica";
        }

        if (typeof valueFloatCtx !== typeof undefined) {
            valueFloatCtx.font = "16px Helvetica";
        }
        if (typeof valueStationaryCtx !== typeof undefined) {
            valueStationaryCtx.font = "16px Helvetica";
        }
        if (typeof headerFloatCtx !== typeof undefined) {
            headerFloatCtx.font = "16px Helvetica";
        }
        if (typeof headerStationary !== typeof undefined) {
            headerStationary.font = "16px Helvetica";
        }

        ds.headBackground = function (ctx, x, y, width, height) {
            var lg = ctx.createLinearGradient(0, 0, 0, height);
            lg.addColorStop(0, '#5c5f66');
            lg.addColorStop(1, '#000000');
            ctx.fillStyle = lg;
            ctx.fillRect(x, y, width, height);
        };

        ds.bodyRowBackground = function (ctx, x, y, width, height, rowData, rowIndex) {
            ctx.save();
            if (rowIndex % 2 == 0) {
                ctx.fillStyle = "#272727";
            } else {
                ctx.fillStyle = "#0f0f0f";
            }
            ctx.fillRect(x, y, width, height);
            ctx.restore();
        };

        ds.headContent = function (ctx, x, column) {
            ctx.save();
            ctx.fillStyle = "white";
            ctx.textBaseline = "middle";
            ctx.fillText(column.title, x, table.headerMiddle);
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