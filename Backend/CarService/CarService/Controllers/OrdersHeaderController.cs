using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersHeaderController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public OrdersHeaderController(CarServiceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<OrdersHeader>>> GetOrdersHeaders()
        {
            return await _context.OrdersHeaders.ToListAsync();
        }
    }
}
