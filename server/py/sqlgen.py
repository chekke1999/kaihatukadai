def sqlgen(mac,time,path1,path2,jstr):
    print(time)
    sql = "\
SET NOCOUNT ON;\
INSERT INTO pi_camera(plc_mac,datetime,top_img_path,slanting_img_path,scan_data)\
VALUES(?,?,?,?,?);"
    return [sql,(mac,time,path1,path2,jstr)]