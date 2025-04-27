
--adatb�zis l�trehoz�s
if not exists (select 1 from sys.databases where name='CarService')
	create database CarService COLLATE Hungarian_CI_AS
go

use CarService

--jogosults�gok
if not exists (select 1 from sys.objects where name='Roles' and type='U')
	CREATE TABLE Roles (
		id INT PRIMARY KEY IDENTITY(1,1),
		name NVARCHAR(32) NOT NULL UNIQUE
	);
GO

Insert into Roles (name)
select 'Tulajdonos' where not exists (select 1 from Roles where name='Tulajdonos') union
select '�gyint�z�' where not exists (select 1 from Roles where name='�gyint�z�') union
select 'Szerel�' where not exists (select 1 from Roles where name='Szerel�') union
select '�gyf�l' where not exists (select 1 from Roles where name='�gyf�l') 
GO

--felhaszn�l�k
if not exists (select 1 from sys.objects where name='Users' and type='U')
	CREATE TABLE Users (
		id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
		name NVARCHAR(128) NOT NULL,
		password_hash NVARCHAR(255) NULL,
		role_id INT NOT NULL,
		discount SMALLINT DEFAULT 0,
		CONSTRAINT FK_User_Role FOREIGN KEY (role_id) REFERENCES Roles(id)
	);
GO

--�zemanyag
if not exists (select 1 from sys.objects where name='Fuel_Types' and type='U')
	CREATE TABLE Fuel_Types (
		id INT PRIMARY KEY IDENTITY(1,1),
		name NVARCHAR(32) NOT NULL UNIQUE
	);
GO

Insert into Fuel_Types (name)
select 'Benzin' where not exists (select 1 from Fuel_Types where name='Benzin') union
select 'D�zel' where not exists (select 1 from Fuel_Types where name='D�zel') union
select 'Elektromos' where not exists (select 1 from Fuel_Types where name='Elektromos')
GO

--j�rm�vek
if not exists (select 1 from sys.objects where name='Vehicles' and type='U')
	CREATE TABLE Vehicles (
		id INT IDENTITY(1,1) PRIMARY KEY,   
		owner_id UNIQUEIDENTIFIER NOT NULL, 
		license_plate NVARCHAR(10) NOT NULL UNIQUE, 
		brand NVARCHAR(32) NOT NULL,        
		model NVARCHAR(32) NOT NULL,        
		year_of_manufacture SMALLINT NOT NULL, 
		vin NVARCHAR(17) NOT NULL UNIQUE,   
		engine_code NVARCHAR(20) NULL,      
		odometer INT NULL,    
		fuel_type_id INT NOT NULL,
		CONSTRAINT FK_Vehicle_Owner FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE,
		CONSTRAINT FK_Vehicle_Fuel FOREIGN KEY (fuel_type_id) REFERENCES Fuel_Types(id)
	)
GO

--term�kek
if not exists (select 1 from sys.objects where name='Products' and type='U')
	CREATE TABLE Products (
		product_id NVARCHAR(32) PRIMARY KEY,
		product_type CHAR(1) NOT NULL CHECK (product_type IN ('P', 'S')),
		name NVARCHAR(128) NOT NULL,
		brand NVARCHAR(32) NULL,
		purchase_price FLOAT NULL,
		selling_price FLOAT NOT NULL,
		stock_quantity FLOAT NULL,
		description NVARCHAR(512) NULL
	)
GO

--st�tuszok
if not exists (select 1 from sys.objects where name='Statuses' and type='U')
	CREATE TABLE Statuses (
		id INT IDENTITY(1,1) PRIMARY KEY,
		name NVARCHAR(32) NOT NULL UNIQUE,
		description NVARCHAR(255) NULL
	)
GO

