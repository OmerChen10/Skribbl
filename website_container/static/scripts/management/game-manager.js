
class GameManger {
    constructor() {
        this.networkHandler = new NetworkHandler(this);
        this.player_data = {
            "username": null,
            "isHost": null,
            "role": null
        }
        this.game = {
            "game_state": null
        }

        this.Headers = {
            GAME_STATE: 1,
            IS_HOST: 2
        }
    }

    async initiatePlayer() {
        // This function checks if the user is the host of the game.
        return new Promise(async (resolve, reject) => {
            await this.networkHandler.connectToGameServer();

            var username = document.getElementById('username-text').value;
            if (username == '') {
                alert('Please enter a username');
                return;
            }

            this.player_data.username = username;
            this.networkHandler.sendRaw(username);
            await this.networkHandler.waitForNewMessage();

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
                    this.networkHandler.send(this.Headers.GAME_STATE, "START")
                });
            }

            else {
                guestWaitScreen.style.display = "flex";
            }

            document.addEventListener("game-started", () => {
                resolve();
            });
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
    async gameLoop() {
        while (true){
            await this.getPlayerUpdate();
            console.log("updaye received")
            //await this.getGameUpdate();

            if (this.player_data.role == "drawer"){
                console.log("DRAWER");
            }

            else {
                console.log("GUESSER");
            }
        }
    }
}
