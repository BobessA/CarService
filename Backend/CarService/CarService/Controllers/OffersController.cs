using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OffersController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public OffersController(CarServiceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Offer>>> GetOffers()
        {
            return await _context.Offers.ToListAsync();
        }
    }
}
