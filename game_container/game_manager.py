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
        self.daemon = True

        self.network_handler: NetworkHandler = network_handler
        self.num_of_players = 0
        self.remaining_drawers = None
        self.round_timer = Timer()
        self.reveal_timer = Timer()
        self.word_selector = WordSelector()

        self.correct_guesses = 0

        self.game_ended = threading.Event()

    def run(self):
        """ Starts the game manager. """
        print("[Game Manager] Starting game manager")

        self.waitForStart()  # Wait for the game to start.
        self.startGame()  # Start the game.
        self.finish_game()  # End the game.

    def waitForStart(self) -> None:
        """ Waits for the game to start. """

        print("[Game Manager] Waiting for game to start")

        # Wait for the host to be chosen.
        while (self.network_handler.host is None):
            time.sleep(0.1)

        # Wait for the host to be ready.
        self.network_handler.host.ready.wait()

    def startGame(self) -> None:
        """ Starts the game. """

        print("[Game Manager] Starting the game")
        # Set the number of players.
        self.num_of_players = self.network_handler.num_clients
        # Copy the list of clients.
        self.remaining_drawers = self.network_handler.clients.copy()
        self.network_handler.send_to_all_clients(
            Headers.GAME_STATE, "game-started")  # Notify all clients that the game has started.

        self.start_game_loop()

    def start_game_loop(self) -> None:
        """ The main loop of the game. """

        for current_round in range(self.num_of_players):
            print(f"[Game Manager] Starting round {current_round + 1}")

            self.send_new_roles()  # Send each player it's role.
            self.send_new_word()  # Send the word to all clients.

            self.network_handler.send_to_all_clients(
                Headers.GAME_STATE, "new-round")  # Notify all clients that a new round has started.

            self.network_handler.send_to_all_clients(
                Headers.CHANGE_SCREEN, "game-screen")  # Switch to the game screen.

            self.round_loop()  # Start the round loop.

            self.network_handler.send_to_all_clients(
                Headers.GAME_STATE, "end-round")

            print(f"[Game Manager] Round {current_round + 1} ended.")

            # If this is not the last round.
            if (not current_round == self.num_of_players - 1):
                # Switch to the leaderboard screen.
                self.network_handler.send_to_all_clients(
                    Headers.LEADERBOARD_UPDATE, self.assemble_leaderboard())

                self.network_handler.send_to_all_clients(
                    Headers.CHANGE_SCREEN, "leaderboard")

                time.sleep(GameConfig.ROUND_INTERVAL)

    def send_new_roles(self) -> None:
        """Send each player it's role for the current round."""

        if (self.num_of_players == 1):
            # If there is only one player, he is the drawer.
            self.drawer = self.network_handler.clients[0]

        else:
            # Pick a random drawer.
            self.drawer = random.choice(self.remaining_drawers)

        # Remove the drawer from the list of remaining drawers.
        self.remaining_drawers.remove(self.drawer)
        # Set the drawer in the network handler.
        self.network_handler.set_drawer(self.drawer)

        # Send each player it's role.
        for player in self.network_handler.clients:
            if (player is self.drawer):
                player.send(Headers.PLAYER_ROLE, True)

            else:
                player.send(Headers.PLAYER_ROLE, False)

        print("[Game Manager] Current drawer: " + str(self.drawer.name))

    def send_new_word(self) -> None:
        """ Picks a new word and sends it to all clients. """

        self.word_selector.pick_new_word()  # Pick a new word.
        self.network_handler.send_to_guessers(  # Send the word to all clients.
            Headers.WORD_UPDATE,
            self.word_selector.get_client_view())

        # Send the drawer the full word.
        self.drawer.send(Headers.WORD_UPDATE, self.word_selector.current_word)

    def round_loop(self) -> None:
        """The main loop of the round."""

        self.correct_guesses = 0
        # Start the round timer.
        self.round_timer.start(GameConfig.ROUND_DURATION)
        # Start the reveal timer.
        self.reveal_timer.start(GameConfig.REVEAL_INTERVAL)

        while (not self.round_timer.is_done()):
            # If the drawer updated the canvas.
            if (self.drawer.canvas_update.is_set()):
                self.network_handler.send_to_guessers(  # Send the canvas update to all guessers.
                    Headers.CANVAS_UPDATE,
                    self.drawer.get_canvas_update()
                )

            if (self.reveal_timer.is_done()):  # Reveal a letter.
                self.word_selector.reveal_letter()
                self.network_handler.send_to_guessers(
                    Headers.WORD_UPDATE,
                    self.word_selector.get_client_view())

                self.reveal_timer.start(GameConfig.REVEAL_INTERVAL)

            self.check_guesses()
            # If all players guessed the word, end the round.
            if (self.correct_guesses == self.num_of_players - 1):
                print("[Game Manager] All players guessed the word.")
                break

            time.sleep(0.1)

        # Reset the timers.
        self.round_timer.reset()
        self.reveal_timer.reset()

    def check_guesses(self) -> None:
        """ Check each player's guess."""

        for player in self.network_handler.clients:
            if (player is not self.drawer):
                # If the player guessed the word, check if it's correct.
                if (player.new_guess.is_set()):
                    if (player.get_new_guess().lower() == self.word_selector.current_word.lower()):
                        player.send(Headers.GUESS_CORRECT,
                                    self.word_selector.current_word)
                        self.correct_guesses += 1

                        # Update the scores.
                        player.score += int(GameConfig.BASE_POINTS *
                                            self.round_timer.getTimeLeft())
                        self.drawer.score += GameConfig.POINTS_PER_CORRECT_GUESS

    def finish_game(self) -> None:
        """End the game."""

        # Find the winner.
        winner = max(self.network_handler.clients,
                     key=lambda client: client.score)
        # Send the winner info to all clients.
        self.network_handler.send_to_all_clients(
            Headers.WINNER_UPDATE, {"name": winner.name, "score": winner.score})

        self.network_handler.send_to_all_clients(
            Headers.CHANGE_SCREEN, "end-screen")

        self.network_handler.send_to_all_clients(
            Headers.GAME_STATE, "game-ended")

        self.game_ended.set()

    def assemble_leaderboard(self) -> str:
        """ Assembles the leaderboard. """

        leaderboard = []
        # Sort the clients by their score.
        sorted_clients = sorted(
            self.network_handler.clients, key=lambda client: client.score, reverse=True)

        # Add the top players to the leaderboard.
        for player in sorted_clients[:GameConfig.NUM_PLAYERS_IN_LEADERBOARD]:
            leaderboard.append(f"{player.name}: {player.score}")

        return leaderboard
