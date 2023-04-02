from website_container import WebsiteServer
from client_container import ClientHandler

class Skribbl():
    def __init__(self) -> None:
        self.website = WebsiteServer()
        self.client_handler = ClientHandler()


    def start(self):
        self.website.start()
        self.client_handler.start()