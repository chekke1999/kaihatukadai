CREATE LOGIN admin
WITH
  PASSWORD = "banana",
  DEFAULT_DATABASE = piscan,
  CHECK_EXPIRATION = OFF, -- 有効期限チェックしない
  CHECK_POLICY = OFF -- パスワードの複雑性要件をチェックしない

use piscan
CREATE USER admin
EXEC sp_addrolemember 'db_owner', 'admin'
ALTER LOGIN admin
WITH
  PASSWORD = 'banana'
go