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
        // Send a new update as a png image
        if (this.duringCooldown) return;
        this.duringCooldown = true;
        setTimeout(() => {
            console.log("[Canvas Net] Sending new update");
            this.networkHandler.send(NetworkConfig.HEADERS.CANVAS_UPDATE, this.canvas.canvas.toDataURL());
            this.duringCooldown = false;
        }, CanvasConfig.SENDING_INTERVAL);
    }

    handleUpdate(canvasUpdate) {
        // Display the new update
        let canvasImg = document.getElementById("canvas-img");
        canvasImg.src = canvasUpdate;
    }
}