import os


class GameConfig():

    CODE_LENGTH = 4
    ROUND_DURATION = 30 # Seconds
    ROUND_INTERVAL = 5 # Seconds

    # Words 
    STARTING_PERCENTAGE = 0.25 # The percentage of the word that is shown at the start of the round.
    REVEAL_INTERVAL = ROUND_DURATION * 0.6 # The interval at which the letter is revealed.
    MAX_REVEAL_PERCENTAGE = 0.35 # The maximum percentage of the word that can be revealed.

    WORDS_FILE_DIR = os.path.join(os.path.dirname(__file__), "words.txt") # The directory of the words file.

    BASE_POINTS = 2 # The base points that a player gets for guessing the word.
    POINTS_PER_CORRECT_GUESS = 5 # The amount of points that the drawer gets for each correct guess.

    NUM_PLAYERS_IN_LEADERBOARD = 5 # The number of players that will be shown in the leaderboard.

class NetworkConfig():
    WEBSITE_PORT = 80
    RECONNECTION_ENABLED = False


class Headers():
    GAME_STATE = 1
    IS_HOST = 2
    PLAYER_ROLE = 3
    CANVAS_UPDATE = 4
    WORD_UPDATE = 5
    GUESS = 6
    GUESS_CORRECT = 7
    LEADERBOARD_UPDATE = 8
    CHANGE_SCREEN = 9
    WINNER_UPDATE = 10

    
