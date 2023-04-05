import websockets, asyncio, threading
from client_container.player import Player


class ClientHandler(threading.Thread):
    def __init__(self, game_code: str):
        threading.Thread.__init__(self)

        self.game_code: str = game_code
        self.clients: list[Player] = []
        self.num_clients: int = 0
        self.host: Player = None

    def run(self):
        print("[Client Handler] Starting client handler")

        asyncio.set_event_loop(asyncio.new_event_loop())
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.start_server())
        loop.run_forever()

    async def start_server(self):
        await websockets.serve(self.handle_client, "0.0.0.0", self.game_code)

    async def handle_client(self, websocket):
        player = Player(websocket, self.num_clients)
        await player.initialize()

        if (self.num_clients == 0): # Make the first player the host
            self.host = player

        self.clients.append(player)
        self.num_clients += 1

    async def sendToClient(self, index: int, message: str):
        await self.clients[index].send(message)

    async def receiveFromClient(self, index: int) -> str:
        await self.clients[index].receive()

    async def sendToAllClients(self, message: str):
        for client in self.clients:
            await client.send(message)
