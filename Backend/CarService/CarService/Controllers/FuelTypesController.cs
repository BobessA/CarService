using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.Attributes;
using CarService.DTOs;
using static CarService.Helpers.AuthHelper;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class FuelTypesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public FuelTypesController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Üzemanyag
        /// </summary>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>FuelTypesDTO List, 204, 400</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<FuelTypesDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> GetFuelTypes(CancellationToken cToken)
        {
            try
            {
                List<FuelTypesDTO> fuels = await _context.FuelTypes
                .Select(v => new FuelTypesDTO
                {
                    id = v.Id,
                    name = v.Name,
                })
                .ToListAsync(cToken);

                if (fuels.Count == 0)
                {
                    return NoContent();
                }

                return Ok(fuels);

            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("FuelTypes", "GET", ex.Message, null));
            }
        }
    }
}
