#!/usr/bin/env python3
import cv2
import numpy as np
import temp

#img_ori = cv2.imread('img/ori/A/'+str(test)+'.jpg')
img_ori = cv2.imread('img/ori/r3_1_8/1.png')
img_ori=cv2.cvtColor(img_ori,cv2.COLOR_RGB2BGR)
#640 480
#720,480
#4080  3040
#img_ori=cv2.resize(img_ori,(2198,1696))
data=temp.Mcc.Start(img_ori,True)

#print(data)
