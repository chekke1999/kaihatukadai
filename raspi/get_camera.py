#!/usr/bin/env python3
from __future__ import print_function
from imutils.video import WebcamVideoStream
from imutils.video import FPS
import imutils,cv2
import numpy as np

def img_get(pipe):
	print("[INFO] sampling THREADED frames from webcam...")
	vs = WebcamVideoStream(src=0).start()
	fps = FPS().start()

	WIDTH = 1000

	while(True):
		frame = vs.read()
		pipe = [frame]
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
	cv2.destroyAllWindows()
	vs.stop()
