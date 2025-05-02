using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Rendelés tétel
    /// </summary>
    [Serializable]
    public class OrderItemDTO
    {
        /// <summary>
        /// Tétel azonosító
        /// </summary>
        /// <example>1</example>
        [Required]
        public int id { get; set; }

        /// <summary>
        /// Megrendelés azonosító
        /// </summary>
        /// <example>10</example>
        [Required]
        public int orderId { get; set; }

        /// <summary>
        /// Termék azonosító
        /// </summary>
        /// <example>ABC123</example>
        [Required]
        public string productId { get; set; }

        /// <summary>
        /// Mennyiség
        /// </summary>
        /// <example>3</example>
        [Required]
        public double quantity { get; set; }

        /// <summary>
        /// Egységár
        /// </summary>
        /// <example>5000</example>
        [Required]
        public double unitPrice { get; set; }

        /// <summary>
        /// Nettó összeg
        /// </summary>
        /// <example>15000</example>
        [Required]
        public double netAmount { get; set; }

        /// <summary>
        /// Bruttó összeg
        /// </summary>
        /// <example>19050</example>
        [Required]
        public double grossAmount { get; set; }

        /// <summary>
        /// Megjegyzés
        /// </summary>
        /// <example>Garanciális csere</example>
        public string? comment { get; set; }
    }

    /// <summary>
    /// Rendelés tétel létrehozás
    /// </summary>
    [Serializable]
    public class PostOrderItemRequest
    {
        [Required]
        public int orderId { get; set; }

        [Required]
        public string productId { get; set; }

        [Required]
        public double quantity { get; set; }

        [Required]
        public double unitPrice { get; set; }

        [Required]
        public double netAmount { get; set; }

        [Required]
        public double grossAmount { get; set; }

        public string? comment { get; set; }
    }

    /// <summary>
    /// Rendelés tétel módosítás
    /// </summary>
    [Serializable]
    public class UpdateOrderItemRequest
    {
        [Required]
        public int id { get; set; }

        public double? quantity { get; set; }

        public double? unitPrice { get; set; }

        public double? netAmount { get; set; }

        public double? grossAmount { get; set; }

        public string? comment { get; set; }
    }
}
