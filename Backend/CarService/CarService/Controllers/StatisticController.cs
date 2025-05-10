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
        /// Statisztikák lekérése (ügyfélszám, készlet, bevétel)
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
                .GroupBy(x => new { x.ProductId, x.MainCategory.CategoryId }) // Duplák kiszűrése
                .Select(x => x.First()) // egyedi termék-kategória párok
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



            // --- Összesített eredmény ---
            var result = new StatisticsDTO
            {
                CustomerCounts = groupedDays,
                Inventory = inventory,
                Revenue = revenue
            };

            return Ok(result);
        }
    }
}
