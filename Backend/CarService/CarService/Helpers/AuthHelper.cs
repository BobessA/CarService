using System.Security.Cryptography;
using System.Text;

namespace CarService.Helpers
{
    public static class AuthHelper
    {
        private const string salt = "jajjDeB1zt0nsag0sakVAgyunk";

        public static string HashPassword(string password)
        {
            string saltedPassword = salt + password;

            using (var sha256 = SHA256.Create())
            {
                byte[] bytes = Encoding.UTF8.GetBytes(saltedPassword);
                byte[] hash = sha256.ComputeHash(bytes);

                return Convert.ToBase64String(hash);
            }
        }

        public static bool VerifyPassword(string password, string storedHash)
        {
            string hashOfInput = HashPassword(password);
            return hashOfInput == storedHash;
        }

        /// <summary>
        /// Jogosultságok
        /// </summary>
        public enum UserRole
        {
            Mechanic = 1,
            Owner = 2,
            Customer = 3,
            Admin = 4,
        }
    }
}
