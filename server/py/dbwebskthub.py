import websockets,asyncio,pyodbc,json,base64
from datetime import date, datetime

# date, datetimeの変換関数
def json_serial(obj):
    # 日付型の場合には、文字列に変換します
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    # 上記以外はサポート対象外.
    raise TypeError ("Type %s not serializable" % type(obj))

def sql(database,query,commit):
    driver='{ODBC Driver 17 for SQL Server}'
    server = "localhost"
    trusted_connection='yes'    #Windows認証YES
    cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';DATABASE='+database+';Trusted_Connection='+trusted_connection+';')
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

async def websqhub(websocket, path):
    recv_data = await websocket.recv()
    dict_data = json.loads(recv_data)
    print(dict_data)
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
            send_data = {"img":[imgdict[1][0],imgdict[1][0]]}
    print(send_data)
    await websocket.send(json.dumps(send_data,default=json_serial))


start_server = websockets.serve(websqhub, "192.168.11.199", 8080)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()