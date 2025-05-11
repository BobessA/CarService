using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CarService.Models
{
    [Table("Supplier_order_items")]
    public class SupplierOrder
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }                

        [Required]
        [Column("product_id")]
        [StringLength(32)]
        public string ProductId { get; set; } = null!; 

        [Column("agent_id")]
        public Guid? AgentId { get; set; }             

        [Required]
        [Column("quantity")]
        public double Quantity { get; set; }         

        [Required]
        [Column("ordered_date", TypeName = "datetime")]
        public DateTime OrderedDate { get; set; }     

        [Required]
        [Column("status_id")]
        public int StatusId { get; set; }             

        [ForeignKey("AgentId")] public virtual User Agent { get; set; }
        [ForeignKey("ProductId")] public virtual Product Product { get; set; }
        [ForeignKey("StatusId")]  public virtual Status Status  { get; set; }
    }
}