import { CanvasConfig, NetworkConfig } from "./constants.js";


export class Canvas {
    constructor(networkHandler) {
        this.initialize();
        this.networkHandler = networkHandler;
        this.duringCooldown = false;
    }

    initialize() {
        this.canvasImg = document.getElementById("canvas-img");
        this.toolBar = document.getElementById("canvas-tools");
        this.canvasImg = document.getElementById("canvas-img");
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.canvasPos = this.canvas.getBoundingClientRect();

        this.isDrawing = false;
        this.isEnabled = false;

        this.ctx.lineWidth = 2;
        
        this.drawing = (e) => {
            if (!this.isDrawing) return;
            
            // Draw a line from the previous position to the current position
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();

            this.sendNewUpdate(); // Send a new update to the server
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

            //this.reinitialize();
            // Calculate the position of the touch relative to the canvas
            offsetX = e.touches[0].clientX - this.canvasPos.left;
            offsetY = e.touches[0].clientY - this.canvasPos.top;

            this.ctx.lineTo(offsetX, offsetY);
            this.ctx.stroke();
        }

        // Setup the buttons
        this.setupButtons();

        console.log("[Canvas] Canvas initialized");
    }

    setupButtons() {
        // Setup the buttons
        document.getElementById("red-color").addEventListener("click", () => {
            this.ctx.strokeStyle = "red";
            this.ctx.lineWidth = 2;
        });
        document.getElementById("blue-color").addEventListener("click", () => {
            this.ctx.strokeStyle = "blue";
            this.ctx.lineWidth = 2;
        });
        document.getElementById("green-color").addEventListener("click", () => {
            this.ctx.strokeStyle = "green";
            this.ctx.lineWidth = 2;
        });
        document.getElementById("yellow-color").addEventListener("click", () => {
            this.ctx.strokeStyle = "yellow";
            this.ctx.lineWidth = 2;
        });
        document.getElementById("black-color").addEventListener("click", () => {
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 2;
        });
        document.getElementById("custom-color").addEventListener("change", () => {
            let colorPicker = document.getElementById("custom-color");
            this.ctx.strokeStyle = colorPicker.value;
            this.ctx.lineWidth = 2;
        });
        document.getElementById("eraser").addEventListener("click", () => {
            this.ctx.strokeStyle = "white";
            this.ctx.lineWidth = 25;
        });

        document.getElementById("clear-canvas").addEventListener("click", () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.sendNewUpdate();
        });
    }


    reinitialize() {
        this.canvas.width = this.canvas.offsetWidth; 
        this.canvas.height = this.canvas.offsetHeight;

        this.canvasPos = this.canvas.getBoundingClientRect();
    }

    reset() {
        this.disableDrawing();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvasImg.src = " ";
    }

    enableDrawing() {
        if (this.isEnabled) return;
        this.canvasImg.style.display = "none"; // Hide the image (needed only for guessers)
        this.toolBar.style.display = "flex"; // Show the toolbar

        this.isEnabled = true;
        console.log('[Canvas] Drawing enabled');

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
        this.canvasImg.style.display = "block"; // Show the image (needed only for guessers)
        this.toolBar.style.display = "none"; // Hide the toolbar
        this.isEnabled = false;
        console.log('[Canvas] Drawing disabled');

        // Remove all event listeners
        this.canvas.removeEventListener("mousedown", this.startDrawing);
        this.canvas.removeEventListener("mouseup", this.stopDrawing);
        this.canvas.removeEventListener("mousemove", this.drawing);

        this.canvas.removeEventListener("touchstart", this.touchStartDrawing);
        this.canvas.removeEventListener("touchend", this.touchStopDrawing);
        this.canvas.removeEventListener("touchmove", this.touchDrawing);
    }

    sendNewUpdate() {
        // Send a new update as a png image
        if (this.duringCooldown) return;
        this.duringCooldown = true;
        setTimeout(() => {
            this.networkHandler.send(NetworkConfig.HEADERS.CANVAS_UPDATE, this.canvas.toDataURL());
            this.duringCooldown = false;
        }, CanvasConfig.SENDING_INTERVAL); // Send the updates with an interval
    }

    handleUpdate(canvasUpdate) {
        // Display the new update
       this.canvasImg.src = canvasUpdate;
    }
}

