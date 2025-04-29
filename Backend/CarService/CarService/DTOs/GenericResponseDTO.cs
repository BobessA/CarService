using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.ComponentModel.DataAnnotations;

namespace CarService.DTOs
{
    /// <summary>
    /// Általános válasz főleg hibákhoz
    /// </summary>
    [Serializable]
    public class GenericResponseDTO
    {
        /// <summary>
        /// Végpont
        /// </summary>
        /// <example>Vehicles</example>
        [Display(Name = "Végpont")]
        [Required]
        public string endpoint {  get; set; }

        /// <summary>
        /// Metódus
        /// </summary>
        /// <example>GET</example>
        [Display(Name = "Metódus")]
        [Required]
        public string method { get; set; }

        /// <summary>
        /// Hibaüzenet
        /// </summary>
        /// <example></example>
        [Display(Name = "Hibaüzenet")]
        public string? errorMessage { get; set; }

        /// <summary>
        /// Válasz (nem hiba esetén)
        /// </summary>
        /// <example></example>
        [Display(Name = "Válasz")]
        public string? resultMessage { get; set; }

        public GenericResponseDTO(string endpoint, string method, string? errorMessage, string? resultMessage)
        {
            this.endpoint = endpoint;
            this.method = method;
            this.errorMessage = errorMessage ?? string.Empty;
            this.resultMessage = resultMessage ?? string.Empty;
        }
    }
}
