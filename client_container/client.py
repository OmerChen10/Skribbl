import websockets
import asyncio
import json
from colorama import Fore, Style


class Client():
    """ A class representing a client. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.player_data = {
            "username": None,
            "isHost": True if self.id == 0 else False
        }
        self.new_message = False
        self.received_messages = []
        self.pending_messages = []

    async def initialize(self):
        """ Initialize the player. """

        player_data = await self.socket.recv()
        player_data = json.loads(player_data)
        print(f"[Client Handler] Player {self.id} has joined with the name: {player_data['username']}")

        player_data['isHost'] = self.player_data['isHost']
        await self.socket.send(json.dumps(player_data))

        self.player_data["username"] = player_data['username']

    async def reconnect(self, new_socket: websockets):
        """ Reconnect the player. """

        self.socket = new_socket
        await self.sendJson(self.player_data)

    async def update(self):
        """ Update the player. """

        await asyncio.gather(self.receiveJson(), self.sendJson())

    async def sendJson(self):
        """ Send a json to the player. """

        for pending_message in self.pending_messages:
            await self.socket.send(pending_message)
            self.pending_messages.remove(pending_message)

    async def receiveJson(self) -> dict:
        """ Receive a json from the player. """

        received_json = await self.socket.recv()
        received_json = json.loads(received_json)
        self.received_messages.append(received_json)
        self.new_message = True


    def received_new_message(self) -> bool:
        """ Check if the player has received a new message. """

        if (self.new_message):
            self.new_message = False
            return True
        
        return False
