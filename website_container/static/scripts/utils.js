 
function waitForEvent(eventName){
    return new Promise((resolve, reject) => {
        document.addEventListener(eventName, () => {
            resolve();
        });
    });
}    

function waitForSeconds(seconds){
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}