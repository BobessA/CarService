using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Table("Fuel_Types")]
[Index("Name", Name = "UQ__Fuel_Typ__72E12F1B3EB25B4E", IsUnique = true)]
public partial class FuelType
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("name")]
    [StringLength(32)]
    public string Name { get; set; } = null!;

    [InverseProperty("FuelType")]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
