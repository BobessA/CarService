using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.Attributes;
using static CarService.Helpers.AuthHelper;
using CarService.DTOs;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class StatusesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public StatusesController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Státuszok
        /// </summary>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>StatusDTO List, 204, 400</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<StatusDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> GetStatuses(CancellationToken cToken)
        {
            try
            {
                List<StatusDTO> statuses = await _context.Statuses
                .Select(v => new StatusDTO
                {
                    id = v.Id,
                    name = v.Name,
                    description = v.Description,
                })
                .ToListAsync(cToken);

                if (statuses.Count == 0)
                {
                    return NoContent();
                }

                return Ok(statuses);

            } catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Statuses", "GET", ex.Message, null));
            }
        }
    }
}
