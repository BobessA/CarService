import { createFileRoute } from '@tanstack/react-router'
import { useState, ChangeEvent, FormEvent } from "react";
import { ContactFormData, Errors }  from "../models/ContactFormData";

export const Route = createFileRoute('/contact')({
  component: RouteComponent,
});

function RouteComponent() {
  const [formData, setFormData] = useState<ContactFormData>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = (): boolean => {
    let newErrors: Errors = {};
    if (!formData.name.trim()) newErrors.name = "A név megadása kötelező!";
    if (!formData.email.trim()) newErrors.email = "Az e-mail megadása kötelező!";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Érvényes e-mail címet adj meg!";
    if (!formData.message.trim()) newErrors.message = "Az üzenet nem lehet üres!";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Üzenet elküldve:", formData);
      alert("Üzeneted sikeresen elküldve!");
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
    }
  };

  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Kapcsolatfelvétel</h2>
        <p className="text-center text-gray-600 mt-2">
          Kérdésed van? Írj nekünk, és hamarosan válaszolunk!
        </p>

        <div className="mt-10 bg-white p-8 rounded-lg shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Név</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500 ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Írd be a neved"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="pelda@email.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Üzenet</label>
              <textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                className={`w-full mt-1 p-3 border rounded-md focus:ring focus:ring-red-500 focus:border-red-500 ${
                  errors.message ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Írd be az üzeneted..."
              ></textarea>
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-md text-lg font-medium hover:bg-red-700 transition"
            >
              Üzenet küldése
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
