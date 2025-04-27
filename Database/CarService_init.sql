
--adatbázis létrehozás
if not exists (select 1 from sys.databases where name='CarService')
	create database CarService COLLATE Hungarian_CI_AS
go

use CarService

--jogosultságok
if not exists (select 1 from sys.objects where name='Roles' and type='U')
	CREATE TABLE Roles (
		id INT PRIMARY KEY IDENTITY(1,1),
		name NVARCHAR(32) NOT NULL UNIQUE
	);
GO

Insert into Roles (name)
select 'Tulajdonos' where not exists (select 1 from Roles where name='Tulajdonos') union
select 'Ügyintézõ' where not exists (select 1 from Roles where name='Ügyintézõ') union
select 'Szerelõ' where not exists (select 1 from Roles where name='Szerelõ') union
select 'Ügyfél' where not exists (select 1 from Roles where name='Ügyfél') 
GO

--felhasználók
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

--üzemanyag
if not exists (select 1 from sys.objects where name='Fuel_Types' and type='U')
	CREATE TABLE Fuel_Types (
		id INT PRIMARY KEY IDENTITY(1,1),
		name NVARCHAR(32) NOT NULL UNIQUE
	);
GO

Insert into Fuel_Types (name)
select 'Benzin' where not exists (select 1 from Fuel_Types where name='Benzin') union
select 'Dízel' where not exists (select 1 from Fuel_Types where name='Dízel') union
select 'Elektromos' where not exists (select 1 from Fuel_Types where name='Elektromos')
GO

--jármûvek
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

--termékek
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

--státuszok
if not exists (select 1 from sys.objects where name='Statuses' and type='U')
	CREATE TABLE Statuses (
		id INT IDENTITY(1,1) PRIMARY KEY,
		name NVARCHAR(32) NOT NULL UNIQUE,
		description NVARCHAR(255) NULL
	)
GO

Insert into Statuses (name)
select 'Elfogadásra vár' where not exists (select 1 from Statuses where name='Elfogadásra vár') union
select 'Elfogadott' where not exists (select 1 from Statuses where name='Elfogadott') union
select 'Jóváhagyásra vár' where not exists (select 1 from Statuses where name='Jóváhagyásra vár') union
select 'Jóváhagyott' where not exists (select 1 from Statuses where name='Jóváhagyott') union
select 'Beérkezett' where not exists (select 1 from Statuses where name='Beérkezett') union
select 'Folyamatban' where not exists (select 1 from Statuses where name='Folyamatban') union
select 'Elkészült' where not exists (select 1 from Statuses where name='Elkészült') union
select 'Elutasított' where not exists (select 1 from Statuses where name='Elutasított')

GO

--ajánlatok
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

--bizonylatszám
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

--megrendelés fej adatok
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

--megrendelés tétel adatok
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

--bizonylatszám
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

--termék kategóriák
if not exists (select 1 from sys.objects where name='Product_Categories' and type='U')
	CREATE TABLE Product_Categories (
		category_id INT IDENTITY(1,1) PRIMARY KEY,
		category_name NVARCHAR(128) NOT NULL,
		parent_id INT NULL,
		CONSTRAINT FK_ProductC_Parent FOREIGN KEY (parent_id) REFERENCES Product_Categories(category_id)
	)
GO

--termék kategória besorolások
if not exists (select 1 from sys.objects where name='Product_Category_Assignments' and type='U')
	CREATE TABLE Product_Category_Assignments (
		product_id  NVARCHAR(32) NOT NULL,
		category_id INT NOT NULL,
		PRIMARY KEY (product_id, category_id),
		CONSTRAINT FK_ProductCA_Product FOREIGN KEY (product_id) REFERENCES Products(product_id) ON DELETE CASCADE,
		CONSTRAINT FK_ProductCA_Category FOREIGN KEY (category_id) REFERENCES Product_Categories(category_id) ON DELETE CASCADE
	)
GO

--categória fa
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

--automata besorolás a fentebbi fákba
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

--automata kisorolás a lentebbi ágakból
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

--termékcsoportok feltöltés
INSERT Product_Categories (category_name, parent_id) 
select 'Motor',null where not exists (select 1 from Product_Categories where category_name='Motor') union
select 'Fékrendszer',null where not exists (select 1 from Product_Categories where category_name='Fékrendszer') union
select 'Futómû',null where not exists (select 1 from Product_Categories where category_name='Futómû') union
select 'Karosszéria',null where not exists (select 1 from Product_Categories where category_name='Karosszéria') union
select 'Szûrök',null where not exists (select 1 from Product_Categories where category_name='Szûrõk') 

