 
export function waitForEvents(...events){
    // Resolve when all the events are fired

    return new Promise((resolve, reject) => {
        let eventCounter = 0;
        for (let i = 0; i < events.length; i++) {
            document.addEventListener(events[i], (e) => {
                eventCounter++;
                resolve();
            });
        }
    });
}    

export function waitForSeconds(seconds){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}


export class CanvasPacket {
    constructor(header, data) {
        this.header = header;
        this.data = data;
    }

    build() {
        return JSON.stringify(this);
    }
}