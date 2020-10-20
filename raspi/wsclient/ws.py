#!/usr/bin/env python3
import asyncio,json,websockets
jlist = {
    "banana":{
        "test":"unchi",
        "ringo":"chinchin"
    }
}
class ws:
    @staticmethod
    async def _send(url,jlist):
        async with websockets.connect(url) as websocket:
            await websocket.send(json.dumps(jlist))
            recv = await websocket.recv()
            print(recv)
    @classmethod
    def send(cls,url,jlist):
        asyncio.get_event_loop().run_until_complete(cls._send(url,jlist))
ws.send("ws://192.168.77.55:8080/",jlist)