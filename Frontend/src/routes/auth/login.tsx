import { useState,FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/AuthContext";

export const Route = createFileRoute("/auth/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login } = useAuth();


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    login(email,password);
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800">Bejelentkezés</h2>

        <form onSubmit={handleSubmit} className="mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email cím</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
              placeholder="pelda@email.com"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Jelszó</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-indigo-500"
              placeholder="Jelszó"
            />
          </div>

          <button type="submit" className="w-full mt-6 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition">
            Bejelentkezés
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Még nincs fiókod?{" "}
          <Link to="/auth/register" className="text-indigo-600 hover:underline">Regisztrálj itt</Link>
        </p>
      </div>
    </div>
  );
}
