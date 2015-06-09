/**
 * Created by user on 2015/4/23.
 */
if (typeof CanvasRenderingContext2D !== typeof undefined && CanvasRenderingContext2D !== false) {

    CanvasRenderingContext2D.prototype.drawHorizontalLine = function (x, y, right) {
        this.beginPath();
        this.moveTo(x, y);
        this.lineTo(right, y);
        this.stroke();
    };

    CanvasRenderingContext2D.prototype.drawVerticalLine = function (x, y, top) {
        this.beginPath();
        this.moveTo(x, y);
        this.lineTo(x, top);
        this.stroke();
    };

    CanvasRenderingContext2D.prototype.drawDashLine = function (x1, y1, x2, y2, dashLength) {
        var deltaX = x2 - x1;
        var deltaY = y2 - y1;
        var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));//2點之間的距離
        var numDash = Math.floor(distance / dashLength);//虛線和空白的數量
        var x;
        var y;
        this.beginPath();
        for (var i = 0; i < numDash; i++) {
            x = x1 + deltaX / numDash * i;
            y = y1 + deltaY / numDash * i;
            if (i % 2 == 0) {
                this.moveTo(x, y);
            } else {
                this.lineTo(x, y);
            }
        }
        if (numDash % 2 != 0) {//
            this.lineTo(x2, y2);
        }
        this.stroke();
    };
}