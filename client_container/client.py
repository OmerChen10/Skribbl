import websockets, asyncio, json, time
from colorama import Fore, Style


class Client():
    """ A class representing a client. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.new_update_received = False
        self.pending_messages = []
        self.player_data = {
            "username": None,
            "isHost": True if self.id == 0 else False
        }
        self.game = {
            "game_data": {
                "game_state": "waiting"
            }
        }

    async def initialize(self):
        """ Initialize the player. """

        player_data = json.loads(await self.socket.recv())
        print(f"[Client Handler] Player {self.id} has joined with the name: {player_data['username']}")

        self.player_data["username"] = player_data["username"]
        await self.socket.send(json.dumps(self.player_data))

    def reconnect(self, new_socket: websockets):
        """ Reconnect the player. """

        self.socket = new_socket
        self.pending_messages.append(json.dumps(self.game))

    async def start_update_loop(self):
        """ Update the player. """

        await asyncio.gather(self.receive_update(), self.send_pending_updates())

    async def send_pending_updates(self):
        """ Send a json to the player. """

        while True:
            for pending_message in self.pending_messages:
                await self.socket.send(json.dumps(pending_message))
                self.pending_messages.remove(pending_message)

                # Send the current game data to the player
                await self.socket.send(json.dumps(self.game))

            await asyncio.sleep(0.1)

    async def receive_update(self) -> dict:
        """ Receive a json from the player. """

        while True:
            client_update = await self.socket.recv()
            client_update = json.loads(client_update)
            self.game = client_update
            self.new_update_received = True

            await asyncio.sleep(0.1)


    def received_new_update(self) -> bool:
        """ Check if the player has received a new message. """

        if (self.new_update_received):
            self.new_update_received = False
            return True
        
        return False
