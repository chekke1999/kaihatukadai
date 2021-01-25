#!/usr/bin/env python3
import cv2
import numpy as np


class Mcc:
    """画像保存"""
    @staticmethod
    def _SAVE(imge_str,save_img):
        save_img_res=cv2.cvtColor(save_img,cv2.COLOR_BGR2RGB)
        cv2.imwrite('img/test/'+imge_str+'.png',save_img_res)
        print("SAVE")
    @staticmethod
    def _Point_DEC(set_pt):
        pt_return=[[]*4]*4
        X_01=[]
        Y_01=[]
        for i in range(len(set_pt)):
            X_01+=set_pt[i][::4]
            Y_01+=set_pt[i][1::4]
        X_ave=(max(X_01)+min(X_01))/2
        Y_ave=(max(Y_01)+min(Y_01))/2
        for j in range(4):
            if X_01[j]>X_ave:
                if Y_01[j]>Y_ave:
                    pt_return[3]=set_pt[j]
                else:
                    pt_return[1]=set_pt[j]
            else:
                if Y_01[j]>Y_ave:
                    pt_return[2]=set_pt[j]
                else:
                    pt_return[0]=set_pt[j]
        print(pt_return)
        return pt_return
    @staticmethod
    def _HSV_dec(img,hsv_max,hsv_min):
        hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
        hsv_mask=cv2.inRange(hsv,hsv_min,hsv_max)
        #hsv_mask=cv2.bitwise_not(hsv_mask)
        res=cv2.bitwise_and(img,img,mask=hsv_mask)
        return res
    @staticmethod
    def _H_dec(img):
        hsv=cv2.cvtColor(img,cv2.COLOR_BGR2HSV)
        res_H=cv2.split(hsv)
        res=res_H[0]
        return res
    """エッジ"""
    @staticmethod
    def _EDGES_dec(img):

        """
        edges = cv2.Canny(img,0,180)
        return edges
        """     
        dst=img.copy()
        edges = cv2.Canny(img,60,60,apertureSize=3)
          
        minLineLength = 10
        maxLineGap = 30
        lines = cv2.HoughLinesP(edges,1,np.pi/180,100,minLineLength,maxLineGap)
        for x1,y1,x2,y2 in lines[0]:
            cv2.line(dst,(x1,y1),(x2,y2),(0,0,0),5)
        #print( lines)
        
        return dst
    """#ズーム"""
    @staticmethod
    def _ZOOM_dec(set_img,point):
        zoom_img=set_img[point[1]:point[3],point[0]:point[2]]
        #print(str(point))
        return zoom_img
    """テンプレマッチング"""
    @classmethod
    def _MARCH_M(cls,set_img,xp_img,temp,zoom_point):
        
        if temp=='R_R':####
            template=cv2.imread('img/temple/R.jpg')
            template=cv2.cvtColor(template,cv2.COLOR_BGR2GRAY)
            rows,cols = template.shape[:2]
            M = cv2.getRotationMatrix2D((cols,0),90,1)
            template = cv2.warpAffine(template,M,(500,500))
            template=template[0:cols,cols:rows+cols]

        else:
            template=cv2.imread('img/temple/'+temp+'.jpg')
            template=cv2.cvtColor(template,cv2.COLOR_BGR2GRAY)

        set_img=cls._ZOOM_dec(set_img,zoom_point)
        try :
            res=cv2.matchTemplate(set_img,template,cv2.TM_CCOEFF_NORMED)
            h,w=template.shape[:2]
            font = cv2.FONT_HERSHEY_SIMPLEX
            
            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
            
            if max_val<0.5 :
                cv2.rectangle(xp_img, (zoom_point[0],+zoom_point[1]), (zoom_point[2],zoom_point[3]),  (0,255,0),3) 
                print("cv2 ERROR " + temp)
                return [0,0],max_val

            pt = (max_loc[0]+zoom_point[0],max_loc[1]+zoom_point[1])
            return_pt=([pt[0],pt[1],pt[0] + w, pt[1] + h])
            cv2.rectangle(xp_img, pt, (pt[0] + w, pt[1] + h),  (255,0,0),2) 
            cv2.rectangle(xp_img, (zoom_point[0],+zoom_point[1]), (zoom_point[2],zoom_point[3]),  (0,255,0),1) 
            #cv2.putText(xp_img,str(pt), (pt[0], pt[1]), font,1,(255,0,0),3,cv2.LINE_AA)

            return return_pt,max_val
        except cv2.error:
            cv2.rectangle(xp_img, (zoom_point[0],+zoom_point[1]), (zoom_point[2],zoom_point[3]),  (0,255,0),3) 
            print("cv2 ERROR " + temp)
            return [0,0],0
    @classmethod
    def _MARCH_C(cls,set_img,xp_img,zoom_point):

        set_img=cls._ZOOM_dec(set_img,zoom_point)

        return_pt=[0,0,0,0]
        save_point=0
        start_point=0
        set_img=cv2.cvtColor(set_img,cv2.COLOR_BGR2HSV)
        h,w=set_img.shape[:2]
        
        for y in range(h):
            for x in range(w):
                if save_point==5 and start_point ==0:
                    return_pt[0]=x+zoom_point[0]-30
                    return_pt[1]=y+zoom_point[1]-10
                    start_point=1
                elif save_point>5 :
                    return_pt[2]=x+zoom_point[0]+30
                    return_pt[3]=y+zoom_point[1]+10
                if set_img[y,x][0]>10 and set_img[y,x][0]<15:
                    save_point=save_point+1
                    #xp_img[y+zoom_point[1],x+zoom_point[0]]=[255,255,255]
                else:
                    save_point=0
        
        cv2.rectangle(xp_img, (return_pt[0],return_pt[1]), (return_pt[2],return_pt[3]),  (255,0,0),3) 
        cv2.rectangle(xp_img, (zoom_point[0],+zoom_point[1]), (zoom_point[2],zoom_point[3]),  (0,255,0),1) 
        if return_pt==[0,0,0,0]:
            cv2.rectangle(xp_img, (zoom_point[0],+zoom_point[1]), (zoom_point[2],zoom_point[3]),  (0,255,0),3) 
            print("cv2 ERROR " + "C")
            return [0,0]

        return return_pt

    @classmethod
    def _R_CHECK(cls,img,num):
        h,w=img.shape[:2]
        #set_point=[50,int(h/2)-20,w-50,int(h/2)+20]
        set_point=[0,0,w,h]
        #print(set_point)
        H_img=cls._ZOOM_dec(cls._H_dec(img),set_point)
        

        f=open('img/test/col1.txt',mode='w')
        f.write('')
        f=open('img/test/col1.txt',mode='a')

        h,w=H_img.shape[:2]
        
        H=list(range(h))
        RGB=[]
        H_data=[0]*180

        for x in range(w):
            for y in range(h):
                H[y]=H_img[y,x]
                H_data[H_img[y,x]]+=1
            RGB.append(int(sum(H)/len(H)))
            f.write(str(RGB[x]))
            f.write("\n")
        f.close()


        MAX_H_data=H_data.index(max(H_data))
        lower = np.array([MAX_H_data-0,0,0])
        upper = np.array([MAX_H_data+0,255,255])
        return H_img
    @classmethod
    def _MARCH_E_mono(cls,set_img,xp_img):

        template=cv2.imread('img/temple/H_bol_4080.jpg')
        template=cv2.cvtColor(template,cv2.COLOR_BGR2GRAY)

        Y,X=set_img.shape[:2]
        Y_off=int (Y/2) 
        X_off=int (X/2)
        print(Y_off)
        XY_off_img=[
            set_img[0:Y_off,0:X_off],
            set_img[0:Y_off,X_off:X],
            set_img[Y_off:Y,0:X_off],
            set_img[Y_off:Y,X_off:X]
            ]
        
        return_pt=[]

        for img_num in range(4):
            super_img = XY_off_img[img_num].copy()
            offset_X=[0,int(X/2),0,int(X/2)]
            offset_Y=[0,0,int(Y/2),int(Y/2)]
            rows,cols = template.shape[:2]

            res=cv2.matchTemplate(super_img,template,cv2.TM_CCOEFF_NORMED)

            min_val, max_val, min_loc, max_loc = cv2.minMaxLoc(res)
            top_left = max_loc
            
            if max_val<0.5 :
                print ("\nBOL_ERROER\n")
                return return_pt,xp_img
            bottom_right = (top_left[0] + rows, top_left[1] +cols)
            
            return_pt.append([
                top_left[0] + offset_X[img_num],
                top_left[1] + offset_Y[img_num],
                bottom_right[0] + offset_X[img_num],
                bottom_right[1] + offset_Y[img_num] 
                ])
            cv2.rectangle(xp_img,
            (return_pt[img_num][0],return_pt[img_num][1]),
            (return_pt[img_num][2],return_pt[img_num][3]), 
            (255,255,0),3)
        return return_pt,xp_img
    @classmethod
    def Img_Transform(cls,img,pt_set):
        pt_set_t=np.float32([
            [pt_set[0][0],pt_set[0][1]],
            [pt_set[1][2],pt_set[1][1]],
            [pt_set[2][0],pt_set[2][3]]
        ])
        pt_trans=np.float32([
        [0,0],
        [pt_set[1][2]-pt_set[0][0],0],
        [0,pt_set[2][3]-pt_set[0][1]]
        ])
        M = cv2.getAffineTransform(pt_set_t,pt_trans)
        rows,cols,ch=img.shape
        #print(rows,cols)
        dst = cv2.warpAffine(img,M,(cols,rows))
        dst=dst[0:pt_set[2][3]-pt_set[0][1],0:pt_set[1][2]-pt_set[0][0]]

        dst=cv2.resize(dst,(2198,1696))
        return dst
    @classmethod
    def _Parts_serch(cls,img,xp_img,parts_name,parts_xywh):
        data=[[]]*len(parts_xywh[parts_name])
        for i in range(len(parts_xywh[parts_name])):
            point=[]
            val=0
            if parts_name == "R" :
                if i == 0 or i == 1 or i == 11 or i == 12:
                    point,val=cls._MARCH_M(cls._H_dec(img),xp_img,'R_R',parts_xywh["R"][i])
                elif i >= 5 and i<=8:
                    point,val=cls._MARCH_M(cls._H_dec(img),xp_img,'R_C',parts_xywh["R"][i])
                else:
                    point,val=cls._MARCH_M(cls._H_dec(img),xp_img,'R',parts_xywh["R"][i])
            elif parts_name == "SW" or parts_name == "Q":
                point,val=cls._MARCH_M(cls._H_dec(img),xp_img,parts_name,parts_xywh[parts_name][i])
            elif parts_name == "C":
                if i == 0 :
                    point,val=cls._MARCH_M(cls._H_dec(img),xp_img,parts_name+str(i),parts_xywh[parts_name][i])
                else:
                    point=cls._MARCH_C(img,xp_img,parts_xywh[parts_name][i])
            else :
                point,val=cls._MARCH_M(cls._H_dec(img),xp_img,parts_name+str(i),parts_xywh[parts_name][i])
            if point[0]>0 or point[1]>0:
                data[i]=[True,(point[0],point[1]),val]
            else:
                data[i]=[None,None,0]
        return data
    @classmethod 
    def _Parts_Select(cls):
        parts_point={
            "R":[
                    [1000,600,1150,1100],
                    [1000,1050,1150,1450],
                    [1100,600,1500,750],
                    [1100,875,1500,1025],
                    [900,525,1300,675],
                    [1200,1150,1300,1300],
                    [1275,1150,1375,1300],
                    [1275,1300,1375,1450],
                    [1200,1300,1300,1450],
                    [1600,475,2000,625],
                    [1250,475,1650,625],
                    [1775,1000,1925,1400],
                    [1525,100,1675,500],
                    [900,400,1300,550],
                    [900,300,1300,450],
                    [900,200,1300,350],
                    [900,100,1300,250],
                    [1600,375,2000,525]
                ],
            "C":[
                    [1450,900,1650,1000],
                    [1600,1300,1800,1400],
                    [1600,900,1800,1000]
                ],
            "D":[
                    [900,600,1050,1000],
                    [750,250,950,400],
                    [1700,1400,2000,1600],
                    [1700,100,2000,300]
                ],
            "Q":[
                    [1200,700,1400,900],
                    [1200,950,1400,1150]
                ],
            "SW":[
                    [400,150,800,550],
                    [400,1150,800,1550]
                ],
            "U":[
                    [1425,575,1825,925],
                    [1450,1000,1850,1350]
                ]
        }
        return parts_point

    @classmethod
    def Start(cls,img,test=True):
        img=cv2.resize(img,(4080,3040))###
        #img=cv2.resize(img,(2040,1520))###
        img_copy=img.copy()
        pro_img=img.copy()
        
        cls._SAVE("1XP_",img_copy)
        cls._SAVE("1H_dec",cls._H_dec(cls._HSV_dec (img,(120,250,255),(90,0,0))))
        if test == True : 
            #point_T,trancs_img=cls._MARCH_E_mono(cls._H_dec(img),img_copy)
            point_T,trancs_img=cls._MARCH_E_mono(cls._H_dec(cls._HSV_dec (img,(120,250,255),(80,0,0))),img_copy)
            if len(point_T)==4 :
                pro_img=cls.Img_Transform(trancs_img,cls._Point_DEC(point_T))
            else :
                print("quit_4")
                cls._SAVE("XP_",img_copy)
                cls._SAVE("H_dec",cls._H_dec (img))
                return

            img=pro_img.copy()
            img_copy=img.copy()
        else:
            img=cv2.resize(img,(2200,1700))
            img_copy=img.copy()
        parts_xywh=cls._Parts_Select()
        R_data=cls._Parts_serch(img,img_copy,"R",parts_xywh)
        C_data=cls._Parts_serch(img,img_copy,"C",parts_xywh)
        D_data=cls._Parts_serch(img,img_copy,"D",parts_xywh)
        Q_data=cls._Parts_serch(img,img_copy,"Q",parts_xywh)
        SW_data=cls._Parts_serch(img,img_copy,"SW",parts_xywh)
        #U_data=cls._Parts_serch(img,img_copy,"U",parts_xywh)


        send_value=[
                    R_data,
                    C_data,
                    D_data,
                    Q_data,
                    SW_data,
                [ #U
                    [True,False,0.0],
                    [True,False,0.5]
                ]
            ]


        cls._SAVE("XP_",img_copy)
        cls._SAVE("H_dec",cls._H_dec (img))
        return cls._send_data(img_copy,send_value)

    @classmethod
    def _send_data(cls,img,wark_data):
        
        R=[]
        C=[]
        D=[]
        Q=[]
        SW=[]
        U=[]
        wark_type="A"
        for i in range(len(wark_data)):
            for j in range(len(wark_data[i])):
                #print(i,j,wark_data[i][j])
                if i==0:
                    R.append(wark_data[i][j])
                elif i ==1 :
                    C.append(wark_data[i][j])
                elif i ==2 :
                    D.append(wark_data[i][j])
                elif i ==3 :
                    Q.append(wark_data[i][j])
                elif i ==4 :
                    SW.append(wark_data[i][j])
                elif i ==5 :
                    U.append(wark_data[i][j])
        try:
            send_data={
                "img":img,
                "type":wark_type,
                "parts":{
                    "R1":{
                        "mounted_parts":R[0][0],
                        "misalignment1":R[0][1],
                        "misalignment2":R[0][2]
                    },
                    "R2":{
                        "mounted_parts":R[1][0],
                        "misalignment1":R[1][1],
                        "misalignment2":R[1][2]
                    },
                    "R3":{
                        "mounted_parts":R[2][0],
                        "misalignment1":R[2][1],
                        "misalignment2":R[2][2]
                    },
                    "R4":{
                        "mounted_parts":R[3][0],
                        "misalignment1":R[3][1],
                        "misalignment2":R[3][2]
                    },
                    "R5":{
                        "mounted_parts":R[4][0],
                        "misalignment1":R[4][1],
                        "misalignment2":R[4][2]
                    },
                    "R6":{
                        "mounted_parts":R[5][0],
                        "misalignment1":R[5][1],
                        "misalignment2":R[5][2]
                    },
                    "R7":{
                        "mounted_parts":R[6][0],
                        "misalignment1":R[6][1],
                        "misalignment2":R[6][2]
                    },
                    "R8":{
                        "mounted_parts":R[7][0],
                        "misalignment1":R[7][1],
                        "misalignment2":R[7][2]
                    },
                    "R9":{
                        "mounted_parts":R[8][0],
                        "misalignment1":R[8][1],
                        "misalignment2":R[8][2]
                    },
                    "R10":{
                        "mounted_parts":R[9][0],
                        "misalignment1":R[9][1],
                        "misalignment2":R[9][2]
                    },
                    "R11":{
                        "mounted_parts":R[10][0],
                        "misalignment1":R[10][1],
                        "misalignment2":R[10][2]
                    },
                    "R12":{
                        "mounted_parts":R[11][0],
                        "misalignment1":R[11][1],
                        "misalignment2":R[11][2]
                    },
                    "R13":{
                        "mounted_parts":R[12][0],
                        "misalignment1":R[12][1],
                        "misalignment2":R[12][2]
                    },
                    "R14":{
                        "mounted_parts":R[13][0],
                        "misalignment1":R[13][1],
                        "misalignment2":R[13][2]
                    },
                    "R15":{
                        "mounted_parts":R[14][0],
                        "misalignment1":R[14][1],
                        "misalignment2":R[14][2]
                    },
                    "R16":{
                        "mounted_parts":R[15][0],
                        "misalignment1":R[15][1],
                        "misalignment2":R[15][2]
                    },
                    "R17":{
                        "mounted_parts":R[16][0],
                        "misalignment1":R[16][1],
                        "misalignment2":R[16][2]
                    },
                    "R18":{
                        "mounted_parts":R[17][0],
                        "misalignment1":R[17][1],
                        "misalignment2":R[17][2]
                    },
                    "Q1":{
                        "mounted_parts":Q[0][0],
                        "misalignment1":Q[0][1],
                        "misalignment2":Q[0][2]
                    },
                    "Q2":{
                        "mounted_parts":Q[1][0],
                        "misalignment1":Q[1][1],
                        "misalignment2":Q[1][2]
                    },
                    "D1":{
                        "mounted_parts":D[0][0],
                        "misalignment1":D[0][1],
                        "misalignment2":D[0][2]
                    },
                    "D2":{
                        "mounted_parts":D[1][0],
                        "misalignment1":D[1][1],
                        "misalignment2":D[1][2]
                    },
                    "D3":{
                        "mounted_parts":D[2][0],
                        "misalignment1":D[2][1],
                        "misalignment2":D[2][2]
                    },
                    "D4":{
                        "mounted_parts":D[3][0],
                        "misalignment1":D[3][1],
                        "misalignment2":D[3][2]
                    },
                    "C1":{
                        "mounted_parts":C[0][0],
                        "misalignment":C[0][1]
                    },
                    "C2":{
                        "mounted_parts":C[1][0],
                        "misalignment":C[1][1]
                    },
                    "C3":{
                        "mounted_parts":C[2][0],
                        "misalignment":C[2][1]
                    },
                    "SW1":{
                        "mounted_parts":SW[0][0],
                        "misalignment1":SW[0][1],
                        "misalignment2":SW[0][2]
                    },
                    "SW2":{
                        "mounted_parts":SW[1][0],
                        "misalignment1":SW[1][1],
                        "misalignment2":SW[1][2]
                    },
                    "IC1":{
                        "mounted_parts":U[0][0],
                        "misalignment":U[0][1],
                        "angle":U[0][2]
                    },
                    "IC2":{
                        "mounted_parts":U[0][0],
                        "misalignment":U[0][1],
                        "angle":U[0][2]
                    },
                }
            }
        
        except NameError:
            return send_data
        return send_data
        
