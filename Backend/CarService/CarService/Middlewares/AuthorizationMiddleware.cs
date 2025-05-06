using CarService.Attributes;
using System.Security.Claims;

namespace CarService.Middlewares
{
    public class AuthorizationMiddleware
    {
        private readonly RequestDelegate _next;
        public AuthorizationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context) 
        {
            var endpoint = context.GetEndpoint();
            var authorizeAttributes = endpoint?.Metadata.GetOrderedMetadata<AuthorizeRoleAttribute>();

            if (authorizeAttributes?.Any() == true)
            {
                var userRole = context.User.FindFirst(ClaimTypes.Role)?.Value;

                if (userRole == null ||
                !authorizeAttributes.Any(attr =>
                    attr.Roles.Any(role =>
                        int.TryParse(userRole, out int userRoleId) &&
                        (int)role == userRoleId)))
                {
                    context.Response.StatusCode = 403;
                    return;
                }
            }

            await _next(context);
        }
    }
}