Insert into Statuses (name)
select 'Elfogad�sra v�r' where not exists (select 1 from Statuses where name='Elfogad�sra v�r') union
select 'Elfogadott' where not exists (select 1 from Statuses where name='Elfogadott') union
select 'J�v�hagy�sra v�r' where not exists (select 1 from Statuses where name='J�v�hagy�sra v�r') union
select 'J�v�hagyott' where not exists (select 1 from Statuses where name='J�v�hagyott') union
select 'Be�rkezett' where not exists (select 1 from Statuses where name='Be�rkezett') union
select 'Folyamatban' where not exists (select 1 from Statuses where name='Folyamatban') union
select 'Elk�sz�lt' where not exists (select 1 from Statuses where name='Elk�sz�lt') union
select 'Elutas�tott' where not exists (select 1 from Statuses where name='Elutas�tott')

GO

--aj�nlatok
if not exists (select 1 from sys.objects where name='Offers' and type='U')
	CREATE TABLE Offers (
		id INT IDENTITY(1,1) PRIMARY KEY,
		offer_number NVARCHAR(16) NULL,
		customer_id UNIQUEIDENTIFIER NOT NULL,
		vehicle_id INT NOT NULL,
		request_date DATETIME NOT NULL DEFAULT GETDATE(),
		issue_description NVARCHAR(512) NULL,
		status_id INT NOT NULL,
		agent_id UNIQUEIDENTIFIER NULL,
		appointment_date DATETIME NULL,
		admin_comment NVARCHAR(512) NULL,
		CONSTRAINT FK_Offer_Customer FOREIGN KEY (customer_id) REFERENCES Users(id),  
		CONSTRAINT FK_Offer_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id),  
		CONSTRAINT FK_Offer_Status FOREIGN KEY (status_id) REFERENCES Statuses(id)  
	)
GO

--bizonylatsz�m
if not exists (select 1 from sys.sequences where name='Offer_Sequence')
CREATE SEQUENCE Offer_Sequence
    START WITH 1        
    INCREMENT BY 1      
    MINVALUE 0          
    MAXVALUE 2147483647
GO

if exists (select 1 from sys.objects where name='trg_offer_number' and type='TR')
drop trigger trg_offer_number
GO
	
CREATE TRIGGER trg_offer_number ON Offers AFTER INSERT
AS
BEGIN
	UPDATE Offers
	SET offer_number = RIGHT('00000' + CAST(NEXT VALUE FOR Offer_Sequence AS NVARCHAR(5)), 5)+'/25-CO'
	WHERE exists (SELECT 1 FROM inserted i where i.id=Offers.id)
END
GO

--megrendel�s fej adatok
if not exists (select 1 from sys.objects where name='Orders_Header' and type='U')
	CREATE TABLE Orders_Header (
		id INT IDENTITY(1,1) PRIMARY KEY,
		customer_id UNIQUEIDENTIFIER NOT NULL,
		vehicle_id INT NOT NULL,
		order_number NVARCHAR(16) NULL,
		offer_id INT NULL,
		agent_id UNIQUEIDENTIFIER NULL,
		mechanic_id UNIQUEIDENTIFIER NULL,
		status_id INT NOT NULL,
		comment NVARCHAR(255) NULL,
		net_amount FLOAT NOT NULL,
		gross_amount FLOAT NOT NULL,
		order_date DATETIME DEFAULT GETDATE(),
		CONSTRAINT FK_OrderH_Customer FOREIGN KEY (customer_id) REFERENCES Users(id),
		CONSTRAINT FK_OrderH_Vehicle FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id),
		CONSTRAINT FK_OrderH_Offer FOREIGN KEY (offer_id) REFERENCES Offers(id),
		CONSTRAINT FK_OrderH_Agent FOREIGN KEY (agent_id) REFERENCES Users(id),
		CONSTRAINT FK_OrderH_Mechanic FOREIGN KEY (mechanic_id) REFERENCES Users(id),
		CONSTRAINT FK_OrderH_Status FOREIGN KEY (status_id) REFERENCES Statuses(id)
	)
Go

