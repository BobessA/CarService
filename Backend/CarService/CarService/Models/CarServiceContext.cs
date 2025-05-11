using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace CarService.Models;

public partial class CarServiceContext : DbContext
{
    public CarServiceContext()
    {
    }

    public CarServiceContext(DbContextOptions<CarServiceContext> options)
        : base(options)
    {
    }

    public virtual DbSet<FuelType> FuelTypes { get; set; }

    public virtual DbSet<Offer> Offers { get; set; }

    public virtual DbSet<OrderItem> OrderItems { get; set; }

    public virtual DbSet<OrdersHeader> OrdersHeaders { get; set; }

    public virtual DbSet<Product> Products { get; set; }

    public virtual DbSet<ProductCategory> ProductCategories { get; set; }

    public virtual DbSet<ProductCategoryTree> ProductCategoryTrees { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Status> Statuses { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Vehicle> Vehicles { get; set; }

    public virtual DbSet<OfferImage> OfferImages { get; set; }
    public virtual DbSet<SupplierOrder> SupplierOrders { get; set; }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FuelType>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Fuel_Typ__3213E83FFFD4D3ED");
        });

        modelBuilder.Entity<Offer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Offers__3213E83F4ED2981A");

            entity.ToTable(tb => tb.HasTrigger("trg_offer_number"));

            entity.Property(e => e.RequestDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Customer).WithMany(p => p.Offers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Offer_Customer");

            entity.HasOne(d => d.Status).WithMany(p => p.Offers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Offer_Status");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.Offers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Offer_Vehicle");
        });

        modelBuilder.Entity<OrderItem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Order_It__3213E83F00F9B3CF");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderI_Order");

            entity.HasOne(d => d.Product).WithMany(p => p.OrderItems)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderI_Product");
        });

        modelBuilder.Entity<OrdersHeader>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Orders_H__3213E83F3D5B309D");

            entity.ToTable("Orders_Header", tb => tb.HasTrigger("TRG_order_number"));

            entity.Property(e => e.OrderDate).HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Agent).WithMany(p => p.OrdersHeaderAgents).HasConstraintName("FK_OrderH_Agent");

            entity.HasOne(d => d.Customer).WithMany(p => p.OrdersHeaderCustomers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderH_Customer");

            entity.HasOne(d => d.Mechanic).WithMany(p => p.OrdersHeaderMechanics).HasConstraintName("FK_OrderH_Mechanic");

            entity.HasOne(d => d.Offer).WithMany(p => p.OrdersHeaders).HasConstraintName("FK_OrderH_Offer");

            entity.HasOne(d => d.Status).WithMany(p => p.OrdersHeaders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderH_Status");

            entity.HasOne(d => d.Vehicle).WithMany(p => p.OrdersHeaders)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_OrderH_Vehicle");
        });

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.ProductId).HasName("PK__Products__47027DF5DA3A3EB6");

            entity.Property(e => e.ProductType).IsFixedLength();

            entity.HasMany(d => d.Categories).WithMany(p => p.Products)
                .UsingEntity<Dictionary<string, object>>(
                    "ProductCategoryAssignment",
                    r => r.HasOne<ProductCategory>().WithMany()
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("FK_ProductCA_Category"),
                    l => l.HasOne<Product>().WithMany()
                        .HasForeignKey("ProductId")
                        .HasConstraintName("FK_ProductCA_Product"),
                    j =>
                    {
                        j.HasKey("ProductId", "CategoryId").HasName("PK__Product___1A56936E5FF27341");
                        j.ToTable("Product_Category_Assignments");
                        j.IndexerProperty<string>("ProductId")
                            .HasMaxLength(32)
                            .HasColumnName("product_id");
                        j.IndexerProperty<int>("CategoryId").HasColumnName("category_id");
                    });
        });

        modelBuilder.Entity<ProductCategory>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PK__Product___D54EE9B48E2EFA5E");

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent).HasConstraintName("FK_ProductC_Parent");
        });

        modelBuilder.Entity<ProductCategoryTree>(entity =>
        {
            entity.ToView("Product_Category_Tree");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Roles__3213E83F22301ABC");
        });

        modelBuilder.Entity<Status>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Statuses__3213E83F7C2304A7");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Users__3213E83F96BB8AAE");

            entity.Property(e => e.Id).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Discount).HasDefaultValue((short)0);

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_User_Role");
        });

        modelBuilder.Entity<Vehicle>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Vehicles__3213E83F0D54A203");

            entity.HasOne(d => d.FuelType).WithMany(p => p.Vehicles)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Vehicle_Fuel");

            entity.HasOne(d => d.Owner).WithMany(p => p.Vehicles).HasConstraintName("FK_Vehicle_Owner");
        });
        modelBuilder.HasSequence("Offer_Sequence")
            .HasMin(0L)
            .HasMax(2147483647L);
        modelBuilder.HasSequence("Order_Sequence")
            .HasMin(0L)
            .HasMax(2147483647L);

        OnModelCreatingPartial(modelBuilder);

        modelBuilder.Entity<OfferImage>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Offer_Images");

            entity.Property(e => e.ImagePath)
                .IsRequired()
                .HasMaxLength(256);

            entity.HasOne(e => e.Offer)
                .WithMany(o => o.OfferImages)
                .HasForeignKey(e => e.OfferId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("FK_OfferImages_Offer");
        });
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
