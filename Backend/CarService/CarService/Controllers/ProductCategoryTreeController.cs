using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;

namespace CarService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class ProductCategoryTreeController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public ProductCategoryTreeController(CarServiceContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCategoryTree>>> GetProductCategoryTree()
        {
            return await _context.ProductCategoryTrees.ToListAsync();
        }
    }
}
