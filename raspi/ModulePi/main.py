#!/usr/bin/env python3
import asyncio,json,websockets,os,time,\
atexit,io,base64,socket,struct,serial,\
fcntl,uuid,re,serial,sys
import netifaces as ni
import scapy.all as scapy
import numpy as np
from sys import argv
from multiprocessing import Pipe, Process, Manager, Pool
from PIL import Image
from probe import main as Probe
from sensor import Hard as Sensor
try:
    from get_camera import full_img
    from impro import Mcc
except Exception as e:
    print("importエラーを無視します:",e)
    pass
def cleanup(clp=[]):
    for c in clp:
        if type(c) is Process:
            c.kill()
        else:
            del c

class Count():
    def __init__():
        self.cnt = 0
    def num():
        self.cnt += 1
        return self.cnt

class Serial:
    def __init__(self):
        self.ser = serial.Serial('/dev/ttyAMA0', 9600, timeout=10)
    def send(self,data=b""):
        self.ser.write(data)
        
    def recv(self,cnt=1):
        char = self.ser.read(cnt)
        return char
    def __del__(self):
        self.ser.close()

class Tcp:
    def __init__(self,ip=None,port=None,mode=None):
        self.port = port
        self.ip = ip
        manager = Manager()
        self.data = manager.dict()
        self.data["flag"] = False 
        self.data["data"] = None
        self.data["send_flag"] = False
        self.data["send_data"] = None

        if mode == "svr":
            self.cpro = Process(target=self.__server)
            self.cpro.start()
        elif mode == "clt":
            self.cpro = Process(target=self.__client)
            self.cpro.start()
        else:
            self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.tcp.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.tcp.settimeout(30)
    def client(self,ip,port,res=None,data=None):
        # 2.サーバに接続
        self.tcp.connect((ip,port))
        # 3.データ送信
        print("data send:",data)
        self.tcp.send(data)
        if res == "big":
            data = b""
            while(True):
                response = self.tcp.recv(4096)
                if not response:
                    self.tcp.close()
                    return data
                data += response
        elif res == "sml":
            response = self.tcp.recv(4096)
            self.tcp.close()
            return response
        else:
            return None
    def __client(self):
        # 1.ソケットオブジェクトの作成
        self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # 2.サーバに接続
        self.tcp.connect((self.ip,self.port))
        # 3.PLCに初回シグナル送信
        self.tcp.send(b"1")
        print("child.data set:",self.data)
        while(True):
            if not self.data["flag"]:
                self.data["data"] = self.tcp.recv(4096)
                self.data["flag"] = True
                
            if self.data["send_flag"]:
                print("plc_flag send:",self.data["send_data"])
                self.tcp.send(self.send["send_data"])
                self.data["send_flag"] = False

    def __server(self):
        # 1.ソケットオブジェクトの作成
        self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # 2.作成したソケットオブジェクトにIPアドレスとポートを紐づける
        self.tcp.bind((self.ip, self.port))
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
                # 8.接続を終了させる
                client.close()
            elif data == rb"\x01":
                self.data["flag"] = True

class ChildWebs:
    def __init__(self):
        manager = Manager()
        self.data = manager.dict()
        self.data["flag"] = False 
        self.data["data"] = None
        self.cpro = Process(target=self._sendpro)
        self.cpro.start()
    @staticmethod
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
    VENDER_MAC = ["dc:a6:32","b8:27:eb"]
    GATE_MAC = None
    GATE_IP = "114.51.4.1"
    def __init__(self):
        self.nic = ni.ifaddresses('eth0')
        self.mymac = self.nic[ni.AF_LINK][0]['addr']
        try:
            self.myip = self.nic[ni.AF_INET][0]['addr']
        except KeyError:
            self.myip = None
        mac = scapy.getmacbyip(self.GATE_IP)
        for m in self.VENDER_MAC:
            if mac.startswith(m):
                self.GATE_MAC = mac
        self.mymac = ':'.join(re.split('(..)', format(uuid.getnode(), 'x'))[1::2])

