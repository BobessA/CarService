using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Table("Product_Categories")]
public partial class ProductCategory
{
    [Key]
    [Column("category_id")]
    public int CategoryId { get; set; }

    [Column("category_name")]
    [StringLength(128)]
    public string CategoryName { get; set; } = null!;

    [Column("parent_id")]
    public int? ParentId { get; set; }

    [InverseProperty("Parent")]
    public virtual ICollection<ProductCategory> InverseParent { get; set; } = new List<ProductCategory>();

    [ForeignKey("ParentId")]
    [InverseProperty("InverseParent")]
    public virtual ProductCategory? Parent { get; set; }

    [ForeignKey("CategoryId")]
    [InverseProperty("Categories")]
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
