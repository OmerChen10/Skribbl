import threading
import random
import time
from client_container.network_handler import NetworkHandler
from client_container.client_handler import ClientHandler
from game_container.utils import Timer
from Constants import *


class GameManger(threading.Thread):
    def __init__(self, network_handler: NetworkHandler) -> None:
        threading.Thread.__init__(self)

        self.network_handler: NetworkHandler = network_handler
        self.num_of_players = 0
        self.remaining_drawers = None
        self.current_round = 0
        self.timer = Timer()

    def run(self):
        print("[Game Manager] Starting game manager")

        self.waitForStart()
        self.startGame()
        self.finish_game()

    def waitForStart(self) -> None:
        print("[Game Manager] Waiting for game to start")

        while (self.network_handler.host is None):
            time.sleep(0.1)

        self.network_handler.host.ready.wait()

    def startGame(self) -> None:
        print("[Game Manager] Starting game")
        self.num_of_players = self.network_handler.num_clients
        self.remaining_drawers = self.network_handler.clients.copy()
        self.network_handler.send_to_all_clients(
            Headers.GAME_STATE, "game-started")

        self.start_game_loop()

    def start_game_loop(self) -> None:

        for current_round in range(self.num_of_players):
            self.current_round = current_round + 1
            print(f"[Game Manager] Starting round {self.current_round}")
            self.network_handler.send_to_all_clients(
                Headers.GAME_STATE, "init-round")

            self.send_new_roles()  # Send each player it's role.
            self.round_loop()

            self.network_handler.send_to_all_clients(
                Headers.GAME_STATE, "end-round")
            print(f"[Game Manager] Round {self.current_round} ended.")

    def send_new_roles(self) -> None:
        """Send each player it's role for the current round."""

        if (self.num_of_players == 1):
            # If there is only one player, he is the drawer.
            self.drawer = self.network_handler.clients[0]

        else:
            self.drawer = self.remaining_drawers[random.randint(
                0, len(self.remaining_drawers) - 1)]

        self.remaining_drawers.remove(self.drawer)

        for player in self.network_handler.clients:
            if (player is self.drawer):
                player.send(Headers.PLAYER_ROLE, True)

            else:
                player.send(Headers.PLAYER_ROLE, False)

        print("[Game Manager] Current drawer: " + str(self.drawer.name))

    def round_loop(self) -> None:
        """The main loop of the round."""

        self.timer.start(GameConfig.round_time)
        while (not self.timer.done.is_set()):
            if (self.drawer.canvas_update.is_set()):

                self.network_handler.send_to_guessers(
                    self.drawer,
                    Headers.CANVAS_UPDATE,
                    self.drawer.get_canvas_update()
                )

    def finish_game(self) -> None:
        """End the game."""

        self.network_handler.send_to_all_clients(
            Headers.GAME_STATE, "game-ended")
