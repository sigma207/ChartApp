/**
 * Created by user on 2015/6/11.
 */
var Sort = {
    ORDER_BY: "orderBy",
    DESC: "desc",
    ASC: "asc"
};

var ColumnType = {
    TEXT: "text",
    NUMBER: "number",
    RATE: "rate",
    DATE: "date",
    TIME: "time"
};

var DataSourceManager = {
    createNew: function (usePage) {
        var dsr = {};
        dsr.split = 0;
        dsr.dataSource = [];
        dsr.dataSize = dsr.dataSource.length;
        dsr.renderers = [];
        dsr.renderDataGroup = [];
        dsr.renderDataGroupSize = 0;
        dsr.usePage = usePage || false;
        dsr.pageInit = false;
        dsr.pageNo = 0;
        dsr.pageCount = 30;

        dsr.setDataSource = function (dataSource) {
            dsr.dataSource = dataSource;
            dsr.dataSize = dsr.dataSource.length;
            dsr.pageNo = 0;
            dsr.allocateData();
            dsr.clearSort();
            dsr.refresh();

            if (dsr.usePage && !dsr.pageInit) {
                dsr.addPageController();
            }
            if (dsr.usePage) {
                dsr.renderPageInfo();
            }
        };

        dsr.updateRowData = function (index, rowData) {
            dsr.refreshRow(index);
        };

        dsr.addRenderer = function (renderer) {
            renderer.setDataSourceRenderer(dsr);
            dsr.renderers.push(renderer);
            dsr.split++;
        };

        dsr.getRenderRowCount = function () {
            return dsr.pageCount / dsr.split;
        };

        dsr.getPageTotal = function () {
            return Math.ceil(dsr.dataSize / dsr.pageCount);
        };

        dsr.getRowStartIndex = function () {
            return (dsr.usePage) ? dsr.getRenderRowCount() * dsr.pageNo : 0
        };

        dsr.sortData = function (sortIndex, field, orderBy, type) {
            if (type == "number" || type == "rate") {
                JsonTool.sort(dsr.dataSource, field, orderBy);
            } else {
                JsonTool.sortString(dsr.dataSource, field, orderBy);
            }
            dsr.allocateData();
            dsr.updateSortColumn(sortIndex, orderBy);
            dsr.refresh();
        };

        dsr.allocateData = function () {
            //logTime("allocateData");
            var renderRowCount = dsr.getRenderRowCount();
            dsr.renderDataGroup = [];
            if(dsr.split==1){
                dsr.renderDataGroup.push(dsr.dataSource);
                dsr.renderDataGroupSize = dsr.renderDataGroup.length;
            }else{
                for (var s = 0; s < dsr.split; s++) {
                    dsr.renderDataGroup.push([]);
                }
                dsr.renderDataGroupSize = dsr.renderDataGroup.length;
                var rowIndex = 1;
                var reportDataIndex = 0;
                var currentReportData = dsr.renderDataGroup[reportDataIndex];
                for (var i = 0; i < dsr.dataSize; i++) {
                    currentReportData.push(dsr.dataSource[i]);
                    if (rowIndex >= renderRowCount) {
                        if (reportDataIndex == dsr.renderDataGroupSize - 1) {
                            reportDataIndex = 0;
                        } else {
                            reportDataIndex++;
                        }
                        currentReportData = dsr.renderDataGroup[reportDataIndex];
                        rowIndex = 1;
                    } else {
                        rowIndex++;
                    }
                }
            }

            //logTimeEnd("allocateData");
        };

        dsr.updateSortColumn = function (sortIndex, orderBy) {
            for (var i = 0; i < dsr.renderers.length; i++) {
                dsr.renderers[i].updateSortColumn(sortIndex, orderBy);
            }
        };

        dsr.clearSort = function () {
            for (var i = 0; i < dsr.renderers.length; i++) {
                dsr.renderers[i].clearSortColumn();
            }
        };

        dsr.refresh = function () {
            for (var i = 0; i < dsr.renderers.length; i++) {
                dsr.renderers[i].setDataSource(dsr.renderDataGroup[i]);
            }
        };

        dsr.refreshRow = function (index) {
            for (var i = 0; i < dsr.renderers.length; i++) {
                dsr.renderers[i].renderRow(index);
            }
        };

        dsr.addPageController = function () {
            var pageButton = "<div class='reportPageButton' style='float: right;'>" +
                "<button id='fpagebtn' class='btn btn-default'>第一頁</button>" +
                "<button id='pageupbtn' class='btn btn-default'>上一頁</button>" +
                "<button id='pagedownbtn' class='btn btn-default'>下一頁</button>" +
                "<button id='lpagebtn' class='btn btn-default'>最末頁</button>" + "</div>";
            var pageInfo = "<div class='reportPageInfo' style='float: left;'>" +
                "當前第[<label id='pageIdxCount'>0/0</label>]頁" + "</div>";
            var pageDiv = "<div class='reportPage'>" + pageInfo + pageButton + "</div>";
            $(".reportTableContainer").after(pageDiv);
            dsr.initPageButtonEvent();
            dsr.pageInit = true;
        };

        dsr.initPageButtonEvent = function () {
            $("#pagedownbtn").click(function () {
                if (dsr.pageNo < dsr.getPageTotal() - 1) {
                    dsr.pageNo++;
                    dsr.renderAll();
                } else {
                    alert("抱歉!最後一頁囉");
                }
            });
            $("#pageupbtn").click(function () {
                if (dsr.pageNo > 0) {
                    dsr.pageNo--;
                    dsr.renderAll();
                } else {
                    alert("抱歉!第一頁囉");
                }
            });
            $("#fpagebtn").click(function () {
                dsr.pageNo = 0;
                dsr.renderAll();
            });
            $("#lpagebtn").click(function () {
                dsr.pageNo = dsr.getPageTotal() - 1;
                dsr.renderAll();
            });
        };

        dsr.renderAll = function () {
            for (var i = 0; i < dsr.renderers.length; i++) {
                dsr.renderers[i].render();
            }
            if (dsr.usePage) {
                dsr.renderPageInfo();
            }
        };

        dsr.renderPageInfo = function () {
            $("#pageIdxCount").text((dsr.pageNo + 1) + "/" + dsr.getPageTotal());
        };

        return dsr;
    }
};

var DataSourceRenderer = {
    createNew: function () {
        var renderer = {};
        renderer.dsr = null;
        renderer.data = [];
        renderer.dataSize = 0;

        renderer.setDataSource = function (newData) {
            renderer.data = newData;
            renderer.dataSize = renderer.data.length;
            renderer.render();
        };

        renderer.setDataSourceRenderer = function (dsr) {
            renderer.dsr = dsr;
        };

        renderer.render = function () {
        };

        renderer.renderRow = function (rowIndex) {
        };

        renderer.updateSortColumn = function () {
        };

        renderer.clearSortColumn = function () {
        };

        return renderer;
    }
};