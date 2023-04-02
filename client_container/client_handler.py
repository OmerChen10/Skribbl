import websockets
import asyncio
from client_container.player import Player

class ClientHandler():
    def __init__(self):
        self.clients = []
        self.num_clients = 0
        

    def start(self):
        print("[Client Handler] Starting client handler")
        asyncio.get_event_loop().run_until_complete(self.start_server())
        asyncio.get_event_loop().run_forever()

    
    async def start_server(self):
        await websockets.serve(self.handle_client, "localhost", 5801) 


    async def handle_client(self, websocket):
        self.clients.append(Player(websocket, self.num_clients))
        self.num_clients += 1

        print(f"[Client Handler] Client {self.num_clients} connected")
    