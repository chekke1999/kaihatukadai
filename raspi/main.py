#!/usr/bin/env python3
import asyncio,json,websockets,os,time
from multiprocessing import Pipe, Process
jlist = {
    "banana":{
        "test":"unchi",
        "ringo":"chinchin"
    }
}

async def _send(url,jlist):
    async with websockets.connect(url) as websocket:
        await websocket.send(json.dumps(jlist))
        return await websocket.recv()
#asyncio.get_event_loop().run_until_complete(cls._send(url,jlist))
class DEMO:
    @staticmethod
    def camera_run(pipe):
        pipe.send("banana")
        print(pipe.recv())
class CamPi:
    @classmethod
    def main(cls):
        parent_conn, child_conn = Pipe()
        camera_p = Process(target=DEMO.camera_run, args=[child_conn])
        camera_p.start()
        print(parent_conn.recv())
        parent_conn.send("apple")
if __name__ == "__main__":
    CamPi.main()
    
    

