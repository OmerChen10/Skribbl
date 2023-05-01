
class GameManger {
    constructor() {
        this.networkHandler = new NetworkHandler(this);
        this.canvas = new Canvas();
        this.player_data = {
            "username": null,
            "isHost": null,
            "isDrawer": null
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
            await waitForEvent("is-host");
            resolve();
        });
    }
    moveToWaitScreen() {
        console.log("Moving to wait screen");
        return new Promise(async (resolve, reject) => {
            let usernameContainer = document.querySelector(".username");
            let hostWaitScreen = document.getElementById("host-wait-screen");
            let guestWaitScreen = document.getElementById("guest-wait-screen");
            let startGameButton = document.getElementById("start-game-button");

            usernameContainer.style.display = "none";
            if (this.player_data.isHost) {
                hostWaitScreen.style.display = "flex";

                startGameButton.addEventListener("click", () => {
                    this.networkHandler.send(this.Headers.GAME_STATE, "host-ready")
                });
            }

            else {
                guestWaitScreen.style.display = "flex";
            }
            
            await waitForEvent("game-started");
            resolve();
        });
    }
    moveToGameScreen() {
        return new Promise((resolve, reject) => {
            console.log("Moving to game screen");

            document.getElementById("host-wait-screen").style.display = "none";
            document.getElementById("guest-wait-screen").style.display = "none";

            let gameContainer = document.querySelector(".game");
            gameContainer.style.display = "flex";
        });
    }

    async roundInit(){
        console.log("Initiating round");
        await waitForEvent("new-player-role")
        console.log("Drawer: " + this.player_data.isDrawer)
        if (this.player_data.isDrawer) {
            this.canvas.enableDrawing();
        }
        else {
            this.canvas.disableDrawing();
        }
    }

    async runRound() {
        return new Promise(async (resolve, reject) => {
            console.log("New round started");
            document.addEventListener("end-round", () => {
                console.log("Round ended.");
                resolve();
            });

            if (this.player_data.isDrawer) {
                await this.canvas.enableDrawing();
            }
            else {
                await this.canvas.disableDrawing();
            }
        });
    }

    async startGameLoop() {
        return new Promise(async (resolve, reject) => {
            console.log("Starting game loop");
            await this.moveToGameScreen();
            document.addEventListener("end-game", () => {
                this.networkHandler.stop();
                resolve();
            });

            while (true) {
                await waitForEvent("init-round");
                await this.roundInit();
                await this.runRound();
            }
        });
    }
}
