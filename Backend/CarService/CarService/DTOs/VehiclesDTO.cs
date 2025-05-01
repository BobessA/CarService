using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Járművek
    /// </summary>
    [Serializable]
    public class VehiclesDTO
    {
        /// <summary>
        /// Jármű azonosító
        /// </summary>
        /// <example>1</example>
        [Display(Name = "Jármű azonosító")]
        [Required]
        public int id { get; set; }

        /// <summary>
        /// Ügyfél azonosító
        /// </summary>
        /// <example>561104E8-52E0-4210-B949-CAA54FCCF873</example>
        [Display(Name = "Ügyfél azonosító")]
        [Required]
        public Guid ownerId { get; set; }

        /// <summary>
        /// Rendszám
        /// </summary>
        /// <example>XYZ-001</example>
        [Display(Name = "Rendszám")]
        [StringLength(10)]
        [Required]
        public string licensePlate { get; set; }

        /// <summary>
        /// Gyártó
        /// </summary>
        /// <example>Tesla</example>
        [Display(Name = "Gyártó")]
        [StringLength(32)]
        [Required]
        public string brand {  get; set; }

        /// <summary>
        /// Modell
        /// </summary>
        /// <example>Model 3</example>
        [Display(Name = "Modell")]
        [StringLength(32)]
        [Required]
        public string model { get; set; }

        /// <summary>
        /// Évjárat
        /// </summary>
        /// <example>2020</example>
        [Display(Name = "Évjárat")]
        [Required]
        public short yearOfManufacture { get; set; }

        /// <summary>
        /// Alvázszám
        /// </summary>
        /// <example>xxx73452jhaopskve</example>
        [Display(Name = "Alvázszám")]
        [StringLength(17)]
        [Required]
        public string vin {  get; set; }

        /// <summary>
        /// Motorkód
        /// </summary>
        /// <example>ergbas</example>
        [Display(Name = "Motorkód")]
        [StringLength(20)]
        public string? engineCode { get; set; }

        /// <summary>
        /// Kilóméteróra állás
        /// </summary>
        /// <example>23000</example>
        [Display(Name = "Kilóméteróra állás")]
        public int? odometer { get; set; }

        /// <summary>
        /// Üzemanyag típus
        /// </summary>
        /// <example>3</example>
        [Display(Name = "Üzemanyag típus")]
        [Required]
        public string fuelType { get; set; }
    }

    /// <summary>
    /// Jármű rögzítés
    /// </summary>
    [Serializable]
    public class PostVehicleRequest
    {
        /// <summary>
        /// Ügyfél azonosító
        /// </summary>
        /// <example>561104E8-52E0-4210-B949-CAA54FCCF873</example>
        [Display(Name = "Ügyfél azonosító")]
        [Required]
        public Guid ownerId { get; set; }

        /// <summary>
        /// Rendszám
        /// </summary>
        /// <example>XYZ-001</example>
        [Display(Name = "Rendszám")]
        [StringLength(10)]
        [Required]
        public string licensePlate { get; set; }

        /// <summary>
        /// Gyártó
        /// </summary>
        /// <example>Tesla</example>
        [Display(Name = "Gyártó")]
        [StringLength(32)]
        [Required]
        public string brand { get; set; }

        /// <summary>
        /// Modell
        /// </summary>
        /// <example>Model 3</example>
        [Display(Name = "Modell")]
        [StringLength(32)]
        [Required]
        public string model { get; set; }

        /// <summary>
        /// Évjárat
        /// </summary>
        /// <example>2020</example>
        [Display(Name = "Évjárat")]
        [Required]
        public short yearOfManufacture { get; set; }

        /// <summary>
        /// Alvázszám
        /// </summary>
        /// <example>xxx73452jhaopskve</example>
        [Display(Name = "Alvázszám")]
        [StringLength(17)]
        [Required]
        public string vin { get; set; }

        /// <summary>
        /// Motorkód
        /// </summary>
        /// <example>ergbas</example>
        [Display(Name = "Motorkód")]
        [StringLength(20)]
        public string? engineCode { get; set; }

        /// <summary>
        /// Kilóméteróra állás
        /// </summary>
        /// <example>23000</example>
        [Display(Name = "Kilóméteróra állás")]
        public int? odometer { get; set; }

        /// <summary>
        /// Üzemanyag típus
        /// </summary>
        /// <example>3</example>
        [Display(Name = "Üzemanyag típus")]
        [Required]
        public int fuelType { get; set; }
    }

    /// <summary>
    /// Jármű adatok módosítása
    /// </summary>
    [Serializable]
    public class UpdateVehicleRequest
    {
        /// <summary>
        /// Jármű azonosító
        /// </summary>
        /// <example>1</example>
        [Display(Name = "Jármű azonosító")]
        [Required]
        public int id { get; set; }

        /// <summary>
        /// Ügyfél azonosító
        /// </summary>
        /// <example>561104E8-52E0-4210-B949-CAA54FCCF873</example>
        [Display(Name = "Ügyfél azonosító")]
        public Guid? ownerId { get; set; }

        /// <summary>
        /// Kilóméteróra állás
        /// </summary>
        /// <example>23000</example>
        [Display(Name = "Kilóméteróra állás")]
        public int? odometer { get; set; }

    }

}
