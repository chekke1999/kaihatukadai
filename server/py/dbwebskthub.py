#!/bin/env python3
import pyodbc,json,base64,asyncio,socket
from datetime import date, datetime
from websocket_server import WebsocketServer

# date, datetimeの変換関数
def json_serial(obj):
    # 日付型の場合には、文字列に変換します
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    # 上記以外はサポート対象外.
    raise TypeError ("Type %s not serializable" % type(obj))

def sql(database,query,commit):
    driver='{ODBC Driver 17 for SQL Server}'
    server = "tcp:sqlserver2017"
    #trusted_connection='yes'    #Windows認証YES
    username = 'SA' 
    password = 'MyPass@2020' 
    cnxn = pyodbc.connect(f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password};')
    cursor = cnxn.cursor()

    cursor.execute(query) 
    if commit == True:
        cnxn.commit()
    row = cursor.fetchone() 
    cnt = 1
    send_data = {}
    while row: 
        send_data[cnt] = list(row)
        row = cursor.fetchone()
        cnt+=1
    cursor.close()
    cnxn.close()
    return send_data

#websocket_serverのコールバック関数に渡すやつ
#クライアント接続時
def new_client(client, server):
    print(f"connection success fully.")
    print(f"client : {client}")
#クライアント切断時
def disconnect(client, server):
    print(f"disconnect cliet")
    print(f"clinet : {client}")
#メッセージ受信時
def recv(client, server, message):
    print(f"recv_msg:{message}")
    dict_data = json.loads(message)
    for jkey in dict_data:
        if jkey == "sql":
            send_data = sql(dict_data[jkey]["db"],dict_data[jkey]["query"],dict_data[jkey]["commit"])
        elif jkey == "img":
            imgdict = sql(dict_data[jkey]["db"],f"SELECT top_img_path,slanting_img_path FROM pi_camera WHERE scan_id={dict_data[jkey]['id']}",False)
            cnt = 0
            for imgpath in imgdict[1]:
                with open(imgpath,"rb") as imgf:
                    imgdict[1][cnt] = base64.b64encode(imgf.read()).decode('utf-8')
                cnt+=1
            send_data = {"img":[imgdict[1][0],imgdict[1][1]]}
    server.send_message(client,json.dumps(send_data,default=json_serial))


server = WebsocketServer(8080, host='0.0.0.0')
server.set_fn_new_client(new_client)
server.set_fn_message_received(recv)
server.set_fn_client_left(disconnect)
server.run_forever()