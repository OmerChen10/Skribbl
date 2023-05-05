
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
            IS_HOST: 2,
            PLAYER_ROLE: 3,
            CANVAS_UPDATE: 4,
            DEBUG: 5
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

            resolve();
        });
    }

    async runRound() {
        return new Promise(async (resolve, reject) => {
            console.log("New round started");

            await waitForEvent("new-player-role")

            document.addEventListener("end-round", () => {
                console.log("Round ended");
                this.canvas.reset();
                resolve();
            });

            if (this.player_data.isDrawer) {
                this.startDrawerLoop();
            }
            else{
                this.startGuesserLoop();
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
                await this.runRound();
            }
        });
    }

    startDrawerLoop() {
        this.canvas.enableDrawing();
        let duringCooldown = false;

        document.addEventListener("canvas-update", (e) => {
            if (!duringCooldown) {
                duringCooldown = true;
                setTimeout(() => {
                    console.log("Sending canvas update");
                    this.networkHandler.sendJson(this.Headers.CANVAS_UPDATE, this.canvas.getMousePoses());
                    duringCooldown = false;
                }, 100);
            }
        });
    }

    startGuesserLoop() {
        this.canvas.disableDrawing();
        this.canvas.update();
    }
}
