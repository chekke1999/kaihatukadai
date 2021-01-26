# -*- coding: utf-8 -*-
import time                                             
import spidev                                                                   
import csv
import datetime as dt
import numpy as np
                                                                               
 
class  ADConverterClass:                                
    def __init__(self, ref_volts, ch):                  
        self.ref_volts = ref_volts                      
        self.spi = spidev.SpiDev()                      
        self.spi.open(0,0)                              
        self.spi.max_speed_hz = 1000000
        self.ch = ch                                    
 
    def get_voltage(self, ch):                          
        raw = self.spi.xfer2([((0b1000+ch)>>2)+0b100,((0b1000+ch)&0b0011)<<6,0])  
        raw2 = ((raw[1]&0b1111) << 8) + raw[2]          
        volts = (raw2 * self.ref_volts ) / float(4095)  
        volts = round(volts,4)                          
        return volts                                    
 
    def Cleanup(self):                                          
        self.spi.close()

"""def all_cleanup():
    ad_conv_no9.Cleanup()
    ad_conv_no10.Cleanup()
    ad_conv_no11.Cleanup()
    ad_conv_no12.Cleanup()
    ad_conv_no13.Cleanup()"""


def main ():
    VOLTS = 3.3   #mcp3028の基準電圧 入力を抵抗にて分圧してあるので、×1.4すること       
    #if __name__ == '__main__': # main

    #volts_no[i]_np = np.zeros(250)
    ad_conv_no=[]*6
    volts_no_np=[[0]*250]*5
    volts_no=0
    for i in range(5):
        ad_conv_no.append(ADConverterClass(ref_volts=VOLTS, ch=i))
        

    f=open('ADC_test.csv','w')
    writer = csv.writer(f, lineterminator='\n')
    try:
        for ch_cnt in range(5):
            state=[]
            for num in range(250):
                volts_no = ad_conv_no[ch_cnt].get_voltage(ch=ch_cnt)

                #volts_no = float(volts_no) * 1.4
                #writer.writerow([num,volts_no)
                #volts_no_np[ch_cnt][num]= volts_no
                state.append(volts_no)
            volts_no_np[ch_cnt]=state
    except KeyboardInterrupt:                           
        print("\nCtl+C")
    except Exception as e:
        print(str(e))                                   
    finally:
        for i in range(5):
            ad_conv_no[i].Cleanup()

        mas_data=[[0]*4]*5
        for i in range(4):
            mas_data[i][0] = np.amax(volts_no_np[i])#最大
            mas_data[i][1] = np.amin(volts_no_np[i])#最小
            mas_data[i][2] = np.mean(volts_no_np[i])#平均
            mas_data[i][3] = np.std(volts_no_np[i],ddof=1) #標準偏差
        
        
            #writer.writerow([num,volts_no[i],standard_no9,average_no9])#CSVに書き出し
        #for x in range(len(volts_no_np[1])):
        #    print(volts_no_np[0][x])


        send_data={
            "type":"A",
            "denkyoku":{
                "9":{
                    "adc_data":volts_no_np[0],
                    "MAX":mas_data[0][0],
                    "MIN":mas_data[0][1],
                    "AVE":mas_data[0][2],
                    "standard":mas_data[0][3]
                },
                "10":{
                    "adc_data":volts_no_np[1],
                    "MAX":mas_data[1][0],
                    "MIN":mas_data[1][1],
                    "AVE":mas_data[1][2],
                    "standard":mas_data[1][3]
                },
                "11":{
                    "adc_data":volts_no_np[2],
                    "MAX":mas_data[2][0],
                    "MIN":mas_data[2][1],
                    "AVE":mas_data[2][2],
                    "standard":mas_data[2][3]
                },
                "12":{
                    "adc_data":volts_no_np[3],
                    "MAX":mas_data[3][0],
                    "MIN":mas_data[3][1],
                    "AVE":mas_data[3][2],
                    "standard":mas_data[3][3]
                },
                "13":{
                    "adc_data":volts_no_np[4],
                    "MAX":mas_data[4][0],
                    "MIN":mas_data[4][1],
                    "AVE":mas_data[4][2],
                    "standard":mas_data[4][3]
                }
            }
        }

    return send_data