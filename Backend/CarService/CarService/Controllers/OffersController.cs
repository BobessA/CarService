using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Helpers;

namespace CarService.Controllers
{
    [Route("api/Offers")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class OffersController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public OffersController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Ajánlatok lekérése
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(List<OfferDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetOffers(int? offerId, string? customerId, int? statusId, CancellationToken cToken)
        {
            var query = _context.Offers.AsQueryable();

            if (offerId.HasValue)
                query = query.Where(o => o.Id == offerId.Value);

            if (!string.IsNullOrEmpty(customerId))
            {
                if (Guid.TryParse(customerId, out Guid parsedCustomerId))
                {
                    query = query.Where(o => o.CustomerId == parsedCustomerId);
                }
                else
                {
                    return BadRequest(new GenericResponseDTO("Offers", "GET", "Invalid customerId format", null));
                }
            }

            if (statusId.HasValue)
                query = query.Where(o => o.StatusId == statusId.Value);

            var offers = await query
                .Select(o => new OfferDTO
                {
                    id = o.Id,
                    offerNumber = o.OfferNumber,
                    customerId = o.CustomerId,
                    vehicleId = o.VehicleId,
                    requestDate = o.RequestDate,
                    issueDescription = o.IssueDescription,
                    statusId = o.StatusId,
                    agentId = o.AgentId,
                    appointmentDate = o.AppointmentDate,
                    adminComment = o.AdminComment,
                    statusName = o.Status.Name
                })
                .ToListAsync(cToken);

            if (offers == null || offers.Count == 0)
                return NoContent();

            return Ok(offers);
        }


        /// <summary>
        /// Új ajánlat létrehozása
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PostOffer([FromBody] PostOfferRequest request, CancellationToken cToken)
        {
            if (!await _context.Users.AnyAsync(u => u.Id == request.customerId, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "POST", "Customer not found", null));

            if (!await _context.Vehicles.AnyAsync(v => v.Id == request.vehicleId, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "POST", "Vehicle not found", null));

            if (!await _context.Statuses.AnyAsync(s => s.Id == request.statusId, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "POST", "Status not found", null));

            if (request.agentId != null && !await _context.Users.AnyAsync(a => a.Id == request.agentId, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "POST", "Agent not found", null));

            var offer = new Offer
            {
                CustomerId = request.customerId,
                VehicleId = request.vehicleId,
                RequestDate = request.requestDate,
                IssueDescription = request.issueDescription,
                StatusId = request.statusId,
                AgentId = request.agentId,
                AppointmentDate = request.appointmentDate,
                AdminComment = request.adminComment
            };

            await _context.Offers.AddAsync(offer, cToken);
            await _context.SaveChangesAsync(cToken);

            return Ok();
        }

        /// <summary>
        /// Ajánlat módosítása
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutOffer([FromBody] UpdateOfferRequest request, CancellationToken cToken)
        {
            var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == request.id, cToken);
            if (offer == null)
                return NotFound();

            if (request.statusId.HasValue && !await _context.Statuses.AnyAsync(s => s.Id == request.statusId, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "PUT", "Invalid status ID", null));

            if (request.agentId.HasValue && !await _context.Users.AnyAsync(a => a.Id == request.agentId, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "PUT", "Invalid agent ID", null));

            offer.StatusId = request.statusId ?? offer.StatusId;
            offer.AgentId = request.agentId ?? offer.AgentId;
            offer.AppointmentDate = request.appointmentDate ?? offer.AppointmentDate;
            offer.AdminComment = request.adminComment ?? offer.AdminComment;

            try
            {
                await _context.SaveChangesAsync(cToken);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Offers", "PUT", ex.Message, null));
            }
        }

        /// <summary>
        /// Ajánlat törlése
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteOffer(int id, CancellationToken cToken)
        {
            var offer = await _context.Offers.FirstOrDefaultAsync(o => o.Id == id, cToken);
            if (offer == null)
                return NotFound();

            if (await _context.OrdersHeaders.AnyAsync(o => o.OfferId == id, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "DELETE", "Offer is already assigned to an order", null));

            _context.Offers.Remove(offer);
            await _context.SaveChangesAsync(cToken);

            return NoContent();
        }

        /// <summary>
        /// Ajánlatok darabszáma
        /// </summary>
        [HttpGet("count")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetOfferCount(CancellationToken cToken)
        {
            try
            {
                var count = await _context.Offers.CountAsync(cToken);
                if (count == 0)
                    return NoContent();
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Offers", "GET", ex.Message, null));
            }
        }
    }
}
