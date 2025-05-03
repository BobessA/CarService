using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Termékek kategóriája
    /// </summary>
    [Serializable]
    public class ProductCategoryAssignmentsDTO
    {
        /// <summary>
        /// Termák azonosító
        /// </summary>
        /// <example>ABC123</example>
        [Display(Name = "Cikkszám")]
        [Required]
        [StringLength(32)]
        public string productId { get; set; }

        /// <summary>
        /// Termék kategória
        /// </summary>
        /// <example>2</example>
        [Display(Name = "Cikkszám")]
        [Required]
        public int categoryId { get; set; }
    }
}
