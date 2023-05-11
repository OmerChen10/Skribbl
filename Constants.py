import os


class GameConfig():

    code_length = 4
    round_duration = 30 # Seconds

    # Words 
    starting_percentage = 0.25 # The percentage of the word that is shown at the start of the round.
    reveal_interval = round_duration * 0.6 # In round time percentage.
    max_reveal_percentage = 0.35 # The maximum percentage of the word that can be revealed.

    words_file_dir = os.path.join(os.path.dirname(__file__), "words.txt")


class NetworkConfig():
    website_port = 80
    reconnection_enabled = False


class Headers():
    GAME_STATE = 1
    IS_HOST = 2
    PLAYER_ROLE = 3
    CANVAS_UPDATE = 4
    WORD_UPDATE = 5
    
