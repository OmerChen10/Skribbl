
function MoveToWaitScreen(isHost, networkHandler) {
    console.log("Moving to wait screen");
    return new Promise(async (resolve, reject) => {
        var usernameContainer = document.querySelector(".username");
        var hostWaitScreen = document.getElementById("host-wait-screen");
        var guestWaitScreen = document.getElementById("guest-wait-screen");
        var startGameButton = document.getElementById("start-game-button");

        usernameContainer.style.display = "none";
        if (isHost) {
            hostWaitScreen.style.display = "flex";
        }
        else {
            guestWaitScreen.style.display = "flex";
        }

        if (isHost) {
            console.log(networkHandler.getSocketState());
            // Wait for the button to be pressed
            await new Promise((resolve, reject) => {
                startGameButton.addEventListener('click', resolve);
            });
            console.log(networkHandler.getSocketState());
        }

        serverMsg = await networkHandler.receive()
        if (serverMsg == 'start') {
            console.log("Game is starting");
            resolve();
        }
    });
}