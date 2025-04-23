using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

public partial class Product
{
    [Key]
    [Column("product_id")]
    [StringLength(32)]
    public string ProductId { get; set; } = null!;

    [Column("product_type")]
    [StringLength(1)]
    [Unicode(false)]
    public string ProductType { get; set; } = null!;

    [Column("name")]
    [StringLength(128)]
    public string Name { get; set; } = null!;

    [Column("brand")]
    [StringLength(32)]
    public string? Brand { get; set; }

    [Column("purchase_price")]
    public double? PurchasePrice { get; set; }

    [Column("selling_price")]
    public double SellingPrice { get; set; }

    [Column("stock_quantity")]
    public double? StockQuantity { get; set; }

    [Column("description")]
    [StringLength(512)]
    public string? Description { get; set; }

    [InverseProperty("Product")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [ForeignKey("ProductId")]
    [InverseProperty("Products")]
    public virtual ICollection<ProductCategory> Categories { get; set; } = new List<ProductCategory>();
}
