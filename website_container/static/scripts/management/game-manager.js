
class GameManger {

    constructor() {
        this.player = {username: null, isHost: null};
        this.networkHandler = new NetworkHandler();      
    }

    initiatePlayer() {
        // This function checks if the user is the host of the game.
        return new Promise(async (resolve, reject) => {
            await this.networkHandler.connectToGameServer();

            var username = document.getElementById('username-text').value;
            if (username == '') {
                alert('Please enter a username');
                return;
            }
            
            this.player.username = username;
            this.networkHandler.sendJson(this.player); // Send username to server
            this.player = await this.networkHandler.receiveJson(); // Receive player object from server
            resolve();
        });
    }

    moveToWaitScreen() {
        console.log("Moving to wait screen");
        return new Promise(async (resolve, reject) => {
            var usernameContainer = document.querySelector(".username");
            var hostWaitScreen = document.getElementById("host-wait-screen");
            var guestWaitScreen = document.getElementById("guest-wait-screen");
            var startGameButton = document.getElementById("start-game-button");
    
            usernameContainer.style.display = "none";
            if (this.player.isHost) {
                hostWaitScreen.style.display = "flex";
            }
            else {
                guestWaitScreen.style.display = "flex";
            }
    
            if (this.player.isHost) {
                // Wait for the button to be pressed
                await new Promise((resolve, reject) => {
                    startGameButton.addEventListener('click', resolve);
                });
                await this.networkHandler.connectToGameServer();
                console.log(this.networkHandler.getSocketState());
                this.networkHandler.send("start");
            }
        });
    }

    getServerUpdate() {
        // Parse the data received from the server
        // Update the game state
        serverUpdate = self.networkHandler.receiveJson();
        this.player = serverUpdate.player;
    }
}
