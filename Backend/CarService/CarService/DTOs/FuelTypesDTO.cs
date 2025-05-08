using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Üzemanyag
    /// </summary>
    [Serializable]
    public class FuelTypesDTO
    {
        /// <summary>
        /// Azonosító
        /// </summary>
        /// <example>1</example>
        [Display(Name = "Azonosító")]
        public int id { get; set; }

        /// <summary>
        /// Megnevezés
        /// </summary>
        /// <example>Beérkezett</example>
        [Display(Name = "Megnevezés")]
        public string name { get; set; }
    }
}
