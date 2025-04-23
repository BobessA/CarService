using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Index("Name", Name = "UQ__Statuses__72E12F1B1F9C2207", IsUnique = true)]
public partial class Status
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [StringLength(32)]
    public string Name { get; set; } = null!;

    [Column("description")]
    [StringLength(255)]
    public string? Description { get; set; }

    [InverseProperty("Status")]
    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();

    [InverseProperty("Status")]
    public virtual ICollection<OrdersHeader> OrdersHeaders { get; set; } = new List<OrdersHeader>();
}
