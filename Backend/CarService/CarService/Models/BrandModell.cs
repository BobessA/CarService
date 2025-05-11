using System;
using System.Collections.Generic;

namespace CarService.Models;

public partial class BrandModell
{
    public int Id { get; set; }

    public int BrandId { get; set; }

    public string? ModellName { get; set; }

    public virtual VehicleBrand Brand { get; set; } = null!;
}
