using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Helpers;

namespace CarService.Controllers
{
    [Route("api/OrderItems")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class OrderItemsController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public OrderItemsController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Rendelés tételek lekérése
        /// </summary>
        /// <param name="orderId">OrdersHeader.id</param>
        /// <param name="productId">Product.product_id</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>OrderItemDTO lista</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<OrderItemDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetOrderItems(int? orderId, string? productId, CancellationToken cToken)
        {
            var query = _context.OrderItems.AsQueryable();

            if (orderId.HasValue)
            {
                query = query.Where(i => i.OrderId == orderId.Value);
            }

            if (!string.IsNullOrEmpty(productId))
            {
                query = query.Where(i => i.ProductId == productId);
            }

            var items = await query
                .Select(i => new OrderItemDTO
                {
                    id = i.Id,
                    orderId = i.OrderId,
                    productId = i.ProductId,
                    quantity = i.Quantity,
                    unitPrice = i.UnitPrice,
                    netAmount = i.NetAmount,
                    grossAmount = i.GrossAmount,
                    comment = i.Comment
                })
                .ToListAsync(cToken);

            if (items.Count == 0)
                return NoContent();

            return Ok(items);
        }

        /// <summary>
        /// Rendelés tétel rögzítése
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PostOrderItem([FromBody] PostOrderItemRequest request, CancellationToken cToken)
        {
            if (!await _context.OrdersHeaders.AnyAsync(o => o.Id == request.orderId, cToken))
                return BadRequest(new GenericResponseDTO("OrderItems", "POST", "Order does not exist", null));

            if (!await _context.Products.AnyAsync(p => p.ProductId == request.productId, cToken))
                return BadRequest(new GenericResponseDTO("OrderItems", "POST", "Product does not exist", null));

            var item = new OrderItem
            {
                OrderId = request.orderId,
                ProductId = request.productId,
                Quantity = request.quantity,
                UnitPrice = request.unitPrice,
                NetAmount = request.netAmount,
                GrossAmount = request.grossAmount,
                Comment = request.comment
            };

            await _context.OrderItems.AddAsync(item, cToken);
            await _context.SaveChangesAsync(cToken);

            return Ok();
        }

        /// <summary>
        /// Rendelés tétel módosítása
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutOrderItem([FromBody] UpdateOrderItemRequest request, CancellationToken cToken)
        {
            var item = await _context.OrderItems.FirstOrDefaultAsync(i => i.Id == request.id, cToken);

            if (item == null)
                return NotFound();

            item.Quantity = request.quantity ?? item.Quantity;
            item.UnitPrice = request.unitPrice ?? item.UnitPrice;
            item.NetAmount = request.netAmount ?? item.NetAmount;
            item.GrossAmount = request.grossAmount ?? item.GrossAmount;
            item.Comment = request.comment ?? item.Comment;

            try
            {
                await _context.SaveChangesAsync(cToken);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("OrderItems", "PUT", ex.Message, null));
            }
        }

        /// <summary>
        /// Rendelés tétel törlése
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> DeleteOrderItem(int id, CancellationToken cToken)
        {
            var item = await _context.OrderItems.FirstOrDefaultAsync(i => i.Id == id, cToken);

            if (item == null)
                return NotFound();

            try
            {
                _context.OrderItems.Remove(item);
                await _context.SaveChangesAsync(cToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("OrderItems", "DELETE", ex.Message, null));
            }
        }
    }
}
