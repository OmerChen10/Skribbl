import websockets
import asyncio
from colorama import Fore, Style


class Player():
    """ A class representing a client. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.name = None

    async def initialize(self):
        """ Initialize the player. """

        name = await self.socket.recv()
        print(
            f"[Client Handler] Player {self.id} has joined with the name: {name}")

        self.name = name

    async def send(self, message: str):
        """ Send a message to the player. """

        await self.socket.send(message)
