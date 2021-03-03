#!/usr/bin/env python3
from sys import argv
import wiringpi,sys
import serial,socket
from multiprocessing import Pipe, Process, Manager, Pool
#継承わからん
class Tcp:
    def __init__(self,ip,port):
        self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.tcp.settimeout(30)
    def client(self,data=None):
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
                    self.tcp.shutdown(1)
                    self.tcp.detach()
                    return data
                data += response
        elif res == "sml":
            response = self.tcp.recv(4096)
            self.tcp.shutdown(1)
            self.tcp.detach()
            return response
        else:
            return None
    def sever(self):
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

class ChildPro_TCP(Tcp):
    def __init__(self,ip,port,mode):
        super(ChildPro_TCP, self).__init__(ip,port)
        manager = Manager()
        self.data = manager.dict()
        self.data["flag"] = False 
        self.data["data"] = None
        self.port = port
        self.ip = ip
        if mode == "svr":
            self.cpro = Process(target=self.__server)
        elif mode == "clt":
            self.cpro = Process(target=self.__client)
        self.cpro.start()
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

if argv[1] == "c":
    t = Tcp()
    t.client(data=b"1",res="sml",ip="plcnet",port=8081)
elif argv[1] == "s":
    t = Tcp(mode="svr",ip="114.51.4.3",port=8080)
    while(True):
        pass
elif argv[1] == "sc":
    t = Tcp(mode="clt",ip="plcnet",port=8081)
    while(True):
        while t.data["flag"]:
            print("parent.data:",t.data)
        pass
