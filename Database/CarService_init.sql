
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

if not exists (select 1 from sys.objects where name='Offer_images' and type='U')
	CREATE TABLE Offer_images (
		id INT IDENTITY(1,1) PRIMARY KEY,
		offer_id INT NOT NULL,
		image_path NVARCHAR(512) NULL,
		CONSTRAINT FK_Images_Offer FOREIGN KEY (offer_id) REFERENCES Offers(id)  
	)
GO

--jármû márkák
if not exists (select 1 from sys.objects where name='Vehicle_brands' and type='U')
	CREATE TABLE Vehicle_brands (
		id INT NOT NULL PRIMARY KEY,
		brand NVARCHAR(64) NOT NULL
	)
GO

--jármû modellek
if not exists (select 1 from sys.objects where name='Brand_modells' and type='U')
	CREATE TABLE Brand_modells (
		id INT IDENTITY(1,1) PRIMARY KEY,
		brand_id INT NOT NULL,
		modell_name NVARCHAR(64),
		CONSTRAINT FK_BrandModells_Brand FOREIGN KEY (brand_id) REFERENCES Vehicle_brands(id)
	)
GO


if not exists (select 1 from sys.objects where name='Supplier_order_items' and type='U')
	CREATE TABLE Supplier_order_items (
		id INT IDENTITY(1,1) PRIMARY KEY,
		product_id  NVARCHAR(32) NOT NULL,
		agent_id UNIQUEIDENTIFIER NULL,
		quantity FLOAT NOT NULL,
		ordered_date datetime NOT NULL,
		status_id INT NOT NULL,
		CONSTRAINT FK_SupplierOI_Agent FOREIGN KEY (agent_id) REFERENCES Users(id),
		CONSTRAINT FK_SupplierOI_Products FOREIGN KEY (product_id) REFERENCES Products(product_id),
		CONSTRAINT FK_SupplierOI_Status FOREIGN KEY (status_id) REFERENCES Statuses(id),
	)
GO

if not exists (select 1 from Vehicle_brands)
begin
	INSERT INTO Vehicle_brands (id, brand) 
	select 1, N'Audi' union
	select 2, N'BMW' union
	select 3, N'Mercedes-Benz' union
	select 4, N'Volkswagen' union
	select 5, N'Opel' union
	select 6, N'Peugeot' union
	select 7, N'Renault' union
	select 8, N'Fiat' union
	select 9, N'Citroën' union
	select 10, N'Volvo' union
	select 11, N'Skoda' union
	select 12, N'Seat' union
	select 13, N'Ford' union
	select 14, N'Toyota' union
	select 15, N'Nissan' union
	select 16, N'Kia' union
	select 17, N'Hyundai' union
	select 18, N'Dacia' union
	select 19, N'Mini' union
	select 20, N'Suzuki' union
	select 21, N'Honda' union
	select 22, N'Mazda' union
	select 23, N'Lexus' union
	select 24, N'Alfa Romeo' union
	select 25, N'Tesla' union
	select 26, N'Jaguar' union
	select 27, N'Land Rover' union
	select 28, N'Saab' union
	select 29, N'Mitsubishi' union
	select 30, N'Chevrolet' union
	select 31, N'Porsche' union
	select 32, N'Ferrari' union
	select 33, N'Lamborghini' union
	select 34, N'Aston Martin' union
	select 35, N'Maserati' union
	select 36, N'Rolls-Royce' union
	select 37, N'Bentley' union
	select 38, N'Mclaren' union
	select 39, N'Bugatti' union
	select 40, N'Subaru' union
	select 41, N'Infiniti' union
	select 42, N'DS Automobiles' union
	select 43, N'Smart' union
	select 44, N'Cupra' union
	select 45, N'Polestar' union
	select 46, N'Genesis' union
	select 47, N'Rover' union
	select 48, N'Tata' union
	select 49, N'Lancia' union
	select 50, N'Zastava'
end
GO

if not exists (select 1 from Brand_modells)
begin
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(1, N'A1'),
(1, N'A3'),
(1, N'A4'),
(1, N'A5'),
(1, N'A6'),
(1, N'A7'),
(1, N'A8'),
(1, N'Q3'),
(1, N'Q5'),
(1, N'Q7');

