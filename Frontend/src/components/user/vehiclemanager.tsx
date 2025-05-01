import React, { useState, useEffect, FC } from "react";
import { Vehicle } from "../../models/Vehicle";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../utils/apiClient"; // centralized API client module

interface FuelType {
  id: number;
  name: string;
}

const VehicleManager: FC = () => {
  const { user } = useAuth();
  const token = user?.userId;

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  // Loading & error states for vehicles
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [vehiclesError, setVehiclesError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Vehicle, 'id'>>({
    licensePlate: "",
    brand: "",
    model: "",
    yearOfManufacture: new Date().getFullYear(),
    vin: "",
    engineCode: "",
    odometer: 0,
    fuelType: 0,
    ownerId: user?.userId || "",
  });

  // Load vehicles & fuel types
  useEffect(() => {
    if (!user) return;
    
    // Fuel types (no indicator)
    apiClient.get<FuelType[]>(`/fueltypes`, token)
      .then(setFuelTypes)
      .catch(console.error);
    // Vehicles
    setLoadingVehicles(true);
    setVehiclesError(null);
    apiClient.get<Vehicle[]>(`/vehicles?userId=${user.userId}`, token)
      .then(setVehicles)
      .catch(err => setVehiclesError(err.message))
      .finally(() => setLoadingVehicles(false));


  }, [user, token]);

  // Reset form
  const resetForm = () => {
    setEditing(null);
    setShowForm(false);
    setForm({
      licensePlate: "",
      brand: "",
      model: "",
      yearOfManufacture: new Date().getFullYear(),
      vin: "",
      engineCode: "",
      odometer: 0,
      fuelType: 0,
      ownerId: user?.userId || "",
    });
  };

  // Open new
  const openNewForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = `/vehicles`;
    const action = editing ? apiClient.put : apiClient.post; 

       action<Vehicle>(endpoint, form, token)
      .then(() => apiClient.get<Vehicle[]>(`/vehicles?userId=${user?.userId}`, token))
      .then(setVehicles)
      .then(resetForm)
      .catch(console.error);
  };

  // Edit
  const handleEdit = (v: Vehicle) => {
    setEditing(v);
    setForm({ ...v, ownerId: v.ownerId });
    setShowForm(true);
  };

  // Delete
  const handleDelete = (id: number) => {
    if (!window.confirm("Biztos törlöd?")) return;
    apiClient.delete(`/vehicles/${id}`, token)
      .then(() => apiClient.get<Vehicle[]>(`/vehicles?userId=${user?.userId}`, token))
      .then(setVehicles)
      .catch(console.error);
  };

  // Get fuel name
  const getFuelName = (id: number) =>
    fuelTypes.find(ft => ft.id === id)?.name || "";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Saját járművek</h2>
        <button onClick={openNewForm} className="bg-green-600 text-white px-4 py-2 rounded">
          Új jármű regisztrálása
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 transition-opacity duration-300 ease-in-out">
          <h2 className="text-lg font-semibold mb-4">
            {editing ? "Jármű szerkesztése" : "Új jármű regisztrálása"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input type="text" placeholder="Rendszám" value={form.licensePlate}
              onChange={e => setForm({ ...form, licensePlate: e.target.value })}
              className="border px-3 py-2 rounded" required />
            <input type="text" placeholder="Márka" value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              className="border px-3 py-2 rounded" required />
            <input type="text" placeholder="Típus" value={form.model}
              onChange={e => setForm({ ...form, model: e.target.value })}
              className="border px-3 py-2 rounded" required />
            <input type="number" placeholder="Gyártási év" value={form.yearOfManufacture}
              onChange={e => setForm({ ...form, yearOfManufacture: Number(e.target.value) })}
              className="border px-3 py-2 rounded" required />
            <input type="text" placeholder="Alvázszám" value={form.vin}
              onChange={e => setForm({ ...form, vin: e.target.value })}
              className="border px-3 py-2 rounded" required />
            <input type="text" placeholder="Motor kód" value={form.engineCode}
              onChange={e => setForm({ ...form, engineCode: e.target.value })}
              className="border px-3 py-2 rounded" required />
            <input type="number" placeholder="Kilométeróra" value={form.odometer}
              onChange={e => setForm({ ...form, odometer: Number(e.target.value) })}
              className="border px-3 py-2 rounded" required />
            <select value={form.fuelType} onChange={e => setForm({ ...form, fuelType: Number(e.target.value) })}
              className="border px-3 py-2 rounded" required>
              <option value={0}>Üzemanyag típusa</option>
              {fuelTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
            </select>
            <div className="sm:col-span-2 flex space-x-2 mt-4">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Mentés</button>
              <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Mégse</button>
            </div>
          </form>
        </div>
      )}

      {/* Loading & error states */}
      {vehiclesError && <div className="text-red-600 mb-4">Hiba betöltéskor: {vehiclesError}</div>}
      {loadingVehicles ? (
        <div>Járművek betöltése...</div>
      ) : (
        
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-2">Rendszám</th>
                <th className="px-4 py-2">Márka</th>
                <th className="px-4 py-2">Típus</th>
                <th className="px-4 py-2">Év</th>
                <th className="px-4 py-2">Üzemanyag</th>
                <th className="px-4 py-2">Műveletek</th>
              </tr>
            </thead>
            <tbody>
              
              {vehicles.map(v => (
                <tr key={v.id} className="even:bg-gray-50 hover:bg-gray-100">
                  <td className="px-4 py-2">{v.licensePlate}</td>
                  <td className="px-4 py-2">{v.brand}</td>
                  <td className="px-4 py-2">{v.model}</td>
                  <td className="px-4 py-2">{v.yearOfManufacture}</td>
                  <td className="px-4 py-2">{getFuelName(v.fuelType)}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button onClick={() => handleEdit(v)} className="text-indigo-600 hover:underline">Szerkeszt</button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Töröl</button>
                  </td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nincs jármű.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VehicleManager;
