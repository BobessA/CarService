using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FuelTypesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public FuelTypesController(CarServiceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<FuelType>>> GetFuelTypes()
        {
            return await _context.FuelTypes.ToListAsync();
        }
    }
}
