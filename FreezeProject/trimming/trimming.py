import cv2,json,re
import numpy as np
import math as mt
#パーツのトリミング範囲を格納 x+420,y+110 C x+115,y+20
with open("./parts_list.json") as f:
    parts_list = json.load(f)["R_C"]

def HsvRange(hsv_median):
    tflist2 = []
    #カラーコード定義
    with open("./c_code.json") as f:
        c_code = json.load(f)
    for (l,u) in zip(c_code["lower"],c_code["upper"]):
        tflist1 = []
        for i in range(3):
            tflist1.append(c_code["lower"][l][i] <= hsv_median[i] <= c_code["upper"][u][i])
        tflist2.append(np.all(tflist1))
    if tflist2.count(True) == 1:#Trueの数が1のときだけ読むことで複数のTrueになってる場所を除外
        return tflist2.index(True)
def TRIM():
    #画像読み込み
    img = cv2.imread("./in_img/img_ic.jpg")
    for i in range(1,12):
        #スライス処理(トリミング[y1:y2, x1:x2]
        #img[top : bottom, left : right]左の形式に変換(x1=240,y1=250)(x2=660,y2=360)
        img_trim = img[parts_list[f"R{i}"][1]:parts_list[f"R{i}"][3],parts_list[f"R{i}"][0]:parts_list[f"R{i}"][2]]
        hsv_img = cv2.cvtColor(img_trim, cv2.COLOR_BGR2HSV)
        R_code = []
        old_color = 10
        for j in reversed(range(hsv_img.shape[1])):
            H_medi = mt.floor(np.median(hsv_img[:,j][:,0]))
            S_medi = mt.floor(np.median(hsv_img[:,j][:,1]))
            V_medi = mt.floor(np.median(hsv_img[:,j][:,2]))
            HSV_median = [H_medi,S_medi,V_medi]
            now_color = HsvRange(HSV_median)
            if now_color != 10 and now_color != None:
                if old_color == now_color:
                    pass
                else:
                    R_code.append(now_color)
            old_color = now_color
        print(f"R{i}_ColorCode={R_code}")

            
                
TRIM()

