import websockets, asyncio, threading, Constants
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
        if (Constants.NetworkConfig.reconnection_enabled):
            for client in self.clients:
                if (client.socket.remote_address[0] == websocket.remote_address[0]):
                    print(f"[Client Handler] Client {client.id} reconnected.")
                    client.reconnect(websocket)
                    return

        new_client = Client(websocket, self.num_clients)
        await new_client.initialize()

        if (self.num_clients == 0): # Make the first player the host
            self.host = new_client

        self.clients.append(new_client)
        self.num_clients += 1

        await new_client.start_update_loop()


    def receive_from_client(self, index: int):
        while not self.clients[index].received_new_update():
            pass
        
        return self.clients[index].game
    
    def receive_from_client(self, client: Client):
        while not client.received_new_update():
            pass
        
        return client.game
    
    def send_to_client(self, index: int, server_update: dict):
        self.clients[index].game = server_update
        self.clients[index].pending_messages.append(server_update)

    def send_to_client(self, client: Client, server_update: dict):
        client.game = server_update
        client.pending_messages.append(server_update)

    def send_to_all_clients(self, server_update: dict):
        for client in self.clients:
            client.game = server_update
            client.pending_messages.append(server_update)
         
    
