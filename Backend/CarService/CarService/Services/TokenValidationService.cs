using CarService.Models;
using Microsoft.EntityFrameworkCore;

namespace CarService.Services
{
    public class TokenValidationService
    {
        private readonly CarServiceContext _context;

        // Konstruktorban injektáljuk a CarServiceContext-et
        public TokenValidationService(CarServiceContext context)
        {
            _context = context;
        }

        public async Task<bool> IsValidTokenAsync(string token)
        {
            if (!Guid.TryParse(token, out var parsedToken))
            {
                return false;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == parsedToken);
            return user != null;
        }
    }
}