class CamPi:
    @staticmethod
    def _base64conv(ndimg):
        png = io.BytesIO()
        Image.fromarray(ndimg).save(png,"PNG")
        return base64.b64encode(png.getvalue()).decode('utf-8')

    @classmethod
    def _gendata(cls,prodata1,prodata2):
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
        # seri = Serial()
        # subcam_ip = seri.recv(cnt=10).decode() 
        # if len(subcam_ip) < 10:
        #     print(f"TimeoutError: return ip={subcam_ip}, leng={len(subcam_ip)}", file=sys.stderr)
        #     exit()
        # else:
        #     seri.send(b"0")
        #     print(f"complete serial :{subcam_ip}")
        #     del seri
        tcpc = Tcp(mode="clt",ip="plcnet",port=8081)
        tcpc.data["send_data"] = b"1"
        subp = ChildWebs()
        atexit.register(cleanup,clp=[subp.cpro,tcpc.cpro])
        print("loop start")
        while(True):
            if tcpc.data["flag"]:
                print("plc recv:",tcpc.data)
                start = time.time()
                print("Please wait until the shooting is completed...",end="")
                ndimg1 = full_img()
                print("\rShooting complete successfully:",time.time() - start,"[sec]")
                print("Wait for the sub camera to complete shooting")
                #サブカメラのラズパイでcap.readでNoneが戻り値になる問題
                #ndimg2 = np.load(io.BytesIO(send.client(data=b"plees",res="big",ip=subcam_ip,port=8080)))
                ndimg2 = np.array(Image.open('/home/pi/banana/Pictures/l_e_others_501.png'))
                print("\rSub camera shooting complete successfully:",time.time() - start,"[sec]")
                tcpc.data["flag"] = False
                tcpc.data["send_flag"] = True
                print("Run Image processing...")
                prodata1 = Mcc.Start(ndimg1)
                prodata2 = ndimg2
                print("Image processing complete successfully:",time.time() - start,"[sec]")
                subp.OneBeforeSendWait(cls._gendata(prodata1,prodata2))
                print("End of loop time:",time.time() - start,"[sec]")

class SCamPi:
    @classmethod
    def run(cls,net):
        cls.pimac = net.GATE_MAC
        seri = Serial()
        print(net.myip.encode())
        for i in range(1,4):
            seri.send(net.myip.encode())
            recv = seri.recv(cnt=1)
            if recv == b"" and i == 3:
                print("TimeoutError", file=sys.stderr)
                exit()
            elif recv != b"":
                print("complete serial:",recv)
                del seri
                break
        tcps = Tcp(mode="svr",ip=net.myip,port=8080)
        atexit.register(cleanup,clp=[tcps.cpro])
        print("loop start")
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
    spi_mac,
    scan_data
) VALUES( 
    '{cls.pimac}',
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
        print(send_d)
        return send_d
    @classmethod
    def run(cls,net):
        cls.pimac = net.GATE_MAC
        subp = ChildWebs()
        atexit.register(cleanup,clp=subp.cpro)
        tcpc = Tcp(mode="clt",ip="plcnet",port=8081)
        send = Tcp()
        while True:
            if tcpc.data["flag"]:
                start = time.time()
                print("Scan probe...")
                send_d = cls._gendata()
                print("Scan complete successfully:",time.time() - start,"[sec]")
                tcpc.data["flag"] = False
                send.client(data=b"2",ip="plcnet",port=8081)
                subp.OneBeforeSendWait(send_d)
                print("End of loop time:",time.time() - start,"[sec]")
    @classmethod
    def test_run(cls):
        cls.pimac = net.GATE_MAC
        subp = ChildWebs()
        atexit.register(cleanup,clp=subp.cpro)
        while(True):
            start = time.time()
            print("Scan probe...")
            send_d = cls._gendata()
            print("Scan complete successfully:",time.time() - start,"[sec]")
            subp.OneBeforeSendWait(send_d)
            print("End of loop time:",time.time() - start,"[sec]")
            time.sleep(5)

if __name__ == '__main__':
    net = NetInfo()
    if net.GATE_MAC == None:
        print("Mac address none")
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
    elif argv[1] == "-tpro":
        ProbePi.test_run()
    else:
        print("引数を指定してください")
        print("-p:プローブモード,-c:カメラモード")
        exit()
