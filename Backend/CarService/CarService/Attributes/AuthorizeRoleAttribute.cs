using static CarService.Helpers.AuthHelper;

namespace CarService.Attributes
{
    /// <summary>
    /// Jogosultságkezeléshez új attributum
    /// </summary>
    [AttributeUsage(AttributeTargets.Class | AttributeTargets.Method, AllowMultiple = false, Inherited = true)]
    public class AuthorizeRoleAttribute : Attribute
    {
        public UserRole[] Roles { get; }

        public AuthorizeRoleAttribute(params UserRole[] roles)
        {
            Roles = roles;
        }
    }
}
