

class GameConfig():

    code_length = 4
    round_time = 10 # Seconds


class NetworkConfig():
    website_port = 80
    reconnection_enabled = False


class Headers():
    GAME_STATE = 1
    IS_HOST = 2
    PLAYER_ROLE = 3
    CANVAS_UPDATE = 4
    DEBUG = 5
