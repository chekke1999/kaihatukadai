#!/usr/bin/env python3
from package import websockets
import asyncio

async def hello(uri):
    async with websockets.connect(uri) as websocket:
        await websocket.send("Hello world!")
        print("Send:Hello world!")
        await websocket.recv()

asyncio.get_event_loop().run_until_complete(
    hello('ws://localhost:8080'))