#!/usr/bin/env python3
import asyncio,json,websockets,os,time,atexit,io,logging,base64
from get_camera import img_get
from sys import argv
from multiprocessing import Pipe, Process, Manager
import netifaces as ni
import scapy.all as scapy
from PIL import Image
from jsongen import genjson

async def _send(url,jlist):
    async with websockets.connect(url,max_size=20000000) as websocket:
        sendj = json.dumps(jlist)
        await websocket.send(sendj)
        try:
            recv_data = await websocket.recv()
        except Exception as e:
            print("websockets.exceptions.ConnectionClosedError:",e)
            print('Reconnecting')
            websocket = await websockets.connect(url,max_size=20000000)
            await websocket.send(sendj)
        return recv_data
def Arp(cls, ip):
    #cls.ip = ip
    mac_list = []
    print(ip)
    arp_r = scapy.ARP(pdst=ip)
    br = scapy.Ether(dst='ff:ff:ff:ff:ff:ff')
    request = br/arp_r
    answered, unanswered = scapy.srp(request, timeout=1)
    print('\tIP\t\t\t\t\tMAC')
    print('_' * 37)
    for i in answered:
        ip, mac = i[1].psrc, i[1].hwsrc
        print(ip, '\t\t' + mac)
        print('-' * 37)
        mac_list.append([ip,mac])
    return mac_list

class CamPi:
    @staticmethod
    def AllKill(p):
        p.kill()

    @classmethod
    def StartCamera(cls):
        manager = Manager()
        d = manager.dict()
        camera_p = Process(target=img_get, args=[d])
        camera_p.start()
        print(d,camera_p)
        return d,camera_p
    @classmethod
    def Main(cls,smode=False):
        logger = logging.getLogger('websockets')
        logger.setLevel(logging.INFO)
        logger.addHandler(logging.StreamHandler())
        PLC_MAC = ["58:52:8a"]
        #プロセスの分離とプロセス間通信用マネージャ
        img_data,cam_p = cls.StartCamera()
        atexit.register(cls.AllKill,p=cam_p)
        if smode == False:
            while(True):
                time.sleep(5)
                png = io.BytesIO()
                Image.fromarray(img_data["img"]).save(png,"PNG")
                b_frame = png.getvalue()
                send_d = {
                    "in_data" : {
                        "db":"piscan",
                        "mac":"58:52:8a:d6:69:a1",
                        "jstr":genjson(),
                        "img":[base64.b64encode(b_frame).decode('utf-8'),base64.b64encode(b_frame).decode('utf-8')]
                    }
                }
                recv_d = asyncio.get_event_loop().run_until_complete(_send("ws://192.168.11.199:8080",send_d))
                print("return:",recv_d)
        else:
            while(True):
                input("なにかのキーを押すと映像を取得します:")
                

if __name__ == '__main__':
    print(argv[1])
    if argv[1] == "-c":
        CamPi.Main(smode=False)

