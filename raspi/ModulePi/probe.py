# -*- coding: utf-8 -*-
import time,spidev,sys
import datetime as dt
import numpy as np
from pprint import pprint
 
class ADConverterClass:
    def __init__(self, ref_volts, ch):
        self.ref_volts = ref_volts
        self.spi = spidev.SpiDev()
        self.spi.open(0,0)
        self.spi.max_speed_hz = 1000000
        self.ch = ch

    def get_voltage(self):
        raw = self.spi.xfer2([((0b1000+self.ch)>>2)+0b100,((0b1000+self.ch)&0b0011)<<6,0])  
        raw2 = ((raw[1]&0b1111) << 8) + raw[2]
        volts = (raw2 * self.ref_volts ) / float(4095)
        return volts*1.4
 
    def Cleanup(self):
        self.spi.close()

def totalp(i,value):

    min_percent = np.amin(i/value[1]) * 100
    avg_percent = np.mean(i/value[2]) * 100
    max_percent = np.amax(i/value[0]) * 100
    sd_percent = np.std(i/value[3]) * 100
    total_percent = (max_percent+min_percent+avg_percent+sd_percent)/ 4

    return abs(total_percent)
def main ():
    volts_no_np=[]
    try:
        for i in range(5):
            state=[]
            #mcp3028の基準電圧 入力を抵抗にて分圧してあるので、×1.4すること
            ADCC = ADConverterClass(ref_volts=3.3, ch=i)
            print(f"pin{i}:",ADCC.get_voltage())
            for num in range(250):
                state.append(round(ADCC.get_voltage(),3))
            volts_no_np.append(state)
    except KeyboardInterrupt:                           
        print("\nCtl+C")
    except Exception as e:
        print("Error:",e,file=sys.stderr)                                   
    send_data={"type":"A","measured_value":{}}
    for i in range(5):
        send_data["measured_value"][f"{i+9}"] = {
            "adc_data":volts_no_np[i],
            "MAX":round(np.amax(volts_no_np[i]),3),
            "MIN":round(np.amin(volts_no_np[i]),3),
            "AVG":round(np.mean(volts_no_np[i]),3),
            "SD":round(np.std(volts_no_np[i],ddof=1),3),
        }
        #最大、最小、平均、標準偏差のシュミレーションデータ
        if i == 0:
            send_data["measured_value"][f"{i+9}"]["TP"] = round(totalp(volts_no_np[i],\
            np.array([3.057549,1.534248,2.357537,0.69402])))
        elif i == 2:
            send_data["measured_value"][f"{i+9}"]["TP"] = round(totalp(volts_no_np[i],\
            np.array([3.030951,1.56193,2.341626,0.648205])))
    print(send_data)
    return send_data