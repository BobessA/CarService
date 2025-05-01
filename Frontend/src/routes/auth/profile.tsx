import { createFileRoute } from '@tanstack/react-router'
import { authGuard } from '../../utils/authGuard'
import { useAuth } from "../../contexts/AuthContext"; 

export const Route = createFileRoute('/auth/profile')({
  beforeLoad: () => authGuard(),
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth(); 

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold">Üdvözlünk, {user?.name}!</h1>
    </div>
  );}
