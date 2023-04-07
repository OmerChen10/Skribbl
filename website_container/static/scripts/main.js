
var isHost, networkHandler;
async function main(){
    networkHandler = new NetworkHandler(); // Create a new network handler
    await networkHandler.connectToGameServer(); // Connect to the game server
    isHost = await networkHandler.initiatePlayer(); // Initiate player and get if they are the host
    await MoveToWaitScreen(isHost, networkHandler);
}