import threading, random, time
from client_container import ClientHandler, client


class GameManger(threading.Thread):
    def __init__(self, client_handler: ClientHandler) -> None:
        threading.Thread.__init__(self)

        self.client_handler = client_handler
        self.num_of_players = 0
        self.players = None
        self.game = {
            "game_data": {
                "game_state": "waiting"
            }
        }

    def run(self):
        print("[Game Manager] Starting game manager")
        
        self.waitForStart()

    def waitForStart(self) -> None:
        print("[Game Manager] Waiting for game to start")

        while True: # TODO: Add thread events instead of while true loop.
            if (self.client_handler.host is not None):
                break

        game = self.client_handler.receive_from_client(self.client_handler.host)
        if (game["game_data"]["game_state"] == "start"):
            self.startGame()


    def startGame(self) -> None:
        print("[Game Manager] Starting the game")
        self.game["game_data"]["game_state"] = "active"
        self.client_handler.send_to_all_clients(self.game)
        self.num_of_players = self.client_handler.num_clients

        self.start_game_loop()

    def start_game_loop(self) -> None:

        remaining_drawers = self.client_handler.clients

        for current_round in range(self.num_of_players):
            print(f"[Game Manager] Starting round {current_round}")
            drawer = remaining_drawers[random.randint(0, self.num_of_players - 1)]

            self.send_current_roles(drawer) # Send each player it's role.


    def send_current_roles(self, drawer: client) -> None:
        """Send each player it's role for the current round."""

        for player in self.client_handler.clients:
            if (player is drawer):
                player.player_data["role"] = "drawer"
                self.client_handler.send_to_client(player, player.player_data)

            else:
                player.player_data["role"] = "guesser"
                self.client_handler.send_to_client(player, player.player_data)


        
        

                
