import { GameManger } from "./management/game-manager.js";

// Add event listener to the join button
let joinButton = document.getElementById("join-button");
joinButton.addEventListener("click", main);
    

async function main(){
    var gameManager = new GameManger();
    await gameManager.initiatePlayer();
    await gameManager.initGame();
}
