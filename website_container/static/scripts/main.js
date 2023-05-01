
async function main(){
    var gameManager = new GameManger();
    await gameManager.initiatePlayer();
    await gameManager.moveToWaitScreen();
    await gameManager.roundInit();
    await gameManager.moveToGameScreen();
}