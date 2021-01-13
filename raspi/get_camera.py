#!/usr/bin/env python3
from __future__ import print_function
import numpy as np
import cv2
from screeninfo import get_monitors 

def imshow_fullscreen(winname, img):
    cv2.namedWindow(winname, cv2.WINDOW_NORMAL)
    cv2.setWindowProperty(winname, cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)
    cv2.imshow(winname, img)

def img_get(pipe):
	src = 'v4l2src ! video/x-raw, width=1280, height=720, framerate=30/1 ! videoconvert ! appsink sync=false'
	print("[INFO] sampling THREADED frames from webcam...")
	vs = WebcamVideoStream(src).start()

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

def test():
	vs = VideoStream(src=0, resolution=(1280, 720))

	WIDTH = 1280
	HEIGHT= 720
	for i in range(100):
		frame = vs.read()
		frame = cv2.flip(frame, -1)
		frame = imutils.resize(frame, width=WIDTH, height=HEIGHT)
		cv2.imshow("Frame", frame)

		key = cv2.waitKey(1) & 0xFF
		if key == ord('c'):
			cv2.imwrite('./data/test_fps.jpg', frame)
		elif key == ord('q'):
			break
		if i == 99:
			vs.stop()
			del vs, frame, src
			print("[INFO] sampling THREADED frames from webcam...")
			vs = VideoStream(src=0, resolution=(4056, 3040))
			frame = vs.read()
			frame = cv2.flip(frame, -1)
			cv2.imwrite('./test_fps.jpg', frame)

def test2():

    print("[INFO] sampling THREADED frames from webcam...")
    cap = cv2.VideoCapture (0)

    WIDTH = 4056
    HEIGHT = 3040

    cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc('Y','U','1','2'))
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, WIDTH)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)

    _, frame = cap.read()

    while(True):

	    frame_resize = cv2.resize(frame, (2028,1520))

    #	cv2.namedWindow("Frame", cv2.WINDOW_NORMAL)
	    cv2.imshow("Frame", frame_resize)

	    key = cv2.waitKey(1) & 0xFF
	    if key == ord('c'):
		    cv2.imwrite('./test_fps.png', frame)
	    elif key == ord('q'):
		    break

    print(type(frame))
    monitor = get_monitors()[0]
    print(monitor.width,monitor.height)

    # do a bit of cleanup
    cv2.destroyAllWindows()
    cap.release()


if __name__ == '__main__':
	#test()
	test2()
	imshow_fullscreen('screen', img)
