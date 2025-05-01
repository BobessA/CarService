import { AuthProvider } from '../contexts/AuthContext'
import { createRootRoute, Outlet } from "@tanstack/react-router";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
    <div className="flex flex-col min-h-screen">
      <Navbar />
        <div className="flex-grow min-h-96">
          <Outlet />
        </div>
      <Footer />
    </div>
    </AuthProvider>
  ),
});
