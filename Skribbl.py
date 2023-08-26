from website_container import WebsiteServer
from client_container import NetworkHandler
from game_container import GameManger
import random, Constants, threading
from colorama import Fore, Style


class Skribbl():
    def __init__(self) -> None:
        self.game_code = self._randomize_game_code()
        self.website = WebsiteServer.get_instance()
        self.website.add_game_code(self.game_code)
        self.network_manager = NetworkHandler(self.game_code)
        self.game_manager = GameManger(self.network_manager)

    def start(self):
        print(Fore.BLUE + Style.BRIGHT +
              f"[Skribbl] Starting game with code: {self.game_code}"
              + Style.RESET_ALL)

        self.network_manager.start()
        self.game_manager.start()

        threading.Thread(target=self.waitForFinish).start()

    def _randomize_game_code(self) -> str:
        code = ""
        for _ in range(Constants.GameConfig.CODE_LENGTH):
            code += str(random.randint(1, 9))

        return code

    
    def waitForFinish(self):
        self.game_manager.game_ended.wait()

        print(Fore.RED + Style.BRIGHT +
              "[Skribbl] Game ended." +
              Style.RESET_ALL)
        
        exit(0)
        
