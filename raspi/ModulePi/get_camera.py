#!/usr/bin/env python3
from __future__ import print_function
import numpy as np
import cv2
from screeninfo import get_monitors 

monitor = get_monitors()[0]

def imshow_fullscreen(winname, img):
	cv2.namedWindow(winname, cv2.WINDOW_NORMAL)
	cv2.setWindowProperty(winname, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
	cv2.imshow(winname, img)
	cv2.waitKey(300)
	#cv2.destroyAllWindows()

def resize(img,re_length):
	# リサイズしたい短い辺のサイズ re_length
	# 縦横のサイズを取得(h:縦、ｗ：横)
	h, w = img.shape[:2]
	# 変換する倍率を計算
	re_h = re_w = re_length/min(h,w)
	# アスペクト比を固定して画像を変換
	img2 = cv2.resize(img, dsize=None, fx=re_h , fy=re_w)
	return img2

def full_img(show=True):
	cap = cv2.VideoCapture (0)
	WIDTH = 4056
	HEIGHT = 3040
	cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('Y','U','1','2'))
	cap.set(cv2.CAP_PROP_FRAME_WIDTH, WIDTH)
	cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)
	_, frame = cap.read()
	if show:
		imshow_fullscreen('screen', resize(frame,monitor.height))
	return cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

def img_get(pipe):
	src = 'v4l2src ! video/x-raw, width=1280, height=720, framerate=30/1 ! videoconvert ! appsink sync=false'
	print("[INFO] sampling THREADED frames from webcam...")
	vs = VideoStream(src).start()

	WIDTH = 1280
	HEIGHT= 720

	while(True):
		frame = vs.read()
		frame = cv2.flip(frame, -1)
		pipe["img"] = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
		frame = imutils.resize(frame, width=WIDTH, height=HEIGHT)
		cv2.imshow("Frame", frame)
		key = cv2.waitKey(1) & 0xFF

		if key == ord('c'):
			cv2.imwrite('./data/test_fps.jpg', frame)
		elif key == ord('q'):
			break




if __name__ == '__main__':
	#test()
	img = full_img()
	imshow_fullscreen('screen', img)
	cv2.imwrite('./img/test_fps.png', img)