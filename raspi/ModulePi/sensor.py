#!/usr/bin/env python3
# -*- coding: utf-8 -*-#!/usr/bin/env python
# -*- coding: utf-8 -*-
import spidev
import RPi.GPIO as gpio
import numpy as np
import smbus
import time



class Hard:
    @classmethod
    def _SPI_AD_DEC(cls,mode,ch):
        Vref = 3.3
        ch_sel = [1,(8+ch)<<4,0]
        
        spi = spidev.SpiDev()
        spi.open(0,mode) #bus 0,cs 0
        spi.max_speed_hz = 1000000 # 1MHz
        
        adc = spi.xfer2(ch_sel)
        data = ((adc[1] & 3) << 8) + adc[2]
        data = round(data,4)
        vol=Vref*data/1023
        spi.close()

        return vol
    
    @classmethod
    def _SPI_DA_DEC(cls,set_vol):#MCP4911
        if set_vol>255:
            return

        spi=spidev.SpiDev()
        spi.open(0,0)
        spi.max_speed_hz=2000000
        spi.mode=0
        
        gpio.setmode(gpio.BCM)
        gpio.setup(26,gpio.OUT)
        gpio.output(26,True)

        vol=((set_vol<<2) & 0x3FFF)
        write_data=[
            (0b0011<<4)+((vol>>6) & 0x0F),
            vol & 0x00FF
            ]

        #Vout=(Vref*1023/1024*Vref)/2**10*1

        """
            ゲインなし(1倍)
            Vref=5V
            Vref*1倍=5V
        """
        
        spi.writebytes(write_data)
        #print("SPI_DA_DEC")
        gpio.output(26,False)
        gpio.output(26,True)
        spi.close()
        #print(bin((write_data[0]<<8)+write_data[1]))
    
    @classmethod
    def __BME280(cls,regi,spi):
        data=[0]*len(regi)
        for i in range(len(regi)):
            data[i] = spi.xfer2([regi[i] & 0xFF,0x01,0x01])
        return data
    @classmethod
    def __DEC_2(cls,data):
        if data>0x8000:
            dst=-(data&0x7FFF)
        else:
            dst=data
        return dst
    @classmethod
    def _SPI_BME(cls):#BME280

        spi=spidev.SpiDev()
        spi.open(0,1)
        spi.mode=3
        spi.max_speed_hz=1000000
        cont_byte_W=0b01111111
        config=[0xF5 & cont_byte_W,0b00000000]# 0b00000000
        ctrl_meas=[0xF4 & cont_byte_W,0b00100111] # 
        ctrl_hum=[0xF2 & cont_byte_W,0b00000001] # 0b00000001
        

        read_press=[0xF7,0xF8,0xF9]
        read_temp=[0xFA,0xFB,0xFC]
        read_hum=[0xFD,0xFE]


        dig_T_register=[0x88,0x89,0x8A,0x8B,0x8C,0x8D]
        dig_P_register=[0x8E,0x8F,0x90,0x91,0x92,0x93,0x94,0x95,0x96,0x97,0x98,0x99,0x9A,0x9B,0x9C,0x9D,0x9E,0x9F]
        dig_H_register=[0xA1,0xE1,0xE2,0xE3,0xE4,0xE5,0xE6,0xE7]

        ### write
        spi.writebytes(config)
        spi.writebytes(ctrl_meas)
        spi.writebytes(ctrl_hum)
        ##read
        temp=Hard.__BME280(read_temp,spi)
        data_temp=((temp[0][1]<<12)+(temp[1][1]<<4)+((temp[2][1]>>4)&0x0F))
        ##
        hum=Hard.__BME280(read_hum,spi)
        data_hum=(hum[0][1]<<8)+(hum[1][1])
        ##
        press=Hard.__BME280(read_press,spi)
        data_press=((press[0][1]<<12)+(press[1][1]<<4)+((press[2][1]>>4)&0x0F))
        ######
        dig_T=Hard.__BME280(dig_T_register,spi)
        dig_H=Hard.__BME280(dig_H_register,spi)
        dig_P=Hard.__BME280(dig_P_register,spi)
        ################
        data_dig_T=[
            (dig_T[0][1])+(dig_T[1][1]<<8),
            (dig_T[2][1])+(dig_T[3][1]<<8),
            (dig_T[4][1])+(dig_T[5][1]<<8)]
        data_dig_H=[
            (dig_H[0][1]),
            (dig_H[1][1])+(dig_H[2][1]<<8),
            (dig_H[3][1]<<8),
            (dig_H[4][1]<<4)+(dig_H[5][1]&0x0F),
            (dig_H[6][1]<<4)+(dig_H[5][1]>>4),
            (dig_H[7][1])]
        """
            data_dig_P=[
            (dig_P[0][1])+(dig_P[1][1]<<8),
            (dig_P[2][1])+(dig_P[3][1]<<8),
            (dig_P[4][1])+(dig_P[5][1]<<8),
            (dig_P[6][1])+(dig_P[7][1]<<8),
            (dig_P[8][1])+(dig_P[9][1]<<8),
            (dig_P[10][1])+(dig_P[11][1]<<8),
            (dig_P[12][1])+(dig_P[13][1]<<8),
            (dig_P[14][1])+(dig_P[15][1]<<8),
            (dig_P[16][1])+(dig_P[17][1]<<8)]
        """
        data_dig_P=[0]*9
        for i in range(0,9):
            data_dig_P[i]=(dig_P[i*2][1])+(dig_P[i*2+1][1]<<8)
        #############
        try:
            data_dig_T[1]= Hard.__DEC_2(data_dig_T[1])
            data_dig_T[2]= Hard.__DEC_2(data_dig_T[2])
            for i in range(1,9):
                data_dig_P[i]= Hard.__DEC_2(data_dig_P[i])
            for i in range(1,6):
                data_dig_H[1]= Hard.__DEC_2(data_dig_H[1])
            ########T#########

            var1=(((data_temp >>3)-(data_dig_T[0]<<1))*(data_dig_T[1]))>>11
            var2=(((((data_temp>>4)-(data_dig_T[0])) * ((data_temp >> 4) - (data_dig_T[0]))) >> 12) * (data_dig_T[2])) >> 14
            res = var1 + var2
            T = (res * 5 + 128) >> 8

            ########P########
            var1 = (res) - 128000
            var2 = var1 * var1 * data_dig_P[5]
            var2 = var2 + ((var1*data_dig_P[4]) << 17)
            var2 = var2 + ((data_dig_P[3]) << 35)
            var1 = ((var1 * var1 * data_dig_P[2]) >> 8) + ((var1 * data_dig_P[1]) << 12)
            var1 = ((((1) << 47)+var1))*(data_dig_P[0]) >> 33

            P = (1048576-data_press)
            P = (((P << 31)-var2)*3125)/var1
            var1 = data_dig_P[8] * (P/4096*P/4096)/0x1000000
            var2 = data_dig_P[7] * P /0x40000
            P = ((P + var1 + var2)/0x80) + (data_dig_P[6] * 0x8)
            #######H#######

            var_H = (res - (76800))
            var_H = (((((data_hum << 14) - ((data_dig_H[3]) << 20) - 
            ((data_dig_H[4]) * var_H)) +(16384)) >> 15) * ((((((var_H * data_dig_H[5] >> 10) *
            (((var_H *data_dig_H[2]) >> 11) + 32768)) >> 10) + (2097152)) *(data_dig_H[1]) + 8192) >> 14))
            var_H = (var_H - (((((var_H >> 15) * (var_H >> 15)) >> 7) * (data_dig_H[0])) >> 4))
            if var_H<0:
                var_H=0
            if var_H>419430400:
                var_H=419430400
            H= (var_H >> 12)

            ####################
            T=round(T*0.01,3)
            P=round(P/256*0.01,3)
            H=round(H/1024,3)
            spi.close()

            return T,P,H
        except ZeroDivisionError:
            print("ZeroDivisionError")
            return 0,0,0

    @classmethod
    def _I2C_COMMAD(cls,com):
        COM=(0x80 | 0x20 | com)
        return COM
    @classmethod
    def _I2C(cls):
        i2c=smbus.SMBus(1)
        dev_addr=0x39
        try:
            flg=i2c.read_i2c_block_data(dev_addr,Hard._I2C_COMMAD(0x12),1)
            if ( flg != [0x34]) :
                i2c.close()
                return -1
            i2c.write_byte_data(dev_addr,Hard._I2C_COMMAD(0x0F),0x00)
            i2c.write_byte_data(dev_addr,Hard._I2C_COMMAD(0x0D),0x00)
            i2c.write_byte_data(dev_addr,Hard._I2C_COMMAD(0x01),0xC0)
            i2c.write_byte_data(dev_addr,Hard._I2C_COMMAD(0x00),0x02 | 0x01)


            data=i2c.read_i2c_block_data(dev_addr,Hard._I2C_COMMAD(0x14),4)
            adc=[(data[1]<<8|data[0]),(data[3]<<8|data[2])]
            
            i2c.close()
            cpl = (2.73 * (256 - 0xC0) * 1)/(60.0)
            lux1 = ((adc[0] * 1.00) - (adc[1] * 1.87)) / cpl
            lux2 = ((adc[0] * 0.63) - (adc[1] * 1.00)) / cpl
            if ((lux1 <= 0) and (lux2 <= 0)) :
                return 0
            elif (lux1 > lux2) :
                #print("{:.1f} Lx".format(lux1))
                return lux1
            elif (lux1 < lux2) :
                #print("{:.1f} Lx".format(lux2))
                return lux2
        except OSError:
            print("None_luminance")
            return None
        #time.sleep(0.2)
    @classmethod
    def _GPIO_SETUP(cls):
        LED_pin=[22,27,0]
        RELRY_pin=[4,17]
        gpio.setmode(gpio.BCM)
        for num in range(3):
            gpio.setup(LED_pin[num],gpio.OUT)
        gpio.setup(RELRY_pin[0],gpio.OUT)
        gpio.setup(RELRY_pin[1],gpio.OUT)
