using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Attributes;
using static CarService.Helpers.AuthHelper;

namespace CarService.Controllers
{
    [Route("api/ProductCategories")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class ProductCategoriesController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public ProductCategoriesController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Csoportbesorolások lekérése
        /// </summary>
        /// <param name="productId">products.product_id</param>
        /// <param name="categoryId">Product_Categories.category_id</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>ProductCategoryAssignmentsDTO list, 400, 204</returns>
        [HttpGet("Assignments")]
        [ProducesResponseType(typeof(List<ProductCategoryAssignmentsDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> GetProductCategoryAssignments(string? productId, int? categoryId, CancellationToken cToken)
        {
            var query = _context.Products
                .SelectMany(p => p.Categories, (product, category) => new ProductCategoryAssignmentsDTO
                {
                    productId = product.ProductId,
                    categoryId = category.CategoryId
                })
                .AsQueryable();

            if (categoryId != null && !await _context.ProductCategories.AnyAsync(pc => pc.CategoryId == categoryId, cToken))
            {
                return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "GET", "Category does not exists", null));
            }
            if (categoryId.HasValue)
            {
                query = query.Where(w => w.categoryId == categoryId);
            }

            if (productId != null && !await _context.Products.AnyAsync(p => p.ProductId == productId, cToken))
            {
                return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "GET", "Product does not exists", null));
            }
            if (!string.IsNullOrEmpty(productId))
            {
                query = query.Where(w => w.productId == productId);
            }

            List<ProductCategoryAssignmentsDTO> assignments = await query.ToListAsync(cToken);

            if (assignments == null || assignments.Count == 0)
            {
                return NoContent();
            }

            return Ok(assignments); 
        }

        /// <summary>
        /// Csoportbesorolás rögzítés
        /// </summary>
        /// <param name="requests">List ProductCategoryAssignmentsDTO</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>200, 400</returns>
        [HttpPost("Assignments")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> AddProductCategoryAssignments(List<ProductCategoryAssignmentsDTO> requests, CancellationToken cToken)
        {
            if (requests == null || !requests.Any())
            {
                return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "POST", "Request is empty", null));
            }

            var categoryIds = requests.Select(r => r.categoryId).Distinct().ToList();
            var productIds = requests.Select(r => r.productId).Distinct().ToList();

            var categories = await _context.ProductCategories
                .Where(pc => categoryIds.Contains(pc.CategoryId))
                .ToListAsync(cToken);

            var products = await _context.Products
                .Include(p => p.Categories)
                .Where(p => productIds.Contains(p.ProductId))
                .ToListAsync(cToken);

            foreach (var req in requests)
            {
                var category = categories.FirstOrDefault(c => c.CategoryId == req.categoryId);
                if (category == null)
                {
                    return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "POST", $"Category {req.categoryId} does not exists", null));
                }

                var product = products.FirstOrDefault(p => p.ProductId == req.productId);
                if (product == null)
                {
                    return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "POST", $"Product {req.productId} does not exists", null));
                }

                if (product.Categories.Any(pc => pc.CategoryId == req.categoryId))
                {
                    return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "POST", $"This assignment already exists (product: {req.productId}, category: {req.categoryId})", null));
                }
            }

            foreach (var req in requests)
            {
                var category = categories.First(c => c.CategoryId == req.categoryId);
                var product = products.First(p => p.ProductId == req.productId);
                product.Categories.Add(category);
            }
            await _context.SaveChangesAsync(cToken);

            var distinctProductIds = requests.Select(r => r.productId).Distinct();
            foreach (var productId in distinctProductIds)
            {
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"EXEC AssignProductToCategory {productId}", cToken);
            }

            return Ok();
        }

        /// <summary>
        /// Csoportbesorolás törlés
        /// </summary>
        /// <param name="categoryId">Product_Categories.category_id</param>
        /// <param name="productId">products.product_id</param>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>204, 400, 204</returns>
        [HttpDelete("Assignments/{categoryId}/{productId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [AuthorizeRole(UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> DeleteProductCategoryAssignment(int categoryId, string productId, CancellationToken cToken)
        {
            var product = await _context.Products
                .Include(p => p.Categories)
                .FirstOrDefaultAsync(p => p.ProductId == productId, cToken);

            if (product == null)
            {
                return NotFound(new GenericResponseDTO("ProductCategoryAssignments", "DELETE", "Product does not exist", null));
            }

            var category = product.Categories.FirstOrDefault(c => c.CategoryId == categoryId);

            if (category == null)
            {
                return NotFound(new GenericResponseDTO("ProductCategoryAssignments", "DELETE", "Assignment does not exist", null));
            }

            try
            {
                product.Categories.Remove(category);
                await _context.SaveChangesAsync(cToken);

                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"EXEC DeleteProductCategoriesAssignment {productId}, {categoryId}", cToken);

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("ProductCategoryAssignments", "DELETE", ex.Message, null));
            }
        }

        /// <summary>
        /// Termékcsoport fa
        /// </summary>
        /// <param name="cToken">CancellationToken</param>
        /// <returns>ProductCategoryTreeDTO List, 400, 204</returns>
        [HttpGet("CategoryTree")]
        [ProducesResponseType(typeof(List<ProductCategoryTreeDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [AuthorizeRole(UserRole.Mechanic, UserRole.Admin, UserRole.Owner)]
        public async Task<IActionResult> GetProductCategoryTree(CancellationToken cToken)
        {
            var tree = await _context.ProductCategoryTrees.ToListAsync(cToken);

            return Ok(tree);
        }
    }
}
