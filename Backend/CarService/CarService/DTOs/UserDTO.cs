using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Felhasználók
    /// </summary>
    [Serializable]
    public class UserDTO
    {
        /// <summary>
        /// Felhasználó azonosító
        /// </summary>
        /// <example>C9F42F84-7D61-4443-87F0-D297666FEE02</example>
        [Required]
        [Display(Name = "Felhasználó azonosító")]
        public Guid userId { get; set; }

        /// <summary>
        /// E-mail cím
        /// </summary>
        /// <example>teszt@teszt.hu</example>
        [Required]
        [Display(Name = "E-mail cím")]
        [StringLength(128)]
        public string email { get; set; }

        /// <summary>
        /// Személynév
        /// </summary>
        /// <example>Nagy István</example>
        [Required]
        [Display(Name = "Személynév")]
        [StringLength(128)]
        public string name { get; set; }

        /// <summary>
        /// Telefonszám
        /// </summary>
        /// <example>069066666666</example>
        [Display(Name = "Telefonszám")]
        [StringLength(64)]
        public string? phone { get; set; }

        /// <summary>
        /// Jogosultság
        /// </summary>
        /// <example>3</example>
        [Display(Name = "Jogosultság")]
        public int? roleId { get; set; }

        /// <summary>
        /// Állandó kedvezmény százalék
        /// </summary>
        /// <example>10</example>
        [Required]
        [Display(Name = "Állandó kedvezmény százalék")]
        public short? discount { get; set; }
    }

    /// <summary>
    /// Regisztráció
    /// </summary>
    [Serializable]
    public class RegistrationRequest
    {
        /// <summary>
        /// E-mail cím
        /// </summary>
        /// <example>teszt@teszt.hu</example>
        [Required]
        [Display(Name = "E-mail cím")]
        [StringLength(128)]
        public string email { get; set; }

        /// <summary>
        /// Jelszó
        /// </summary>
        /// <example>admin1234</example>
        [Required]
        [Display(Name = "Jelszó")]
        public string password { get; set; }

        /// <summary>
        /// Személynév
        /// </summary>
        /// <example>Nagy István</example>
        [Required]
        [Display(Name = "Személynév")]
        [StringLength(128)]
        public string name { get; set; }

        /// <summary>
        /// Telefonszám
        /// </summary>
        /// <example>069066666666</example>
        [Display(Name = "Telefonszám")]
        [StringLength(64)]
        public string? phone { get; set; }

        /// <summary>
        /// Jogosultság
        /// </summary>
        /// <example>3</example>
        [Display(Name = "Jogosultság")]
        public int? roleId { get; set; }

    }

    /// <summary>
    /// Bejelentkezés
    /// </summary>
    [Serializable]
    public class LoginResponse
    {
        /// <summary>
        /// Felhasználó azonosító
        /// </summary>
        /// <example>C9F42F84-7D61-4443-87F0-D297666FEE02</example>
        [Required]
        [Display(Name = "Felhasználó azonosító")]
        public Guid userId { get; set; }

        /// <summary>
        /// Jogosultság
        /// </summary>
        /// <example>3</example>
        [Required]
        [Display(Name = "Jogosultság")]
        public int roleId { get; set; }

        /// <summary>
        /// Személynév
        /// </summary>
        /// <example>Nagy István</example>
        [Required]
        [Display(Name = "Személynév")]
        [StringLength(128)]
        public string name { get; set; }

        /// <summary>
        /// E-mail cím
        /// </summary>
        /// <example>teszt@teszt.hu</example>
        [Required]
        [Display(Name = "E-mail cím")]
        [StringLength(128)]
        public string email { get; set; }

        /// <summary>
        /// Telefonszám
        /// </summary>
        /// <example>069066666666</example>
        [Display(Name = "Telefonszám")]
        [StringLength(64)]
        public string? phone { get; set; }

        /// <summary>
        /// Állandó kedvezmény százalék
        /// </summary>
        /// <example>10</example>
        [Required]
        [Display(Name = "Állandó kedvezmény százalék")]
        public short? discount { get; set; }
    }

    /// <summary>
    /// Felhasználó adatok módosítása
    /// </summary>
    [Serializable]
    public class UpdateUserRequest
    {
        /// <summary>
        /// Felhasználó azonosító
        /// </summary>
        /// <example>C9F42F84-7D61-4443-87F0-D297666FEE02</example>
        [Required]
        [Display(Name = "Felhasználó azonosító")]
        public Guid userId { get; set; }

        /// <summary>
        /// Személynév
        /// </summary>
        /// <example>Nagy István</example>
        [Required]
        [Display(Name = "Személynév")]
        [StringLength(128)]
        public string name { get; set; }

        /// <summary>
        /// Telefonszám
        /// </summary>
        /// <example>069066666666</example>
        [Display(Name = "Telefonszám")]
        [StringLength(64)]
        public string? phone { get; set; }

        /// <summary>
        /// Jogosultság
        /// </summary>
        /// <example>3</example>
        [Display(Name = "Jogosultság")]
        public int? roleId { get; set; }

        /// <summary>
        /// Állandó kedvezmény százalék
        /// </summary>
        /// <example>10</example>
        [Required]
        [Display(Name = "Állandó kedvezmény százalék")]
        public short? discount { get; set; }
    }

    /// <summary>
    /// Felhasználó rögzítése regisztráció nélkül
    /// </summary>
    [Serializable]
    public class PostUserRequest
    {
        /// <summary>
        /// E-mail cím
        /// </summary>
        /// <example>teszt@teszt.hu</example>
        [Required]
        [Display(Name = "E-mail cím")]
        [StringLength(128)]
        public string email { get; set; }

        /// <summary>
        /// Személynév
        /// </summary>
        /// <example>Nagy István</example>
        [Required]
        [Display(Name = "Személynév")]
        [StringLength(128)]
        public string name { get; set; }

        /// <summary>
        /// Telefonszám
        /// </summary>
        /// <example>069066666666</example>
        [Display(Name = "Telefonszám")]
        [StringLength(64)]
        public string? phone { get; set; }

        /// <summary>
        /// Állandó kedvezmény százalék
        /// </summary>
        /// <example>10</example>
        [Required]
        [Display(Name = "Állandó kedvezmény százalék")]
        public short? discount { get; set; }

        /// <summary>
        /// Jogosultság
        /// </summary>
        /// <example>3</example>
        [Display(Name = "Jogosultság")]
        public int? roleId { get; set; }
    }
}
