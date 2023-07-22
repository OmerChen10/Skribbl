import { CanvasConfig, NetworkConfig } from "../constants.js";
import { CanvasPacket } from "../utils.js";
import { NetworkHandler } from "../management/network-handler.js";


export class CanvasNet {
    constructor(canvas, networkHandler) {
        this.canvas = canvas;
        this.networkHandler = networkHandler;

        this.duringCooldown = false;
    }

    sendNewUpdate() {
        if (!this.duringCooldown) {
            this.duringCooldown = true;
            setTimeout(() => {
                this.networkHandler.send(NetworkConfig.HEADERS.CANVAS_UPDATE, 
                    new CanvasPacket(CanvasConfig.ACTIONS.DRAWING, this.canvas.getMousePoses()));

                this.duringCooldown = false;
            }, CanvasConfig.SENDING_INTERVAL);
        }
    }

    startDrawing() {
        this.networkHandler.send(NetworkConfig.HEADERS.CANVAS_UPDATE, 
            new CanvasPacket(CanvasConfig.ACTIONS.START_DRAWING));    
    }

    stopDrawing() {
        // delay the stop drawing to prevent the packet from arriving before the drawing packet
        setTimeout(() => {
            this.networkHandler.send(NetworkConfig.HEADERS.CANVAS_UPDATE, 
                new CanvasPacket(CanvasConfig.ACTIONS.STOP_DRAWING));
            }, 100);
    }

    handleUpdate(canvasUpdate) {
        canvasUpdate = JSON.parse(canvasUpdate);
        let poseX, poseY;

        switch (canvasUpdate.header) {
            case CanvasConfig.ACTIONS.START_DRAWING:
                this.canvas.ctx.beginPath();
                break;

            case CanvasConfig.ACTIONS.STOP_DRAWING:
                this.canvas.ctx.closePath();
                this.lasPos = null;
                break;

            case CanvasConfig.ACTIONS.DRAWING:
                if (this.lasPos != null) { // Prevent the holes that are created between the chunks of data.
                    this.canvas.ctx.lineTo(this.lasPos[0], this.lasPos[1]);
                    this.canvas.ctx.stroke();
                } 

                for (let i = 0; i < canvasUpdate.data.length; i++) { // Draw the new mouse positions
                    poseX = canvasUpdate.data[i][0] * this.canvas.canvas.width; // Convert the mouse position to the canvas's size
                    poseY = canvasUpdate.data[i][1] * this.canvas.canvas.height; // Convert the mouse position to the canvas's size
                    this.canvas.ctx.lineTo(poseX, poseY);
                    this.canvas.ctx.stroke();
                }
                
                this.lasPos = [poseX, poseY];        
        }
    }
}