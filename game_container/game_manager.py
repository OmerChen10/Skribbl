import threading
import random
import time
from client_container.network_handler import NetworkHandler
from client_container.client_handler import ClientHandler
from game_container.utils import Timer, WordSelector
from Constants import *
from colorama import Fore, Style


class GameManger(threading.Thread):
    def __init__(self, network_handler: NetworkHandler) -> None:
        threading.Thread.__init__(self)

        self.network_handler: NetworkHandler = network_handler
        self.num_of_players = 0
        self.remaining_drawers = None
        self.round_timer = Timer()
        self.word_selector = WordSelector()
        self.reveal_timer = Timer()

        self.game_ended = threading.Event()

    def run(self):
        """ Starts the game manager. """
        print("[Game Manager] Starting game manager")

        self.waitForStart()
        self.startGame()
        self.finish_game()

    def waitForStart(self) -> None:
        """ Waits for the game to start. """

        print("[Game Manager] Waiting for game to start")

        while (self.network_handler.host is None):
            time.sleep(0.1)

        self.network_handler.host.ready.wait()

    def startGame(self) -> None:
        """ Starts the game. """

        print("[Game Manager] Starting game")
        self.num_of_players = self.network_handler.num_clients
        self.remaining_drawers = self.network_handler.clients.copy()
        self.network_handler.send_to_all_clients(
            Headers.GAME_STATE, "game-started")

        self.start_game_loop()

    def start_game_loop(self) -> None:
        """ The main loop of the game. """

        for current_round in range(self.num_of_players):
            print(f"[Game Manager] Starting round {current_round + 1}")
            self.network_handler.send_to_all_clients(
                Headers.GAME_STATE, "init-round")

            self.send_new_roles()  # Send each player it's role.
            self.send_new_word()  # Send the word to all clients.
            self.round_loop()  # Start the round loop.

            self.network_handler.send_to_all_clients(
                Headers.GAME_STATE, "end-round")

            print(f"[Game Manager] Round {current_round + 1} ended.")

    def send_new_roles(self) -> None:
        """Send each player it's role for the current round."""

        if (self.num_of_players == 1):
            # If there is only one player, he is the drawer.
            self.drawer = self.network_handler.clients[0]

        else:
            self.drawer = random.choice(self.remaining_drawers)

        self.remaining_drawers.remove(self.drawer)
        self.network_handler.set_drawer(self.drawer)

        for player in self.network_handler.clients:
            if (player is self.drawer):
                player.send(Headers.PLAYER_ROLE, True)

            else:
                player.send(Headers.PLAYER_ROLE, False)

        print("[Game Manager] Current drawer: " + str(self.drawer.name))

    def send_new_word(self) -> None:
        """ Picks a new word and sends it to all clients. """
        
        self.word_selector.pick_new_word()
        self.network_handler.send_to_guessers(  # Send the word to all clients.
            Headers.WORD_UPDATE,
            self.word_selector.get_client_view())

        self.drawer.send(Headers.WORD_UPDATE, self.word_selector.current_word)

    def round_loop(self) -> None:
        """The main loop of the round."""

        self.round_timer.start(GameConfig.ROUND_DURATION)
        self.reveal_timer.start(GameConfig.REVEAL_INTERVAL)

        while (not self.round_timer.is_done()):
            if (self.drawer.canvas_update.is_set()):
                self.network_handler.send_to_guessers( # Send the canvas update to all guessers.
                    Headers.CANVAS_UPDATE,
                    self.drawer.get_canvas_update()
                )
 
            if (self.reveal_timer.is_done()): # Reveal a letter.
                self.word_selector.reveal_letter()
                self.network_handler.send_to_guessers(
                    Headers.WORD_UPDATE,
                    self.word_selector.get_client_view())

                self.reveal_timer.start(GameConfig.REVEAL_INTERVAL)

            self.check_guesses()

            time.sleep(0.1)

        self.round_timer.reset()
        self.reveal_timer.reset()

    def check_guesses(self) -> None:
        """ Check each player's guess."""

        for player in self.network_handler.clients:
            if (player is not self.drawer):
                if (player.new_guess.is_set()):
                    if (player.get_new_guess() == self.word_selector.current_word):
                        player.send(Headers.GUESS_CORRECT, self.word_selector.current_word)

    def finish_game(self) -> None:
        """End the game."""

        self.network_handler.send_to_all_clients(
            Headers.GAME_STATE, "game-ended")

        self.game_ended.set()
        
