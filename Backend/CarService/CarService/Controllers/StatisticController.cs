using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.DTOs;
using CarService.Models;

namespace CarService.Controllers
{
    [Route("api/statistics")]
    [ApiController]
    [Produces("application/json")]
    public class AdminStatisticsController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public AdminStatisticsController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Statisztikák lekérése (ügyfélszám, készlet, bevétel, bejelentkezett autók)
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(StatisticsDTO), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetStatistics(CancellationToken cToken)
        {
            // --- 1. Ügyfélszám napi bontásban (utolsó 7 nap) ---
            var offers = await _context.Offers
                .Where(o => o.RequestDate >= DateTime.Today.AddDays(-6))
                .ToListAsync(cToken);

            var groupedDays = offers
                .GroupBy(o => o.RequestDate.DayOfWeek)
                .Select(g => new DayCount
                {
                    Day = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToList();

            // --- 2. Inventory (készlet) fő kategóriánként ---
            var products = await _context.Products
                .Include(p => p.Categories)
                    .ThenInclude(c => c.Parent)
                .ToListAsync(cToken);

            var inventory = products
                .SelectMany(p => p.Categories.Select(cat => new
                {
                    ProductId = p.ProductId,
                    Quantity = p.StockQuantity ?? 0,
                    MainCategory = cat.ParentId == null ? cat : cat.Parent!
                }))
                .GroupBy(x => new { x.ProductId, x.MainCategory.CategoryId })
                .Select(x => x.First())
                .GroupBy(x => x.MainCategory.CategoryName)
                .Select(g => new CategoryCount
                {
                    Category = g.Key,
                    Quantity = g.Sum(x => (int)x.Quantity)
                })
                .ToList();

            // --- 3. Revenue (bevétel) fő kategóriánként ---
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                    .ThenInclude(p => p.Categories)
                        .ThenInclude(c => c.Parent)
                .ToListAsync(cToken);

            var revenue = orderItems
                .SelectMany(oi =>
                    oi.Product.Categories.Select(cat => new
                    {
                        OrderId = oi.OrderId,
                        ProductId = oi.Product.ProductId,
                        Revenue = oi.GrossAmount,
                        MainCategory = cat.ParentId == null ? cat : cat.Parent!
                    })
                )
                .GroupBy(x => new { x.OrderId, x.ProductId, x.MainCategory.CategoryId })
                .Select(x => x.First())
                .GroupBy(x => x.MainCategory.CategoryName)
                .Select(g => new CategoryRevenue
                {
                    Category = g.Key,
                    Revenue = g.Sum(x => (decimal)x.Revenue)
                })
                .ToList();

            // --- 4. Bejelentkezett autók (megrendelések darabszáma) ---
            var orderCount = await _context.OrdersHeaders.CountAsync(cToken);

            // --- 5. Árajánlatok (darabszáma) ---
            var offerCount = await _context.Offers
            .Where(o => o.StatusId == 1 || o.StatusId == 2)
            .CountAsync(cToken);


            //--- 6. Raktár (darabszáma) ---
            var productCount = await _context.Products.CountAsync(cToken);

            //--- 7. Munkafolyamatok (darabszáma) ---
            var processCount = await _context.OrdersHeaders
            .Where(o => o.StatusId == 6) // <<< Ide kerül a státuszkód, egyenlőre 6-os.
            .CountAsync(cToken);


            //--- 8. Ügyfelek (havi darabszáma) ---
            var monthlyCustomerCount = await _context.Offers
            .Where(o => o.RequestDate.Year == DateTime.Today.Year && o.RequestDate.Month == DateTime.Today.Month)
            .CountAsync(cToken);

            //--- 9. Beszállítói rendelések (darabszáma) ---
            var supplierOrderCount = await _context.SupplierOrders.CountAsync(cToken);

            //--- 10. Összesített bevétel ---
            var totalRevenue = await _context.OrderItems
            .SumAsync(oi => (decimal)oi.GrossAmount, cToken);

            //--- 11. Járművek (darabszáma) ---
            var vehicleCount = await _context.Vehicles.CountAsync(cToken);



            // --- Összesített eredmény ---
            var result = new StatisticsDTO
            {
                CustomerCounts = groupedDays,
                Inventory = inventory,
                Revenue = revenue,
                OrderCount = orderCount,
                OfferCount = offerCount,
                ProductCount = productCount,
                ProcessCount = processCount,
                MonthlyCustomerCount = monthlyCustomerCount,
                SupplierOrderCount = supplierOrderCount,
                TotalRevenue = totalRevenue,
                VehicleCount = vehicleCount
            };

            return Ok(result);
        }
    }
}
