function connect() {
    const username = document.getElementById('username').value;
    const gameCode = location.pathname.replace('/', '');  
    const ip = location.hostname;

    console.log('CONNECTING TO SERVER');
    const ws = new WebSocket('ws://' + ip + ':' + gameCode); // Connect to server
    
    ws.onopen = function(event) {
        console.log('CONNECTED TO GAME SERVER'); 
        ws.send(username); // Send username to server
    };
}