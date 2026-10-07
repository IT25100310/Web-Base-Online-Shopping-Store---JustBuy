/* Run in SSMS 19 as a SQL Server administrator for a local coursework setup. */
IF DB_ID(N'JustBuyDB') IS NULL
BEGIN
    CREATE DATABASE [JustBuyDB];
END;
GO

USE [master];
GO
IF SUSER_ID(N'justbuy_app') IS NULL
BEGIN
    CREATE LOGIN [justbuy_app] WITH PASSWORD = N'JustBuyDb123!', CHECK_POLICY = ON;
END;
GO

USE [JustBuyDB];
GO
IF USER_ID(N'justbuy_app') IS NULL
BEGIN
    CREATE USER [justbuy_app] FOR LOGIN [justbuy_app];
END;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.database_role_members drm
    JOIN sys.database_principals r ON r.principal_id = drm.role_principal_id
    JOIN sys.database_principals u ON u.principal_id = drm.member_principal_id
    WHERE r.name = N'db_datareader' AND u.name = N'justbuy_app'
) ALTER ROLE [db_datareader] ADD MEMBER [justbuy_app];
GO
IF NOT EXISTS (
    SELECT 1 FROM sys.database_role_members drm
    JOIN sys.database_principals r ON r.principal_id = drm.role_principal_id
    JOIN sys.database_principals u ON u.principal_id = drm.member_principal_id
    WHERE r.name = N'db_datawriter' AND u.name = N'justbuy_app'
) ALTER ROLE [db_datawriter] ADD MEMBER [justbuy_app];
GO
/* Development only: ddl-auto=update requires DDL permission on initial schema creation.
   For production, use a separate migration account and remove the app user from db_ddladmin. */
IF NOT EXISTS (
    SELECT 1 FROM sys.database_role_members drm
    JOIN sys.database_principals r ON r.principal_id = drm.role_principal_id
    JOIN sys.database_principals u ON u.principal_id = drm.member_principal_id
    WHERE r.name = N'db_ddladmin' AND u.name = N'justbuy_app'
) ALTER ROLE [db_ddladmin] ADD MEMBER [justbuy_app];
GO
/* Hibernate creates/updates the mapped tables during application startup. */
