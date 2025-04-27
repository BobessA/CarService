using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

public partial class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Column("name")]
    [StringLength(128)]
    public string Name { get; set; } = null!;

    [Column("password_hash")]
    [StringLength(255)]
    public string? PasswordHash { get; set; }

    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("discount")]
    public short? Discount { get; set; }

    [Column("email")]
    [StringLength(128)]
    public string Email { get; set; } = null!;

    [Column("phone")]
    [StringLength(64)]
    public string? Phone { get; set; }

    [InverseProperty("Customer")]
    public virtual ICollection<Offer> Offers { get; set; } = new List<Offer>();

    [InverseProperty("Agent")]
    public virtual ICollection<OrdersHeader> OrdersHeaderAgents { get; set; } = new List<OrdersHeader>();

    [InverseProperty("Customer")]
    public virtual ICollection<OrdersHeader> OrdersHeaderCustomers { get; set; } = new List<OrdersHeader>();

    [InverseProperty("Mechanic")]
    public virtual ICollection<OrdersHeader> OrdersHeaderMechanics { get; set; } = new List<OrdersHeader>();

    [ForeignKey("RoleId")]
    [InverseProperty("Users")]
    public virtual Role Role { get; set; } = null!;

    [InverseProperty("Owner")]
    public virtual ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
}
