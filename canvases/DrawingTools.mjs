export default class DrawingTools {
    constructor(canvas) {
        this._canvas = canvas;
    }

    clearCanvas() {
        const context = this._canvas.getContext('2d');
        context.clearRect(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * @param {Number} x
     * @param {Number} y
     */
    drawDot(x, y) {
        const context = this._canvas.getContext('2d');
        context.beginPath();
        context.arc(x * this._canvas.width, y * this._canvas.height, 2, 0, 2 * Math.PI, true);
        context.fill();
        context.closePath();
    }

    /**
     * @param {DrawnLine} line
     */
    drawLine(line) {
        const context = this._canvas.getContext('2d');
        context.beginPath();
        context.moveTo(line.x1 * this._canvas.width, line.y1 * this._canvas.height);
        context.lineTo(line.x2 * this._canvas.width, line.y2 * this._canvas.height);
        context.strokeStyle = line.color;
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
    }

    updateCanvasSiteToItsClientSize() {
        this._canvas.width = this._canvas.clientWidth;
        this._canvas.height = this._canvas.clientHeight;
    }
}