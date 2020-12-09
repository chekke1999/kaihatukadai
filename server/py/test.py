import pyodbc

driver='{ODBC Driver 17 for SQL Server}'
server = "localhost"
database = 'piscan'
trusted_connection='yes'    #Windows認証YES
cnxn = pyodbc.connect('DRIVER='+driver+';SERVER='+server+';DATABASE='+database+';Trusted_Connection='+trusted_connection+';')
cursor = cnxn.cursor()

#Sample select query
cursor.execute("SELECT scan_id,plc_mac,datetime,scan_data FROM pi_camera;") 
row = cursor.fetchone() 
while row: 
    print(row)
    row = cursor.fetchone()

cursor.close()
cnxn.close()