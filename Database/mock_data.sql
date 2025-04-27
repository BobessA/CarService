
insert Users (id,name,password_hash,role_id,discount,email)
select '561104e8-52e0-4210-b949-caa54fccf873','Nagy István','nmGVmE3+V8IPGITCsaG9IM8GgeYokA24/RoV3hQRzOA=',3,0,'istvan@nagy.hu'
where not exists (select 1 from Users where id='561104E8-52E0-4210-B949-CAA54FCCF873')
GO

insert Vehicles (owner_id,license_plate,brand,model,year_of_manufacture,vin,engine_code,odometer,fuel_type_id) 
select '561104e8-52e0-4210-b949-caa54fccf873',
	'XYZ-001',
	'Tesla',
	'Model 3',
	2020,
	'xxx73452jhaopskve',
	'ergbas',
	'23000',
	3
where not exists (select 1 from Vehicles where owner_id='561104e8-52e0-4210-b949-caa54fccf873')
GO

INSERT INTO Products (product_id, product_type, name, brand, purchase_price, selling_price, stock_quantity, description)
select 'TP001', 'P', 'Motorvezérlõ egység', 'Bosch', 45000, 60000, 10, 'Elektronikus vezérlõegység a motor teljesítményének optimalizálására.'
	where not exists (select 1 from Products where product_id='TP001') union
select 'TP002', 'P', 'Fékbetét garnitúra', 'Brembo', 15000, 22000, 25, 'Magas kopásállóságú fékbetét szett.' 
	where not exists (select 1 from Products where product_id='TP002') union
select 'TP003', 'P', 'Lengéscsillapító', 'Monroe', 20000, 28000, 0, 'Gázos lengéscsillapító az optimális menetstabilitás érdekében.'
	where not exists (select 1 from Products where product_id='TP003') union
select 'TP004', 'P', 'Hengerfej', 'Tesla', 12000, 18000, 30, 'Tesla Model 3 hengerfej'
	where not exists (select 1 from Products where product_id='TP004')
GO

insert Product_Category_Assignments (product_id,category_id)
select 'TP001',17 where not exists (select 1 from Product_Category_Assignments where product_id='TP001' and category_id=17) union
select 'TP002',7 where not exists (select 1 from Product_Category_Assignments where product_id='TP002' and category_id=7) union
select 'TP003',12 where not exists (select 1 from Product_Category_Assignments where product_id='TP003' and category_id=12) union
select 'TP004',17 where not exists (select 1 from Product_Category_Assignments where product_id='TP004' and category_id=17) 

exec AssignProductToCategory 'TP001'
exec AssignProductToCategory 'TP002'
exec AssignProductToCategory 'TP003'
exec AssignProductToCategory 'TP004'
GO

insert Offers (customer_id,vehicle_id,request_date,issue_description,status_id,agent_id,appointment_date,admin_comment)
select 
	'561104e8-52e0-4210-b949-caa54fccf873',1,GETDATE(),'Hengerfejes ez a jóság, tiszta motorolaj a hûtõvíz',2,null,null,'Tesla típus betegség'
where not exists (select 1 from Offers where customer_id='561104e8-52e0-4210-b949-caa54fccf873')
GO