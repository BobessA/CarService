namespace CarService.DTOs
{
    public class StatisticsDTO
    {
        public List<DayCount>? CustomerCounts { get; set; }
        public List<CategoryCount>? Inventory { get; set; }
        public List<CategoryRevenue>? Revenue { get; set; }
    }

    public class DayCount
    {
        public string? Day { get; set; }
        public int Count { get; set; }
    }

    public class CategoryCount
    {
        public string? Category { get; set; }
        public int Quantity { get; set; }
    }

    public class CategoryRevenue
    {
        public string? Category { get; set; }
        public decimal Revenue { get; set; }
    }
}
