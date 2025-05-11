
using CarService.DTOs;
using CarService.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace CarService.Controllers
{
    [Route("api/SupplierOrders")]
    [ApiController]
    public class SupplierOrdersController : ControllerBase
    {
        private readonly CarServiceContext _context;
        public SupplierOrdersController(CarServiceContext ctx) => _context = ctx;
        [HttpGet]
        public async Task<IActionResult> Get(
            int? id,
            string? agentId,
            CancellationToken ct)
        {
            IQueryable<SupplierOrder> q = _context.SupplierOrders;

            if (id.HasValue)
                q = q.Where(x => x.Id == id.Value);

            if (!string.IsNullOrEmpty(agentId))
            {
                if (Guid.TryParse(agentId, out var ag))
                    q = q.Where(x => x.AgentId == ag);
                else
                    return BadRequest("Invalid agentId");
            }

            var list = await q
              .Include(x => x.Agent) 
              .Select(x => new SupplierOrderDTO
              {
                  Id = x.Id,
                  ProductId = x.ProductId,
                  AgentId = x.AgentId,
                  AgentName = x.Agent != null ? x.Agent.Name : null,
                  Quantity = x.Quantity,
                  OrderedDate = x.OrderedDate,
                  StatusId = x.StatusId
              })
              .ToListAsync(ct);

            if (list.Count == 0)
                return NoContent();

            return Ok(list);
        }


        [HttpPost]
        public async Task<IActionResult> Post(
            [FromBody] PostSupplierOrderRequest req,
            CancellationToken ct)
        {
            
            if (!await _context.Products.AnyAsync(p => p.ProductId == req.ProductId, ct))
                return BadRequest("Invalid productId");

            var order = new SupplierOrder
            {
                ProductId = req.ProductId,
                AgentId = req.AgentId,             
                Quantity = req.Quantity,
                OrderedDate = DateTime.UtcNow,
                StatusId = 6               // default „folyamatban”
            };

            await _context.SupplierOrders.AddAsync(order, ct);
            await _context.SaveChangesAsync(ct);
            return Ok();
        }

        [HttpPut]
        public async Task<IActionResult> Put(
     [FromBody] UpdateSupplierOrderRequest req,
     CancellationToken ct)
        {
            var order = await _context.SupplierOrders.FindAsync(new object[] { req.Id }, ct);
            if (order == null)
                return NotFound();

            var originalStatus = order.StatusId;

            if (req.Quantity.HasValue)
                order.Quantity = req.Quantity.Value;

            if (req.StatusId.HasValue)
                order.StatusId = req.StatusId.Value;

            if (req.OrderedDate.HasValue)
                order.OrderedDate = req.OrderedDate.Value;


            if (req.StatusId.HasValue
                && req.StatusId.Value == 1
                && originalStatus != 1)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.ProductId == order.ProductId, ct);

                if (product != null)
                {
                    product.StockQuantity += order.Quantity;
                }
                else
                {
                    return BadRequest($"Product not found: {order.ProductId}");
                }
            }
          
            await _context.SaveChangesAsync(ct);
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(
            int id,
            CancellationToken ct)
        {
            var order = await _context.SupplierOrders.FindAsync(new object[] { id }, ct);
            if (order == null) return NotFound();

            _context.SupplierOrders.Remove(order);
            await _context.SaveChangesAsync(ct);
            return NoContent();
        }

        /// <summary>
        /// Szállítói rendelések száma
        /// </summary>
        [HttpGet("count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> GetSupplierOrderCount(CancellationToken ct)
        {
            var count = await _context.SupplierOrders.CountAsync(ct);
            if (count == 0)
                return NoContent();
            return Ok(count);
        }

    }
}
