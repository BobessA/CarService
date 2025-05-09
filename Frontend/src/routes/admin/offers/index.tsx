import { createFileRoute } from '@tanstack/react-router'
import { authGuard } from '../../../utils/authGuard'
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import apiClient from '../../../utils/apiClient';
import { format } from 'date-fns';
import { OfferDTO } from '../../../models/offerDTO';
import { Vehicle } from '../../../models/Vehicle';
import { Status } from '../../../models/status';

export const Route = createFileRoute('/admin/offers/')({
    beforeLoad: () => authGuard([1,2,4]),
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<OfferDTO[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] =       useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [edits, setEdits] = useState<Record<number, { adminComment: string; statusId: number; appointmentDate: string }>>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      apiClient.get<OfferDTO[]>('/Offers', user?.userId),
      apiClient.get<Vehicle[]>('/vehicles', user?.userId),
      apiClient.get<Status[]>('/statuses', user?.userId),
    ])
      .then(([offerData, vehicleData, statusData]) => {
        setOffers(offerData.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
        setVehicles(vehicleData);
        setStatuses(statusData);
      })
      .catch(() => setError('Hiba az adatok betöltésekor'))
      .finally(() => setLoading(false));
  }, [user]);

  const vehicleMap = useMemo(() => {
    const map: Record<number, string> = {};
    vehicles.forEach(v => map[v.id] = `${v.brand} ${v.model} (${v.licensePlate})`);
    return map;
  }, [vehicles]);

  const getNextStatuses = (currentId: number): Status[] => {
    const mainSeq = [1, 2, 3];
    if (currentId === 5) {
      const next = statuses.find(s => s.id === 2);
      return next ? [next] : [];
    }
    const idx = mainSeq.indexOf(currentId);
    if (idx !== -1 && idx < mainSeq.length - 1) {
      const nextId = mainSeq[idx + 1];
      const next = statuses.find(s => s.id === nextId);
      return next ? [next] : [];
    }
    return [];
  };

  const handleSave = async (offer: OfferDTO) => {
    const edit = edits[offer.id];
    if (!edit) return;
    
    const updatedOffer = { ...offer,
      ...edit,
      appointmentDate: edit.appointmentDate || null,
    agentId: offer.statusId === 1 ? user?.userId : offer.agentId };

  
    // Létrehozunk egy FormData objektumot
    const formData = new FormData();
    
    // Hozzáadjuk a mezőket a FormData-hoz
    formData.append('id', updatedOffer.id.toString());
    formData.append('statusId', updatedOffer.statusId.toString());
    if (updatedOffer.agentId) formData.append('agentId', updatedOffer.agentId);
    if (updatedOffer.appointmentDate) formData.append('appointmentDate', updatedOffer.appointmentDate);
    if (updatedOffer.adminComment) formData.append('adminComment', updatedOffer.adminComment || '');
  
    try {
      // FormData-val küldjük a PUT kérést
      await apiClient.put(`/Offers`, formData, user?.userId);
      
      const updated = await apiClient.get<OfferDTO[]>('/Offers', user?.userId);
      setOffers(updated.sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()));
      setExpanded(prev => { const nxt = new Set(prev); nxt.delete(offer.id); return nxt; });
      setEdits(prev => { const nxt = { ...prev }; delete nxt[offer.id]; return nxt; });
    } catch (error) {
      console.error('Update error:', error);
      alert('Frissítési hiba');
    }
  };

  const toggleExpand = (id: number) => setExpanded(prev => {
    const nxt = new Set(prev);
    nxt.has(id) ? nxt.delete(id) : nxt.add(id);
    return nxt;
  });

  if (loading) return <p className="p-8 text-center">Betöltés...</p>;
  if (error) return <p className="p-8 text-center text-red-600">{error}</p>;

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-6">Ajánlatkezelés (Admin)</h2>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2" />
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Szám</th>
                <th className="px-4 py-2">Jármű</th>
                <th className="px-4 py-2">Bekérve</th>
                <th className="px-4 py-2">Állapot</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offers.map(offer => (
                <React.Fragment key={offer.id}>
                  <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleExpand(offer.id)}>
                    <td className="px-4 py-2 text-center"><span>{expanded.has(offer.id) ? '−' : '+'}</span></td>
                    <td className="px-4 py-2">{offer.id}</td>
                    <td className="px-4 py-2">{offer.offerNumber}</td>
                    <td className="px-4 py-2">{vehicleMap[offer.vehicleId]}</td>
                    <td className="px-4 py-2">{format(new Date(offer.requestDate), 'yyyy.MM.dd.')}</td>
                    <td className="px-4 py-2">
                      {edits[offer.id]?.statusId
                        ? statuses.find(s => s.id === edits[offer.id]!.statusId)?.name
                        : offer.statusName}
                    </td>
                  </tr>
                  {expanded.has(offer.id) && (
                    <tr className="bg-gray-50">
                      <td colSpan={7} className="px-4 py-4">
                        <div className="grid grid-cols-1 gap-4 text-gray-700">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <p><span className="font-medium">Probléma:</span> {offer.issueDescription || '-'}</p>
                              <p className="mt-1"><span className="font-medium">Agent ID:</span> {offer.agentId || '-'}</p>
                              <p className="mt-1"><span className="font-medium">Customer ID:</span> {offer.customerId}</p>


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
                              <p><span className="font-medium">Admin megjegyzés:</span></p>
                              <textarea value={edits[offer.id]?.adminComment ?? offer.adminComment ?? ''} onChange={e => setEdits(prev => ({ ...prev, [offer.id]: { ...(prev[offer.id] ?? { statusId: offer.statusId, appointmentDate: offer.appointmentDate ?? '' }), adminComment: e.target.value } }))} className="w-full border rounded p-2" />
                              <div className="mt-4 space-x-2">
                                {getNextStatuses(offer.statusId).map(next => (
                                  <button key={next.id} onClick={() => setEdits(prev => ({ ...prev, [offer.id]: { ...(prev[offer.id] ?? { adminComment: offer.adminComment ?? '', appointmentDate: offer.appointmentDate ?? '' }), statusId: next.id } }))} className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700">
                                    {next.name}
                                  </button>
                                ))}
                              </div>
                              <p className="mt-4"><span className="font-medium">Időpont:</span></p>
                              <input type="datetime-local" value={edits[offer.id]?.appointmentDate ?? (offer.appointmentDate ? format(new Date(offer.appointmentDate), "yyyy-MM-dd'T'HH:mm") : '')} onChange={e => setEdits(prev => ({ ...prev, [offer.id]: { ...(prev[offer.id] ?? { adminComment: offer.adminComment ?? '', statusId: offer.statusId }), appointmentDate: e.target.value } }))} className="w-full border rounded p-2 mt-1" />
                              <button onClick={() => handleSave(offer)} className="mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Mentés</button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
