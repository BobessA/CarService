using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Index("Vin", Name = "UQ__Vehicles__DDB00C66D73EF848", IsUnique = true)]
[Index("LicensePlate", Name = "UQ__Vehicles__F72CD56EDA39B352", IsUnique = true)]
public partial class Vehicle
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("owner_id")]
    public Guid OwnerId { get; set; }

    [Column("license_plate")]
    [StringLength(10)]
    public string LicensePlate { get; set; } = null!;

    [Column("brand")]
    [StringLength(32)]
    public string Brand { get; set; } = null!;

    [Column("model")]
    [StringLength(32)]
    public string Model { get; set; } = null!;

    [Column("year_of_manufacture")]
    public short YearOfManufacture { get; set; }

    [Column("vin")]
    [StringLength(17)]
    public string Vin { get; set; } = null!;

    [Column("engine_code")]
    [StringLength(20)]
    public string? EngineCode { get; set; }

    [Column("odometer")]
    public int? Odometer { get; set; }

    [Column("fuel_type_id")]
    public int FuelTypeId { get; set; }

    [ForeignKey("FuelTypeId")]
    [InverseProperty("Vehicles")]
    public virtual FuelType FuelType { get; set; } = null!;

    [InverseProperty("Vehicle")]
    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();

    [InverseProperty("Vehicle")]
    public virtual ICollection<OrdersHeader> OrdersHeaders { get; set; } = new List<OrdersHeader>();

    [ForeignKey("OwnerId")]
    [InverseProperty("Vehicles")]
    public virtual User Owner { get; set; } = null!;
}