--megrendel�s t�tel adatok
if not exists (select 1 from sys.objects where name='Order_Items' and type='U')
	CREATE TABLE Order_Items (
		id INT IDENTITY(1,1) PRIMARY KEY,
		order_id INT NOT NULL,
		product_id NVARCHAR(32) NOT NULL,
		quantity FLOAT NOT NULL,
		unit_price FLOAT NOT NULL,
		net_amount FLOAT NOT NULL,
		gross_amount FLOAT NOT NULL,
		comment NVARCHAR(255) NULL,
		CONSTRAINT FK_OrderI_Order FOREIGN KEY (order_id) REFERENCES Orders_Header(id),
		CONSTRAINT FK_OrderI_Product FOREIGN KEY (product_id) REFERENCES Products(product_id)
	)
GO

--bizonylatsz�m
if not exists (select 1 from sys.sequences where name='Order_Sequence')
CREATE SEQUENCE Order_Sequence
    START WITH 1        
    INCREMENT BY 1      
    MINVALUE 0          
    MAXVALUE 2147483647
GO

if exists (select 1 from sys.objects where name='trg_order_number' and type='TR')
drop trigger TRG_order_number
GO
	
CREATE TRIGGER TRG_order_number ON Orders_Header AFTER INSERT
AS
BEGIN
	UPDATE Orders_Header
	SET order_number = RIGHT('00000' + CAST(NEXT VALUE FOR Offer_Sequence AS NVARCHAR(5)), 5)+'/25-FO'
	WHERE exists (SELECT 1 FROM inserted i where i.id=Orders_Header.id)
END
GO

--term�k kateg�ri�k
if not exists (select 1 from sys.objects where name='Product_Categories' and type='U')
	CREATE TABLE Product_Categories (
		category_id INT IDENTITY(1,1) PRIMARY KEY,
		category_name NVARCHAR(128) NOT NULL,
		parent_id INT NULL,
		CONSTRAINT FK_ProductC_Parent FOREIGN KEY (parent_id) REFERENCES Product_Categories(category_id)
	)
GO

--term�k kateg�ria besorol�sok
if not exists (select 1 from sys.objects where name='Product_Category_Assignments' and type='U')
	CREATE TABLE Product_Category_Assignments (
		product_id  NVARCHAR(32) NOT NULL,
		category_id INT NOT NULL,
		PRIMARY KEY (product_id, category_id),
		CONSTRAINT FK_ProductCA_Product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
		CONSTRAINT FK_ProductCA_Category FOREIGN KEY (category_id) REFERENCES Product_Categories(category_id) ON DELETE CASCADE
	)
GO

--categ�ria fa
if exists (select 1 from sys.objects where name='Product_Category_Tree' and type='V')
drop view Product_Category_Tree
GO

CREATE VIEW Product_Category_Tree 
as 
   WITH CTE AS (
        SELECT 
			c.category_id,
			c.category_name,
			null as parent_id,
			0 as level
        FROM 
			Product_Categories c
		WHERE 
			parent_id is null
		union all
		select
			c.category_id,
			c.category_name,
			c.parent_id,
			level + 1 as level
		from 
			Product_Categories c
			Inner join cte on cte.category_id=c.parent_id 
    )
	SELECT * from cte
GO

--automata besorol�s a fentebbi f�kba
if exists (select 1 from sys.objects where name='AssignProductToCategory' and type='P')
	drop procedure AssignProductToCategory
GO

CREATE PROCEDURE AssignProductToCategory (
    @product_id NVARCHAR(32)
)
AS
SET NOCOUNT ON
BEGIN

    declare @ParentCategories table (category_id int)

    ;WITH CTE as (
        select 
			pca.category_id, 
			pc.parent_id
        from 
			Product_Category_Assignments pca
			inner join Product_Categories pc on pca.category_id = pc.category_id
        where pca.product_id = @product_id
        UNION ALL
        select 
			pc.category_id, 
			pc.parent_id
        from
			Product_Categories pc
			inner join CTE ch on pc.category_id = ch.parent_id
    )
	insert into @ParentCategories (category_id)
    select distinct category_id 
	from CTE

    insert Product_Category_Assignments (product_id, category_id)
    select 
		@product_id, 
		category_id 
	from
		@ParentCategories c
    where
		not exists (select 1 from Product_Category_Assignments where product_id = @product_id and category_id = c.category_id);
