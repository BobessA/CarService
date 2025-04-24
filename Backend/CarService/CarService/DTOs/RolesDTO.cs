using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Jogosultságok
    /// </summary>
    [Serializable]
    public class RolesDTO
    {
        /// <summary>
        /// Azonosító
        /// </summary>
        /// <example>1</example>
        [Required]
        [Display(Name = "Azonosító")]
        public int id { get; set; }

        /// <summary>
        /// Megnevezés
        /// </summary>
        /// <example>Szerelő</example>
        [Display(Name = "Megnevezés")]
        [StringLength(32)]
        public string name { get; set; }
    }
}
