/**
 * Created by user on 2015/6/24.
 */
var QuoteDetailStyle = {
    DEFAULT_COLOR: "white",
    FONT:"12px Helvetica",
    upDownColor: function (rowData) {
        if (rowData.upDown == 0) {
            return "#ffffff";
        } else {
            return (rowData.upDown > 0) ? "#ad0000" : "#00a900";
        }
    },
    createNew: function (table) {
        var ds = {};
        for(var i=0;i<table.layerManager.layerList.length;i++){
            table.layerManager.getLayer(i).assignFont(QuoteDetailStyle.FONT);
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
            ctx.fillStyle = "#0f0f0f";
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
            var value = column.getValue(rowData);
            ctx.fillText(value, x, y);
            if (column.field == "upDown") {
                var valueWidth = ctx.measureText(value).width;
                var arrowStartX = x - valueWidth - 10;
                var top = (y - table.rowMiddle ) + 2;
                var bottom = (y + table.rowMiddle ) - 4;
                if (value > 0) {
                    ctx.beginPath();
                    ctx.moveTo(arrowStartX, bottom);
                    ctx.lineTo(arrowStartX + 4, top);
                    ctx.lineTo(arrowStartX + 8, bottom);
                    ctx.fill();
                } else if (value < 0) {
                    ctx.beginPath();
                    ctx.moveTo(arrowStartX, top);
                    ctx.lineTo(arrowStartX + 4, bottom);
                    ctx.lineTo(arrowStartX + 8, top);
                    ctx.fill();
                }

            }

            ctx.restore();
        };

        return ds;
    }

};