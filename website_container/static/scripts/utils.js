 
export function waitForEvent(eventName){
    return new Promise((resolve, reject) => {
        document.addEventListener(eventName, () => {
            resolve();
        });
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