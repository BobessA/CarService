using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductCategoriesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public ProductCategoriesController(CarServiceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCategory>>> GetProductCategories()
        {
            return await _context.ProductCategories.ToListAsync();
        }
    }
}
