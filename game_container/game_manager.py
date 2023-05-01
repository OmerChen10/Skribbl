import threading, random, time
from client_container.network_handler import NetworkHandler
from client_container.client_handler import ClientHandler
from Constants import Headers


class GameManger(threading.Thread):
    def __init__(self, network_handler: NetworkHandler) -> None:
        threading.Thread.__init__(self)

        self.network_handler: NetworkHandler = network_handler
        self.num_of_players = 0
        self.remaining_drawers = None
        self.current_round = 0

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
        self.num_of_players = self.network_handler.num_clients
        self.remaining_drawers = self.network_handler.clients.copy()

        self.start_game_loop()

    def start_game_loop(self) -> None:

        for current_round in range(self.num_of_players):
            self.current_round = current_round + 1
            print(f"[Game Manager] Starting round {self.current_round}")
            self.network_handler.send_to_all_clients(Headers.GAME_STATE, "game-started")
            
            self.send_current_roles() # Send each player it's role.

            time.sleep(10)


    def send_current_roles(self) -> None:
        """Send each player it's role for the current round."""

        if (self.num_of_players == 1):
            drawer = self.network_handler.clients[0] # If there is only one player, he is the drawer.

        else:
            drawer = self.remaining_drawers[random.randint(0, len(self.remaining_drawers) - 1)]
        
        self.remaining_drawers.remove(drawer)

        for player in self.network_handler.clients:
            if (player is drawer):
                player.send(Headers.PLAYER_ROLE, True)

            else:
                player.send(Headers.PLAYER_ROLE, False)

        print("[Game Manager] Role assignment finished.")


        
        

                