END
GO

--automata kisorol�s a lentebbi �gakb�l
if exists (select 1 from sys.objects where name='DeleteProductCategoriesAssignment' and type='P')
	drop procedure DeleteProductCategoriesAssignment
GO

CREATE PROCEDURE DeleteProductCategoriesAssignment (
    @product_id NVARCHAR(32),
	@category_id int
)
AS
SET NOCOUNT ON
BEGIN

    declare @DeleteAssignemnts table (category_id int)

    ;WITH CTE AS (
        SELECT 
			c.category_id,
			c.category_id parent_id,
			0 as level
        FROM 
			Product_Categories c
		where category_id=@category_id
		UNION ALL
        select 
			pc.category_id, 
			pc.parent_id,
			level + 1 as level
        from
			Product_Categories pc
			inner join CTE ch on pc.parent_id = ch.category_id
	)
	insert into @DeleteAssignemnts (category_id)
    select distinct category_id 
	from CTE

    delete from Product_Category_Assignments 
    where
		exists (select 1 from @DeleteAssignemnts w where product_id=@product_id and Product_Category_Assignments.category_id = w.category_id);
END
GO

--term�kcsoportok felt�lt�s
INSERT Product_Categories (category_name, parent_id) 
select 'Motor',null where not exists (select 1 from Product_Categories where category_name='Motor') union
select 'F�krendszer',null where not exists (select 1 from Product_Categories where category_name='F�krendszer') union
select 'Fut�m�',null where not exists (select 1 from Product_Categories where category_name='Fut�m�') union
select 'Karossz�ria',null where not exists (select 1 from Product_Categories where category_name='Karossz�ria') union
select 'Sz�r�k',null where not exists (select 1 from Product_Categories where category_name='Sz�r�k') 

INSERT Product_Categories (category_name, parent_id) 
select 'Motor elektromos alkatr�szek',(select top 1 category_id from Product_Categories where category_name='Motor') where not exists (select 1 from Product_Categories where category_name='Motor elektromos alkatr�szek') union
select 'Motor ken�s',(select top 1 category_id from Product_Categories where category_name='Motor') where not exists (select 1 from Product_Categories where category_name='Motor ken�s') union
select 'Motor vez�rl�s',(select top 1 category_id from Product_Categories where category_name='Motor') where not exists (select 1 from Product_Categories where category_name='Motor vez�rl�s') union

select 'F�kbet�t',(select top 1 category_id from Product_Categories where category_name='F�krendszer') where not exists (select 1 from Product_Categories where category_name='F�kbet�t') union
select 'F�kt�rcsa',(select top 1 category_id from Product_Categories where category_name='F�krendszer') where not exists (select 1 from Product_Categories where category_name='F�kt�rcsa') union
select 'Dobf�k',(select top 1 category_id from Product_Categories where category_name='F�krendszer') where not exists (select 1 from Product_Categories where category_name='Dobf�k') union

select 'Vil�g�t�s',(select top 1 category_id from Product_Categories where category_name='Karossz�ria') where not exists (select 1 from Product_Categories where category_name='Vil�g�t�s') union
select 'L�kh�r�t�k',(select top 1 category_id from Product_Categories where category_name='Karossz�ria') where not exists (select 1 from Product_Categories where category_name='L�kh�r�t�k') union
select 'Sz�lv�d�',(select top 1 category_id from Product_Categories where category_name='Karossz�ria') where not exists (select 1 from Product_Categories where category_name='Sz�lv�d�') union
select 'Karossz�ria elemek',(select top 1 category_id from Product_Categories where category_name='Karossz�ria') where not exists (select 1 from Product_Categories where category_name='Karossz�ria elemek') union

