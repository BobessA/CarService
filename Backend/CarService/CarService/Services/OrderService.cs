using Azure.Core;
using CarService.Models;
using Microsoft.EntityFrameworkCore;

namespace CarService.Services
{
    public static class OrderService
    {
        /// <summary>
        /// Rendelés fej értékek frissítése
        /// </summary>
        /// <param name="_context">adatbázis kontext</param>
        /// <param name="orderId">rendelés azonosító</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns></returns>
        public static async Task UpdateOrderAmountsAsync(CarServiceContext _context, int orderId, CancellationToken cToken)
        {
            var totalNetAmount = await _context.OrderItems
                .Where(o => o.OrderId == orderId)
                .Select(o => o.NetAmount)
                .SumAsync(cToken);

            var header = await _context.OrdersHeaders
                .Where(h => h.Id == orderId)
                .FirstOrDefaultAsync(cToken);

            if (header != null)
            {
                header.GrossAmount = totalNetAmount * 1.27;
                header.NetAmount = totalNetAmount;
                await _context.SaveChangesAsync(cToken);
            }
        }
    }
}
