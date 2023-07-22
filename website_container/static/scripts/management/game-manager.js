import { waitForEvents } from "../utils.js";
import { NetworkConfig } from "../constants.js";
import { NetworkHandler } from "./network-handler.js";
import { Canvas } from "../Canvas/canvas.js";


export class GameManger {
    constructor() {
        this.networkHandler = new NetworkHandler(this);
        this.canvas = new Canvas(this.networkHandler);
        this.player_data = {
            "username": null,
            "isHost": null,
            "isDrawer": null,
            "guessedCorrectly": false
        }
        this.game = {
            "gameState": null
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
            await waitForEvents("is-host");
            resolve();
        });
    }
    
    moveToWaitScreen() {
        console.log("[Game Manager] Waiting for the game to start");
        return new Promise(async (resolve, reject) => {
            let usernameContainer = document.querySelector(".username");
            let hostWaitScreen = document.getElementById("host-wait-screen");
            let guestWaitScreen = document.getElementById("guest-wait-screen");
            let startGameButton = document.getElementById("start-game-button");

            usernameContainer.style.display = "none";
            if (this.player_data.isHost) {
                hostWaitScreen.style.display = "flex";

                startGameButton.addEventListener("click", () => {
                    this.networkHandler.send(NetworkConfig.HEADERS.GAME_STATE, "host-ready")
                });
            }

            else {
                guestWaitScreen.style.display = "flex";
            }
            
            await waitForEvents("game-started");
            resolve();
        });
    }

    moveToGameScreen() {
        return new Promise((resolve, reject) => {
            console.log("[Game Manager] Starting the game");

            document.getElementById("host-wait-screen").style.display = "none";
            document.getElementById("guest-wait-screen").style.display = "none";

            let gameContainer = document.getElementById("main-container");
            gameContainer.style.display = "flex";

            resolve();
        });
    }

    async startGameLoop() {
        return new Promise(async (resolve, reject) => {

            await this.moveToGameScreen();

            document.addEventListener("game-ended", () => {
                console.log("[Game Manager] Game ended");

                document.addEventListener("end-screen", (e) => {
                    this.showEndScreen(e.detail);
                });

                resolve();
            });

            while (true) {
                await waitForEvents("init-round");
                await this.runRound();
            }
        });
    }

    async runRound() {
        return new Promise(async (resolve, reject) => {
            document.getElementById("leaderboard").style.display = "none";
            document.getElementById("main-container").style.display = "flex";

            console.log("[Game Manager] Starting new round");
            
            await waitForEvents("new-player-role", "new-word");

            document.addEventListener("end-round", () => {
                console.log("[Game Manager] Round ended");
                this.canvas.reset();
                
                document.addEventListener("leaderboard-update", (e) => {
                    this.showLeaderboard(e.detail);
                });

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

    startDrawerLoop() {
        document.querySelector(".guess").style.display = "none";
        this.canvas.enableDrawing();
        let duringCooldown = false;
    }

    startGuesserLoop() {
        this.canvas.disableDrawing();
        this.canvas.reinitialize();

        let guessInput = document.querySelector(".guess");
        guessInput.style.display = "flex";

        document.getElementById("word-submit-button").addEventListener("click", () => {
            let guess = document.getElementById("word-input").value;
            this.networkHandler.send(NetworkConfig.HEADERS.GUESS, guess); // Send the guess to the server
            // Clear the input
            document.getElementById("word-input").value = "";
        });

        document.addEventListener("guess-correct", () => {
            console.log("[Game Manager] Guess correct");
            guessInput.style.display = "none";
        });
    }

    showLeaderboard(leaderboardUpdate) {
        document.getElementById("main-container").style.display = "none";
        document.getElementById("leaderboard").style.display = "flex";

        let playerList = document.getElementById("player-list");
        playerList.innerHTML = "";
        
        for (let playerData of leaderboardUpdate) {
            let playerElement = document.createElement("li");
            playerElement.textContent = playerData;
            playerList.appendChild(playerElement);
        }
 
    }

    showEndScreen(winner) {
        document.getElementById("main-container").style.display = "none";
        document.getElementById("end-screen").style.display = "flex";

        let winnerText = document.getElementById("winner-text");
        winnerText.textContent = "THE WINNER IS: " + winner.name + "!" + 
                                 "\nWITH A SCORE OF: " + winner.score + " POINTS!";
    }
}
