import threading, json, asyncio, websockets
from Constants import Headers


class ClientHandler():
    """ Handles the client's messages. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.name = None
        self.received_new_message: threading.Event = threading.Event()
        self.pending_messages = []
        self.received_messages = []

        self.ready: threading.Event = threading.Event()
        self.message_sent: threading.Event = threading.Event()

        self.canvas_image = None
        self.canvas_update: threading.Event = threading.Event()

        self.guess = None
        self.new_guess = threading.Event()
        self.score = 0

        self.thread = threading.Thread(target=self.initialize_client)
        self.thread.start()


    async def start_update_loop(self):
        """ Start the receiving and sending loops. """

        await asyncio.gather(self.start_receiving_loop(), self.start_sending_loop())

    async def start_sending_loop(self):

        while True:
            for pending_message in self.pending_messages:
                await self.socket.send(pending_message)
                self.pending_messages.remove(pending_message)
                self.message_sent.set()

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
        """ Returns the last received message. """

        if (self.received_messages != []):
            return self.received_messages.pop(0)

        self.received_new_message.wait()
        self.received_new_message.clear()

        return self.received_messages.pop(0)

    def send(self, header: int, server_msg):
        """ Sends a message to the client. """
        msg_data = json.dumps({"value": server_msg})
        msg = f"{header}==={msg_data}END"
        self.pending_messages.append(msg)

        self.message_sent.wait()
        self.message_sent.clear()

    def initialize_client(self) -> None:
        """ Runs the initial server-client handshake. """

        self.name = self.receive()
        print(f"[Client Handler] Client {self.id} has connected with name {self.name}.")

        self.send(Headers.IS_HOST, (self.id == 1))
        self.handle_requests()

    def handle_requests(self) -> None:
        """ Handles the client's requests. """

        handlers = {
            str(Headers.GAME_STATE): self.handle_game_state,
            str(Headers.CANVAS_UPDATE): self.handle_canvas_update,
            str(Headers.GUESS): self.handle_new_guess
        }

        while True:
            # Remove the last element, which is an empty string
            requests = self.receive().split("END")[:-1]
            for request in requests:
                try:
                    request = request.split("===")
                    header = request[0]
                    data = request[1]

                    handlers[header](data)
                
                except Exception as e:
                    print(f"[Client Handler] Error handling a request.")

    def handle_new_guess(self, data: str) -> None:
        """ Handles the client's guess. """

        self.new_guess.set()
        self.guess = data

    def get_new_guess(self) -> str:
        """ Returns the client's guess. """

        self.new_guess.clear()
        return self.guess

    def handle_game_state(self, data: str) -> None:
        """ Handles the client's game state request. """
  
        if (data == "host-ready"):
            self.ready.set()

    def handle_canvas_update(self, data) -> None:
        """ Handles the client's canvas update request. """

        self.canvas_image = data
        self.canvas_update.set()

    def get_canvas_update(self) -> str:
        """ Returns the canvas update. """

        self.canvas_update.clear()

        return self.canvas_image
    
    async def close(self) -> None:
        """ Closes the client. """

        await self.socket.close()
