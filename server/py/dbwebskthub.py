import asyncio
import websockets

async def hello(websocket, path):
    name = await websocket.recv()

    greeting = f"Hello {name}!"
    print(f"{greeting}")

    await websocket.send(greeting)

start_server = websockets.serve(hello, "192.168.11.199", 8080)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()