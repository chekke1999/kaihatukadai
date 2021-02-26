#!/usr/bin/env python3


import cv2
import RPi.GPIO as gpio
import time
from impro import Mcc as Mcc
from sensor import Hard as Hard
from get_camera import full_img
from get_camera import destroy

class SW:
    SW_state1=False
    SW_state2=False
    SW_state3=False
    @classmethod
    def _SW_callback_1(cls,sw):
        #time.sleep(3)
        #destroy()
        SW.SW_state1=not(SW.SW_state1)
        Hard._LED(0,SW.SW_state1)
        #ndimg1 = full_img()
        #Mcc.Start(ndimg1)
        print("1")
    @classmethod
    def _SW_callback_2(cls,sw):
        SW.SW_state2=not(SW.SW_state2)
        if SW.SW_state2:
            Hard.light(255)
        else:
            Hard.light(0)
        Hard.light_power(SW.SW_state2)
        Hard._LED(1,SW.SW_state2)
        print("2")
    @classmethod
    def _SW_callback_3(cls,sw):
        SW.SW_state3=not(SW.SW_state3)
        Hard._LED(2,SW.SW_state3)
        Hard._Line(SW.SW_state3)
        print("3")

    @classmethod
    def _motor_sensor_callback_1(cls,sw):
        Hard._Motor(0)
        time.sleep(1)
        Hard._Motor(-1)
        print("return")
    @classmethod
    def _motor_sensor_callback_2(cls,sw):
        Hard._Motor(0)
        print("stop")
    @classmethod
    def _main(cls):
        Hard._GPIO_SETUP()
        gpio.add_event_detect(Hard.SW_pin[0],gpio.RISING,callback=(SW._SW_callback_1),bouncetime=300)
        gpio.add_event_detect(Hard.SW_pin[1],gpio.RISING,callback=(SW._SW_callback_2),bouncetime=300)
        gpio.add_event_detect(Hard.SW_pin[2],gpio.RISING,callback=(SW._SW_callback_3),bouncetime=300)
        """
        if Hard.flag==True:
            gpio.add_event_detect(Hard.motor_sensor[0],gpio.RISING,callback=SW._motor_sensor_callback_1,bouncetime=300)
            gpio.add_event_detect(Hard.motor_sensor[1],gpio.RISING,callback=SW._motor_sensor_callback_2,bouncetime=300)
        """
    @classmethod
    def _test_main(cls):
        SW._SW_callback_1(1)


#SW._test_main()
SW._main()
try:
    while 1 :
        time.sleep(0.5)
except KeyboardInterrupt:
    print("OFF")
    gpio.cleanup()