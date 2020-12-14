#!/usr/bin/env python3
import asyncio,json,websockets,os,time
from get_camera import img_get
from sys import argv
from multiprocessing import Pipe, Process, Manager
import netifaces as ni
import scapy.all as scapy


async def _send(url,jlist):
    async with websockets.connect(url) as websocket:
        await websocket.send(json.dumps(jlist))
        return await websocket.recv()
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
    @classmethod
    def StartCamera(cls):
        with Manager() as manager:
                l = manager.list()
                camera_p = Process(target=img_get, args=[l])
                camera_p.start()
                return l
    @classmethod
    def Main(cls,smode=False):
        PLC_MAC = ["58:52:8a"]
        #プロセスの分離とプロセス間通信用マネージャ
        if mode == False:
            img_data = cls.StartCamera()
        else:
            with Manager() as manager:
                l = manager.list()
                camera_p = Process(target=img_get, args=[l])
                camera_p.start()
                while(True):
                    input("なにかのキーを押すと映像を取得します:")
                    img_data = cls.StartCamera()

if __name__ == '__main__':
    print(argv[1])
    if argv[1] == "-c":
        CamPi.Main()

