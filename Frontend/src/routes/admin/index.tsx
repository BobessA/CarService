import { useEffect, useState } from "react";
import { createFileRoute, Link } from '@tanstack/react-router'
import { authGuard } from '../../utils/authGuard'
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Car, DollarSign, Package, Wrench, Users, ShoppingCart, TrendingUp } from "lucide-react";
import "chart.js/auto";
import { ReactNode } from "react";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/apiClient";

export const Route = createFileRoute('/admin/')({
  beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
})
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
    useEffect(() => {
      apiClient
      .get<number>(`/vehicles/count`, user?.userId)
      .then(setCarCount)
      .catch(err => console.error("Hiba a jármű lekérdezésben:", err));
      apiClient
      .get<number>(`/offers/count`, user?.userId)
      .then(setOfferCount)
      .catch(err => console.error("Hiba az ajánlatok lekérdezésében:", err));
  }, []);
  
    /*const [quoteCount, setQuoteCount] = useState<number>(0);
    const [stockCount, setStockCount] = useState<number>(0);
    const [workCount, setWorkCount] = useState<number>(0);
    const [customerCount, setCustomerCount] = useState<number>(0);
    const [invoiceCount, setInvoiceCount] = useState<number>(0);
    const [profitCount, setProfitCount] = useState<number>(0);*/
  
    return (
        <div className="p-6">
          {/* Kártyák */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card icon={<Car size={32} className="text-blue-500 mr-4" />} title="Bejelentkezett autók" data="15 aktív" />
            <Link to="/admin/offers"><Card icon={<DollarSign size={32} className="text-green-500 mr-4" />} title="Árajánlatok" data={offerCount+" függőben"} /></Link>
            <Link to="/admin/products"><Card icon={<Package size={32} className="text-yellow-500 mr-4" />} title="Raktár" data="120 alkatrész" /></Link>
            <Card icon={<Wrench size={32} className="text-red-500 mr-4" />} title="Munkafolyamatok" data="5 folyamatban" />
            <Link to="/admin/users"><Card icon={<Users size={32} className="text-purple-500 mr-4" />} title="Ügyfélszám" data="230 ebben a hónapban" /></Link>
            <Card icon={<ShoppingCart size={32} className="text-orange-500 mr-4" />} title="Alkatrész rendelések" data="12 új rendelés" />
            <Card icon={<TrendingUp size={32} className="text-indigo-500 mr-4" />} title="Bevételek" data="$25,000" />
            <Link to="/admin/cars"><Card icon={<Car size={32} className="text-indigo-500 mr-4" />} title="Regisztrált autók" data={carCount+" autó az adatbázisban"} /></Link>
          </div>
    
          {/* Grafikonok */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <ChartContainer title="Heti Ügyfélszám">
              <Line data={customerChartData} />
            </ChartContainer>
            <ChartContainer title="Raktár Készlet">
              <Bar data={inventoryChartData} />
            </ChartContainer>
            <ChartContainer title="Bevételi Források">
              <div className="flex justify-center h-80">
              <Pie data={revenueChartData} />
              </div>
            </ChartContainer>
          </div>
        </div>
      );
    };
    
    const Card:React.FC<CardProps> = ({ icon, title,data }) => (
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
    
    const customerChartData = {
      labels: ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"],
      datasets: [
        {
          label: "Ügyfélszám",
          data: [12, 19, 10, 15, 20, 22, 18],
          borderColor: "#4F46E5",
          backgroundColor: "rgba(79, 70, 229, 0.2)",
        },
      ],
    };
    
    const inventoryChartData = {
      labels: ["Motor", "Gumik", "Akkumulátorok", "Fékek", "Szűrők"],
      datasets: [
        {
          label: "Készlet",
          data: [30, 45, 20, 60, 25],
          backgroundColor: ["#F59E0B", "#10B981", "#EF4444", "#3B82F6", "#9333EA"],
        },
      ],
    };
    
    const revenueChartData = {
      labels: ["Javítás", "Alkatrész", "Gumi csere", "Diagnosztika"],
      datasets: [
        {
          label: "Bevétel",
          data: [10000, 8000, 5000, 7000],
          backgroundColor: ["#6366F1", "#22C55E", "#EF4444", "#EAB308"],
        },
      ],
    };
