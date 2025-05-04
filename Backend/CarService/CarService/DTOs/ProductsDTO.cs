using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Termékek
    /// </summary>
    [Serializable]
    public class ProductsDTO
    {
        /// <summary>
        /// Termék azonosító
        /// </summary>
        /// <example>ABC123</example>
        [Display(Name = "Termék azonosító")]
        [Required]
        public string productId { get; set; } = null!;

        /// <summary>
        /// Termék típusa
        /// </summary>
        /// <example>R</example>
        [Display(Name = "Termék típusa")]
        [StringLength(1)]
        [Required]
        public string productType { get; set; } = null!;

        /// <summary>
        /// Név
        /// </summary>
        /// <example>Fékbetét</example>
        [Display(Name = "Név")]
        [StringLength(128)]
        [Required]
        public string name { get; set; } = null!;

        /// <summary>
        /// Márka
        /// </summary>
        /// <example>Bosch</example>
        [Display(Name = "Márka")]
        [StringLength(32)]
        public string? brand { get; set; }

        /// <summary>
        /// Beszerzési ár
        /// </summary>
        /// <example>2500</example>
        [Display(Name = "Beszerzési ár")]
        public double? purchasePrice { get; set; }

        /// <summary>
        /// Eladási ár
        /// </summary>
        /// <example>3500</example>
        [Display(Name = "Eladási ár")]
        [Required]
        public double sellingPrice { get; set; }

        /// <summary>
        /// Készlet mennyiség
        /// </summary>
        /// <example>42</example>
        [Display(Name = "Készlet mennyiség")]
        public double? stockQuantity { get; set; }

        /// <summary>
        /// Leírás
        /// </summary>
        /// <example>Első tengelyre való prémium fékbetét</example>
        [Display(Name = "Leírás")]
        [StringLength(512)]
        public string? description { get; set; }
    }

    /// <summary>
    /// Termék rögzítés
    /// </summary>
    [Serializable]
    public class PostProductRequest
    {
        [Required]
        public string productId { get; set; } = null!;
        [Required]
        public string productType { get; set; } = null!;
        [Required]
        public string name { get; set; } = null!;
        public string? brand { get; set; }
        public double? purchasePrice { get; set; }
        [Required]
        public double sellingPrice { get; set; }
        public double? stockQuantity { get; set; }
        public string? description { get; set; }
    }

    /// <summary>
    /// Termék frissítés
    /// </summary>
    [Serializable]
    public class UpdateProductRequest
    {
        /// <summary>
        /// Cikkszám
        /// </summary>
        [Required]
        public string productId { get; set; } = null!;

        /// <summary>
        /// Megnevezés
        /// </summary>
        [Required]
        public string name { get; set; } = null!;
        
        /// <summary>
        /// Gyártó
        /// </summary>
        public string? brand { get; set; }

        /// <summary>
        /// Beszerzési ár
        /// </summary>
        [Required]
        public double purchasePrice { get; set; }

        /// <summary>
        /// Eladási ár
        /// </summary>
        [Required]
        public double sellingPrice { get; set; }
        
        /// <summary>
        /// Készletmennyiség
        /// </summary>
        public double? stockQuantity { get; set; }

        /// <summary>
        /// Leírás
        /// </summary>
        public string? description { get; set; }

        /// <summary>
        /// Termékkategória besorolások
        /// </summary>
        public int[]? categoryAssignments { get; set; }
    }
}
