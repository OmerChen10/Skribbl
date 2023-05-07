
class CanvasNet {
    constructor(canvas, networkHandler) {
        this.canvas = canvas;
        this.networkHandler = networkHandler;
        this.actions = {
            START_DRAWING: 1,
            STOP_DRAWING: 2,
            DRAWING: 3
        }
        this.duringCooldown = false;
        this.sendingInterval = 100; // ms
    }

    sendNewUpdate() {
        if (!this.duringCooldown) {
            this.duringCooldown = true;
            setTimeout(() => {
                this.networkHandler.sendJson(this.networkHandler.Headers.CANVAS_UPDATE, 
                    {"header": this.actions.DRAWING, 
                     "data": this.canvas.getMousePoses()});

                this.duringCooldown = false;
            }, this.sendingInterval);
        }
    }

    startDrawing() {
        this.networkHandler.sendJson(this.networkHandler.Headers.CANVAS_UPDATE, 
            {"header": this.actions.START_DRAWING, 
             "data": null});
            
    }

    stopDrawing() {
        // delay the stop drawing to prevent the packet from arriving before the drawing packet
        setTimeout(() => {
            this.networkHandler.sendJson(this.networkHandler.Headers.CANVAS_UPDATE, 
                {"header": this.actions.STOP_DRAWING, 
                "data": null});
            }, 100);
    }

    handleUpdate(canvasUpdate) {
        canvasUpdate = JSON.parse(canvasUpdate);
        let poseX, poseY;

        switch (canvasUpdate.header) {
            case this.actions.START_DRAWING:
                this.canvas.ctx.beginPath();
                break;

            case this.actions.STOP_DRAWING:
                this.canvas.ctx.closePath();
                this.lasPos = null;
                break;

            case this.actions.DRAWING:
                if (this.lasPos != null) { // Prevent the holes that are created between the chunks of data.
                    this.canvas.ctx.lineTo(this.lasPos[0], this.lasPos[1]);
                    this.canvas.ctx.stroke();
                } 

                for (let i = 0; i < canvasUpdate.data.length; i++) { // Draw the new mouse positions
                    poseX = canvasUpdate.data[i][0] * this.canvas.canvas.width; // Convert the mouse position to the canvas's size
                    poseY = canvasUpdate.data[i][1] * this.canvas.canvas.height; // Convert the mouse position to the canvas's size
                    this.canvas.ctx.lineTo(poseX, poseY);
                }
                
                this.lasPos = [poseX, poseY];
                this.canvas.ctx.stroke();
        }
    }
}