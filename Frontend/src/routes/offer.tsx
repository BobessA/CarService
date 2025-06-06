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
    const [photos, setPhotos] = useState<File[]>([]);
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
      const formData = new FormData();
      formData.append('customerId', user?.userId || "");
      formData.append('vehicleId', String(selectedVehicle));
      formData.append('statusId', '1');
      formData.append('issueDescription', issueDescription);
  
      photos.forEach((file) => {
        formData.append('photos', file);
      });
  
      await apiClient.postForm('/offers', formData, user?.userId);
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
              //Textboxes for the basic offer request
              <div>
                <label className="block text-sm font-medium text-gray-700">Szolgáltatásaink</label>
                <div className="mt-2 space-y-2">
                  

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="oilChange"
                      name="issueOptions"
                      checked={issueDescription.includes('Olaj- és szűrőcsere,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Olaj- és szűrőcsere,' 
                          : issueDescription.replace('Olaj- és szűrőcsere,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="oilChange" className="ml-2 block text-sm text-gray-700">
                      Olaj- és szűrőcsere
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="brakeService"
                      name="issueOptions"
                      checked={issueDescription.includes('Fékrendszer karbantartás,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Fékrendszer karbantartás,' 
                          : issueDescription.replace('Fékrendszer karbantartás,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="brakeService" className="ml-2 block text-sm text-gray-700">
                      Fékrendszer karbantartás
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="suspensionCheck"
                      name="issueOptions"
                      checked={issueDescription.includes('Futómű- és felfüggesztés ellenőrzés,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Futómű- és felfüggesztés ellenőrzés,' 
                          : issueDescription.replace('Futómű- és felfüggesztés ellenőrzés,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="suspensionCheck" className="ml-2 block text-sm text-gray-700">
                      Futómű- és felfüggesztés ellenőrzés
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tireService"
                      name="issueOptions"
                      checked={issueDescription.includes('Gumiabroncs szerviz,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Gumiabroncs szerviz,' 
                          : issueDescription.replace('Gumiabroncs szerviz,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tireService" className="ml-2 block text-sm text-gray-700">
                      Gumiabroncs szerviz
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="coolingSystem"
                      name="issueOptions"
                      checked={issueDescription.includes('Hűtőrendszer karbantartás,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Hűtőrendszer karbantartás,' 
                          : issueDescription.replace('Hűtőrendszer karbantartás,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="coolingSystem" className="ml-2 block text-sm text-gray-700">
                      Hűtőrendszer karbantartás
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="batteryCheck"
                      name="issueOptions"
                      checked={issueDescription.includes('Akkumulátor ellenőrzés,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Akkumulátor ellenőrzés,' 
                          : issueDescription.replace('Akkumulátor ellenőrzés,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="batteryCheck" className="ml-2 block text-sm text-gray-700">
                      Akkumulátor ellenőrzés
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="fuelSystem"
                      name="issueOptions"
                      checked={issueDescription.includes('Üzemanyagrendszer karbantartás,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Üzemanyagrendszer karbantartás,' 
                          : issueDescription.replace('Üzemanyagrendszer karbantartás,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="fuelSystem" className="ml-2 block text-sm text-gray-700">
                      Üzemanyagrendszer karbantartás
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="lightingCheck"
                      name="issueOptions"
                      checked={issueDescription.includes('Világítás ellenőrzés,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Világítás ellenőrzés,' 
                          : issueDescription.replace('Világítás ellenőrzés,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="lightingCheck" className="ml-2 block text-sm text-gray-700">
                      Világítás ellenőrzés
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="bodywork"
                      name="issueOptions"
                      checked={issueDescription.includes('Karosszéria tisztítás,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Karosszéria tisztítás,' 
                          : issueDescription.replace('Karosszéria tisztítás,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="bodywork" className="ml-2 block text-sm text-gray-700">
                      Karosszéria tisztítás
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="diagnostics"
                      name="issueOptions"
                      checked={issueDescription.includes('Diagnosztikai vizsgálat,')}
                      onChange={(e) => {
                        const newValue = e.target.checked 
                          ? issueDescription + 'Diagnosztikai vizsgálat,' 
                          : issueDescription.replace('Diagnosztikai vizsgálat,', '');
                        setIssueDescription(newValue);
                      }}
                      disabled={submitting}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    />
                    <label htmlFor="diagnostics" className="ml-2 block text-sm text-gray-700">
                      Diagnosztikai vizsgálat
                    </label>
                  </div>
                </div>
              </div>

             )
            }          
            <div>
              <label className="block text-sm font-medium text-gray-700">Fénykép csatolása (opcionális)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={e => {
                  if (e.target.files) {
                    setPhotos(Array.from(e.target.files));
                  }
                }}
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
