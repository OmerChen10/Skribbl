
class Canvas {
    constructor(){
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvasPos = this.canvas.getBoundingClientRect();
    }

    enableDrawing(){
        console.log('DRAWING ENABLED'); 

        this.isDrawing = false;

        const drawing = (e) => {
            if (!this.isDrawing) return;

            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();
        }

        const startDrawing = (e) => {
            this.ctx.beginPath();
            this.isDrawing = true;
        }

        const stopDrawing = (e) => {
            this.ctx.closePath();
            this.isDrawing = false;
        }

        // Support for mobile devices

        const touchStartDrawing = (e) => {
            this.ctx.beginPath();
            this.isDrawing = true;
        }

        const touchStopDrawing = (e) => {
            this.ctx.closePath();
            this.isDrawing = false;
        }

        const touchDrawing = (e) => {
            if (!this.isDrawing) return;

            // Calculate the position of the touch relative to the canvas
            offsetX = e.touches[0].clientX - this.canvasPos.left;
            offsetY = e.touches[0].clientY - this.canvasPos.top;

            this.ctx.lineTo(offsetX, offsetY);
            this.ctx.stroke();
        }

        // Event listeners for mouse events
        this.canvas.addEventListener("mousedown", startDrawing);
        this.canvas.addEventListener("mouseup", stopDrawing);
        this.canvas.addEventListener("mousemove", drawing);

        // Event listeners for touch events
        this.canvas.addEventListener("touchstart", touchStartDrawing);
        this.canvas.addEventListener("touchend", touchStopDrawing);
        this.canvas.addEventListener("touchmove", touchDrawing);
    }

    disableDrawing(){
        console.log('DRAWING DISABLED'); 

        // Remove all event listeners
        this.canvas.removeEventListener("mousedown", startDrawing);
        this.canvas.removeEventListener("mouseup", stopDrawing);
        this.canvas.removeEventListener("mousemove", drawing);

        this.canvas.removeEventListener("touchstart", touchStartDrawing);
        this.canvas.removeEventListener("touchend", touchStopDrawing);
        this.canvas.removeEventListener("touchmove", touchDrawing);
    }
}

