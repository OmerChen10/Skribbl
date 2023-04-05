
function MoveToWaitScreen(isHost) {
    console.log("Moving to wait screen");
    return new Promise((resolve, reject) => {
        var usernameContainer = document.querySelector(".username");
        var hostWaitScreen = document.getElementById("host-wait-screen");
        var guestWaitScreen = document.getElementById("guest-wait-screen");
        var startGameButton = document.getElementById("start-game-button");

        usernameContainer.style.display = "none";
        if (isHost) {
            hostWaitScreen.style.display = "flex";
            startGameButton.addEventListener("click", () => {

                resolve();
            });
        }
        else {
            guestWaitScreen.style.display = "flex";
        }
    });
}