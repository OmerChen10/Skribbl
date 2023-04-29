import threading, json, asyncio, websockets


class ClientHandler():
    """ Handles the client's messages. """

    def __init__(self, socket: websockets, id: int) -> None:
        self.socket = socket
        self.id = id
        self.new_update_received = False
        self.pending_messages = []
        self.received_messages = []
        
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

            self.new_update_received = True
            await asyncio.sleep(0.1)

    def received_new_update(self) -> bool:
        """ Check if the player has received a new message. """

        if (self.new_update_received):
            self.new_update_received = False
            return True

        return False

    def receive(self):
        if (self.received_messages != []):
            return self.received_messages.pop(0)

        while not self.received_new_update():
            pass

        return self.received_messages.pop(0)

    def send(self, header: int, server_msg):
        msg_data = json.dumps({"value": server_msg})
        msg = f"{header}-{msg_data}END"
        self.pending_messages.append(msg)

    def initialize_client(self) -> None:
        """ Initializes the client. """

        client_name = self.receive()
        self.name = client_name

        print(f"[Client Handler] Client {self.id} has connected with name {self.name}.")

        self.send(Headers.IS_HOST, (self.id == 1))


    def handle_requests(self) -> None:
        """ Handles the client's requests. """

        pass


class Headers():
    GAME_STATE = 0
    IS_HOST = 1