INSERT Product_Categories (category_name, parent_id) 
select 'Motor elektromos alkatrészek',(select top 1 category_id from Product_Categories where category_name='Motor') where not exists (select 1 from Product_Categories where category_name='Motor elektromos alkatrészek') union
select 'Motor kenés',(select top 1 category_id from Product_Categories where category_name='Motor') where not exists (select 1 from Product_Categories where category_name='Motor kenés') union
select 'Motor vezérlés',(select top 1 category_id from Product_Categories where category_name='Motor') where not exists (select 1 from Product_Categories where category_name='Motor vezérlés') union

select 'Fékbetét',(select top 1 category_id from Product_Categories where category_name='Fékrendszer') where not exists (select 1 from Product_Categories where category_name='Fékbetét') union
select 'Féktárcsa',(select top 1 category_id from Product_Categories where category_name='Fékrendszer') where not exists (select 1 from Product_Categories where category_name='Féktárcsa') union
select 'Dobfék',(select top 1 category_id from Product_Categories where category_name='Fékrendszer') where not exists (select 1 from Product_Categories where category_name='Dobfék') union

select 'Világítás',(select top 1 category_id from Product_Categories where category_name='Karosszéria') where not exists (select 1 from Product_Categories where category_name='Világítás') union
select 'Lökhárítók',(select top 1 category_id from Product_Categories where category_name='Karosszéria') where not exists (select 1 from Product_Categories where category_name='Lökhárítók') union
select 'Szélvédõ',(select top 1 category_id from Product_Categories where category_name='Karosszéria') where not exists (select 1 from Product_Categories where category_name='Szélvédõ') union
select 'Karosszéria elemek',(select top 1 category_id from Product_Categories where category_name='Karosszéria') where not exists (select 1 from Product_Categories where category_name='Karosszéria elemek') union

select 'Lengéscsillapítás',(select top 1 category_id from Product_Categories where category_name='Futómû') where not exists (select 1 from Product_Categories where category_name='Lengéscsillapítás') union
select 'Kerékcsapágy',(select top 1 category_id from Product_Categories where category_name='Futómû') where not exists (select 1 from Product_Categories where category_name='Kerékcsapágy') union
select 'Futómû készlet',(select top 1 category_id from Product_Categories where category_name='Futómû') where not exists (select 1 from Product_Categories where category_name='Futómû készlet') union

select 'Olajszûrõ',(select top 1 category_id from Product_Categories where category_name='Szûrök') where not exists (select 1 from Product_Categories where category_name='Olajszûrõ') union
select 'Levegõszûrõ',(select top 1 category_id from Product_Categories where category_name='Szûrök') where not exists (select 1 from Product_Categories where category_name='Levegõszûrõ') union
select 'Üzemanyagszûrõ',(select top 1 category_id from Product_Categories where category_name='Szûrök') where not exists (select 1 from Product_Categories where category_name='Üzemanyagszûrõ')

INSERT Product_Categories (category_name, parent_id) 
select 'Motorolaj',(select top 1 category_id from Product_Categories where category_name='Motor kenés') where not exists (select 1 from Product_Categories where category_name='Motorolaj') union
select 'Olaj nívópálca',(select top 1 category_id from Product_Categories where category_name='Motor kenés') where not exists (select 1 from Product_Categories where category_name='Olaj nívópálca') union
select 'Szíjak, láncok',(select top 1 category_id from Product_Categories where category_name='Motor vezérlés') where not exists (select 1 from Product_Categories where category_name='Szíjak, láncok') union
select 'Fényszóró',(select top 1 category_id from Product_Categories where category_name='Világítás') where not exists (select 1 from Product_Categories where category_name='Fényszóró') union
select 'Izzó',(select top 1 category_id from Product_Categories where category_name='Világítás') where not exists (select 1 from Product_Categories where category_name='Izzó') union

select 'Sárvédõ',(select top 1 category_id from Product_Categories where category_name='Karosszéria elemek') where not exists (select 1 from Product_Categories where category_name='Sárvédõ') union
select 'Motorháztetõ',(select top 1 category_id from Product_Categories where category_name='Karosszéria elemek') where not exists (select 1 from Product_Categories where category_name='Motorháztetõ')

INSERT Product_Categories (category_name, parent_id) 
select 'Halogén',(select top 1 category_id from Product_Categories where category_name='Izzó') where not exists (select 1 from Product_Categories where category_name='Halogén') union
select 'LED',(select top 1 category_id from Product_Categories where category_name='Izzó') where not exists (select 1 from Product_Categories where category_name='LED') union
select 'Xenon',(select top 1 category_id from Product_Categories where category_name='Izzó') where not exists (select 1 from Product_Categories where category_name='Xenon') 
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