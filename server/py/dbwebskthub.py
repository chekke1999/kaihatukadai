import websockets,asyncio,pyodbc,json
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
    while row: 
        data = row
        yield data
        row = cursor.fetchone()
    cursor.close()
    cnxn.close()

async def websqhub(websocket, path):
    recv_data = await websocket.recv()
    dict_data = json.loads(recv_data)
    cnt = 0
    send_data = {}
    print(dict_data)
    for jkey in dict_data:
        if jkey == "sql":
            for i in [list(i) for i in sql(dict_data[jkey]["db"],dict_data[jkey]["query"],dict_data[jkey]["commit"])]:
                cnt+=1
                send_data[cnt] = i
    print(send_data)
    await websocket.send(json.dumps(send_data,default=json_serial))


start_server = websockets.serve(websqhub, "192.168.11.199", 8080)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()