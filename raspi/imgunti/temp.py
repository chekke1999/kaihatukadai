import cv2
import numpy as np
import math
from matplotlib import pyplot as plt

COL_list=[[255,192,128,0],[255,192,164,128,82,0],[255,192,164,0]]
COL_code=[0,0,0],[128,82,0],[255,0,0],[255,164,0],[255,255,0],[0,128,0],[0,0,255],[128,82,255],[192,192,192],[255,255,192]





img_ori = cv2.imread('D:/img/01.jpg')
img_ori=cv2.cvtColor(img_ori,cv2.COLOR_RGB2BGR)
img = img_ori.copy()
temp_01=cv2.imread('D:/img/H_01.jpg')
temp_01=cv2.cvtColor(temp_01,cv2.COLOR_BGR2GRAY)
temp_02=cv2.imread('D:/img/H_02.jpg')
temp_02=cv2.cvtColor(temp_02,cv2.COLOR_BGR2GRAY)
temp_03=cv2.imread('D:/img/H_03.jpg')
temp_03=cv2.cvtColor(temp_03,cv2.COLOR_BGR2GRAY)

xp_img=img_ori.copy()
###########プロット表示###########
def plot(plot_img):
    w,h=plot_img.shape[:2]
    plt.figure(figsize=(w/100,h/100))
    plt.subplot(111),plt.imshow(plot_img,cmap = 'gray')
    plt.title('Image'), plt.xticks([]), plt.yticks([])
    #print(str(w)+','+str(h))
    plt.show()
###########画像保存###########
def SAVE(imge_str,save_img):
    save_img=cv2.cvtColor(save_img,cv2.COLOR_BGR2RGB)
    cv2.imwrite('D:/img/'+imge_str+'.jpg',save_img)
###########HSV###########
def HSV_dec(hsv_max,hsv_min):
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
    hsv_mask=cv2.inRange(hsv,hsv_min,hsv_max)
    #hsv_mask=cv2.bitwise_not(hsv_mask)
    res=cv2.bitwise_and(img,img,mask=hsv_mask)
    return res
def H_dec():
    hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
    res_H=cv2.split(hsv)
    res=res_H[0]
    return res
###########エッジ###########
def EDGES_dec():
    edges = cv2.Canny(img,0,180)
    return edges
############ズーム###########
def ZOOM_dec(img_set,point):
    zoom_img=img_set[point[1]:point[3],point[0]:point[2]]
    print(str(point))
    return zoom_img
###########テンプレマッチング###########
def MARCH(set_img , template):
    res=cv2.matchTemplate(set_img,template,cv2.TM_SQDIFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

    h,w=template.shape[:2]
    top_left = min_loc
    bottom_right = (top_left[0] + w, top_left[1] + h)
    cv2.rectangle(xp_img,top_left, bottom_right, 255, 10)

    return [top_left[0],top_left[1],bottom_right[0],bottom_right[1]]

def MARCH_M(set_img , template,threshold):
    res=cv2.matchTemplate(set_img,template,cv2.TM_CCOEFF_NORMED)
    min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)

    h,w=template.shape[:2]
    loc = np.where( res >= threshold)
    font = cv2.FONT_HERSHEY_SIMPLEX
    
    save_pt=[[0,0],[0,0],[0,0]]
    
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

##########################
def R_CHECK():
    CK_img=cv2.imread('D:/img/R_CK.jpg')
    CK_img=cv2.cvtColor(CK_img,cv2.COLOR_BGR2RGB)
    h,w=CK_img.shape[:2]
    set_point=[20,int(h/2)-20,w-20,int(h/2)+20]
    print(set_point)
    SAVE('secR',ZOOM_dec(CK_img,set_point))
    
    f=open('D:/img/col1.txt',mode='w')
    f.write('')
    f=open('D:/img/col1.txt',mode='a')
    R_COL_img_1=cv2.imread('D:/img/secR.jpg')
    h,w=R_COL_img_1.shape[:2]
    
    B=list(range(h))
    G=list(range(h))
    R=list(range(h))
    old_B=0
    old_G=0
    old_R=0
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
        print(R_num[x])
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
    print(list)
    for i in range(10)
        if list==COL_code[10]:
            return E
        elif list==COL_code[i]
            return i
###########main###########
#plot(img)
#plot(H_dec())
#plot(HSV_dec(np.array([255,255,255]),np.array([60,0,0])))
#point_R=MARCH(H_dec(),temp_ori)
#MARCH_M(H_dec(),temp_01,0.7)
#MARCH_M(H_dec(),temp_02,0.9)
#MARCH_M(H_dec(),temp_03,0.6)
#plot(xp_img)
#SAVE('xp_',xp_img)
#plot(ZOOM_dec(img,point_R))
R_CHECK()
#hist()

