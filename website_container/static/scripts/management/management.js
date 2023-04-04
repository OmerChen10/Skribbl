
function connectToGameServer() {
    // This function is used to connect the user to the game server.
    var username = document.getElementById('username').value;
    if (username == '') {
        alert('Please enter a username');
        return;
    }

    var usernameContainer = document.querySelector('#username-container');

    const gameCode = location.pathname.replace('/', '');
    const ip = location.hostname;

    console.log('CONNECTING TO SERVER');
    const ws = new WebSocket('ws://' + ip + ':' + gameCode); // Connect to server

    ws.onopen = function (event) {
        console.log('CONNECTED TO GAME SERVER');
        ws.send(username); // Send username to server
        usernameContainer.style.display = 'none'; // Hide username input
        initializeGame(); // Initialize canvas
    };
}