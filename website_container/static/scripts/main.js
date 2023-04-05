
async function main(){
    // Connect to game server.
    const isHost = await connectToGameServer(); 
    await MoveToWaitScreen(isHost);
}