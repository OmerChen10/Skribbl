 
function waitForVariable(variable, wantedValue){
    return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
            if(variable == wantedValue){
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}    