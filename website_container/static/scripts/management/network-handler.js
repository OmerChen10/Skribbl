import { NetworkConfig } from "../constants.js";
import { CanvasPacket } from "../utils.js";


export class NetworkHandler{
    constructor(gameManager){
        this.ws = null;
        this.gameManager = gameManager;
        this.receivedNewMessage = false;
    }

    connectToGameServer(){
        return new Promise((resolve, reject) => {
            const gameCode = location.pathname.replace('/', '');
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
                this.handlePendingRequests(event.data);
            }.bind(this);
        });
    }

    getSocketState() {
        // Return the state of the ws connection
        return (this.ws.readyState == WebSocket.OPEN);
    }

    send(header, data){
        if(this.getSocketState()){
            this.ws.send(header + "===" + data + "!END");
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

        let pendingRequests = msg.split("!END");
        for (let i = 0; i < pendingRequests.length - 1; i++) {
            let request = pendingRequests[i].split("===");
            // console.log(request);
            let header = parseInt(request[0]);
            let data = JSON.parse(request[1]).value;

            switch (header) {
                case NetworkConfig.HEADERS.GAME_STATE:
                    document.dispatchEvent(new CustomEvent(data));
                    this.gameManager.game.game_state = data;
                    break;

                case NetworkConfig.HEADERS.IS_HOST:
                    this.gameManager.player_data.isHost = data;
                    document.dispatchEvent(new CustomEvent("is-host"));
                    break;

                case NetworkConfig.HEADERS.PLAYER_ROLE:
                    this.gameManager.player_data.isDrawer = data;
                    this.gameManager.player_data.guessedCorrectly = false;
                    document.dispatchEvent(new CustomEvent("new-player-role"));
                    break;

                case NetworkConfig.HEADERS.CANVAS_UPDATE:
                    this.gameManager.canvas.handleUpdate(data);
                    break;

                case NetworkConfig.HEADERS.WORD_UPDATE:
                    document.dispatchEvent(new CustomEvent("new-word"));
                    if (this.gameManager.player_data.guessedCorrectly) { 
                        break;
                    }

                    document.getElementById("word-text").textContent = data;
                    break;

                case NetworkConfig.HEADERS.GUESS_CORRECT:
                    document.getElementById("word-text").textContent = data;
                    this.gameManager.player_data.guessedCorrectly = true;
                    document.dispatchEvent(new CustomEvent("guess-correct"));
                    break;

                case NetworkConfig.HEADERS.LEADERBOARD_UPDATE:
                    document.dispatchEvent(new CustomEvent("leaderboard-update", { detail: data }));
                    break;  

                case NetworkConfig.HEADERS.END_SCREEN:
                    document.dispatchEvent(new CustomEvent("end-screen", { detail: data }));
                    break;

                default:
                    break;
            }
        }

    }
}