-- BMW (brandId = 2)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(2, N'1 Series'),
(2, N'2 Series'),
(2, N'3 Series'),
(2, N'4 Series'),
(2, N'5 Series'),
(2, N'6 Series'),
(2, N'7 Series'),
(2, N'X1'),
(2, N'X3'),
(2, N'X5');

-- Mercedes-Benz (brandId = 3)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(3, N'A-Class'),
(3, N'B-Class'),
(3, N'C-Class'),
(3, N'E-Class'),
(3, N'S-Class'),
(3, N'CLA'),
(3, N'CLS'),
(3, N'GLA'),
(3, N'GLC'),
(3, N'GLE');

-- Volkswagen (brandId = 4)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(4, N'Golf'),
(4, N'Polo'),
(4, N'Passat'),
(4, N'Tiguan'),
(4, N'Touareg'),
(4, N'T-Roc'),
(4, N'Arteon'),
(4, N'ID.3'),
(4, N'ID.4'),
(4, N'Touran');

-- Opel (brandId = 5)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(5, N'Corsa'),
(5, N'Astra'),
(5, N'Insignia'),
(5, N'Mokka'),
(5, N'Crossland'),
(5, N'Grandland'),
(5, N'Zafira'),
(5, N'Meriva'),
(5, N'Combo'),
(5, N'Vivaro');

-- Peugeot (brandId = 6)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(6, N'208'),
(6, N'2008'),
(6, N'308'),
(6, N'3008'),
(6, N'508'),
(6, N'5008'),
(6, N'207'),
(6, N'206'),
(6, N'RCZ'),
(6, N'Partner');

-- Renault (brandId = 7)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(7, N'Clio'),
(7, N'Mégane'),
(7, N'Talisman'),
(7, N'Captur'),
(7, N'Kadjar'),
(7, N'Arkana'),
(7, N'Koleos'),
(7, N'Scenic'),
(7, N'ZOE'),
(7, N'Trafic');

-- Fiat (brandId = 8)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(8, N'500'),
(8, N'500X'),
(8, N'500L'),
(8, N'Panda'),
(8, N'Tipo'),
(8, N'Doblo'),
(8, N'Talento'),
(8, N'Bravo'),
(8, N'Fiorino'),
(8, N'Uno');

-- Citroën (brandId = 9)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(9, N'C1'),
(9, N'C3'),
(9, N'C3 Aircross'),
(9, N'C4'),
(9, N'C4 Cactus'),
(9, N'C5'),
(9, N'C5 Aircross'),
(9, N'Berlingo'),
(9, N'Jumper'),
(9, N'Spacetourer');

-- Volvo (brandId = 10)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(10, N'XC40'),
(10, N'XC60'),
(10, N'XC90'),
(10, N'S60'),
(10, N'S90'),
(10, N'V40'),
(10, N'V60'),
(10, N'V90'),
(10, N'C30'),
(10, N'C70');

-- Škoda (brandId = 11)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(11, N'Fabia'),
(11, N'Octavia'),
(11, N'Superb'),
(11, N'Kodiaq'),
(11, N'Karoq'),
(11, N'Kamiq'),
(11, N'Enyaq'),
(11, N'Roomster'),
(11, N'Citigo'),
(11, N'Yeti');

-- SEAT (brandId = 12)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(12, N'Ibiza'),
(12, N'Leon'),
(12, N'Arona'),
(12, N'Ateca'),
(12, N'Tarraco'),
(12, N'Altea'),
(12, N'Alhambra'),
(12, N'Mii'),
(12, N'Toledo'),
(12, N'Cordoba');

-- Ford (brandId = 13)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(13, N'Fiesta'),
(13, N'Focus'),
(13, N'Mondeo'),
(13, N'Kuga'),
(13, N'S-Max'),
(13, N'C-Max'),
(13, N'EcoSport'),
(13, N'Puma'),
(13, N'Mustang'),
(13, N'Edge');

