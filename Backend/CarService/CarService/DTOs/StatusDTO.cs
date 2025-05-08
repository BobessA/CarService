using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Státuszok
    /// </summary>
    [Serializable]
    public class StatusDTO
    {
        /// <summary>
        /// Azonosító
        /// </summary>
        /// <example>1</example>
        [Display(Name = "Azonosító")]
        public int id {  get; set; }

        /// <summary>
        /// Megnevezés
        /// </summary>
        /// <example>Beérkezett</example>
        [Display(Name = "Megnevezés")]
        public string name { get; set; }

        /// <summary>
        /// Leírás
        /// </summary>
        /// <example>Beérkezett ajánlatok, rendelések</example>
        [Display(Name = "Leírás")]
        public string? description { get; set; }
    }
}
