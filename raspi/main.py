#!/usr/bin/env python3
import asyncio,json,websockets,os,time,atexit,io,base64,socket
import fcntl,struct,uuid,re
import netifaces as ni
from get_camera import img_get
from sys import argv
from multiprocessing import Pipe, Process, Manager
import netifaces as ni
import scapy.all as scapy
from PIL import Image
from jsongen import genjson

def _TcpSend(target_ip="127.0.0.1",target_port=8080):
    buffer_size = 4096
    # 1.ソケットオブジェクトの作成
    tcp_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    # 2.サーバに接続
    tcp_client.connect((target_ip,target_port))
    # 3.サーバにデータを送信
    tcp_client.send(b"Data by TCP Client!!")
    # 4.サーバからのレスポンスを受信
    response = tcp_client.recv(buffer_size)
    print("[*]Received a response : {}".format(response))

async def _Send(url,jlist):
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
def PlcValue():
    time.sleep(10)
    return True

class NetInfo:
    PLC_MAC = ["58:52:8a"]
    PLC_IP = "192.168.11.250"
    def __init__(self,ifname):
        self.plcmac = None
        self.nic = ni.ifaddresses('wlan0')
        self.mymac = self.nic[ni.AF_LINK][0]['addr']
        try:
            self.myip = self.nic[ni.AF_INET][0]['addr']
        except KeyError:
            self.myip = None
        self.__mac = self.Arp([self.PLC_IP])
        for m in self.PLC_MAC:
            if self.__mac[self.PLC_IP].startswith(m):
                self.plcmac = self.__mac[self.PLC_IP]
        self.mymac = ':'.join(re.split('(..)', format(uuid.getnode(), 'x'))[1::2])

    @staticmethod
    def Arp(ip):
        #cls.ip = ip
        mac_list = {}
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
            mac_list = {ip:mac}
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
    def Main(cls,PLC=False):

        #プロセスの分離とプロセス間通信用マネージャ
        img_data,cam_p = cls.StartCamera()
        atexit.register(cls.AllKill,p=cam_p)
        if PLC == True:
            while(True):
                time.sleep(10)
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
                recv_d = asyncio.get_event_loop().run_until_complete(_Send("ws://192.168.11.199:8080",send_d))
                print("return:",recv_d)
        else:
            exit()

if __name__ == '__main__':
    net = NetInfo(b"wlan0")
    print("myip:",net.myip)
    print("mymac:",net.mymac)
    print("plcmac:",net.plcmac)
    #_tcpsend()
    # if argv[1] == "-c":
    #     CamPi.Main(PLC=True)

