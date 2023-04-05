import threading
from client_container import ClientHandler


class GameManger(threading.Thread):
    def __init__(self, client_handler: ClientHandler) -> None:
        threading.Thread.__init__(self)

        self.client_handler = client_handler

    def run(self):
        print("[Game Manager] Starting game manager")
        
        self.waitForStart()

    def waitForStart(self) -> None:
        print("[Game Manager] Waiting for game to start")

        while True:
            if (self.client_handler.host is not None):
                host_msg = self.client_handler.receiveFromClient(0)
                