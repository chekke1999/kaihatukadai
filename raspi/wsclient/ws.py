#!/usr/bin/env python3
import asyncio,json,websockets
class ws:
    @staticmethod
    async def asend(uri,jlist):
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps(jlist))
            recv = await websocket.recv()
            print(json.loads(recv))
    @classmethod
    def send(cls,uri,jlist):
        asyncio.get_event_loop().run_until_complete(cls.asend(uri,jlist))
