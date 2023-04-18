
class GameManger {

    constructor() {
        this.networkHandler = new NetworkHandler();   
        this.player_data = {
            "username" : null,
            "isHost" : null
        }
        this.game = {
            "game_data" : {
                "game_state" : null
            }
        }   
    }

    initiatePlayer() {
        // This function checks if the user is the host of the game.
        return new Promise(async (resolve, reject) => {
            await this.networkHandler.connectToGameServer();

            var username = document.getElementById('username-text').value;
            if (username == '') {
                alert('Please enter a username');
                return;
            }
            
            this.player_data.username = username;
            await this.sendPlayerUpdate(); // Send the username to the server
            await this.getPlayerUpdate(); // Get whether the user is the host or not

            resolve();
        });
    }

    moveToWaitScreen() {
        console.log("MOVING TO WAIT SCREEN");
        return new Promise(async (resolve, reject) => {
            let usernameContainer = document.querySelector(".username");
            let hostWaitScreen = document.getElementById("host-wait-screen");
            let guestWaitScreen = document.getElementById("guest-wait-screen");
            let startGameButton = document.getElementById("start-game-button");
    
            usernameContainer.style.display = "none";
            if (this.player_data.isHost) {
                hostWaitScreen.style.display = "flex";

                startGameButton.addEventListener("click", () => {
                    this.game.game_data.game_state = "start";
                    this.sendGameUpdate();
                    resolve();
                });
            }

            else {
                guestWaitScreen.style.display = "flex";
                resolve();
            }
        });
    }

    waitForGameToStart() {
        return new Promise(async (resolve, reject) => {
            // Wait for the game state to change to "active"
            await this.getGameUpdate();
            if (this.game.game_data.game_state == "active") {
                console.log("GAME STARTED");
                resolve();
            }
        });
    }
    moveToGameScreen() {
        return new Promise((resolve, reject) => {
            console.log("MOVING TO GAME SCREEN");
            
            let gameContainer = document.querySelector(".game");

            if (this.player_data.isHost) {
                document.getElementById("host-wait-screen").style.display = "none";
            }
            else {
                document.getElementById("guest-wait-screen").style.display = "none";
            }

            gameContainer.style.display = "flex";
        });
    }

    async getGameUpdate() {
        this.game = await this.networkHandler.receiveJson();
    }

    async sendGameUpdate() {
        this.networkHandler.sendJson(this.game);
    }

    async getPlayerUpdate() {
        this.player_data = await this.networkHandler.receiveJson();
    }

    async sendPlayerUpdate() {
        this.networkHandler.sendJson(this.player_data);
    }
}
