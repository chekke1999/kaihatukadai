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
go