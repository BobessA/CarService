using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Table("Order_Items")]
public partial class OrderItem
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("order_id")]
    public int OrderId { get; set; }

    [Column("product_id")]
    [StringLength(32)]
    public string ProductId { get; set; } = null!;

    [Column("quantity")]
    public double Quantity { get; set; }

    [Column("unit_price")]
    public double UnitPrice { get; set; }

    [Column("net_amount")]
    public double NetAmount { get; set; }

    [Column("gross_amount")]
    public double GrossAmount { get; set; }

    [Column("comment")]
    [StringLength(255)]
    public string? Comment { get; set; }

    [ForeignKey("OrderId")]
    [InverseProperty("OrderItems")]
    public virtual OrdersHeader Order { get; set; } = null!;

    [ForeignKey("ProductId")]
    [InverseProperty("OrderItems")]
    public virtual Product Product { get; set; } = null!;
}
