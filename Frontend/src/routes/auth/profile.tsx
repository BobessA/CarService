import { createFileRoute } from '@tanstack/react-router'
import { authGuard } from '../../utils/authGuard'
import { useAuth } from "../../contexts/AuthContext"; 
import VehicleManager from "../../components/user/vehiclemanager";
export const Route = createFileRoute('/auth/profile')({
  beforeLoad: () => authGuard(),
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth(); 
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold">Üdvözlünk, {user?.name}!</h1>
      
      {code === 'no-vehicles' && (
        <div className="m-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">Időpont foglaláshoz kérjük először regisztráljon egy járművet!</span>
        </div>
      )}

      <VehicleManager />
    </div>
  );}
