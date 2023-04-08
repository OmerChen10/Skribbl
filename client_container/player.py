import websockets, asyncio, json
from colorama import Fore, Style


class Player():
    """ A class representing a client. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.name = None

    async def initialize(self):
        """ Initialize the player. """

        player_data = await self.receiveJson()
        print(f"[Client Handler] Player {self.id} has joined with the name: {player_data['username']}")

        if (self.id == 0):
            player_data['isHost'] = True
            await self.sendJson(player_data)

        else:
            player_data['isHost'] = False
            await self.sendJson(player_data)

        self.name = player_data['username']

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
    



