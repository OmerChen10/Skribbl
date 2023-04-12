
async function main(){
    var gameManager = new GameManger();
    await gameManager.initiatePlayer();
    await gameManager.moveToWaitScreen();
    await gameManager.waitForGameToStart();
}