import cv2,json,numpy

#黒0,茶1,赤2,橙3,黄4,緑5,青6,紫7,灰8,白9
def TRIM():
    #パーツのトリミング範囲を格納 x+420,y+110 C x+115,y+20
    with open("./parts_list.json") as f:
        parts_list = json.load(f)["R_C"]
    #カラーコード定義
    with open("./c_code.json") as f:
        c_code = json.load(f)
    #画像読み込み
    img = cv2.imread("./in_img/img_ic.jpg")
    for i in range(1,12):
        #スライス処理(トリミング[y1:y2, x1:x2]
        #img[top : bottom, left : right]左の形式に変換(x1=240,y1=250)(x2=660,y2=360)
        img_trim = img[parts_list[f"R{i}"][1]:parts_list[f"R{i}"][3],parts_list[f"R{i}"][0]:parts_list[f"R{i}"][2]]
        hsv_img = cv2.cvtColor(img_trim, cv2.COLOR_BGR2HSV)
        for j in reversed(range(hsv_img.shape[1])):
            print(f"{j}列画素")
            H_medi = numpy.median(hsv_img[:,j][:,0])
            S_medi = numpy.median(hsv_img[:,j][:,1])
            V_medi = numpy.median(hsv_img[:,j][:,2])
            print(f"H:{H_medi} S:{S_medi} V:{V_medi}")
TRIM()
