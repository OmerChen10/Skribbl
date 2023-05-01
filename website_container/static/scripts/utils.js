 
function waitForEvent(eventName){
    return new Promise((resolve, reject) => {
        document.addEventListener(eventName, () => {
            resolve();
        });
    });
}    