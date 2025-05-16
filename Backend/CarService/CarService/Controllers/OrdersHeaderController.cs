using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Helpers;
using CarService.Attributes;
using static CarService.Helpers.AuthHelper;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class OrdersHeaderController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public OrdersHeaderController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Megrendelések lekérdezése
        /// </summary>
        /// <param name="orderId"></param>
        /// <param name="customerId"></param>
        /// <param name="statusId"></param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>OrdersHeaderDTO List, 204, 400</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<OrdersHeaderDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO),StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> GetOrders([FromQuery] int? orderId,[FromQuery] Guid? customerId,[FromQuery] int[]? statusId,CancellationToken cToken)
        {
            try
            {
                var query = _context.OrdersHeaders
                    .Include(o => o.Status)
                    .AsQueryable();

                if (orderId.HasValue)
                    query = query.Where(o => o.Id == orderId.Value);

                if (customerId.HasValue)
                    query = query.Where(o => o.CustomerId == customerId.Value);

                if (statusId != null && statusId.Length > 0)
                    query = query.Where(o => statusId.Contains(o.StatusId));

                var result = await query.Select(o => new OrdersHeaderDTO
                {
                    id = o.Id,
                    customerId = o.CustomerId,
                    vehicleId = o.VehicleId,
                    orderNumber = o.OrderNumber,
                    offerId = o.OfferId,
                    agentId = o.AgentId,
                    mechanicId = o.MechanicId,
                    statusId = o.StatusId,
                    comment = o.Comment,
                    netAmount = o.NetAmount,
                    grossAmount = o.GrossAmount,
                    orderDate = o.OrderDate,
                    statusName = o.Status.Name
                }).ToListAsync(cToken);

                if (result.Count == 0)
                    return NoContent();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("OrdersHeader", "GET", ex.Message, null));
            }
        }

        /// <summary>
        /// Megrendelés rögzítése
        /// </summary>
        /// <param name="request">PostOrdersHeaderRequest</param>
        /// <param name="cToken">Cancellationtoken</param>
        /// <returns>200, 400</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> PostOrder([FromBody] PostOrdersHeaderRequest request, CancellationToken cToken)
        {
            if (!await _context.Users.AnyAsync(u => u.Id == request.customerId, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "POST", "Customer does not exist", null));

            if (!await _context.Vehicles.AnyAsync(v => v.Id == request.vehicleId, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "POST", "Vehicle does not exist", null));

            if (!await _context.Statuses.AnyAsync(s => s.Id == request.statusId, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "POST", "Invalid status", null));

            var order = new OrdersHeader
            {
                CustomerId = request.customerId,
                VehicleId = request.vehicleId,
                OrderNumber = request.orderNumber,
                OfferId = request.offerId,
                AgentId = request.agentId,
                MechanicId = request.mechanicId,
                StatusId = request.statusId,
                Comment = request.comment,
                NetAmount = request.netAmount,
                GrossAmount = request.grossAmount,
                OrderDate = request.orderDate ?? DateTime.Now
            };

            await _context.OrdersHeaders.AddAsync(order, cToken);
            await _context.SaveChangesAsync(cToken);

            return Ok();
        }

        /// <summary>
        /// Megrendelés módosítása
        /// </summary>
        /// <param name="request">UpdateOrdersHeaderRequest</param>
        /// <param name="cToken">Cancellationtoken</param>
        /// <returns>200, 400, 404</returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> PutOrder([FromBody] UpdateOrdersHeaderRequest request, CancellationToken cToken)
        {
            var order = await _context.OrdersHeaders.FirstOrDefaultAsync(o => o.Id == request.id, cToken);

            if (order == null)
                return NotFound();

            if (request.customerId.HasValue && !await _context.Users.AnyAsync(u => u.Id == request.customerId, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "PUT", "Invalid customerId", null));

            if (request.vehicleId.HasValue && !await _context.Vehicles.AnyAsync(v => v.Id == request.vehicleId, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "PUT", "Invalid vehicleId", null));

            if (request.statusId.HasValue && !await _context.Statuses.AnyAsync(s => s.Id == request.statusId, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "PUT", "Invalid statusId", null));

            // Frissítés
            order.CustomerId = request.customerId ?? order.CustomerId;
            order.VehicleId = request.vehicleId ?? order.VehicleId;
            order.OrderNumber = request.orderNumber ?? order.OrderNumber;
            order.OfferId = request.offerId ?? order.OfferId;
            order.AgentId = request.agentId ?? order.AgentId;
            order.MechanicId = request.mechanicId ?? order.MechanicId;
            order.StatusId = request.statusId ?? order.StatusId;
            order.Comment = request.comment ?? order.Comment;
            order.NetAmount = request.netAmount ?? order.NetAmount;
            order.GrossAmount = request.grossAmount ?? order.GrossAmount;
            order.OrderDate = request.orderDate ?? order.OrderDate;

            try
            {
                await _context.SaveChangesAsync(cToken);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Orders", "PUT", ex.Message, null));
            }
        }

        /// <summary>
        /// Megrendelés törlése
        /// </summary>
        /// <param name="id">OrderHeader.id</param>
        /// <param name="cToken">Cancellationtoken</param>
        /// <returns>204, 400, 404</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [AuthorizeRole(UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> DeleteOrder(int id, CancellationToken cToken)
        {
            var order = await _context.OrdersHeaders.FirstOrDefaultAsync(o => o.Id == id, cToken);

            if (order == null)
                return NotFound();

            if (await _context.OrderItems.AnyAsync(i => i.OrderId == id, cToken))
                return BadRequest(new GenericResponseDTO("Orders", "DELETE", "Order has items assigned", null));

            try
            {
                _context.OrdersHeaders.Remove(order);
                await _context.SaveChangesAsync(cToken);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Orders", "DELETE", ex.Message, null));
            }
        }

        /// <summary>
        /// Megrendelések darabszáma
        /// </summary>
        [HttpGet("count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<IActionResult> GetOrderCount(CancellationToken cToken)
        {
            var count = await _context.OrdersHeaders.CountAsync(cToken);
            if (count == 0)
                return NoContent();

            return Ok(count);
        }

        /// <summary>
        /// Megrendelések lekérdezése
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>OrdersHeaderDTO List, 204, 400</returns>
        [HttpGet("fullOrder/{id}")]
        [ProducesResponseType(typeof(FullOrderToPdfDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> GetFullOrder(int id, CancellationToken cToken)
        {
            try
            {
                var header = await _context.OrdersHeaders
                    .Where(o => o.Id == id)
                    .FirstOrDefaultAsync(cToken);

                if (header == null)
                    return NoContent();

                var items = await _context.OrderItems
                    .Where(i => i.OrderId == id)
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

                var vehicle = await _context.Vehicles
                    .Where(v => v.Id == (header.VehicleId))
                    .Select(v => new VehiclesDTO
                    {
                        id = v.Id,
                        ownerId = v.OwnerId,
                        licensePlate = v.LicensePlate,
                        brand = v.Brand,
                        model = v.Model,
                        yearOfManufacture = v.YearOfManufacture,
                        vin = v.Vin,
                        engineCode = v.EngineCode,
                        odometer = v.Odometer,
                        fuelType = v.FuelTypeId
                    })
                    .FirstOrDefaultAsync(cToken);

                string statusName = await _context.Statuses.Where(s => s.Id == header.StatusId).Select(s => s.Name).FirstOrDefaultAsync(cToken);

                var offer = await _context.Offers.Where(o => o.Id == header.OfferId).FirstOrDefaultAsync(cToken);

                FullOrderToPdfDTO order = new FullOrderToPdfDTO
                {
                    id = id,
                    customerId = header.CustomerId,
                    vehicleId = header.VehicleId,
                    vehicle = vehicle,
                    orderNumber = header.OrderNumber,
                    offerId = header.OfferId,
                    agentId = header.AgentId,
                    mechanicId = header.MechanicId,
                    statusId = header.StatusId,
                    statusName = statusName,
                    comment = header.Comment,
                    netAmount = header.NetAmount,
                    grossAmount = header.GrossAmount,
                    orderDate = header.OrderDate,
                    offerNumber = offer.OfferNumber,
                    offerIssueDescription = offer.IssueDescription,
                    items = items,

                };

                return Ok(order);

            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("OrdersHeader/fullOrder", "GET", ex.Message, null));
            }
        }

    }
}
