import { waitForEvents } from "../utils.js";
import { NetworkConfig } from "../constants.js";
import { NetworkHandler } from "./network-handler.js";
import { Canvas } from "../canvas.js";


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
            await this.showWaitScreen();
            resolve();
        });
    }

    async initGame() {
        return new Promise(async (resolve, reject) => {

            document.addEventListener("game-ended", () => {
                console.log("[Game Manager] Game ended");
                resolve();
            });

            // Setup event listeners for word updates
            document.addEventListener("new-word", (e) => {
                if (!this.player_data.guessedCorrectly) {
                    // Display the word to the player
                    document.getElementById("word-text").textContent = e.detail;
                }
            });

            while (true) {
                await waitForEvents("new-round");
                await this.runRound();
            }
        });
    }

    async runRound() {
        return new Promise(async (resolve, reject) => {
            this.player_data.guessedCorrectly = false;
            console.log("[Game Manager] Starting new round");

            document.addEventListener("end-round", () => {
                console.log("[Game Manager] Round ended");
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

    startDrawerLoop() {
        this.canvas.enableDrawing();
        let duringCooldown = false;
        document.getElementById("guess-input").style.display = "none";
    }

    startGuesserLoop() {
        this.canvas.disableDrawing();
        this.canvas.reinitialize();

        document.getElementById("guess-input").style.display = "flex";

        document.getElementById("word-submit-button").addEventListener("click", () => {
            let guess = document.getElementById("word-input").value;
            this.networkHandler.send(NetworkConfig.HEADERS.GUESS, guess); // Send the guess to the server
            // Clear the input
            document.getElementById("word-input").value = "";
        });

        document.addEventListener("guess-correct", (e) => {
            console.log("[Game Manager] Guess correct");
            document.getElementById("guess-input").style.display = "none";
            document.getElementById("word-text").textContent = e.detail;
        });
    }

    changeScreen(screen) {
        let screens = document.querySelectorAll(".screen");
        for (let screenElement of screens) {
            screenElement.style.display = "none";
        }

        switch (screen) {
            case "game-screen":
                document.getElementById("game-screen").style.display = "flex";
                this.canvas.reinitialize();
                break;

            case "leaderboard":
                this.showLeaderboard();
                break;

            case "end-screen":
                this.showEndScreen();
                break;

            default:
                break;
        }
    }

    showWaitScreen() {
        console.log("[Game Manager] Waiting for the game to start");
        return new Promise(async (resolve, reject) => {
            let usernameContainer = document.getElementById("username");
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

    showGameScreen() {
        return new Promise((resolve, reject) => {
            console.log("[Game Manager] Starting the game");

            document.getElementById("host-wait-screen").style.display = "none";
            document.getElementById("guest-wait-screen").style.display = "none";

            let gameContainer = document.getElementById("game-screen");
            gameContainer.style.display = "flex";

            resolve();
        });
    }

    showLeaderboard(leaderboardUpdate) {
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
        document.getElementById("end-screen").style.display = "flex";

        let winnerText = document.getElementById("winner-text");
        winnerText.textContent = "THE WINNER IS: " + winner.name + "!" + 
                                 "\nWITH A SCORE OF: " + winner.score + " POINTS!";
    }
}
