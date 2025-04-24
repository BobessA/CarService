using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;

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

        [HttpGet]
        [ProducesResponseType(typeof(RolesDTO), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetRoles()
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
