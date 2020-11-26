#!/usr/bin/env python3
import asyncio,json,websockets,os,time
from get_camera import img_get
from sys import argv
from multiprocessing import Pipe, Process, Manager
import netifaces as ni
import scapy.all as scapy

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
    @classmethod
    def Main(cls):
        """
        プロセスの分離とプロセス間通信用の
        パイプを生成
        """
        #parent_conn, child_conn = Pipe()
        with Manager() as manager:
            l = manager.list()
            camera_p = Process(target=img_get, args=[l])
            camera_p.start()
            while(True):
                time.sleep(2)
                print(type(l))
if __name__ == '__main__':
    print(argv[1])
    if argv[1] == "-c":
        CamPi.Main()

