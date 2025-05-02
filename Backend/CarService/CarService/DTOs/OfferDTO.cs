using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs;

/// <summary>
/// Ajánlat adatai
/// </summary>
[Serializable]
public class OfferDTO
{
    [Required]
    public int id { get; set; }

    [StringLength(16)]
    public string? offerNumber { get; set; }

    [Required]
    public Guid customerId { get; set; }

    [Required]
    public int vehicleId { get; set; }

    [Required]
    public DateTime requestDate { get; set; }

    [StringLength(512)]
    public string? issueDescription { get; set; }

    [Required]
    public int statusId { get; set; }

    public Guid? agentId { get; set; }

    public DateTime? appointmentDate { get; set; }

    [StringLength(512)]
    public string? adminComment { get; set; }

    // Opcionálisan status név
    public string? statusName { get; set; }
}

/// <summary>
/// Új ajánlat rögzítése
/// </summary>
[Serializable]
public class PostOfferRequest
{
    [Required]
    public Guid customerId { get; set; }

    [Required]
    public int vehicleId { get; set; }

    [Required]
    public DateTime requestDate { get; set; }

    [StringLength(512)]
    public string? issueDescription { get; set; }

    [Required]
    public int statusId { get; set; }

    public Guid? agentId { get; set; }

    public DateTime? appointmentDate { get; set; }

    [StringLength(512)]
    public string? adminComment { get; set; }
}

/// <summary>
/// Ajánlat módosítása
/// </summary>
[Serializable]
public class UpdateOfferRequest
{
    [Required]
    public int id { get; set; }

    public int? statusId { get; set; }
    public Guid? agentId { get; set; }
    public DateTime? appointmentDate { get; set; }
    public string? adminComment { get; set; }
}
