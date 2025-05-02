using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs;

/// <summary>
/// Megrendelések (rendelés fejléc) adatai
/// </summary>
[Serializable]
public class OrdersHeaderDTO
{
    [Display(Name = "Rendelés azonosító")]
    [Required]
    public int id { get; set; }

    [Display(Name = "Ügyfél azonosító")]
    [Required]
    public Guid customerId { get; set; }

    [Display(Name = "Jármű azonosító")]
    [Required]
    public int vehicleId { get; set; }

    [Display(Name = "Rendelésszám")]
    [StringLength(16)]
    public string? orderNumber { get; set; }

    [Display(Name = "Ajánlat azonosító")]
    public int? offerId { get; set; }

    [Display(Name = "Ügyintéző azonosító")]
    public Guid? agentId { get; set; }

    [Display(Name = "Szerelő azonosító")]
    public Guid? mechanicId { get; set; }

    [Display(Name = "Státusz azonosító")]
    [Required]
    public int statusId { get; set; }

    [Display(Name = "Megjegyzés")]
    [StringLength(255)]
    public string? comment { get; set; }

    [Display(Name = "Nettó összeg")]
    [Required]
    public double netAmount { get; set; }

    [Display(Name = "Bruttó összeg")]
    [Required]
    public double grossAmount { get; set; }

    [Display(Name = "Rendelés dátuma")]
    public DateTime? orderDate { get; set; }

    [Display(Name = "Státusz név")]
    public string? statusName { get; set; }
}

/// <summary>
/// Megrendelés rögzítés
/// </summary>
[Serializable]
public class PostOrdersHeaderRequest
{
    [Required]
    public Guid customerId { get; set; }

    [Required]
    public int vehicleId { get; set; }

    [StringLength(16)]
    public string? orderNumber { get; set; }

    public int? offerId { get; set; }

    public Guid? agentId { get; set; }

    public Guid? mechanicId { get; set; }

    [Required]
    public int statusId { get; set; }

    [StringLength(255)]
    public string? comment { get; set; }

    [Required]
    public double netAmount { get; set; }

    [Required]
    public double grossAmount { get; set; }

    public DateTime? orderDate { get; set; }
}

/// <summary>
/// Megrendelés módosítása
/// </summary>
[Serializable]
public class UpdateOrdersHeaderRequest
{
    [Required]
    public int id { get; set; }

    public Guid? customerId { get; set; }

    public int? vehicleId { get; set; }

    [StringLength(16)]
    public string? orderNumber { get; set; }

    public int? offerId { get; set; }

    public Guid? agentId { get; set; }

    public Guid? mechanicId { get; set; }

    public int? statusId { get; set; }

    [StringLength(255)]
    public string? comment { get; set; }

    public double? netAmount { get; set; }

    public double? grossAmount { get; set; }

    public DateTime? orderDate { get; set; }
}
