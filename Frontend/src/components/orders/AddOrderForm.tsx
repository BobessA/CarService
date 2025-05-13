import { useState } from "react";
import { OrderCreateDTO } from "../../models/OrderCreateDTO";
import { useAuth } from "../../contexts/AuthContext";
import AsyncSelect from "react-select/async";
import apiClient from "../../utils/apiClient";
import { Vehicle } from "../../models/Vehicle";
import User from "../../models/User";

interface AddOrderFormProps {
  onSave: (order: OrderCreateDTO) => void;
  onCancel: () => void;
  currentUserId?: string;
}

export const AddOrderForm = ({ onSave, onCancel, currentUserId }: AddOrderFormProps) => {
  const { user } = useAuth();
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  // Use provided currentUserId or fall back to user from context
  const effectiveUserId = currentUserId || user?.userId || "";

  const [newOrder, setNewOrder] = useState<OrderCreateDTO>({
    customerId: "",
    vehicleId: 0,
    agentId: effectiveUserId,
    statusId: 3,
    orderDate: new Date().toISOString(),
  });

  const loadCustomers = async (inputValue: string) => {
    try {
      console.log("Searching for users with query:", inputValue);
      const response = await apiClient.get<User[]>(
        "/users/Search?query=" + encodeURIComponent(inputValue), 
        effectiveUserId
      );
      
      console.log("API response:", response);
      
      if (!response) {
        console.error("Invalid response format:", response);
        return [];
      }
      
      const usersArray = Array.isArray(response) ? response : [response];
      
      const options = usersArray.map(u => ({
        value: u.userId,
        label: `${u.name} (${u.email})`
      }));
      
      console.log("Mapped options:", options);
      return options;
    } catch (error) {
      console.error("Error loading customers:", error);
      return [];
    }
  };

  const handleCustomerChange = async (selectedOption: any) => {
    console.log("Selected customer:", selectedOption);
    setSelectedCustomer(selectedOption);
    
    const customerId = selectedOption?.value || "";
    
    setNewOrder((prev) => ({
      ...prev,
      customerId,
      vehicleId: 0, // Reset vehicle selection
    }));

    if (customerId) {
      try {
        const vehicles = await apiClient.get<Vehicle[]>(
          `/Vehicles?userId=${customerId.trim()}`,
          effectiveUserId
        );
        console.log("Loaded vehicles for customer:", vehicles);
        
        if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
          console.log("No vehicles found for this customer");
          setCustomerVehicles([]);
        } else {
          setCustomerVehicles(vehicles);
        }
      } catch (error) {
        console.error("Error loading vehicles:", error);
        setCustomerVehicles([]);
      }
    } else {
      setCustomerVehicles([]);
    }
  };

  const handleSave = () => {
    onSave(newOrder);
    // Reset form
    setNewOrder({
      customerId: "",
      vehicleId: 0,
      agentId: effectiveUserId,
      statusId: 3,
      orderDate: new Date().toISOString(),
    });
    setSelectedCustomer(null);
    setCustomerVehicles([]);
  };

  return (
    <div className="mt-4 p-4 border rounded bg-gray-50">
      <h2 className="text-lg font-semibold mb-4">Új rendelés</h2>

      <div className="grid grid-cols-1 gap-4">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Ügyfél</label>
          <AsyncSelect
            cacheOptions
            loadOptions={loadCustomers}
            defaultOptions
            value={selectedCustomer}
            onChange={handleCustomerChange}
            placeholder="Keresés név/email alapján..."
            noOptionsMessage={() => "Nem található ügyfél"}
            loadingMessage={() => "Keresés..."}
            className="basic-single"
            classNamePrefix="select"
          />
        </div>

        {customerVehicles.length > 0 ? (
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Autó</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={newOrder.vehicleId}
              onChange={(e) =>
                setNewOrder((prev) => ({
                  ...prev,
                  vehicleId: Number(e.target.value),
                }))
              }
            >
              <option value={0}>Válassz autót...</option>
              {customerVehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                </option>
              ))}
            </select>
          </div>
        ) : newOrder.customerId ? (
          <div className="col-span-1">
            <div className="py-2 px-3 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
              Az ügyfélnek nincs regisztrált autója
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex justify-end mt-4 gap-2">
        <button
          className="bg-gray-300 px-4 py-2 rounded"
          onClick={onCancel}
        >
          Mégse
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSave}
          disabled={!newOrder.customerId || newOrder.vehicleId === 0}
        >
          Mentés
        </button>
      </div>
    </div>
  );
};