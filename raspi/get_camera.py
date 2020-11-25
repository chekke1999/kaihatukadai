#!/usr/bin/env python3
from __future__ import print_function
from imutils.video import WebcamVideoStream
from imutils.video import FPS
import argparse,imutils,cv2
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument("-n", "--num-frames", type=int, default=100,
	help="# of frames to loop over for FPS test")
ap.add_argument("-d", "--display", type=int, default=-1,
	help="Whether or not frames should be displayed")
args = vars(ap.parse_args())

print("[INFO] sampling THREADED frames from webcam...")
vs = WebcamVideoStream(src=0).start()
fps = FPS().start()

WIDTH = 1920
#HEIGHT = 1080

def img_get(pipe):
	while(True):
		frame = vs.read()
		pipe.send(frame)
		frame = imutils.resize(frame, width=WIDTH)
		cv2.imshow("Frame", frame)
		key = cv2.waitKey(1) & 0xFF

		if key == ord('c'):
			cv2.imwrite('./data/test_fps.jpg', frame)
		elif key == ord('q'):
			break
		fps.update()
	fps.stop()

if __name__ == '__main__':
	print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
	print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))
	print("[INFO] width: {:.0f}".format(WIDTH))
	print(type(frame))
	cv2.destroyAllWindows()
	vs.stop()
