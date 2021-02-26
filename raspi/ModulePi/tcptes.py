#!/usr/bin/env python3
from sys import argv
import wiringpi,sys
import serial,socket
from multiprocessing import Pipe, Process, Manager, Pool

class Tcp:
    def __init__(self,ip=None,port=None,mode=None):
        self.port = port
        self.ip = ip
        manager = Manager()
        self.data = manager.dict()
        self.data["flag"] = False 
        self.data["data"] = None
        if mode == "svr":
            self.cpro = Process(target=self.__server)
        elif mode == "clt":
            self.cpro = Process(target=self.__client)
            self.cpro.start()
        else:
            self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    def client(self,data,ip,port,res=None):
        # 2.サーバに接続
        self.tcp.connect((ip,port))
        # 3.データ送信
        self.tcp.send(data)
        if res == "big":
            data = b""
            while(True):
                response = self.tcp.recv(4096)
                if not response:
                    return data
                data += response
        elif res == "sml":
            response = self.tcp.recv(4096)
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
        while(True):
            if not self.data["flag"]:
                # 4.サーバからのレスポンスを受信
                self.data["data"] = self.tcp.recv(4096)
                self.data["flag"] = True

    def __server(self):
        # 1.ソケットオブジェクトの作成
        print("server start")
        self.tcp = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        # 2.作成したソケットオブジェクトにIPアドレスとポートを紐づける
        self.tcp.bind((self.ip, self.port))
        # 3.作成したオブジェクトを接続可能状態にする
        self.tcp.listen(5)
        # 4.ループして接続を待ち続ける
        while True:
            # 5.クライアントと接続する
            # 誰かがアクセスしてきたら、コネクションとアドレスを入れる
            conn, addr = self.tcp.accept()
            with conn:
                while True:
                    # データを受け取る
                    data = conn.recv(1024)
                    if not data:
                        break
                    print('data : {}, addr: {}'.format(data, addr))
                    # クライアントにデータを返す(b -> byte でないといけない)
                    conn.sendall(b'Received: ' + data)

if argv[1] == "c":
    t = Tcp()
elif argv[1] == "s":
    t = Tcp(mode="svr",ip="114.51.4.3",port=8080)
    while(True):
        pass
print(t.client(ip="114.51.4.3",port=8080,data=b"test"))
