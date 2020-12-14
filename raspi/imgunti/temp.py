#!/usr/bin/env python3
import cv2
import numpy as np
import math

COL_list=[[255,192,128,0],[255,192,164,128,82,0],[255,192,164,0]]
COL_code=[0,0,0],[128,82,0],[255,0,0],[255,164,0],[255,255,0],[0,128,0],[0,0,255],[128,82,255],[192,192,192],[255,255,192]
img_ori = cv2.imread('img/01.jpg')
img_ori=cv2.cvtColor(img_ori,cv2.COLOR_RGB2BGR)
img_copy = img_ori.copy()
temp_01=cv2.imread('img/H_01.jpg')
temp_01=cv2.cvtColor(temp_01,cv2.COLOR_BGR2GRAY)
temp_02=cv2.imread('img/H_02.jpg')
temp_02=cv2.cvtColor(temp_02,cv2.COLOR_BGR2GRAY)
temp_03=cv2.imread('img/H_03.jpg')
temp_03=cv2.cvtColor(temp_03,cv2.COLOR_BGR2GRAY)

xp_img=img_ori.copy()
###########画像保存###########
def SAVE(imge_str,save_img):
    save_img_res=cv2.cvtColor(save_img,cv2.COLOR_BGR2RGB)
    cv2.imwrite('img/R/'+imge_str+'.jpg',save_img_res)
###########HSV###########
def HSV_dec(img,hsv_max,hsv_min):
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
    hsv_mask=cv2.inRange(hsv,hsv_min,hsv_max)
    #hsv_mask=cv2.bitwise_not(hsv_mask)
    res=cv2.bitwise_and(img,img,mask=hsv_mask)
    return res
def H_dec(img):
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
    res_H=cv2.split(hsv)
    res=res_H[0]
    return res
###########エッジ###########
def EDGES_dec(img):
    edges = cv2.Canny(img,0,180)
    return edges
############ズーム###########
def ZOOM_dec(img_set,point):
    zoom_img=img_set[point[1]:point[3],point[0]:point[2]]
    #print(str(point))
    return zoom_img
