import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../utils/apiClient';
import { format } from 'date-fns';
import { OfferDTO } from '../../models/offerDTO';
import { Vehicle } from '../../models/Vehicle';
export const Route = createFileRoute('/offers/')({
  component: RouteComponent,
})

function RouteComponent() {
    const { user } = useAuth();
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    apiClient.get<Vehicle[]>(`/vehicles?userId=${user.userId}`, user.userId)
      .then(setUserVehicles)
      .catch(() => {});
  }, [user, user?.userId, user?.userId]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    apiClient.get<OfferDTO[]>(`/Offers?customerId=${user.userId}`, user.userId)
      .then(data => {
        setOffers(data.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
      })
      .catch(() => setError('Hiba az ajánlatok betöltésekor'))
      .finally(() => setLoading(false));
  }, [user, user?.userId, user?.userId]);

  const vehicleMap = useMemo(() => {
    const map: Record<number, string> = {};
    userVehicles.forEach(v => {
      map[v.id] = `${v.brand} ${v.model} (${v.licensePlate})`;
    });
    return map;
  }, [userVehicles]);

  const statusOptions = useMemo(() => Array.from(new Set(offers.map(o => o.statusName))), [offers]);

  const filteredOffers = useMemo(() => offers.filter(o => {
    const matchesSearch = [o.offerNumber, o.statusName, o.issueDescription, vehicleMap[o.vehicleId]]
      .some(field => field?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter ? o.statusName === statusFilter : true;
    return matchesSearch && matchesStatus;
  }), [offers, searchTerm, statusFilter, vehicleMap]);

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Ajánlatkérelmeim</h2>
        {loading && <p className="text-center mt-6">Betöltés...</p>}
        {error && <p className="text-center text-red-600 mt-6">{error}</p>}
        {!loading && !error && offers.length === 0 && (
          <p className="text-center text-gray-600 mt-6">Még nincs ajánlatkérésed.</p>
        )}

        {offers.length > 0 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <input
              type="text"
              placeholder="Keresés ajánlatszámra, járműre, problémára..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-1/2 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500"
            />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full sm:w-1/3 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500"
            >
              <option value="">Összes állapot</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        )}

        <div className="mt-10 space-y-6">
          {filteredOffers.length > 0 ? filteredOffers.map(offer => {
            const statusColor = offer.statusName === 'Beérkezett'
              ? 'border-red-500'
              : offer.statusName === 'Feldolgozás alatt'
              ? 'border-yellow-500'
              : offer.statusName === 'Elfogadásra vár'
              ? 'border-blue-500'
              : 'border-green-500';

              const handleAccept = async () => {
                try {
                  // Létrehozzuk a FormData objektumot
                  const formData = new FormData();
                  formData.append('id', offer.id.toString());
                  formData.append('statusId', '3'); // Elfogadott állapot
                  
                  // FormData-val küldjük a PUT kérést
                  await apiClient.put(`/Offers`, formData, user?.userId);
                  
                  // Frissítjük a lokális állapotot
                  setOffers(prev => prev.map(o => 
                    o.id === offer.id ? { ...o, statusName: 'Elfogadott', statusId: 3 } : o
                  ));
                } catch (error) {
                  console.error('Elfogadási hiba:', error);
                  alert('Hiba az elfogadás során');
                }
              };

            return (
              <div key={offer.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${statusColor}`}>  
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-800">{offer.offerNumber} (#{offer.id})</h3>
                  <span className="text-sm text-gray-500">{format(new Date(offer.requestDate), 'yyyy.MM.dd. HH:mm')}</span>
                </div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
                  <div>
                    <p><span className="font-medium">Jármű:</span> {vehicleMap[offer.vehicleId]}</p>
                    {offer.issueDescription && <p className="mt-1"><span className="font-medium">Probléma:</span> {offer.issueDescription}</p>}
                    <p className="mt-1"><span className="font-medium">Agent ID:</span> {offer.agentId || '-'}</p>
                    <div className="mt-2">
                                <span className="font-medium">Képek:</span>
                                {offer.imagePaths && offer.imagePaths.length > 0 ? (
                                  <div className="flex flex-wrap gap-4 mt-2">
                                    {offer.imagePaths.map((imagePath, index) => (
                                      <div key={index} className="border rounded p-1">
                                        <img 
                                          src={imagePath} 
                                          alt={`Offer image ${index + 1}`} 
                                          className="max-w-xs max-h-48 object-contain"
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-gray-500 mt-1">Nincs megjelenítendő fotó.</p>
                                )}
                              </div>
                  </div>
                  <div>
                    <p><span className="font-medium">Állapot:</span> {offer.statusName}</p>
                    {offer.adminComment && <p className="mt-1"><span className="font-medium">Admin megjegyzés:</span> {offer.adminComment}</p>}
                    {offer.appointmentDate && <p className="mt-1"><span className="font-medium">Időpont:</span> {format(new Date(offer.appointmentDate), 'yyyy.MM.dd. HH:mm')}</p>}
                    {offer.statusName === 'Elfogadásra vár' && (
                      <button
                        onClick={handleAccept}
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      >
                        Időpont elfogadása
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : offers.length > 0 ? (
            <p className="text-center text-gray-600">Nincs találat a szűrésre.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
  }
