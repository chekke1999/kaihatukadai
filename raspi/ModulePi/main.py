#!/usr/bin/env python3
import asyncio,json,websockets,os,time,\
atexit,io,base64,socket,struct,serial,\
fcntl,uuid,re,wiringpi
import netifaces as ni
import scapy.all as scapy
from sys import argv
from multiprocessing import Pipe, Process, Manager, Pool
from PIL import Image
from probe import main as Probe
from sensor import Hard as Sensor
try:
    from get_camera import full_img
    from impro import Mcc
except Exception as e:
    print("エラーを無視します:",e)
    pass
def AllKill(p):
    p.kill()

class Serial:
    def __init__(self):
        wiringpi.wiringPiSetup()
        self.serial = wiringpi.serialOpen('/dev/ttyAMA0',9600)
    def send(self,data=None):
        wiringpi.serialPuts(self.serial,data)
        wiringpi.serialPutchar(self.serial,3)
    def recv(self):
        char = ""
        asciinum = -1
        while(True):
            asciinum = wiringpi.serialGetchar(self.serial)
            if asciinum != -1 and asciinum != 3:
                char += chr(asciinum)
            elif asciinum == 3:
                break
        return char
    def __del__(self):
         wiringpi.serialClose(self.serial)

class Tcp:
    def __init__(self,bkserver_mode=False):
        # 1.ソケットオブジェクトの作成
        self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        if bkserver_mode:
            self.data = manager.dict()
            self.data["flag"] = False 
            self.data["data"] = None
            self.cpro = Process(target=self.server)
            self.cpro.start()
    def client(self,ip="127.0.0.1",port=8080,data,res=True):
        # 2.サーバに接続
        self.tcp.connect((target_ip,target_port))
        # 3.サーバにデータを送信
        self.tcp.send(data)
        # 4.サーバからのレスポンスを受信
        if res:
            data = b""
            wihle True:
                response = self.tcp.recv(4096)
                if not response:
                    return data
                data += response
    def server(self,ip="127.0.0.1",port=8080):
        # 2.作成したソケットオブジェクトにIPアドレスとポートを紐づける
        self.tcp.bind((server_ip, server_port))
        # 3.作成したオブジェクトを接続可能状態にする
        self.tcp.listen(5)
        # 4.ループして接続を待ち続ける
        while True:
            # 5.クライアントと接続する
            client,address = self.tcp.accept()
            print("[*] Connected!! [ Source : {}]".format(address))
            # 6.データを受信する
            data = client.recv(1024)
            # 7.クライアントへデータを返す
            if data == b"plees":
                self.data["flag"] = True
                while self.data["flag"]:
                    pass
                client.send(self.data["data"])
            elif data == b"0x01"
                self.data["flag"] = True
            # 8.接続を終了させる
            client.close()

class ChildWebs:
    def __init__(self):
        manager = Manager()
        self.data = manager.dict()
        self.data["flag"] = False 
        self.data["data"] = None
        self.cpro = Process(target=self._sendpro)
        self.cpro.start()
        print(self.data)
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
                print("return:",loop.run_until_complete(self._Send("ws://192.168.11.199:8080",self.data["data"])))
                self.data["flag"] = False
            else:
                pass

