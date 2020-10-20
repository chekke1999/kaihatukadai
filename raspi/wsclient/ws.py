#!/usr/bin/env python3
import asyncio,json,websockets
class ws:
    @staticmethod
    async def _send(url,jlist):
        async with websockets.connect(url) as websocket:
            await websocket.send(json.dumps(jlist))
            recv = await websocket.recv()
            print(json.loads(recv))
    @classmethod
    def send(cls,url,jlist):
        asyncio.get_event_loop().run_until_complete(cls._send(url,jlist))
