using System;
using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    public class SupplierOrderDTO
    {
        public int Id { get; set; }
        public string ProductId { get; set; } = default!;
        public Guid? AgentId { get; set; }
        public double Quantity { get; set; }
        public DateTime OrderedDate { get; set; }
        public int StatusId { get; set; }
    }

    public class PostSupplierOrderRequest
    {
        [Required, StringLength(32)]
        public string ProductId { get; set; } = default!;

        [Required, Range(0.0001, double.MaxValue)]
        public double Quantity { get; set; }
    }

    public class UpdateSupplierOrderRequest
    {
        [Required]
        public int Id { get; set; }
        public double? Quantity { get; set; }
        public int? StatusId { get; set; }
        public DateTime? OrderedDate { get; set; }
    }
}