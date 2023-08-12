import { NetworkConfig } from "../constants.js";


export class NetworkHandler{
    constructor(gameManager){
        this.ws = null;
        this.gameManager = gameManager;
        this.receivedNewMessage = false;
    }

    connectToGameServer(){
        return new Promise((resolve, reject) => {
            // Assemble the ip and port for connecting to the server
            const gameCode = location.pathname.replace('/', ''); // The game code is the port number of the server
            const ip = location.hostname; 
            this.ws = new WebSocket('ws://' + ip + ':' + gameCode); // Connect to server

            this.ws.onopen = function (event) {
                console.log("[Network Handler] Connected to server");
                resolve()
            };

            this.ws.onerror = function (event) {
                reject();
            }

            this.ws.onmessage = function (event) {
                this.receivedNewMessage = true;
                this.handlePendingRequests(event.data); // Handle the pending requests
            }.bind(this);
        });
    }

    getSocketState() {
        // Return the state of the ws connection
        return (this.ws.readyState == WebSocket.OPEN);
    }

    send(header, data){
        if(this.getSocketState()){
            this.ws.send(header + "===" + data);
        }
    }

    sendRaw(data){
        if(this.getSocketState()){
            this.ws.send(data);
        }
    }

    waitForNewMessage(){
        return new Promise((resolve, reject) => {
            this.ws.addEventListener("message", () => {
                resolve();
            });
        });
    }

    handlePendingRequests(msg){

        let request = msg.split("==="); // Split the message into header and data
        let header = parseInt(request[0]);
        let data = JSON.parse(request[1]).value;

        switch (header) {
            case NetworkConfig.HEADERS.GAME_STATE:
                // Dispatch a new event with the game state
                document.dispatchEvent(new CustomEvent(data));
                this.gameManager.game.game_state = data;
                break;

            case NetworkConfig.HEADERS.IS_HOST:
                this.gameManager.player_data.isHost = data;
                document.dispatchEvent(new CustomEvent("is-host"));
                break;

            case NetworkConfig.HEADERS.PLAYER_ROLE:
                // Update the player role
                this.gameManager.player_data.isDrawer = data;
                this.gameManager.player_data.guessedCorrectly = false;
                document.dispatchEvent(new CustomEvent("new-player-role"));
                break;

            case NetworkConfig.HEADERS.CANVAS_UPDATE:
                this.gameManager.canvas.handleUpdate(data);
                break;

            case NetworkConfig.HEADERS.WORD_UPDATE:
                document.dispatchEvent(new CustomEvent("new-word", { detail: data }));
                break;

            case NetworkConfig.HEADERS.GUESS_CORRECT:
                this.gameManager.player_data.guessedCorrectly = true;
                document.dispatchEvent(new CustomEvent("guess-correct", { detail: data }));
                break;

            case NetworkConfig.HEADERS.LEADERBOARD_UPDATE:
                this.gameManager.game.leaderboard = data;
                break;  

            case NetworkConfig.HEADERS.CHANGE_SCREEN:
                // Call the change screen function with the requested screen
                this.gameManager.changeScreen(data);
                break;

            case NetworkConfig.HEADERS.WINNER_UPDATE:
                this.gameManager.game.winner = data;
                break;

            default:
                break;
        }
    }
}

