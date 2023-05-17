import websockets, asyncio, threading, json
from client_container.client_handler import ClientHandler
from colorama import Fore, Style
from Constants import *


class NetworkHandler(threading.Thread):
    def __init__(self, game_code: str):
        threading.Thread.__init__(self)

        self.game_code: str = game_code
        self.clients: list[ClientHandler] = []
        self.num_clients: int = 0
        self.host: ClientHandler = None

        self.current_drawer: ClientHandler = None

    def run(self):
        """ Starts listening for new connections. """

        print("[Client Handler] Starting network handler")

        asyncio.set_event_loop(asyncio.new_event_loop())
        self.loop = asyncio.get_event_loop()
        self.loop.run_until_complete(self.start_server())
        self.loop.run_forever()

    async def start_server(self):
        await websockets.serve(self.handle_connection, "0.0.0.0", self.game_code)

    async def handle_connection(self, websocket):
        """ Handles a new connection and create a new client handler for it. """

        if (NetworkConfig.RECONNECTION_ENABLED):
            for client in self.clients:
                if (client.socket.remote_address[0] == websocket.remote_address[0]):
                    print(f"[Network Handler] Client {client.id} reconnected.")
                    client.reconnect(websocket)
                    return

        self.num_clients += 1
        new_client = ClientHandler(websocket, self.num_clients)
        self.clients.append(new_client)

        if (self.num_clients == 1): 
            self.host = new_client

        await new_client.start_update_loop()

    def send_to_all_clients(self, header: int, server_msg) -> None:
        """ Sends a message to all clients. """

        for client in self.clients:
            client.send(header, server_msg)

    def set_drawer(self, drawer: ClientHandler):
        """ Sets the current drawer."""

        self.current_drawer = drawer

    def send_to_guessers(self, header: int, server_msg) -> None:
        """ Sends a message to all clients except the current drawer. """

        for client in self.clients:
            if (client is not self.current_drawer):
                client.send(header, server_msg)

    async def close_all_connections(self):
        """ Closes all client connections. """

        for client in self.clients:
            await client.close()

    def stop(self):
        """ Stops the network handler. """
        # Close all client connections
        self.loop.create_task(self.close_all_connections())
        self.loop.stop()

        print(Fore.RED + Style.BRIGHT +
              "[Network Handler] Network handler stopped." + 
              Style.RESET_ALL)
        
        super().join()

    








    
