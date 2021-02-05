#!/usr/bin/env python3
import asyncio,json,websockets,os,time,\
atexit,io,base64,socket,struct,serial,\
fcntl,uuid,re,wiringpi
import netifaces as ni
import scapy.all as scapy
from sys import argv
from multiprocessing import Pipe, Process, Manager
from PIL import Image
from probe import main as Probe
from sensor import Hard as Sensor
try:
    from get_camera import full_img
    from impro import Mcc
except Exception as e:
    print("エラーを無視します:",e)
    pass
def _serial(send=None):
    wiringpi.wiringPiSetup()
    serial = wiringpi.serialOpen('/dev/ttyAMA0',9600)
    if send != None:
        wiringpi.serialPuts(serial,send)
        wiringpi.serialPutchar(serial,3)
        wiringpi.serialClose(serial)
    else:
        char = ""
        asciinum = -1
        while(True):
            asciinum = wiringpi.serialGetchar(serial)
            if asciinum != -1 and asciinum != 3:
                char += chr(asciinum)
            elif asciinum == 3:
                break
        wiringpi.serialClose(serial)
        return char


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
            return recv_data
class ChildWebs:
    def __init__(self):
        manager = Manager()
        self.data = manager.dict()
        self.data["flag"] = False 
        self.data["data"] = None
        self.cpro = Process(target=self._sendpro)
        self.cpro.start()
        print(self.data)
    def OneBeforeSendWait(self,data):
        while self.data["flag"]:
            pass
        if self.data["flag"] == False:
            self.data["data"] = data
            self.data["flag"] = True
    def _sendpro(self):
        loop = asyncio.get_event_loop()
        while True:
            if self.data["flag"]:
                print("return:",loop.run_until_complete(_Send("ws://192.168.11.199:8080",self.data["data"])))
                self.data["flag"] = False
            else:
                pass
    @staticmethod
    def AllKill(p):
        p.kill()

class NetInfo:
    PLC_MAC = ["28:e9:8e"]
    PLC_IP = "114.51.4.254"
    def __init__(self):
        self.nic = ni.ifaddresses('wlan0')
        self.mymac = self.nic[ni.AF_LINK][0]['addr']
        try:
            self.myip = self.nic[ni.AF_INET][0]['addr']
        except KeyError:
            self.myip = None
        self.__mac = self.arp([self.PLC_IP])
        for m in self.PLC_MAC:
            if self.__mac[self.PLC_IP].startswith(m):
                self.PLC_MAC = self.__mac[self.PLC_IP]
        self.mymac = ':'.join(re.split('(..)', format(uuid.getnode(), 'x'))[1::2])

    @staticmethod
    def arp(ip):
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
    def _gendata(img_data,prodata):
        png = io.BytesIO()
        try:
            Image.fromarray(prodata["img"]).save(png,"PNG")
        except Exception as e:
            print(f"Error:{e}")
            Image.fromarray(img_data).save(png,"PNG")
        b_frame = png.getvalue()
        jdict = Sensor.main()
        del prodata["img"]
        jdict.update(prodata)
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
    def run(cls):
        #プロセスの分離とプロセス間通信用マネージャ
        subp = ChildWebs()
        atexit.register(subp.AllKill,p=subp.cpro)
        while(True):
            start = time.time()
            print("Please wait until the shooting is completed...",end="")
            img_data = full_img()
            print("\rshooting complete successfully:",time.time() - start,"[sec]")
            print("Run Image processing...")
            prodata = Mcc.Start(img=img_data)
            print("Image processing complete successfully:",time.time() - start,"[sec]")
            subp.OneBeforeSendWait(cls._gendata(img_data,prodata))
            print("End of loop time:",time.time() - start,"[sec]")
class ProbePi:
    @staticmethod
    def _gendata():
        jdict = Sensor.main()
        jdict.update(Probe())
        insert_str = f"""\
INSERT INTO pi_probe(
    plc_mac,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '{json.dumps(jdict)}'
);
"""
        send_d = {
            "sql" : {
                "db":"piscan",
                "query":insert_str,
                "commit":True
            }
        }
        return send_d
    @classmethod
    def run(cls):
        subp = ChildWebs()
        atexit.register(subp.AllKill,p=subp.cpro)
        while True:
            time.sleep(10)
            start = time.time()
            print("Scan probe...")
            send_d = cls._gendata()
            print("Scan complete successfully:",time.time() - start,"[sec]")
            subp.OneBeforeSendWait(send_d)
            print("End of loop time:",time.time() - start,"[sec]")

if __name__ == '__main__':
    #ipinfo = NetInfo()
    if argv[1] == "-c":
        CamPi.run()
    elif argv[1] == "-dc":
        print(_serial())
    elif argv[1] == "-p":
        ProbePi.run()
    elif argv[1] == "-pint":
        while True:
            full_img()
    elif argv[1] == "-deb":
        _serial("114.51.4.254")

    else:
        print("引数を指定してください")
        print("-p:プローブモード,-c:カメラモード")
        exit()
