#!/usr/bin/env python3
from __future__ import print_function
from imutils.video import WebcamVideoStream
from imutils.video import FPS
import argparse
import imutils
import cv2
import numpy as np

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument("-n", "--num-frames", type=int, default=100,
	help="# of frames to loop over for FPS test")
ap.add_argument("-d", "--display", type=int, default=-1,
	help="Whether or not frames should be displayed")
args = vars(ap.parse_args())

# created a *threaded* video stream, allow the camera sensor to warmup,
# and start the FPS counter
print("[INFO] sampling THREADED frames from webcam...")
vs = WebcamVideoStream(src=0).start()
fps = FPS().start()

WIDTH = 1920
HEIGHT = 1080

# loop over some frames...this time using the threaded stream
while(True):
	# grab the frame from the threaded video stream and resize it
	# to have a maximum width of 400 pixels
	frame = vs.read()
	frame = imutils.resize(frame, width=WIDTH)

	cv2.imshow("Frame", frame)

	key = cv2.waitKey(1) & 0xFF
	if key == ord('c'):
		cv2.imwrite('./data/test_fps.jpg', frame)
	elif key == ord('q'):
		break
	# update the FPS counter
	fps.update()

# stop the timer and display FPS information
fps.stop()
print("[INFO] elasped time: {:.2f}".format(fps.elapsed()))
print("[INFO] approx. FPS: {:.2f}".format(fps.fps()))

#show width
print("[INFO] width: {:.0f}".format(WIDTH))

#get type
print(type(frame))

# do a bit of cleanup
cv2.destroyAllWindows()
vs.stop()