class NetInfo:
    VENDER_MAC = ["dc:a6:32","b8:27:eB"]
    GATE_MAC = None
    GATE_IP = "114.51.4.1"
    def __init__(self):
        self.nic = ni.ifaddresses('wlan0')
        self.mymac = self.nic[ni.AF_LINK][0]['addr']
        try:
            self.myip = self.nic[ni.AF_INET][0]['addr']
        except KeyError:
            self.myip = None
        self.__mac = self.arp([self.GATE_IP])
        for m in self.VENDER_MAC:
            if self.__mac[self.GATE_IP].startswith(m):
                self.GATE_MAC = self.__mac[self.GATE_IP]
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
    def _base64conv(ndimg):
        png = io.BytesIO()
        Image.fromarray(ndimg).save(png,"PNG")
        return base64.b64encode(png.getvalue()).decode('utf-8')

    @classmethod
    def _gendata(prodata1,prodata2):
        base64_img1 = cls._base64conv(prodata1["img"])
        base64_img2 = cls._base64conv(prodata2)
        jdict = Sensor.main()
        del prodata1["img"]
        jdict.update(prodata1)
        send_d = {
            "in_data" : {
                "db":"piscan",
                "mac":cls.pimac,
                "jstr":json.dumps(jdict),
                "img":[base64_img1,base64_img2]
            }
        }
        return send_d

    @classmethod
    def run(cls,net):
        cls.pimac = net.GATE_MAC
        seri = Serial()
        subcam_ip = seri.recv()
        if subcam_ip == -1:
            exit()
        else:
            seri.send(f"Successful connection.Your ip is {subcam_ip}")
        subp = ChildWebs()
        tcps = Tcp(bkserver_mode=True)
        atexit.register(AllKill,p=subp.cpro)
        atexit.register(AllKill,p=tcps.cpro)
        while(True):
            if tcps.data["flag"]:
                start = time.time()
                print("Please wait until the shooting is completed...",end="")
                ndimg1 = full_img()
                print("\rShooting complete successfully:",time.time() - start,"[sec]")
                print("Wait for the sub camera to complete shooting")
                ndimg2 = np.load(io.BytesIO(tcps.client(subcam_ip,8080,b"plees")))
                print("\rSub camera shooting complete successfully:",time.time() - start,"[sec]")
                print("Run Image processing...")
                prodata1 = Mcc.Start(ndimg1)
                prodata2 = ndimg2
                print("Image processing complete successfully:",time.time() - start,"[sec]")
                subp.OneBeforeSendWait(cls._gendata(prodata1,prodata2))
                tcps.data["flag"] = False
                tcps.client(ip="plcnet",data=b"1",res=False)
                print("End of loop time:",time.time() - start,"[sec]")

class SCamPi:
    @classmethod
    def run(cls,net):
        seri = Serial()
        seri.send(net.myip)
        recv = seri.recv()
        if recv == -1:
            exit()
        else:
            pass
        print(recv)
        tcps = Tcp(bkserver_mode=True)
        while(True):
            if tcps.data["flag"]:
                start = time.time()
                print("Please wait until the shooting is completed...",end="")
                ndimg = full_img(show=False)
                ndbyte = io.BytesIO()
                np.save(ndbyte,ndimg)
                tcps.data["data"] = ndbyte.getvalue()
                tcps.data["flag"] = False
                print("\rshooting complete successfully:",time.time() - start,"[sec]")
                print("End of loop time:",time.time() - start,"[sec]")

class ProbePi:
    @classmethod
    def _gendata(cls):
        jdict = Sensor.main()
        jdict.update(Probe())
        insert_str = f"""\
INSERT INTO pi_probe(
    stationpi_mac,
    scan_data
) VALUES( 
    {cls.pimac},
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
    def run(cls,net):
        cls.pimac = net.GATE_MAC
        subp = ChildWebs()
        atexit.register(AllKill,p=subp.cpro)
        while True:
            time.sleep(10)
            start = time.time()
            print("Scan probe...")
            send_d = cls._gendata()
            print("Scan complete successfully:",time.time() - start,"[sec]")
            subp.OneBeforeSendWait(send_d)
            print("End of loop time:",time.time() - start,"[sec]")

if __name__ == '__main__':
    net = NetInfo()
    if net.GATE_MAC == None:
        exit()
    if argv[1] == "-c":
        CamPi.run(net)
    elif argv[1] == "-dc":
        SCamPi.run(net)
    elif argv[1] == "-p":
        ProbePi.run(net)
    elif argv[1] == "-pint":
        while True:
            full_img()

    else:
        print("引数を指定してください")
        print("-p:プローブモード,-c:カメラモード")
        exit()
