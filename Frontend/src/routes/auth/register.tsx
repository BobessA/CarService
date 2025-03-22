import { useState, ChangeEvent, FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import  RegisterFormData  from "../../models/RegisterFormData";

export const Route = createFileRoute("/auth/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("A jelszavak nem egyeznek!");
      return;
    }
    console.log("Regisztráció:", formData);
  };

  return (
    <div className="h-full flex-grow flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Regisztráció
        </h2>

        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Név
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
              placeholder="Teljes név"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Email cím
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
              placeholder="pelda@email.com"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Jelszó
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
              placeholder="Jelszó"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Jelszó megerősítése
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
              placeholder="Jelszó újra"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Regisztráció
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Már van fiókod?{" "}
          <Link to="/auth/login" className="text-indigo-600 hover:underline">
            Bejelentkezés itt
          </Link>
        </p>
      </div>
    </div>
  );
}
