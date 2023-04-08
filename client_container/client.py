import websockets, asyncio, json
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

    async def initialize(self):
        """ Initialize the player. """

        player_data = await self.receiveJson()
        print(f"[Client Handler] Player {self.id} has joined with the name: {player_data['username']}")

        player_data['isHost'] = self.player_data['isHost']
        await self.sendJson(player_data)

        self.player_data["username"] = player_data['username']

    async def reconnect(self, new_socket: websockets):
        """ Reconnect the player. """

        self.socket = new_socket
        await self.sendJson(self.player_data)

    async def send(self, message: str):
        """ Send a message to the player. """

        await self.socket.send(message)

    
    async def receive(self) -> str:
        """ Receive a message from the player. """
        
        return await self.socket.recv()
    

    async def sendJson(self, data: dict):
        """ Send a json to the player. """

        await self.socket.send(json.dumps(data))


    async def receiveJson(self) -> dict:
        """ Receive a json from the player. """

        return json.loads(await self.socket.recv())
    



