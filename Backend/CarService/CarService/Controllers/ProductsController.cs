using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarService.Models;
using CarService.DTOs;
using CarService.Helpers;

namespace CarService.Controllers
{
    [Route("api/Products")]
    [ApiController]
    [Consumes("application/json")]
    [Produces("application/json")]
    public class ProductsController : ControllerBase
    {
        private readonly CarServiceContext _context;

        public ProductsController(CarServiceContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Termékek lekérdezése
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(List<ProductsDTO>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetProducts(string? productId, string? name, CancellationToken cToken)
        {
            var query = _context.Products.AsQueryable();

            if (!string.IsNullOrEmpty(productId))
                query = query.Where(p => p.ProductId == productId);

            if (!string.IsNullOrEmpty(name))
                query = query.Where(p => p.Name.Contains(name));

            var result = await query.Select(p => new ProductsDTO
            {
                productId = p.ProductId,
                productType = p.ProductType,
                name = p.Name,
                brand = p.Brand,
                purchasePrice = p.PurchasePrice,
                sellingPrice = p.SellingPrice,
                stockQuantity = p.StockQuantity,
                description = p.Description
            }).ToListAsync(cToken);

            if (result == null || result.Count == 0)
                return NoContent();

            return Ok(result);
        }

        /// <summary>
        /// Termék létrehozása
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PostProduct([FromBody] PostProductRequest request, CancellationToken cToken)
        {
            if (await _context.Products.AnyAsync(p => p.ProductId == request.productId, cToken))
                return BadRequest(new GenericResponseDTO("Products", "POST", "Product already exists", null));

            var product = new Product
            {
                ProductId = request.productId,
                ProductType = request.productType,
                Name = request.name,
                Brand = request.brand,
                PurchasePrice = request.purchasePrice,
                SellingPrice = request.sellingPrice,
                StockQuantity = request.stockQuantity,
                Description = request.description
            };

            await _context.Products.AddAsync(product, cToken);
            await _context.SaveChangesAsync(cToken);

            return Ok();
        }

        /// <summary>
        /// Termék frissítése
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> PutProduct([FromBody] UpdateProductRequest request, CancellationToken cToken)
        {
            var product = await _context.Products
                .Include(p => p.Categories)
                .FirstOrDefaultAsync(p => p.ProductId == request.productId, cToken);

            if (product == null)
                return NotFound();

            await using var transaction = await _context.Database.BeginTransactionAsync(cToken);
            try
            {
                product.Name = request.name;
                product.SellingPrice = request.sellingPrice;
                product.Brand = request.brand;
                product.PurchasePrice = request.purchasePrice;
                product.StockQuantity = request.stockQuantity ?? product.StockQuantity;
                product.Description = request.description;

                var existingCategoryIds = product.Categories.Select(c => c.CategoryId).ToList();
                var incomingCategoryIds = request.categoryAssignments ?? new int[0];

                var categoriesToRemove = product.Categories
                    .Where(pc => !incomingCategoryIds.Contains(pc.CategoryId))
                    .ToList();

                foreach (var category in categoriesToRemove)
                {
                    product.Categories.Remove(category);
                }

                var categoriesToAdd = incomingCategoryIds
                    .Where(id => !existingCategoryIds.Contains(id))
                    .ToList();

                if (categoriesToAdd.Any())
                {
                    var categories = await _context.ProductCategories
                        .Where(c => categoriesToAdd.Contains(c.CategoryId))
                        .ToListAsync(cToken);

                    foreach (var category in categories)
                    {
                        product.Categories.Add(category);
                    }
                }

                await _context.SaveChangesAsync(cToken);
                await _context.Database.ExecuteSqlInterpolatedAsync(
                    $"EXEC AssignProductToCategory {product.ProductId}", cToken);
                await transaction.CommitAsync(cToken);

                return Ok();
            } 
            catch (Exception ex)
            {
                await transaction.RollbackAsync(cToken);
                return BadRequest(new GenericResponseDTO("Products", "PUT", ex.Message, null));
            }
        }

        /// <summary>
        /// Termék törlése
        /// </summary>
        [HttpDelete("{productId}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProduct(string productId, CancellationToken cToken)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.ProductId == productId, cToken);

            if (product == null)
                return NotFound();

            if (await _context.OrderItems.AnyAsync(oi => oi.ProductId == productId, cToken))
                return BadRequest(new GenericResponseDTO("Products", "DELETE", "Product is already listed in orders", null));

            try
            {
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Products", "DELETE", ex.Message, null));
            }
        }

        [HttpGet("count")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(typeof(GenericResponseDTO), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> GetProductCount(CancellationToken cancellationToken)
        {
            try
            {
                var count = await _context.Products.CountAsync(cancellationToken);
                if (count == 0)
                    return NoContent();
                return Ok(count);
            }
            catch (Exception ex)
            {
                return BadRequest(new GenericResponseDTO("Products", "GET", ex.Message, null));
            }
        }
    }
}