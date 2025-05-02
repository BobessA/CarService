import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/thank-you')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <section className="min-h-90 flex items-center justify-center bg-gradient-to-b from-red-50 to-white py-16">
      <div className="max-w-lg mx-auto text-center bg-white p-8 rounded-xl shadow-xl">
        <h1 className="mt-4 text-3xl font-extrabold text-gray-800">
          Köszönjük a megkeresést!
        </h1>
        <p className="mt-2 text-gray-600">
          Megkaptuk ajánlatkérésedet, és hamarosan felvesszük veled a kapcsolatot az időpont egyeztetésével kapcsolatban.
        </p>
        <div className="mt-6 flex justify-center space-x-4">
          <Link
            to="/auth/profile"
            className="px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition"
          >
            Profil oldal
          </Link>
          <Link
            to="/"
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 transition"
          >
            Főoldal
          </Link>
        </div>
      </div>
    </section>
  );}
