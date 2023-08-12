import { GameManger } from "./management/game-manager.js";

// Add event listener to the join button
let joinButton = document.getElementById("join-button");
joinButton.addEventListener("click", main);
    

async function main(){
    var gameManager = new GameManger(); // Create a new game manager
    await gameManager.initiatePlayer(); // Initiate the player
    await gameManager.initGame(); // Initiate the game
} 
