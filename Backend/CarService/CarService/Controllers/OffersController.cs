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
            var query = _context.Offers
                .Include(o => o.OfferImages)
                .Include(o => o.Status)
                .AsQueryable();

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
                    statusName = o.Status.Name,
                    imagePaths = o.OfferImages.Select(img => img.ImagePath).ToList()
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
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PostOffer([FromForm] PostOfferRequest request, CancellationToken cToken)
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

            if (request.Photos != null && request.Photos.Any())
            {
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                const long maxSize = 2 * 1024 * 1024; // 2MB
                var savedOffer = await _context.Offers
                    .Where(o => o.Id == offer.Id)
                    .Select(o => new { o.OfferNumber })
                    .FirstOrDefaultAsync(cToken);

                if (savedOffer == null || string.IsNullOrWhiteSpace(savedOffer.OfferNumber))
                    return BadRequest(new GenericResponseDTO("Offers", "POST", "Offer saved, de nincs offer_number", null));

                var cleanOfferNumber = savedOffer.OfferNumber.Replace("/", "_");

                var relativeDir = Path.Combine("offers", request.customerId.ToString(), cleanOfferNumber);
                var fullDir = Path.Combine("wwwroot", relativeDir);
                Directory.CreateDirectory(fullDir);

                foreach (var photo in request.Photos)
                {
                    if (!allowedTypes.Contains(photo.ContentType.ToLower()))
                        return BadRequest(new GenericResponseDTO("Offers", "POST", "Csak kép formátum engedélyezett (jpg, png, gif)", null));

                    if (photo.Length > maxSize)
                        return BadRequest(new GenericResponseDTO("Offers", "POST", "A kép mérete legfeljebb 2MB lehet", null));

                    var fileName = Path.GetFileName(photo.FileName);
                    var filePath = Path.Combine(fullDir, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await photo.CopyToAsync(stream, cToken);
                    }

                    var image = new OfferImage
                    {
                        OfferId = offer.Id,
                        ImagePath = Path.Combine(relativeDir, fileName).Replace("\\", "/")
                    };

                    await _context.OfferImages.AddAsync(image, cToken);
                }

                await _context.SaveChangesAsync(cToken);
            }


            return Ok();
        }


        /// <summary>
        /// Ajánlat módosítása
        /// </summary>
        [HttpPut]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutOffer([FromForm] UpdateOfferRequest request, CancellationToken cToken)
        {
            var offer = await _context.Offers
                .Include(o => o.OfferImages)
                .FirstOrDefaultAsync(o => o.Id == request.id, cToken);

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

            // --- ÚJ képek mentése, ha vannak ---
            if (request.Photos != null && request.Photos.Count > 0)
            {
                var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif" };
                const long maxSize = 2 * 1024 * 1024; // 2MB

                var offerData = await _context.Offers
                    .Where(o => o.Id == request.id)
                    .Select(o => new { o.CustomerId, o.OfferNumber })
                    .FirstOrDefaultAsync(cToken);

                if (offerData == null || string.IsNullOrWhiteSpace(offerData.OfferNumber))
                    return BadRequest(new GenericResponseDTO("Offers", "PUT", "Offer mentve, de nincs offer_number", null));

                var cleanOfferNumber = offerData.OfferNumber.Replace("/", "_");

                var relativeDir = Path.Combine("offers", offerData.CustomerId.ToString(), cleanOfferNumber);
                var fullDir = Path.Combine("wwwroot", relativeDir);
                Directory.CreateDirectory(fullDir);

                foreach (var photo in request.Photos)
                {
                    if (!allowedTypes.Contains(photo.ContentType.ToLower()))
                        return BadRequest(new GenericResponseDTO("Offers", "PUT", "Csak kép formátum engedélyezett (jpg, png, gif)", null));

                    if (photo.Length > maxSize)
                        return BadRequest(new GenericResponseDTO("Offers", "PUT", "A kép mérete legfeljebb 2MB lehet", null));

                    var fileName = Path.GetFileName(photo.FileName);
                    var filePath = Path.Combine(fullDir, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await photo.CopyToAsync(stream, cToken);
                    }

                    var image = new OfferImage
                    {
                        OfferId = offer.Id,
                        ImagePath = Path.Combine(relativeDir, fileName).Replace("\\", "/")
                    };

                    await _context.OfferImages.AddAsync(image, cToken);
                }
            }

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
            var offer = await _context.Offers
                .Include(o => o.OfferImages)
                .FirstOrDefaultAsync(o => o.Id == id, cToken);

            if (offer == null)
                return NotFound();

            if (await _context.OrdersHeaders.AnyAsync(o => o.OfferId == id, cToken))
                return BadRequest(new GenericResponseDTO("Offers", "DELETE", "Offer is already assigned to an order", null));

            // Képek fájlrendszerből törlése
            if (!string.IsNullOrWhiteSpace(offer.OfferNumber))
            {
                var cleanOfferNumber = offer.OfferNumber.Replace("/", "_");
                var relativeDir = Path.Combine("offers", offer.CustomerId.ToString(), cleanOfferNumber);
                var fullDir = Path.Combine("wwwroot", relativeDir);

                if (Directory.Exists(fullDir))
                {
                    try
                    {
                        Directory.Delete(fullDir, recursive: true);
                    }
                    catch (Exception ex)
                    {
                        return BadRequest(new GenericResponseDTO("Offers", "DELETE", $"A fájlok törlése nem sikerült: {ex.Message}", null));
                    }
                }
            }
            _context.OfferImages.RemoveRange(offer.OfferImages);
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
