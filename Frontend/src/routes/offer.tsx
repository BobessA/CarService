import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from "react";
import { authGuard } from "../utils/authGuard";
import { useAuth } from "../contexts/AuthContext";
import apiClient from "../utils/apiClient";
import { Vehicle } from "../models/Vehicle";
import { useNavigate } from "@tanstack/react-router";
import { OfferRegister } from '../models/OfferRegister';

export const Route = createFileRoute('/offer')({
  beforeLoad: () => authGuard(),
  component: RouteComponent,
})

function RouteComponent() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<number | "">("");
    const [serviceType, setServiceType] = useState<'general' | 'special'>('general');
    const [issueDescription, setIssueDescription] = useState<string>('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

 useEffect(() => {
    if (!user) return;
    apiClient.get<Vehicle[]>(`/vehicles?userId=${user.userId}`, user.userId)
      .then(data => {
        if (data.length === 0) {
            navigate({
                to: '/auth/profile',
                search: prev => ({ ...prev, code: 'no-vehicles' }),
            });
        } else {
          setVehicles(data);
          setSelectedVehicle(data[0].id);
        }
      })
      .catch(() => setError('Hiba az autók betöltésekor'));
  }, [user, user?.userId, user?.userId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setError('Válassz ki egy autót!');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // Todo: FOTÓÓó
      var offer: OfferRegister = {
        customerId: user?.userId || "",
        vehicleId: selectedVehicle || 0,
        statusId: 1,
        issueDescription: issueDescription
      };

      await apiClient.post('/offers', offer, user?.userId);
      navigate({ to: '/thank-you' });
    } catch (err: any) {
      setError(err.message || 'Hiba az ajánlatkérés során');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Ajánlatkérés</h2>
        <p className="text-center text-gray-600 mt-2">
          Válaszd ki a járműved és küldd be ajánlatkérésedet.
        </p>

        <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
          {error && <div className="text-red-600 mb-4">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-6">

            
            <div>
              <label className="block text-sm font-medium text-gray-700">Jármű</label>
              <select
                className="w-full mt-1 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500"
                value={selectedVehicle}
                onChange={e => setSelectedVehicle(Number(e.target.value))}
                disabled={submitting}
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {`${v.brand} ${v.model} (${v.licensePlate})`}
                  </option>
                ))}
              </select>
            </div>

            
            <div>
              <label className="block text-sm font-medium text-gray-700">Szervíz típusa</label>
              <div className="mt-1 flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="general"
                    checked={serviceType === 'general'}
                    onChange={() => setServiceType('general')}
                    disabled={submitting}
                    className="form-radio"
                  />
                  <span className="ml-2">Általános</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="serviceType"
                    value="special"
                    checked={serviceType === 'special'}
                    onChange={() => setServiceType('special')}
                    disabled={submitting}
                    className="form-radio"
                  />
                  <span className="ml-2">Speciális</span>
                </label>
              </div>
            </div>

           
            {serviceType === 'special' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700">Probléma leírása</label>
                <textarea
                  name="issueDescription"
                  rows={4}
                  value={issueDescription}
                  onChange={e => setIssueDescription(e.target.value)}
                  disabled={submitting}
                  className="w-full mt-1 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500"
                  placeholder="Írd le a problémát..."
                />
              </div>
            ) : (
                <div>
                      Ide jönnek majd a Szolgáltatásaink, mint a(z) <br/>
                      -Olajcsere<br/>
                      -Futóműbeállítá<br/>
                      -Gumizás<br/>

                    Várunk a backendre.. 

                </div>
             )
            }          
            <div>
              <label className="block text-sm font-medium text-gray-700">Fénykép csatolása (opcionális)</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => e.target.files && setPhoto(e.target.files[0])}
                disabled={submitting}
                className="mt-1"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white py-3 rounded-md text-lg font-medium hover:bg-red-700 transition"
            >
              {submitting ? 'Küldés...' : 'Ajánlatkérés elküldése'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