-- Toyota (brandId = 14)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(14, N'Yaris'),
(14, N'Auris'),
(14, N'Corolla'),
(14, N'Avensis'),
(14, N'C-HR'),
(14, N'RAV4'),
(14, N'Land Cruiser'),
(14, N'Prius'),
(14, N'Camry'),
(14, N'Proace');

-- Nissan (brandId = 15)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(15, N'Micra'),
(15, N'Juke'),
(15, N'Qashqai'),
(15, N'X-Trail'),
(15, N'Leaf'),
(15, N'Note'),
(15, N'Almera'),
(15, N'Navara'),
(15, N'Terrano'),
(15, N'Pulsar');

-- Kia (brandId = 16)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(16, N'Picanto'),
(16, N'Rio'),
(16, N'Ceed'),
(16, N'ProCeed'),
(16, N'Sportage'),
(16, N'Sorento'),
(16, N'Stinger'),
(16, N'Niro'),
(16, N'EV6'),
(16, N'Carens');

-- Hyundai (brandId = 17)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(17, N'i10'),
(17, N'i20'),
(17, N'i30'),
(17, N'Elantra'),
(17, N'Tucson'),
(17, N'Santa Fe'),
(17, N'Kona'),
(17, N'Ioniq'),
(17, N'Ioniq 5'),
(17, N'Terracan');

-- Dacia (brandId = 18)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(18, N'Sandero'),
(18, N'Sandero Stepway'),
(18, N'Logan'),
(18, N'Duster'),
(18, N'Jogger'),
(18, N'Spring'),
(18, N'Dokker'),
(18, N'Lodgy'),
(18, N'Solenza'),
(18, N'1310'); -- régi, de ikonikus

-- Mini (brandId = 19)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(19, N'Cooper'),
(19, N'Cooper S'),
(19, N'Clubman'),
(19, N'Countryman'),
(19, N'Paceman'),
(19, N'One'),
(19, N'Cabrio'),
(19, N'John Cooper Works'),
(19, N'Roadster'),
(19, N'Coupe');

-- Suzuki (brandId = 20)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(20, N'Swift'),
(20, N'Vitara'),
(20, N'S-Cross'),
(20, N'Ignis'),
(20, N'Alto'),
(20, N'Splash'),
(20, N'Jimny'),
(20, N'Liana'),
(20, N'Baleno'),
(20, N'Wagon R+');

-- Honda (brandId = 21)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(21, N'Jazz'),
(21, N'Civic'),
(21, N'Accord'),
(21, N'CR-V'),
(21, N'HR-V'),
(21, N'Insight'),
(21, N'Legend'),
(21, N'Prelude'),
(21, N'S2000'),
(21, N'e:Ny1');

-- Mazda (brandId = 22)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(22, N'Mazda2'),
(22, N'Mazda3'),
(22, N'Mazda6'),
(22, N'CX-3'),
(22, N'CX-30'),
(22, N'CX-5'),
(22, N'CX-60'),
(22, N'MX-5'),
(22, N'RX-8'),
(22, N'323');

-- Lexus (brandId = 23)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(23, N'CT 200h'),
(23, N'IS 300'),
(23, N'ES 300h'),
(23, N'GS 450h'),
(23, N'RX 500h'),
(23, N'UX 250h'),
(23, N'NX 350h'),
(23, N'RC 300h'),
(23, N'LC 500'),
(23, N'LS 500h');

-- Alfa Romeo (brandId = 24)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(24, N'Giulia'),
(24, N'Stelvio'),
(24, N'Mito'),
(24, N'Giulietta'),
(24, N'Brera'),
(24, N'159'),
(24, N'147'),
(24, N'GT'),
(24, N'GTV'),
(24, N'Tonale');

-- Tesla (brandId = 25)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(25, N'Model S'),
(25, N'Model 3'),
(25, N'Model X'),
(25, N'Model Y'),
(25, N'Cybertruck'),
(25, N'Roadster'),
(25, N'Semi'),
(25, N'Model S Plaid'),
(25, N'Model 3 Highland'),
(25, N'Model Y Long Range');

