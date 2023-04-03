function connect() {
    const username = document.getElementById('username').value;
    const gameCode = document.getElementById('gameCode').value;

    console.log('CONNECTING TO SERVER');
    const ws = new WebSocket('ws://localhost:' + gameCode); // Connect to server

    ws.onopen = function(event) {
        console.log('CONNECTED TO GAME SERVER'); 
        ws.send(username); // Send username to server
    };

    location.href = '/' + gameCode; // Redirect to game.html
}