select 'Leng�scsillap�t�s',(select top 1 category_id from Product_Categories where category_name='Fut�m�') where not exists (select 1 from Product_Categories where category_name='Leng�scsillap�t�s') union
select 'Ker�kcsap�gy',(select top 1 category_id from Product_Categories where category_name='Fut�m�') where not exists (select 1 from Product_Categories where category_name='Ker�kcsap�gy') union
select 'Fut�m� k�szlet',(select top 1 category_id from Product_Categories where category_name='Fut�m�') where not exists (select 1 from Product_Categories where category_name='Fut�m� k�szlet') union

select 'Olajsz�r�',(select top 1 category_id from Product_Categories where category_name='Sz�r�k') where not exists (select 1 from Product_Categories where category_name='Olajsz�r�') union
select 'Leveg�sz�r�',(select top 1 category_id from Product_Categories where category_name='Sz�r�k') where not exists (select 1 from Product_Categories where category_name='Leveg�sz�r�') union
select '�zemanyagsz�r�',(select top 1 category_id from Product_Categories where category_name='Sz�r�k') where not exists (select 1 from Product_Categories where category_name='�zemanyagsz�r�')

INSERT Product_Categories (category_name, parent_id) 
select 'Motorolaj',(select top 1 category_id from Product_Categories where category_name='Motor ken�s') where not exists (select 1 from Product_Categories where category_name='Motorolaj') union
select 'Olaj n�v�p�lca',(select top 1 category_id from Product_Categories where category_name='Motor ken�s') where not exists (select 1 from Product_Categories where category_name='Olaj n�v�p�lca') union
select 'Sz�jak, l�ncok',(select top 1 category_id from Product_Categories where category_name='Motor vez�rl�s') where not exists (select 1 from Product_Categories where category_name='Sz�jak, l�ncok') union
select 'F�nysz�r�',(select top 1 category_id from Product_Categories where category_name='Vil�g�t�s') where not exists (select 1 from Product_Categories where category_name='F�nysz�r�') union
select 'Izz�',(select top 1 category_id from Product_Categories where category_name='Vil�g�t�s') where not exists (select 1 from Product_Categories where category_name='Izz�') union

select 'S�rv�d�',(select top 1 category_id from Product_Categories where category_name='Karossz�ria elemek') where not exists (select 1 from Product_Categories where category_name='S�rv�d�') union
select 'Motorh�ztet�',(select top 1 category_id from Product_Categories where category_name='Karossz�ria elemek') where not exists (select 1 from Product_Categories where category_name='Motorh�ztet�')

INSERT Product_Categories (category_name, parent_id) 
select 'Halog�n',(select top 1 category_id from Product_Categories where category_name='Izz�') where not exists (select 1 from Product_Categories where category_name='Halog�n') union
select 'LED',(select top 1 category_id from Product_Categories where category_name='Izz�') where not exists (select 1 from Product_Categories where category_name='LED') union
select 'Xenon',(select top 1 category_id from Product_Categories where category_name='Izz�') where not exists (select 1 from Product_Categories where category_name='Xenon') 
GO

if not exists (select 1 from sys.all_columns c where exists (select 1 from sys.objects o where type='U' and name='users' and o.object_id=c.object_id)
	and c.name='email')
begin
	delete from Users
	alter table Users add email nvarchar(128) NOT NULL
end
GO

if not exists (select 1 from sys.all_columns c where exists (select 1 from sys.objects o where type='U' and name='users' and o.object_id=c.object_id)
	and c.name='phone')
begin
	alter table Users add phone nvarchar(64)
end
GO

alter table Users alter column password_hash NVARCHAR(255)
GO

alter table Offers alter column agent_id UNIQUEIDENTIFIER NULL
GO