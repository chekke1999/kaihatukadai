create table pi_camera(
    scan_id  INT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    plc_mac char(17),
    datetime datetime default getdate(),
    top_img_path nvarchar(max),
    slanting_img_path nvarchar(max),
    scan_data nvarchar(max)
);
go