import websockets, asyncio, json, time, threading
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
        self.received_messages = []
        self.pending_messages = []

    async def initialize(self):
        """ Initialize the player. """

        player_data = await self.receiveJson()
        print(f"[Client Handler] Player {self.id} has joined with the name: {player_data['username']}")

        player_data['isHost'] = self.player_data['isHost']
        await self.sendJson(player_data)

        self.player_data["username"] = player_data['username']

        self.thread = threading.Thread(target=self.handleConnection)
        self.thread.start()

    
    def handleConnection(self):
        """ Handle the player's connection. """

        while True:
            try:
                asyncio.create_task(self.auto_send())
                asyncio.create_task(self.auto_receive())

            except:
                print(f"[Client Handler] Player {self.id} has disconnected")
                break

    async def auto_send(self):
        """ Automatically send pending messages to the player. """

        while True:
            if (len(self.pending_messages) > 0):
                for pending_message in self.pending_messages:
                    await self.sendJson(pending_message)

                self.pending_messages = []

            await asyncio.sleep(0.1)

    async def auto_receive(self):
        """ Automatically receive messages from the player. """

        while True:
            received_message = await self.receiveJson()
            self.received_messages.append(received_message)
            await asyncio.sleep(0.1)

    async def reconnect(self, new_socket: websockets):
        """ Reconnect the player. """

        self.socket = new_socket
        await self.sendJson(self.player_data)

    def send(self, message: str):
        """ Send a message to the player. """

        self.pending_messages.append(message)

    
    async def receive(self) -> str:
        """ Receive a message from the player. """
        
        await len(self.received_messages) > 0
        return self.received_messages.pop(0)
    

    async def sendJson(self, data: dict):
        """ Send a json to the player. """

        await self.socket.send(json.dumps(data))


    async def receiveJson(self) -> dict:
        """ Receive a json from the player. """

        return json.loads(await self.socket.recv())
    



