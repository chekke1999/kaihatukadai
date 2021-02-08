use piscan
INSERT INTO pi_camera(
    plc_mac,
    top_img_path,
    slanting_img_path,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '/root/Picture/l_e_others_500.png',
    '/root/Picture/l_e_others_501.png',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"type":"A","parts":{"R1":{"mounted_parts":true,"misalignment":false},"R2":{"mounted_parts":false,"misalignment":true},"R3":{"mounted_parts":true,"misalignment":true},"IC":{"mounted_parts":true,"misalignment":true,"angle":0.1}}}'
);

INSERT INTO pi_camera(
    plc_mac,
    top_img_path,
    slanting_img_path,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '/root/Picture/l_e_others_500.png',
    '/root/Picture/l_e_others_501.png',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"type":"B","parts":{"R1":{"mounted_parts":true,"misalignment":true},"R2":{"mounted_parts":true,"misalignment":true},"R3":{"mounted_parts":true,"misalignment":true},"IC":{"mounted_parts":true,"misalignment":true,"angle":0.1}}}'
);

INSERT INTO pi_camera(
    plc_mac,
    top_img_path,
    slanting_img_path,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '/root/Picture/l_e_others_500.png',
    '/root/Picture/l_e_others_501.png',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"type":"C","parts":{"R1":{"mounted_parts":true,"misalignment":false},"R2":{"mounted_parts":false,"misalignment":true},"R3":{"mounted_parts":true,"misalignment":true},"IC":{"mounted_parts":true,"misalignment":true,"angle":0.1}}}'
);
INSERT INTO pi_camera(
    top_img_path,
    slanting_img_path,
    scan_data
) VALUES( 
    '/root/Picture/l_e_others_500.png',
    '/root/Picture/l_e_others_501.png',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"type":"C","parts":{"R1":{"mounted_parts":true,"misalignment":false},"R2":{"mounted_parts":false,"misalignment":true},"R3":{"mounted_parts":true,"misalignment":true},"IC":{"mounted_parts":true,"misalignment":true,"angle":0.1}}}'
);
go


INSERT INTO pi_probe(
    plc_mac,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"measured_value":{"9":{"Voltage":5.00,"Frequency":1000000},"10":{"Voltage":4.58,"Frequency":1000000},"11":{"Voltage":4.97,"Frequency":1000000},"12":{"Voltage":4.65,"Frequency":1000000},"13":{"Voltage":5.00,"Frequency":1000000}}}'
);

INSERT INTO pi_probe(
    plc_mac,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"measured_value":{"9":{"Voltage":5.00,"Frequency":1000000},"10":{"Voltage":4.58,"Frequency":1000000},"11":{"Voltage":4.97,"Frequency":1000000},"12":{"Voltage":4.65,"Frequency":1000000},"13":{"Voltage":5.00,"Frequency":1000000}}}'
);

INSERT INTO pi_probe(
    plc_mac,
    scan_data
) VALUES( 
    '58:52:8a:d6:69:a1',
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"measured_value":{"9":{"Voltage":5.00,"Frequency":1000000},"10":{"Voltage":4.58,"Frequency":1000000},"11":{"Voltage":4.97,"Frequency":1000000},"12":{"Voltage":4.65,"Frequency":1000000},"13":{"Voltage":5.00,"Frequency":1000000}}}'
);
INSERT INTO pi_probe(
    scan_data
) VALUES( 
    '{"status":{"temp":33,"hr":50,"atm":1013.25,"luminance":20000},"measured_value":{"9":{"Voltage":5.00,"Frequency":1000000},"10":{"Voltage":4.58,"Frequency":1000000},"11":{"Voltage":4.97,"Frequency":1000000},"12":{"Voltage":4.65,"Frequency":1000000},"13":{"Voltage":5.00,"Frequency":1000000}}}'
);
go