-- Jaguar (brandId = 26)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(26, N'XE'),
(26, N'XF'),
(26, N'XJ'),
(26, N'F-Type'),
(26, N'F-Pace'),
(26, N'E-Pace'),
(26, N'I-Pace'),
(26, N'S-Type'),
(26, N'X-Type'),
(26, N'Mark 2');

-- Land Rover (brandId = 27)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(27, N'Discovery'),
(27, N'Discovery Sport'),
(27, N'Defender'),
(27, N'Range Rover'),
(27, N'Range Rover Sport'),
(27, N'Range Rover Evoque'),
(27, N'Freelander'),
(27, N'Series I'),
(27, N'Series II'),
(27, N'Series III');

-- Porsche (brandId = 31)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(31, N'911'),
(31, N'Cayenne'),
(31, N'Macan'),
(31, N'Panamera'),
(31, N'Taycan'),
(31, N'718 Boxster'),
(31, N'718 Cayman'),
(31, N'911 Turbo'),
(31, N'911 Carrera'),
(31, N'Cayenne Coupé');

-- Ferrari (brandId = 32)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(32, N'488 GTB'),
(32, N'F8 Tributo'),
(32, N'Portofino'),
(32, N'Roma'),
(32, N'SF90 Stradale'),
(32, N'812 Superfast'),
(32, N'296 GTB'),
(32, N'LaFerrari'),
(32, N'California'),
(32, N'GTC4Lusso');

-- Lamborghini (brandId = 33)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(33, N'Aventador'),
(33, N'Huracán'),
(33, N'Urus'),
(33, N'Gallardo'),
(33, N'Murciélago'),
(33, N'Diablo'),
(33, N'Countach'),
(33, N'Reventón'),
(33, N'Sian'),
(33, N'Centenario');

-- Maserati (brandId = 35)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(35, N'Ghibli'),
(35, N'Levante'),
(35, N'Quattroporte'),
(35, N'GranTurismo'),
(35, N'GranCabrio'),
(35, N'MC20'),
(35, N'Biturbo'),
(35, N'3200 GT'),
(35, N'228'),
(35, N'Kyalami');

-- Aston Martin (brandId = 34)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(34, N'DB11'),
(34, N'DB12'),
(34, N'Vantage'),
(34, N'DBS Superleggera'),
(34, N'DB9'),
(34, N'Rapide'),
(34, N'Virage'),
(34, N'Vanquish'),
(34, N'Lagonda'),
(34, N'One-77');

-- Rolls-Royce (brandId = 36)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(36, N'Phantom'),
(36, N'Ghost'),
(36, N'Wraith'),
(36, N'Dawn'),
(36, N'Spectre'),
(36, N'Silver Shadow'),
(36, N'Silver Spirit'),
(36, N'Cullinan'),
(36, N'Corniche'),
(36, N'Seraph');

-- Bentley (brandId = 37)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(37, N'Continental GT'),
(37, N'Flying Spur'),
(37, N'Mulsanne'),
(37, N'Bentayga'),
(37, N'Azure'),
(37, N'Brooklands'),
(37, N'Arnage'),
(37, N'Turbo R'),
(37, N'S Series'),
(37, N'8 Litre');

-- McLaren (brandId = 38)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(38, N'540C'),
(38, N'570S'),
(38, N'600LT'),
(38, N'620R'),
(38, N'650S'),
(38, N'675LT'),
(38, N'720S'),
(38, N'765LT'),
(38, N'Artura'),
(38, N'P1');

-- Bugatti (brandId = 39)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(39, N'Veyron'),
(39, N'Chiron'),
(39, N'Divo'),
(39, N'Bolide'),
(39, N'Veyron Super Sport'),
(39, N'Chiron Super Sport'),
(39, N'Chiron Pur Sport'),
(39, N'Centodieci'),
(39, N'La Voiture Noire'),
(39, N'Veyron Grand Sport');

-- Smart (brandId = 43)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(43, N'ForTwo'),
(43, N'ForFour'),
(43, N'Fortwo Cabrio'),
(43, N'ForTwo Electric Drive'),
(43, N'ForFour Electric Drive'),
(43, N'ForTwo Brabus'),
(43, N'ForFour Brabus'),
(43, N'Version EQ'),
(43, N'Smart Roadster'),
(43, N'Smart Crossblade');