###########テンプレマッチング###########
def MARCH_M(set_img , template,threshold):
    res=cv2.matchTemplate(set_img,template,cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

    h,w=template.shape[:2]
    loc = np.where( res >= threshold)
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    """cnt=0"""
    save_pt=[[0,0],[0,0],[0,0]]
    return_pt=[]
    for pt in zip(*loc[::-1]):
        flag=False
        for i in save_pt:
            if abs(pt[0]-i[0])>w/4 or abs(pt[1]-i[1])>h/4:
                flag=True
            else:
                flag=False
                break
        if flag==True:
            cv2.rectangle(xp_img, pt, (pt[0] + w, pt[1] + h),  (255,0,0),3) 
            save_pt=np.roll(save_pt,1,axis=0)
            save_pt[0]=pt
            cv2.putText(xp_img,str(pt), (pt[0], pt[1]), font, 2,(255,0,0),3,cv2.LINE_AA)
            return_pt.append([pt[0],pt[1],pt[0] + w, pt[1] + h])
            """SAVE('R_img'+str(cnt),ZOOM_dec(img_ori,return_pt[cnt]))
            cnt+=1"""
    return return_pt
##########################
def R_CHECK():
    CK_img=cv2.imread('img/xp_ZOOM_ori.jpg')
    CK_img=cv2.cvtColor(CK_img,cv2.COLOR_BGR2RGB)
    h,w=CK_img.shape[:2]
    set_point=[20,int(h/2)-20,w-20,int(h/2)+20]
    #print(set_point)
    SAVE('secR',ZOOM_dec(CK_img,set_point))
    
    f=open('img/col1.txt',mode='w')
    f.write('')
    f=open('img/col1.txt',mode='a')
    R_COL_img_1=cv2.imread('img/secR.jpg')
    h,w=R_COL_img_1.shape[:2]
    
    B=list(range(h))
    G=list(range(h))
    R=list(range(h))
    RGB=[[0,0,0]]
    R_num=[10]
    for x in range(w):
        for y in range(h):
            B[y]=R_COL_img_1[y,x][0]
            G[y]=R_COL_img_1[y,x][1]
            R[y]=R_COL_img_1[y,x][2]
        
        RGB.append([int(sum(B)/len(B)),int(sum(G)/len(G)),int(sum(R)/len(R))])
            
        R_num.append(COL_CK(getNearestValue(COL_list,RGB[x])))
        #if R_num[x]!=R_num[x+1]:
        #print(R_num[x])
    f.close()
    
    

def getNearestValue(list,num_list):
    """
    概要: リストからある値に最も近い値を返却する関数
    @param list: データ配列
    @param num: 対象値
    @return 対象値に最も近い値
    """
    # リスト要素と対象値の差分を計算し最小値のインデックスを取得
    idx_r = np.abs(np.asarray(list[0]) - num_list[0]).argmin()
    idx_g = np.abs(np.asarray(list[1]) - num_list[1]).argmin()
    idx_b = np.abs(np.asarray(list[2]) - num_list[2]).argmin()
    
    return [list[0][idx_r],list[1][idx_g],list[2][idx_b]]

def COL_CK(list):
    #print(list)
    for i in range(10):
        if list==COL_code[i]:
            return i
        else:
            return 'E'
###########main###########
#SAVE('xp_H',H_dec(img_copy))
#SAVE('xp_fil',HSV_dec(img_copy,np.array([255,255,255]),np.array([60,0,0])))
#MARCH_M(H_dec(img_copy),temp_01,0.7)
#point_R=MARCH_M(H_dec(img_copy),temp_02,0.9)
#MARCH_M(H_dec(img_copy),temp_03,0.6)
#SAVE('xp_',xp_img)
#SAVE('xp_',xp_img)
#SAVE('xp_ZOOM',ZOOM_dec(H_dec(img_copy),point_R[0]))
#R_CHECK()

R_mask=cv2.imread('img/R/mask_R.jpg')
R_mask=cv2.cvtColor(R_mask,cv2.COLOR_RGB2GRAY)
for cnt in range(9):
    test__1=cv2.imread('img/R/R_img'+str(cnt)+'.jpg')
    test__1=cv2.cvtColor(test__1,cv2.COLOR_RGB2BGR)
    res=cv2.bitwise_and(test__1,test__1,mask=R_mask)

    SAVE("test"+str(cnt),res)
    
"""for cnt in range(9):
    test__1=cv2.imread('img/R/R_img'+str(cnt)+'.jpg')
    test__1=cv2.cvtColor(test__1,cv2.COLOR_RGB2BGR)
    h,w=test__1.shape[:2]
    set_point=[40,int(h/2)-20,w-20,int(h/2)+20]
    #print(set_point)
    R_COL_img_1=ZOOM_dec(H_dec(test__1),set_point)
    #SAVE('test_ZOOM_H',R_COL_img_1)
    #R_COL_img_1 = cv2.bilateralFilter(R_COL_img_1,9,75,75)
    h,w=R_COL_img_1.shape[:2]
    f=open('img/R/col'+str(cnt)+'.txt',mode='w')
    f.write('')
    f=open('img/R/col'+str(cnt)+'.txt',mode='a')

    H=list(range(h))
    RGB=[]
    H_data=[0]*180
    for x in range(w):
        for y in range(h):
            H[y]=R_COL_img_1[y,x]
            H_data[R_COL_img_1[y,x]]+=1
        RGB.append(int(sum(H)/len(H)))
        f.write(str(RGB[x]))
        f.write("\n")
    f.close()
    #SAVE('xp_fil_Rtest'+str(cnt),HSV_dec(test__1,np.array([180,255,255]),np.array([110,0,0])))


    MAX_H_data=H_data.index(max(H_data))

    lower = np.array([MAX_H_data-2,0,0])
    upper = np.array([MAX_H_data+3,255,255])
    lower_G = np.array([70,0,0])
    upper_G = np.array([255,255,255])

    hsv=cv2.cvtColor(test__1,cv2.COLOR_BGR2HSV)
    hsv_mask_R=cv2.inRange(hsv,lower,upper)
    hsv_mask_R=cv2.bitwise_not(hsv_mask_R)
    hsv_mask_G=cv2.inRange(hsv,lower_G,upper_G)
    hsv_mask=cv2.bitwise_and(hsv_mask_R,hsv_mask_G)
    res=cv2.bitwise_and(test__1,test__1,mask=hsv_mask)
    #SAVE("test"+str(cnt),res)
    """