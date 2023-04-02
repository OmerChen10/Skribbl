import websockets


class Player():
    """ A class representing a client. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id