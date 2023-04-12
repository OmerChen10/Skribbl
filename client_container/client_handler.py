import websockets, asyncio, threading
from client_container.client import Client


class ClientHandler(threading.Thread):
    def __init__(self, game_code: str):
        threading.Thread.__init__(self)

        self.game_code: str = game_code
        self.clients: list[Client] = []
        self.num_clients: int = 0
        self.host: Client = None

    def run(self):
        print("[Client Handler] Starting client handler")

        asyncio.set_event_loop(asyncio.new_event_loop())
        self.loop = asyncio.get_event_loop()
        self.loop.run_until_complete(self.start_server())
        self.loop.run_forever()

    async def start_server(self):
        await websockets.serve(self.handle_client, "0.0.0.0", self.game_code)

    async def handle_client(self, websocket):
        for client in self.clients:
            if (client.socket.remote_address[0] == websocket.remote_address[0]):
                print(f"[Client Handler] Client {client.id} reconnected.")
                await client.reconnect(websocket)
                return

        new_client = Client(websocket, self.num_clients)
        await new_client.initialize()

        if (self.num_clients == 0): # Make the first player the host
            self.host = new_client

        self.clients.append(new_client)
        self.num_clients += 1

        while True:
            await new_client.update()


    def receive_from_client(self, index: int):
        while not self.clients[index].received_new_message():
            pass
        
        return self.clients[index].received_messages.pop(0)
         
    
