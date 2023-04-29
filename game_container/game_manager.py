import threading, random, time
from client_container.network_handler import NetworkHandler
from client_container.client_handler import ClientHandler
from Constants import Headers


class GameManger(threading.Thread):
    def __init__(self, network_handler: NetworkHandler) -> None:
        threading.Thread.__init__(self)

        self.network_handler: NetworkHandler = network_handler
        self.num_of_players = 0
        self.players = None

    def run(self):
        print("[Game Manager] Starting game manager")
        
        self.waitForStart()

    def waitForStart(self) -> None:
        print("[Game Manager] Waiting for game to start")

        while (self.network_handler.host is None):
            time.sleep(0.1)

        self.network_handler.host.ready.wait()
        self.startGame()

    def startGame(self) -> None:
        print("[Game Manager] Starting game")
        self.network_handler.send_to_all_clients(Headers.GAME_STATE, "ACTIVE")
        self.num_of_players = self.network_handler.num_clients

        # self.start_game_loop()

    def start_game_loop(self) -> None:

        remaining_drawers = self.network_handler.clients

        for current_round in range(self.num_of_players):
            print(f"[Game Manager] Starting round {current_round}")
            drawer = remaining_drawers[random.randint(0, self.num_of_players - 1)]

            self.send_current_roles(drawer) # Send each player it's role.


    def send_current_roles(self, drawer: ClientHandler) -> None:
        """Send each player it's role for the current round."""

        for player in self.network_handler.clients:
            if (player is drawer):
                player.player_data["role"] = "drawer"
                self.network_handler.send_to_client(player, player.player_data)

            else:
                player.player_data["role"] = "guesser"
                self.network_handler.send_to_client(player, player.player_data)


        
        

                
