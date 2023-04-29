import websockets, asyncio, json, time
from colorama import Fore, Style


class Client():
    """ A class representing a client. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.new_update_received = False
        self.pending_messages = []
        self.received_messages = []

    async def start_update_loop(self):
        """ Update the player. """

        await asyncio.gather(self.receive_update(), self.send_pending_updates())

    async def send_pending_updates(self):
        """ Send a json to the player. """

        while True:
            for pending_message in self.pending_messages:
                await self.socket.send(pending_message)
                self.pending_messages.remove(pending_message)

            await asyncio.sleep(0.1)

    async def receive_update(self) -> dict:
        """ Receive a json from the player. """

        while True:
            client_update = await self.socket.recv()
            self.received_messages.append(client_update)

            self.new_update_received = True
            await asyncio.sleep(0.1)


    def received_new_update(self) -> bool:
        """ Check if the player has received a new message. """

        if (self.new_update_received):
            self.new_update_received = False
            return True
        
        return False
