using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Helpers;
using Azure.Core;

namespace CarService.Controllers
{
    [Route("api/Vehicles")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class VehiclesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public VehiclesController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Járművek lekérése
        /// </summary>
        /// <param name="vehicleId">vehicle.id</param>
        /// <param name="userId">user.id</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>VehiclesDTO list, 400, 204</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<VehiclesDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetVehicles(int? vehicleId, string? userId, CancellationToken cToken)
        {
            var query = _context.Vehicles.AsQueryable();

            if (vehicleId.HasValue)
            {
                query = query.Where(v => v.Id == vehicleId.Value);
            }

            if (!string.IsNullOrEmpty(userId))
            {
                if (Guid.TryParse(userId, out Guid parsedUserId))
                {
                    query = query.Where(v => v.OwnerId == parsedUserId);
                }
                else
                {
                    return BadRequest("Invalid userId format.");
                }
            }

            List<VehiclesDTO> vehicles = await query
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
                    fuelType = v.FuelTypeId,
                })
                .ToListAsync(cToken);

            if (vehicles == null || vehicles.Count == 0)
            {
                return NoContent();
            }

            return Ok(vehicles);
        }

        /// <summary>
        /// Jármű rögzítés
        /// </summary>
        /// <param name="request">PostVehicleRequest</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>200, 400</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PostVehicle([FromBody] PostVehicleRequest request, CancellationToken cToken)
        {
            if (!await _context.Users.AnyAsync(u => u.Id == request.ownerId, cToken))
            {
                return StatusCode(StatusCodes.Status400BadRequest, "Owner does not exists");
            }

            if (!await _context.FuelTypes.AnyAsync(f => f.Id == request.fuelType, cToken))
            {
                return StatusCode(StatusCodes.Status400BadRequest, "Invalid Fuel type");
            }

            var vehicle = new Vehicle
            {
                OwnerId = request.ownerId,
                LicensePlate = request.licensePlate,
                Brand = request.brand,
                Model = request.model,
                YearOfManufacture = request.yearOfManufacture,
                Vin = request.vin,
                EngineCode = request.engineCode,
                Odometer = request.odometer,
                FuelTypeId = request.fuelType,
            };

            await _context.Vehicles.AddAsync(vehicle);
            await _context.SaveChangesAsync(cToken);

            return Ok();
        }

        /// <summary>
        /// Jármű adatok módosítása
        /// </summary>
        /// <param name="request">UpdateVehicleRequest</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>200, 400, 204</returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutVehicle([FromBody] UpdateVehicleRequest request, CancellationToken cToken)
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(u => u.Id == request.id, cToken);

            if (vehicle == null)
            {
                return NoContent();
            }

            if (request.ownerId != null && !await _context.Users.AnyAsync(u => u.Id == request.ownerId, cToken))
            {
                return StatusCode(StatusCodes.Status400BadRequest, "Owner does not exists");
            }

            vehicle.OwnerId = request.ownerId ?? vehicle.OwnerId;
            vehicle.Odometer = request.odometer ?? vehicle.Odometer;

            try
            {
                await _context.SaveChangesAsync(cToken);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

        }

        /// <summary>
        /// Jármű törlés
        /// </summary>
        /// <param name="id">vehicles.id</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>204, 400, 204</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteVehicle(int id, CancellationToken cToken)
        {
            var vehicle = await _context.Vehicles.FirstOrDefaultAsync(v => v.Id == id, cToken);

            if (vehicle == null)
            {
                return NotFound();
            }

            if (await _context.OrdersHeaders.AnyAsync(o => o.VehicleId == id, cToken))
            {
                return StatusCode(StatusCodes.Status400BadRequest, "Vehicle is already listed on an order");
            }

            if (await _context.Offers.AnyAsync(o => o.VehicleId == id, cToken))
            {
                return StatusCode(StatusCodes.Status400BadRequest, "Vehicle is already listed on an offer");
            }

            try
            {
                _context.Vehicles.Remove(vehicle);
                await _context.SaveChangesAsync();

                return NoContent();
            } 
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status400BadRequest, ex.Message);
            }
        }
    }
}
