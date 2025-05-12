import React, { useState, useEffect, FC } from "react";
import { Vehicle } from "../../models/Vehicle";
import { useAuth } from "../../contexts/AuthContext";
import { VehicleBrands } from "../../models/VehicleBrands";
import { VehicleModells } from "../../models/VehicleModells";
import apiClient from "../../utils/apiClient"; // centralized API client module
import { validateVehicle } from "../../validations/vehicleManagerValidation";
import CreatableSelect from 'react-select/creatable';

interface FuelType {
  id: number;
  name: string;
}

interface VehicleManagerProps {
  ownerId?: string;
}

const VehicleManager: FC<VehicleManagerProps> = ({ ownerId }) => {
  const { user } = useAuth();
  const token = user?.userId;
  // Derive ownerId directly from props or fallback to current user
  const effectiveOwner = ownerId ?? user?.userId ?? "";

  const defaultForm: Omit<Vehicle, 'id'> ={
    licensePlate: "",
      brand: "",
      model: "",
      yearOfManufacture: 0,
      vin: "",
      engineCode: "",
      odometer: 0,
      fuelType: 0,
      ownerId: effectiveOwner,
  }

  // Data states
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [fuelTypes, setFuelTypes] = useState<FuelType[]>([]);
  const [brands, setBrands] = useState<VehicleBrands[]>([]);
  const [modells, setModells] = useState<VehicleModells[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<Vehicle | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Omit<Vehicle, 'id'>>(defaultForm);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset form whenever effectiveOwner changes
  useEffect(() => {
    setForm(defaultForm);
    setEditing(null);
    setShowForm(false);
    setValidationErrors([]);
  }, [effectiveOwner]);

  // Fetch fuel types and vehicles whenever effectiveOwner changes or token changes
  useEffect(() => {
    if (!effectiveOwner || !token) return;
    setLoading(true);
    setError(null);

    apiClient.get<FuelType[]>('/fueltypes', token)
      .then(setFuelTypes)
      .catch(() => {});

    apiClient.get<Vehicle[]>(`/vehicles?userId=${effectiveOwner}`, token)
      .then(setVehicles)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    apiClient.get<VehicleBrands[]>("/Vehicles/Brands", user?.userId)
      .then(data => {
        const sorted = data.sort((a, b) => a.brandName.localeCompare(b.brandName));
        setBrands(sorted);
      })
      .catch(err => setError(err.message));
    apiClient.get<VehicleModells[]>("/Vehicles/Modells", user?.userId)
      .then((data => {
        const sorted = data.sort((a, b) => a.modellName.localeCompare(b.modellName));
        setModells(sorted);
      }))
      .catch(err => setError(err.message));
  }, [effectiveOwner, token]);

  // Open form for new or existing vehicle
  const openForm = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditing(vehicle);
      setForm({ ...vehicle, ownerId: effectiveOwner });
    } else {
      setEditing(null);
      setForm(prev => ({ ...prev, ownerId: effectiveOwner }));
    }
    setShowForm(true);
    setValidationErrors([]);
  };

  // Reset form/cancel
  const resetForm = () => {
    setEditing(null);
    setForm(defaultForm);
    //setForm(prev => ({ ...prev, ownerId: effectiveOwner }));
    setShowForm(false);
    setValidationErrors([]);
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateVehicle(form);
    if (Object.keys(errs).length > 0) {
      setValidationErrors(Object.values(errs));
      return;
    }
    const action = editing ? apiClient.put : apiClient.post;
    action<Vehicle>('/vehicles', form, token)
      .then(() => apiClient.get<Vehicle[]>(`/vehicles?userId=${effectiveOwner}`, token))
      .then(setVehicles)
      .then(resetForm)
      .catch(err => setError(err.message));
  };

  // Delete handler
  const handleDelete = (id: number) => {
    if (!window.confirm('Biztosan törlöd?')) return;
    apiClient.delete(`/vehicles/${id}`, token)
      .then(() => apiClient.get<Vehicle[]>(`/vehicles?userId=${effectiveOwner}`, token))
      .then(setVehicles)
      .catch(err => setError(err.message));
  };

  // Lookup fuel type name
  const getFuelName = (id: number) => fuelTypes.find(ft => ft.id === id)?.name || "";

  const selectedBrand = brands.find(b => b.brandName === form.brand);
  const filteredModells = selectedBrand
    ? modells.filter(m => m.brandId === selectedBrand.id)
    : [];
    
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {showForm ? (editing ? 'Jármű szerkesztése' : 'Új jármű regisztrálása') : 'Járművek'}
        </h2>
        {!showForm && (
          <button onClick={() => {
            openForm();
          }} className="bg-green-600 text-white px-4 py-2 rounded">
            Új jármű
          </button>
        )}
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading && <p>Betöltés...</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-6 rounded-lg shadow mb-6">
          <input type="text" placeholder="Rendszám" value={form.licensePlate}
            onChange={e => setForm({ ...form, licensePlate: e.target.value })}
            readOnly={!!editing} required className="border p-2 rounded" />
            <CreatableSelect
              isClearable
              placeholder="Márka"
              value={form.brand ? { label: form.brand, value: form.brand } : null}
              onChange={(option) => {
                const selected = option?.value || "";
                setForm({ ...form, brand: selected, model: "" });
              }}
              options={brands.map(b => ({ value: b.brandName, label: b.brandName }))}
              formatCreateLabel={(inputValue) => `Új: "${inputValue}"`}
              isDisabled={editing !== null}
            />
            <CreatableSelect
              isClearable
              placeholder="Típus"
              value={form.model ? { label: form.model, value: form.model } : null}
              onChange={(option) => {
                const selected = option?.value || "";
                setForm({ ...form, model: selected });
              }}
              options={filteredModells.map(m => ({ value: m.modellName, label: m.modellName }))}
              formatCreateLabel={(inputValue) => `Új: "${inputValue}"`}
              isDisabled={editing !== null}
            />
          <input type="number" placeholder="Gyártási év" value={form.yearOfManufacture === 0 ? "" : form.yearOfManufacture}
            onChange={e => setForm({ ...form, yearOfManufacture: Number(e.target.value) })}
            min={1900} max={new Date().getFullYear()+1} required className="border p-2 rounded" 
            readOnly={editing !== null}/>
          <input type="text" placeholder="Alvázszám" value={form.vin}
            onChange={e => setForm({ ...form, vin: e.target.value })} required className="border p-2 rounded" 
            readOnly={editing !== null}/>
          <input type="text" placeholder="Motorkód" value={form.engineCode}
            onChange={e => setForm({ ...form, engineCode: e.target.value })} required className="border p-2 rounded" 
            readOnly={editing !== null}/>
          <input type="number" placeholder="Odométer" value={form.odometer === 0 ? "" : form.odometer}
            onChange={e => setForm({ ...form, odometer: Number(e.target.value) })}
            min={0} required className="border p-2 rounded" />
          <select value={form.fuelType} onChange={e => setForm({ ...form, fuelType: Number(e.target.value) })} required className="border p-2 rounded">
            <option value={0}>Üzemanyag típusa</option>
            {fuelTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
          </select>
          <div className="sm:col-span-2 flex justify-end space-x-2">
            <button type="button" onClick={resetForm} className="bg-gray-400 text-white px-4 py-2 rounded">Mégse</button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Mentés</button>
          </div>
          {validationErrors.length>0 && <div className="sm:col-span-2 text-red-500">{validationErrors.map((err,i)=> <p key={i}>{err}</p>)}</div>}
        </form>
      )}

      {!showForm && (
        <table className="min-w-full divide-y divide-gray-200 text-sm text-left bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
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
                  <button onClick={() => openForm(v)} className="text-indigo-600 hover:underline">Szerkeszt</button>
                  <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:underline">Töröl</button>
                </td>
              </tr>
            ))}
            {vehicles.length===0 && <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">Nincs jármű.</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VehicleManager;