-- DS Automobiles (brandId = 42)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(42, N'DS 3 Crossback'),
(42, N'DS 7 Crossback'),
(42, N'DS 9'),
(42, N'DS 5'),
(42, N'DS 4'),
(42, N'DS 3'),
(42, N'DS 4 Crossback'),
(42, N'Rivoli'),
(42, N'Performance Line'),
(42, N'Avant-garde');

-- Cupra (brandId = 44)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(44, N'Ateca'),
(44, N'Formentor'),
(44, N'Leon'),
(44, N'Born'),
(44, N'Tarraco'),
(44, N'Cupra R'),
(44, N'Cupra El-Born'),
(44, N'Cupra Ibiza'),
(44, N'Cupra Formentor VZ'),
(44, N'Cupra Leon VZ');

-- Polestar (brandId = 45)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(45, N'Polestar 1'),
(45, N'Polestar 2'),
(45, N'Polestar 3'),
(45, N'Polestar 4'),
(45, N'Polestar Precept'),
(45, N'Polestar 1 Electric'),
(45, N'Polestar 2 Long Range'),
(45, N'Polestar 2 Performance'),
(45, N'Polestar 3 SUV'),
(45, N'Polestar 4 Coupe');

-- Genesis (brandId = 46)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(46, N'G70'),
(46, N'G80'),
(46, N'G90'),
(46, N'GV70'),
(46, N'GV80'),
(46, N'Xcient'),
(46, N'Essentia'),
(46, N'Vision G'),
(46, N'Genesis Coupe'),
(46, N'GV60');

-- Tata (brandId = 47)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(47, N'Indica'),
(47, N'Indigo'),
(47, N'Nexon'),
(47, N'Tiago'),
(47, N'Tigor'),
(47, N'Safari'),
(47, N'Harrier'),
(47, N'Hexa'),
(47, N'Spacio'),
(47, N'Nano');

-- BYD (brandId = 48)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(48, N'F3'),
(48, N'F6'),
(48, N'S3'),
(48, N'S5'),
(48, N'E6'),
(48, N'BYD Tang'),
(48, N'BYD Qin'),
(48, N'BYD e6 EV'),
(48, N'BYD Yuan EV'),
(48, N'BYD Atto 3');

-- NIO (brandId = 49)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(49, N'ES6'),
(49, N'ES8'),
(49, N'ET7'),
(49, N'EL7'),
(49, N'EC6'),
(49, N'ET5'),
(49, N'ES9'),
(49, N'ETX'),
(49, N'ES5'),
(49, N'ES3');

-- Xpeng (brandId = 50)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(50, N'P7'),
(50, N'P5'),
(50, N'G3'),
(50, N'G9'),
(50, N'P7 Wing'),
(50, N'Xpeng 3'),
(50, N'Xpeng 2'),
(50, N'Xpeng 1'),
(50, N'Xpeng Z'),
(50, N'Xpeng F');

-- Saab (brandId = 28)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(28, N'9-3'),
(28, N'9-5'),
(28, N'9-4X'),
(28, N'900'),
(28, N'93 Aero');

-- Mitsubishi (brandId = 29)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(29, N'Outlander'),
(29, N'ASX'),
(29, N'L200'),
(29, N'Pajero'),
(29, N'Colt');

-- Chevrolet (brandId = 30)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(30, N'Malibu'),
(30, N'Cruze'),
(30, N'Equinox'),
(30, N'Silverado'),
(30, N'Camaro');

-- Subaru (brandId = 40)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(40, N'Outback'),
(40, N'Forester'),
(40, N'Impreza'),
(40, N'Legacy'),
(40, N'WRX');

-- Infiniti (brandId = 41)
INSERT INTO Brand_modells (brand_id, modell_name) VALUES
(41, N'Q50'),
(41, N'Q60'),
(41, N'QX50'),
(41, N'QX80'),
(41, N'G37');

end
GO
