#!/usr/bin/env python3
import asyncio,json,websockets,os,time,atexit,io,base64,socket,struct,serial
import fcntl,struct,uuid,re
import netifaces as ni
from get_camera import full_img
from sys import argv
from multiprocessing import Pipe, Process, Manager
import netifaces as ni
import scapy.all as scapy
from PIL import Image
from jsongen import genjson
from impro import Mcc




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
        start = time.time()
        sendj = json.dumps(jlist)
        await websocket.send(sendj)
        try:
            recv_data = await websocket.recv()
        except Exception as e:
            print("websockets.exceptions.ConnectionClosedError:",e)
            print('Reconnecting')
            websocket = await websockets.connect(url,max_size=20000000)
            await websocket.send(sendj)
        else:
            print("Send complete successfully:",time.time() - start,"[sec]")
            print ("return:",recv_data)
        #return recv_data
def PlcValue():
    time.sleep(10)
    return True

class NetInfo:
    PLC_MAC = ["58:52:8a"]
    PLC_IP = "114.51.4.254"
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
    def _sendpro(send_data):
        loop = asyncio.get_event_loop()
        while True:
            if send_data["flag"]:
                loop.run_until_complete(_Send("ws://192.168.11.199:8080",send_data["data"]))
                send_data["flag"] = False
            else:
                pass
    @staticmethod
    def AllKill(p):
        p.kill()
    @classmethod
    def sendprocess(cls):
        manager = Manager()
        d = manager.dict()
        d["flag"] = False 
        d["shoot"] = False 
        d["data"] = None
        camera_p = Process(target=cls._sendpro, args=[d])
        camera_p.start()
        print(d,camera_p)
        return d,camera_p
    @classmethod
    def _shoot(cls):
        start = time.time()
        png = io.BytesIO()
        print("Please wait until the shooting is completed...",end="")
        img_data = full_img()
        print("\rshooting complete successfully:",time.time() - start,"[sec]")
        return img_data
    @staticmethod
    def _gendata(img_data):
        start = time.time()
        print("Run Image processing...")
        prodata = Mcc.Start(img=img_data)
        print("Image processing complete successfully:",time.time() - start,"[sec]")
        png = io.BytesIO()
        try:
            Image.fromarray(prodata["img"]).save(png,"PNG")
        except TypeError as e:
            print(f"Error:{e}")
            Image.fromarray(img_data).save(png,"PNG")
        b_frame = png.getvalue()
        jdict = {
            "status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},
            "type":prodata["type"],
            "parts":prodata["parts"]
        }
        send_d = {
            "in_data" : {
                "db":"piscan",
                "mac":"58:52:8a:d6:69:a1",
                "jstr":json.dumps(jdict),
                "img":[base64.b64encode(b_frame).decode('utf-8'),base64.b64encode(b_frame).decode('utf-8')]
            }
        }
        return send_d
        
    @classmethod
    def Main(cls):
        #プロセスの分離とプロセス間通信用マネージャ
        send,send_p = cls.sendprocess()
        atexit.register(cls.AllKill,p=send_p)
        while(True):
            start = time.time()
            send_d = cls._gendata(cls._shoot())
            while send["flag"]:
                pass
            if send["flag"] == False:
                send["data"] = send_d
                send["flag"] = True
            print("End of loop time:",time.time() - start,"[sec]")
            #time.sleep(10)
class ProbePi:
    def Main():
        


if __name__ == '__main__':
    if argv[1] == "-c":
        CamPi.Main()
        # if net.plcmac != None:
        #     CamPi.Main()
        # else:
        #     exit()
