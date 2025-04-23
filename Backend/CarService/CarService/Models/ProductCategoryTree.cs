using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Keyless]
public partial class ProductCategoryTree
{
    [Column("category_id")]
    public int? CategoryId { get; set; }

    [Column("category_name")]
    [StringLength(128)]
    public string? CategoryName { get; set; }

    [Column("parent_id")]
    public int? ParentId { get; set; }

    [Column("level")]
    public int? Level { get; set; }
}
