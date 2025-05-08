using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Attributes;
using static CarService.Helpers.AuthHelper;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class RolesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public RolesController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Jogosultságok
        /// </summary>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>RolesDTO List, 404</returns>
        [HttpGet]
        [ProducesResponseType(typeof(List<RolesDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner, UserRole.Customer)]
        public async Task<IActionResult> GetRoles(CancellationToken cToken)
        {
            var roles = await _context.Roles
                .Select(r => new RolesDTO
                {
                    id = r.Id,
                    name = r.Name,
                })
                .ToListAsync();

            if (roles == null || roles.Count == 0) 
            {
                return NotFound();
            }

            return Ok(roles);
        }
    }
}