############################################
    @classmethod
    def _LED(cls,pin,HILO):
        if pin==0:
            gpio.output(22,HILO)
        if pin==1:
            gpio.output(27,HILO)
        if pin==2:
            gpio.output(0,HILO)
    @classmethod
    def _Line(cls,HILO):
        gpio.output(4,HILO)
    @classmethod
    def _Motor(cls,dir,speed):
        gpio.setup(motor_pin,gpio.OUT)
        servo=gpio.PWM(motor_pin,50)
        servo.start(7.5)
        time.sleep(2)
        servo.ChangeDutyCycle(5)
        time.sleep(2)
        servo.ChangeDutyCycle(10)
        time.sleep(2)
        servo.stop()
        """
            import wiringpi as pi
            IN1_MOTOR_PIN = 23
            IN2_MOTOR_PIN = 24
            pi.pinMode( IN1_MOTOR_PIN, pi.OUTPUT )
            pi.pinMode( IN2_MOTOR_PIN, pi.OUTPUT )
            pi.softPwmCreate( IN1_MOTOR_PIN, 0, 100 )
            pi.softPwmCreate( IN2_MOTOR_PIN, 0, 100 )
            pi.softPwmWrite( IN1_MOTOR_PIN, 0 )
            pi.softPwmWrite( IN2_MOTOR_PIN, 0 )
            pi.softPwmWrite( IN1_MOTOR_PIN, 0 )
            pi.softPwmWrite( IN2_MOTOR_PIN, 25 )
        """
    @classmethod
    def light(cls,light_data):
        gpio.output(17,True)
        Hard._SPI_DA_DEC(light)
    @classmethod
    def Motor(cls,pwm_data):
        Hard._Motor(1,100)
    @classmethod
    def main(cls):
        Hard._GPIO_SETUP()
        lux=0
        lux = Hard._I2C()
        
        temp,press,hum,= Hard._SPI_BME()
        send_data = {
            "status" : {
                "temp": temp,
                "hr" : hum,
                "atm" : press
            }
        }
        if lux != None:
            send_data["status"]["luminance"] = round(lux,3)
        gpio.cleanup()
        return send_data
############################################
"""
    gpio SW 23 24 25 
    gpio LED 27 22 0 
    12 13 G
    5 6 G

    I2C
        TSL25721
            SCK──────┤Clock(GPIO3)
            SDA──────┤Data(GPIO2)
            INT──×   │
            OE ──┐   │
            3V3──┼───┤3V3
            GND──│───┤GND
            VIN──┘   │
    SPI
        BME280
            VDD──────┤3.3V
            GND──────┤GND
            CSB──────┤CE1(GPIO7)
            SDI──────┤MOSI(GPIO10)
            SDO──────┤MISO(GPIO9)
            SCK──────┤SCLK(GPIO11)
        MCP4911(D/A)
            VDD────┬─┤5V                ┌─────────┐
            CS ────│─┤CE0(GPIO8)        ┤VDD  Vout├
            SCK────│─┤SCLK(GPIO11)      ┤CS   Vss ├
            SDI────│─┤MOSI(GPIO10)      ┤SCK  Vref├
            VDAC───│─┤GPIO26            ┤SDI  VDAC├
            Vref───┘ │                  └─────────┘
            Vss──────┤GND               
            Vout──OUT 
"""