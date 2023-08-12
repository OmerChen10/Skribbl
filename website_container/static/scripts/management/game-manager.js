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
            await this.networkHandler.connectToGameServer(); // Connect to the game server

            var username = document.getElementById('username-text').value; // Get the username from the input field
            if (username == '') {
                alert('Please enter a username');
                return;
            }

            this.player_data.username = username;
            this.networkHandler.sendRaw(username); // Send the username to the server
            await waitForEvents("is-host"); // Wait for the server to respond with the host status
            await this.showWaitScreen(); // Show the wait screen
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
                await waitForEvents("new-round"); // Wait for the server to start a new round
                await this.runRound(); // Run the round
            }
        });
    }

    async runRound() {
        return new Promise(async (resolve, reject) => {
            this.player_data.guessedCorrectly = false;
            console.log("[Game Manager] Starting new round");

            document.addEventListener("end-round", () => {
                console.log("[Game Manager] Round ended");
                this.canvas.reset(); // Reset the canvas
                resolve();
            });
            
            // Run the appropriate loop
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
        document.getElementById("guess-input").style.display = "none"; // Hide the guess input (needed only for guessers)
    }

    startGuesserLoop() {
        this.canvas.disableDrawing();
        this.canvas.reinitialize(); // Reinitialize the canvas

        document.getElementById("guess-input").style.display = "flex"; // Show the guess input (needed only for guessers)

        document.getElementById("word-submit-button").addEventListener("click", () => {
            let guess = document.getElementById("word-input").value; // Get the guess from the input
            this.networkHandler.send(NetworkConfig.HEADERS.GUESS, guess); // Send the guess to the server
            // Clear the input
            document.getElementById("word-input").value = ""; 
        });

        document.addEventListener("guess-correct", (e) => {
            console.log("[Game Manager] Guess correct");
            document.getElementById("guess-input").style.display = "none"; // Hide the guess input (not needed anymore)
            document.getElementById("word-text").textContent = e.detail; // Display the full word
        });
    }

    changeScreen(screen) {

        // Hide all the screens
        let screens = document.querySelectorAll(".screen"); 
        for (let screenElement of screens) {
            screenElement.style.display = "none";
        }

        // Show the requested screen
        switch (screen) {
            case "game-screen":
                this.showGameScreen();
                this.canvas.reinitialize(); // Reinitialize the canvas
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

            usernameContainer.style.display = "none"; // Hide the username container
            if (this.player_data.isHost) { // Show the appropriate wait screen
                hostWaitScreen.style.display = "flex";

                startGameButton.addEventListener("click", () => {
                    this.networkHandler.send(NetworkConfig.HEADERS.GAME_STATE, "host-ready")
                });
            }

            else {
                guestWaitScreen.style.display = "flex";
            }
            
            await waitForEvents("game-started"); // Wait for the server to start the game
            resolve();
        });
    }

    showGameScreen() {
        return new Promise((resolve, reject) => {
            console.log("[Game Manager] Starting the game");

            let gameContainer = document.getElementById("game-screen");
            gameContainer.style.display = "flex";

            resolve();
        });
    }

    showLeaderboard() {
        document.getElementById("leaderboard").style.display = "flex";

        let playerList = document.getElementById("player-list");
        playerList.innerHTML = "";
        
        for (let playerData of this.game.leaderboard) { // Add all the players to the leaderboard 
            let playerElement = document.createElement("li");
            playerElement.textContent = playerData;
            playerList.appendChild(playerElement);
        }
 
    }

    showEndScreen() {
        document.getElementById("end-screen").style.display = "flex";

        let winnerText = document.getElementById("winner-text"); // Display the winner text
        winnerText.textContent = "THE WINNER IS: " + this.game.winner.name + "!" + 
                                 "\nWITH A SCORE OF: " + this.game.winner.score + " POINTS!";
    }
}
