
class CanvasNet {
    constructor(canvas, networkHandler) {
        this.canvas = canvas;
        this.networkHandler = networkHandler;
        this.headers = {
            START_DRAWING: 1,
            STOP_DRAWING: 2,
            DRAWING: 3
        }
        this.duringCooldown = false;
    }

    sendNewUpdate() {
        if (!this.duringCooldown) {
            this.duringCooldown = true;
            setTimeout(() => {
                console.log("Sending canvas update");
                this.networkHandler.sendJson(this.networkHandler.Headers.CANVAS_UPDATE, 
                    {"header": this.headers.DRAWING, 
                     "data": this.canvas.getMousePoses()});

                this.duringCooldown = false;
            }, 100);
        }
    }

    startDrawing() {
        this.networkHandler.sendJson(this.networkHandler.Headers.CANVAS_UPDATE, 
            {"header": this.headers.START_DRAWING, 
             "data": null});
    }

    stopDrawing() {
        // delay the stop drawing to prevent the packet from arriving before the drawing packet
        setTimeout(() => {
            this.networkHandler.sendJson(this.networkHandler.Headers.CANVAS_UPDATE, 
                {"header": this.headers.STOP_DRAWING, 
                "data": null});
            }, 100);
    }

    handleUpdate(canvasUpdate) {
        canvasUpdate = JSON.parse(canvasUpdate);
        switch (canvasUpdate.header) {
            case this.headers.START_DRAWING:
                this.canvas.ctx.beginPath();
                break;

            case this.headers.STOP_DRAWING:
                this.canvas.ctx.closePath();
                break;

            case this.headers.DRAWING:
                if (this.lasPos != null) { // Prevent the holes that are created between the chunks of data.
                    this.canvas.ctx.lineTo(this.lasPos[0], this.lasPos[1]);
                    this.canvas.ctx.stroke();
                } 

                for (let i = 0; i < canvasUpdate.data.length; i++) { // Draw the new mouse positions
                    this.lasPos = canvasUpdate.data;
                    this.canvas.ctx.lineTo(canvasUpdate.data[i][0], canvasUpdate.data[i][1]);
                }
                
                this.canvas.ctx.stroke();
        }
    }
}