create database piscan
go
use piscan
create table pi_camera(
    scan_id  BIGINT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    stationpi_mac char(17),
    datetime datetime default getdate(),
    top_img_path nvarchar(max),
    slanting_img_path nvarchar(max),
    scan_data nvarchar(max)
);
go
create table pi_probe(
    scan_id  BIGINT NOT NULL IDENTITY(1,1) PRIMARY KEY,
    stationpi_mac char(17),
    datetime datetime default getdate(),
    scan_data nvarchar(max)
);
go