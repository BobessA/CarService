import { useEffect, useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router';
import { authGuard } from '../../utils/authGuard';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Car, DollarSign, Package, Wrench, Users, ShoppingCart, TrendingUp } from "lucide-react";
import "chart.js/auto";
import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/apiClient";

export const Route = createFileRoute('/admin/')({
  beforeLoad: () => authGuard([1, 2, 4]),
  component: RouteComponent,
});

interface CardProps {
  icon: ReactNode;
  title: string;
  data: string | number;
}

interface ChartContainerProps {
  title: string;
  children: ReactNode;
}

function RouteComponent() {
  const { user } = useAuth();
  const [carCount, setCarCount] = useState<number>(0);
  const [offerCount, setOfferCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [productCount, setProductCount] = useState<number>(0);
  const [processCount, setProcessCount] = useState<number>(0);
  const [monthlyCustomerCount, setMonthlyCustomerCount] = useState<number>(0);
  const [supplierOrderCount, setSupplierOrderCount] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [vehicleCount, setVehicleCount] = useState<number>(0);


  const [customerChartData, setCustomerChartData] = useState<any>(null);
  const [inventoryChartData, setInventoryChartData] = useState<any>(null);
  const [revenueChartData, setRevenueChartData] = useState<any>(null);


  useEffect(() => {
    apiClient.get<any>(`/statistics`, user?.userId)
      .then(data => {
        setOrderCount(data.orderCount);
        setOfferCount(data.offerCount);
        setProductCount(data.productCount);
        setMonthlyCustomerCount(data.monthlyCustomerCount);
        setProcessCount(data.processCount);
        setSupplierOrderCount(data.supplierOrderCount);
        setTotalRevenue(data.totalRevenue);
        setVehicleCount(data.vehicleCount);


        setCustomerChartData({
          labels: ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"],
          datasets: [
            {
              label: "Ügyfélszám",
              data: [
                data.customerCounts.find((d: any) => d.day === "Monday")?.count ?? 0,
                data.customerCounts.find((d: any) => d.day === "Tuesday")?.count ?? 0,
                data.customerCounts.find((d: any) => d.day === "Wednesday")?.count ?? 0,
                data.customerCounts.find((d: any) => d.day === "Thursday")?.count ?? 0,
                data.customerCounts.find((d: any) => d.day === "Friday")?.count ?? 0,
                data.customerCounts.find((d: any) => d.day === "Saturday")?.count ?? 0,
                data.customerCounts.find((d: any) => d.day === "Sunday")?.count ?? 0,
              ],
              borderColor: "#4F46E5",
              backgroundColor: "rgba(79, 70, 229, 0.2)",
            },
          ],
        });

        setInventoryChartData({
          labels: data.inventory.map((i: any) => i.category),
          datasets: [
            {
              label: "Készlet",
              data: data.inventory.map((i: any) => i.quantity),
              backgroundColor: ["#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#9333EA", "#8B5CF6", "#EC4899"],
            },
          ],
        });

        setRevenueChartData({
          labels: data.revenue.map((r: any) => r.category),
          datasets: [
            {
              label: "Bevétel",
              data: data.revenue.map((r: any) => r.revenue),
              backgroundColor: ["#6366F1", "#22C55E", "#EF4444", "#EAB308", "#06B6D4", "#F472B6"],
            },
          ],
        });
      })
      .catch(err => console.error("Hiba a statisztikák lekérdezésében:", err));
  }, []);

  return (
    <div className="p-6">
      {/* Kártyák */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/admin/orders">
          <Card
            icon={<Car size={32} className="text-blue-500 mr-4" />}
            title="Megrendelések"
            data={`${orderCount} aktív`}
          />
        </Link>
        <Link to="/admin/offers">
          <Card icon={<DollarSign size={32} className="text-green-500 mr-4" />} title="Árajánlatok" data={`${offerCount} függőben`} />
        </Link>
        <Link to="/admin/products">
          <Card icon={<Package size={32} className="text-yellow-500 mr-4" />} title="Termékek" data={`${productCount} alkatrész`} />
        </Link>
        <Card icon={<Wrench size={32} className="text-red-500 mr-4" />} title="Munkafolyamatok" data={`${processCount} folyamatban`} />
        <Link to="/admin/users">
          <Card icon={<Users size={32} className="text-purple-500 mr-4" />} title="Ügyfelek" data={`${monthlyCustomerCount} ebben a hónapban`} />
        </Link>
        <Link to="/admin/productOrders">
          <Card icon={<ShoppingCart size={32} className="text-orange-500 mr-4" />} title="Termékbeszerzés" data={`${supplierOrderCount} új rendelés`} />
        </Link>
        <Card icon={<TrendingUp size={32} className="text-indigo-500 mr-4" />} title="Bevételek" data={`${totalRevenue.toLocaleString()} Ft`} />
        <Link to="/admin/cars">
          <Card icon={<Car size={32} className="text-indigo-500 mr-4" />} title="Regisztrált autók" data={`${vehicleCount} autó az adatbázisban`} />
        </Link>
      </div>

      {/* Grafikonok */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <ChartContainer title="Heti Ügyfélszám">
          {customerChartData && <Line data={customerChartData} />}
        </ChartContainer>
        <ChartContainer title="Raktár Készlet">
          {inventoryChartData && <Bar data={inventoryChartData} />}
        </ChartContainer>
        <ChartContainer title="Bevételi Források">
          <div className="flex justify-center h-80">
            {revenueChartData && <Pie data={revenueChartData} />}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}

const Card: React.FC<CardProps> = ({ icon, title, data }) => (
  <div className="bg-white p-4 shadow rounded-lg flex items-center">
    {icon}
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500">{data}</p>
    </div>
  </div>
);

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children }) => (
  <div className="bg-white p-6 shadow rounded-lg">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);
