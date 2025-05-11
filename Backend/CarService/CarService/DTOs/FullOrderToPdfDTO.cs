using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Teljes rendelés
    /// </summary>
    [Serializable]
    public class FullOrderToPdfDTO : OrdersHeaderDTO
    {
        /// <summary>
        /// Ajánlat száma
        /// </summary>
        [StringLength(16)]
        public string? offerNumber { get; set; }

        /// <summary>
        /// Ügyfél megjegyzés
        /// </summary>
        [StringLength(512)]
        public string? offerIssueDescription { get; set; }

        /// <summary>
        /// Jármű adatok
        /// </summary>
        public VehiclesDTO vehicle { get; set; }

        /// <summary>
        /// Tétel adatok
        /// </summary>
        public List<OrderItemDTO>? items { get; set; }

    }
}
