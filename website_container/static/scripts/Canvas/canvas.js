import { CanvasNet } from "./canvas-network.js";


export class Canvas {
    constructor(networkHandler) {
        this.initialize();
        this.networkHandler = networkHandler;
        this.canvasNet = new CanvasNet(this, networkHandler);
    }

    initialize() {
        this.canvasImg = document.getElementById("canvas-img");
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.canvasPos = this.canvas.getBoundingClientRect();
        this.isDrawing = false;
        this.isEnabled = false;
        this.mousePoses = [];

        this.ctx.lineWidth = 2;
        
        this.drawing = (e) => {
            if (!this.isDrawing) return;
            
            // Send the mouse position relative to the canvas's size
            this.mousePoses.push([e.offsetX / this.canvas.width, e.offsetY / this.canvas.height]);
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();

            this.canvasNet.sendNewUpdate();
        }

        this.startDrawing = (e) => {
            this.ctx.beginPath();
            this.isDrawing = true;
        }

        this.stopDrawing = (e) => {
            this.ctx.closePath();
            this.isDrawing = false;
        }

        // Support for mobile devices

        this.touchStartDrawing = (e) => {
            this.ctx.beginPath();
            this.isDrawing = true;
        }

        this.touchStopDrawing = (e) => {
            this.ctx.closePath();
            this.isDrawing = false;
        }

        this.touchDrawing = (e) => {
            if (!this.isDrawing) return;

            this.reinitialize();
            // Calculate the position of the touch relative to the canvas
            offsetX = e.touches[0].clientX - this.canvasPos.left;
            offsetY = e.touches[0].clientY - this.canvasPos.top;

            this.ctx.lineTo(offsetX, offsetY);
            this.ctx.stroke();
        }

        console.log("[Canvas] Canvas initialized");
    }

    reinitialize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvasPos = this.canvas.getBoundingClientRect();
    }

    reset() {
        this.disableDrawing();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getMousePoses() {
        let mousePoses = this.mousePoses;
        this.mousePoses = [];
        return mousePoses;
    }

    enableDrawing() {
        if (this.isEnabled) return;
        this.canvasImg.style.display = "none";
        this.isEnabled = true;
        console.log('[Canvas] Drawing enabled');

        this.reinitialize();
        this.isDrawing = false;

        // Event listeners for mouse events
        this.canvas.addEventListener("mousedown", this.startDrawing);
        this.canvas.addEventListener("mouseup", this.stopDrawing);
        this.canvas.addEventListener("mousemove", this.drawing);

        // Event listeners for touch events
        this.canvas.addEventListener("touchstart", this.touchStartDrawing);
        this.canvas.addEventListener("touchend", this.touchStopDrawing);
        this.canvas.addEventListener("touchmove", this.touchDrawing);
    }

    disableDrawing() {
        if (!this.isEnabled) return;
        this.canvasImg.style.display = "block";
        this.isEnabled = false;
        console.log('[Canvas] Drawing disabled');

        this.reinitialize();

        // Remove all event listeners
        this.canvas.removeEventListener("mousedown", this.startDrawing);
        this.canvas.removeEventListener("mouseup", this.stopDrawing);
        this.canvas.removeEventListener("mousemove", this.drawing);

        this.canvas.removeEventListener("touchstart", this.touchStartDrawing);
        this.canvas.removeEventListener("touchend", this.touchStopDrawing);
        this.canvas.removeEventListener("touchmove", this.touchDrawing);
    }

    handleUpdate(update) {
        this.canvasNet.handleUpdate(update);
    }
}

