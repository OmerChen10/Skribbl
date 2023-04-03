from website_container import WebsiteServer
from client_container import ClientHandler
import random
import Constants
import time
from colorama import Fore, Style


class Skribbl():
    def __init__(self) -> None:
        self.game_code = self._randomize_game_code()
        self.website = WebsiteServer(self.game_code)
        self.client_handler = ClientHandler(self.game_code)


    def start(self):
        print(Fore.BLUE + Style.BRIGHT + 
              f"[Skribbl] Starting game with code: {self.game_code}"
              + Style.RESET_ALL)
        
        time.sleep(1)
        self.website.start()
        self.client_handler.start()


    def _randomize_game_code(self) -> str:
        code = ""
        for _ in range(Constants.GameConfig.code_length):
            code += str(random.randint(0, 9))

        return code

