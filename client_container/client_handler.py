import threading
import json
import asyncio
import websockets
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
        self.thread.daemon = True
        self.thread.start()

    async def start_update_loop(self):
        """ Start the receiving and sending loops. """

        # Start the receiving and sending loops.
        await asyncio.gather(self.start_receiving_loop(), self.start_sending_loop())

    async def start_sending_loop(self):

        try:
            while True:
                for pending_message in self.pending_messages:  # Send all pending messages.
                    await self.socket.send(pending_message)
                    # Remove the message from the list of pending messages.
                    self.pending_messages.remove(pending_message)
                    self.message_sent.set()  # Set the message sent event.

                await asyncio.sleep(0.1)

        except Exception:
            print(f"[Client Handler] Client {self.id} disconnected.")

    async def start_receiving_loop(self) -> dict:

        while True:
            client_update = await self.socket.recv() # Receive a message from the client.
            self.received_messages.append(client_update) # Add the message to the list of received messages.

            self.received_new_message.set() # Set the received new message event.
            await asyncio.sleep(0.1)

    def receive(self):
        """ Returns the last received message. """

        if (self.received_messages != []):
            return self.received_messages.pop(0)

        self.received_new_message.wait() # Wait for a new message.
        self.received_new_message.clear()

        try:
            msg = self.received_messages.pop(0)
            return msg

        except Exception as e:
            print(f"[Client Handler] Error receiving message: {e}")
            return ""

    def send(self, header: int, server_msg):
        """ Sends a message to the client. """

        # Create the message. (Using json to serialize the data).
        msg_data = json.dumps({"value": server_msg}) 
        msg = f"{header}==={msg_data}" # Add the header to the message.
        self.pending_messages.append(msg) # Add the message to the list of pending messages.

        self.message_sent.wait() # Wait for the message to be sent.
        self.message_sent.clear()

    def initialize_client(self) -> None:
        """ Runs the initial server-client handshake. """

        self.name = self.receive()
        print(f"[Client Handler] Client {self.id} has connected with name {self.name}.")

        self.send(Headers.IS_HOST, (self.id == 1)) # Send whether the client is the host.
        self.handle_requests() # Start handling the client's requests.

    def handle_requests(self) -> None:
        """ Handles the client's requests. """

        # A dictionary of handlers for each header.
        handlers = {
            str(Headers.GAME_STATE): self.handle_game_state,
            str(Headers.CANVAS_UPDATE): self.handle_canvas_update,
            str(Headers.GUESS): self.handle_new_guess
        }

        while True:
            # Analyze the request.
            request = self.receive().split("===") 
            header = request[0]
            data = request[1]

            handlers[header](data)

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

    async def stop(self) -> None:
        """ Stops the client. """

        await self.socket.close()
        asyncio.get_event_loop().stop()
        self.thread.join()
