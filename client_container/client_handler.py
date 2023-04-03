import websockets
import asyncio
from client_container.player import Player


class ClientHandler():
    def __init__(self, game_code: str):
        self.game_code = game_code
        self.clients = []
        self.num_clients = 0

    def start(self):
        print("[Client Handler] Starting client handler")

        asyncio.get_event_loop().run_until_complete(self.start_server())
        asyncio.get_event_loop().run_forever()

    async def start_server(self):
        await websockets.serve(self.handle_client, "0.0.0.0", self.game_code)

    async def handle_client(self, websocket):
        player = Player(websocket, self.num_clients)
        await player.initialize()

        self.clients.append(player)
        self.num_clients += 1
