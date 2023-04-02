import asyncio
import websockets

async def hello(websocket):
    name = await websocket.recv()
    print(f"<<< {name}")

    greeting = f"Hello {name}!"

    await websocket.send(greeting)
    print(f">>> {greeting}")


async def main():
    async with websockets.serve(hello, "localhost", 5801):
        await asyncio.Future()  # run forever

if __name__ == "__main__":
    print('Game started')
    asyncio.run(main())