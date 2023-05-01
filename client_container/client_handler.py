import threading, json, asyncio, websockets
from Constants import Headers


class ClientHandler():
    """ Handles the client's messages. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.received_new_message: threading.Event = threading.Event()
        self.pending_messages = []
        self.received_messages = []

        self.ready: threading.Event = threading.Event()

        self.thread = threading.Thread(target=self.initialize_client)
        self.thread.start()

    async def start_update_loop(self):
        """ Start receiving and sending messages. """

        await asyncio.gather(self.start_receiving_loop(), self.start_sending_loop())

    async def start_sending_loop(self):

        while True:
            for pending_message in self.pending_messages:
                await self.socket.send(pending_message)
                self.pending_messages.remove(pending_message)

            await asyncio.sleep(0.1)

    async def start_receiving_loop(self) -> dict:

        while True:
            client_update = await self.socket.recv()
            self.received_messages.append(client_update)

            self.received_new_message.set()
            await asyncio.sleep(0.1)

    def received_new_update(self) -> bool:
        """ Check if the player has received a new message. """

        if (self.received_new_message):
            self.received_new_message = False
            return True

        return False

    def receive(self):
        if (self.received_messages != []):
            return self.received_messages.pop(0)

        self.received_new_message.wait()
        self.received_new_message.clear()

        return self.received_messages.pop(0)

    def send(self, header: int, server_msg):
        msg_data = json.dumps({"value": server_msg})
        msg = f"{header}/{msg_data}END"
        self.pending_messages.append(msg)

    def initialize_client(self) -> None:
        """ Initializes the client. """

        self.name = self.receive()
        print(f"[Client Handler] Client {self.id} has connected with name {self.name}.")

        self.send(Headers.IS_HOST, (self.id == 1))
        self.handle_requests()

    def handle_requests(self) -> None:
        """ Handles the client's requests. """

        handlers = {
            str(Headers.GAME_STATE): self.handle_game_state
        }

        while True:
            # Remove the last element, which is an empty string
            requests = self.receive().split("END")[:-1]
            for request in requests:
                print(request)
                header = request.split("/")[0]
                data = request.split("/")[1]

                handlers[header](data)

    def handle_game_state(self, data: str) -> None:
        """ Handles the client's game state request. """
  
        if (data == "host-ready"):
            self.ready.set()
