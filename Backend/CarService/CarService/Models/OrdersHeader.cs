using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

[Table("Orders_Header")]
public partial class OrdersHeader
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("customer_id")]
    public Guid CustomerId { get; set; }

    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [Column("order_number")]
    [StringLength(16)]
    public string? OrderNumber { get; set; }

    [Column("offer_id")]
    public int? OfferId { get; set; }

    [Column("agent_id")]
    public Guid? AgentId { get; set; }

    [Column("mechanic_id")]
    public Guid? MechanicId { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    [Column("comment")]
    [StringLength(255)]
    public string? Comment { get; set; }

    [Column("net_amount")]
    public double NetAmount { get; set; }

    [Column("gross_amount")]
    public double GrossAmount { get; set; }

    [Column("order_date", TypeName = "datetime")]
    public DateTime? OrderDate { get; set; }

    [ForeignKey("AgentId")]
    [InverseProperty("OrdersHeaderAgents")]
    public virtual User? Agent { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("OrdersHeaderCustomers")]
    public virtual User Customer { get; set; } = null!;

    [ForeignKey("MechanicId")]
    [InverseProperty("OrdersHeaderMechanics")]
    public virtual User? Mechanic { get; set; }

    [ForeignKey("OfferId")]
    [InverseProperty("OrdersHeaders")]
    public virtual Offer? Offer { get; set; }

    [InverseProperty("Order")]
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [ForeignKey("StatusId")]
    [InverseProperty("OrdersHeaders")]
    public virtual Status Status { get; set; } = null!;

    [ForeignKey("VehicleId")]
    [InverseProperty("OrdersHeaders")]
    public virtual Vehicle Vehicle { get; set; } = null!;
}
