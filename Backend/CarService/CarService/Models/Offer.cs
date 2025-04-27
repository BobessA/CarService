using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

public partial class Offer
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("offer_number")]
    [StringLength(16)]
    public string? OfferNumber { get; set; }

    [Column("customer_id")]
    public Guid CustomerId { get; set; }

    [Column("vehicle_id")]
    public int VehicleId { get; set; }

    [Column("request_date", TypeName = "datetime")]
    public DateTime RequestDate { get; set; }

    [Column("issue_description")]
    [StringLength(512)]
    public string? IssueDescription { get; set; }

    [Column("status_id")]
    public int StatusId { get; set; }

    [Column("agent_id")]
    public Guid? AgentId { get; set; }

    [Column("appointment_date", TypeName = "datetime")]
    public DateTime? AppointmentDate { get; set; }

    [Column("admin_comment")]
    [StringLength(512)]
    public string? AdminComment { get; set; }

    [ForeignKey("CustomerId")]
    [InverseProperty("Offers")]
    public virtual User Customer { get; set; } = null!;

    [InverseProperty("Offer")]
    public virtual ICollection<OrdersHeader> OrdersHeaders { get; set; } = new List<OrdersHeader>();

    [ForeignKey("StatusId")]
    [InverseProperty("Offers")]
    public virtual Status Status { get; set; } = null!;

    [ForeignKey("VehicleId")]
    [InverseProperty("Offers")]
    public virtual Vehicle Vehicle { get; set; } = null!;
}
