using CarService.Helpers;
using CarService.Models;
using CarService.Services;
using Microsoft.EntityFrameworkCore;

namespace CarService.Middlewares
{
    public class AuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;
        //Adding a variable that contains paths where the site doesn't check for a token
        private readonly string[] _exemptedPaths = new[]
{
            "/registration",
            "/login",
            "/swagger",
            "/favicon.ico"
        };

        public AuthenticationMiddleware(RequestDelegate next, IServiceProvider serviceProvider)
        {
            _next = next;
            _serviceProvider = serviceProvider;
        }

        public async Task Invoke(HttpContext context)
        {
            //First, we check if the requested path is in the exempted list,
            //and proceed with the request without token authentication if so.
            if (ShouldExemptFromAuth(context.Request.Path))
            {
                await _next(context);
                return;
            }

            var path = context.Request.Path.ToString().ToLower();
            if (path.EndsWith("/registration") || path.EndsWith("/login"))
            {
                await _next(context);
            }

            var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

            if (string.IsNullOrEmpty(token))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsync("Invalid token.");
                return;
            }

            using (var scope = _serviceProvider.CreateScope())
            {
                var tokenValidationService = scope.ServiceProvider.GetRequiredService<TokenValidationService>();

                if (!await tokenValidationService.IsValidTokenAsync(token))
                {
                    context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                    await context.Response.WriteAsync("Invalid token.");
                    return;
                }
            }

            await _next(context);
        }

        private bool ShouldExemptFromAuth(PathString path)
        {
            var pathString = path.ToString().ToLower();
            return _exemptedPaths.Any(exempted =>
                pathString.StartsWith(exempted) ||
                pathString.EndsWith(exempted));
        }

    }


}
