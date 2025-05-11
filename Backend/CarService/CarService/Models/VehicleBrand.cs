using System;
using System.Collections.Generic;

namespace CarService.Models;

public partial class VehicleBrand
{
    public int Id { get; set; }

    public string Brand { get; set; } = null!;

    public virtual ICollection<BrandModell> BrandModells { get; set; } = new List<BrandModell>();
}
