
class Canvas {
    constructor(){
        this.initialize();
    }

    initialize(){
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        this.canvasPos = this.canvas.getBoundingClientRect();
        this.isDrawing = false;
        this.isEnabled = false;
        this.mouse_poses = [];

        this.drawing = (e) => {
            if (!this.isDrawing) return;

            this.mouse_poses.push([e.offsetX, e.offsetY]);
            this.ctx.lineTo(e.offsetX, e.offsetY);
            this.ctx.stroke();

            document.dispatchEvent(new Event('canvas-update'));
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

            this.update();
            // Calculate the position of the touch relative to the canvas
            offsetX = e.touches[0].clientX - this.canvasPos.left;
            offsetY = e.touches[0].clientY - this.canvasPos.top;

            this.ctx.lineTo(offsetX, offsetY);
            this.ctx.stroke();

            document.dispatchEvent(new Event('canvas-update'));
        }

        console.log("Canvas initialized.")
    }

    update(){
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.canvasPos = this.canvas.getBoundingClientRect();
    }

    reset() {
        this.disableDrawing();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    getImage(){
        let img = new Image();
        img.src = this.canvas.toDataURL();
        return img;
    }

    getMousePoses(){
        let mousePoses = this.mouse_poses;
        this.mouse_poses = [];
        return mousePoses;
    }

    drawMousePoses(mousePoses){
        this.ctx.beginPath();

        for (let i = 0; i < mousePoses.length; i++) {
            this.ctx.lineTo(mousePoses[i][0], mousePoses[i][1]);
            this.ctx.stroke();
        }

        this.ctx.closePath();
    }

    enableDrawing(){
        if (this.isEnabled) return;
        this.isEnabled = true;
        console.log('Drawing enabled'); 
        
        this.update();
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

    disableDrawing(){
        if (!this.isEnabled) return;
        this.isEnabled = false;
        console.log('Drawing disabled'); 
        
        this.update();

        // Remove all event listeners
        this.canvas.removeEventListener("mousedown", this.startDrawing);
        this.canvas.removeEventListener("mouseup", this.stopDrawing);
        this.canvas.removeEventListener("mousemove", this.drawing);

        this.canvas.removeEventListener("touchstart", this.touchStartDrawing);
        this.canvas.removeEventListener("touchend", this.touchStopDrawing);
        this.canvas.removeEventListener("touchmove", this.touchDrawing);
    }
}

