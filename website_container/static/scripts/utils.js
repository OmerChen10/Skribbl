 
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