using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarService.Models;

[Table("Offer_Images")]
public class OfferImage
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("offer_id")]
    public int OfferId { get; set; }

    [Column("image_path")]
    public string ImagePath { get; set; } = string.Empty;

    public virtual Offer Offer { get; set; } = null!;
}
