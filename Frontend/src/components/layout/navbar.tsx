import { useState, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import MenuItem from "../../models/MenuItem";
import AuthItem from "../../models/AuthItem";

export const menuItems: MenuItem[] = [
  { title: "Főoldal", path: "/" },
  { title: "Szolgáltatásaink", path: "/services" },
  { title: "Rólunk", path: "/aboutus" },
  { title: "Kapcsolat", path: "/contact" },
  {
    title: "Adminisztráció",
    requiredRoles: [4],
    path: "/admin",
    hasDropdown: true,
    subItems: [
      { title: "Vezérlőpult", path: "/admin/" },
      { title: "Autók", path: "/admin/cars/" },
    ],
  },
  {
    title: "Ajánlatkérés!",
    path: "/offer",
    special: true,
    requiredRoles: [1,2,3,4],
  },
];

export const authItems: AuthItem[] = [
  { title: "Bejelentkezés", path: "/auth/login" },
  { title: "Regisztráció", path: "/auth/register", special: true },
];

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuState, setMenuState] = useState<{
    mainOpen: boolean;
    dropdownOpen: string;
    mobileDropdownOpen: string;
  }>({
    mainOpen: false,
    dropdownOpen: "",
    mobileDropdownOpen: "",
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserOpen, setMobileUserOpen] = useState(false);

  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const toggleMenu = (key: keyof typeof menuState, value?: string) => {
    setMenuState((prev) => ({
      ...prev,
      [key]: prev[key] === value ? "" : value || !prev[key],
    }));
  };

  const openDropdown = (menu: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setMenuState((prev) => ({ ...prev, dropdownOpen: menu }));
  };

  const closeDropdown = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setMenuState((prev) => ({ ...prev, dropdownOpen: "" }));
    }, 300);
  };

  const isActive = (menuItem: MenuItem) => {
    if (menuItem.path && currentPath === menuItem.path) {
      return "bg-red-600 text-white";
    }

    if (menuItem.hasDropdown && menuItem.subItems) {
      const isSubItemActive = menuItem.subItems.some(
        (subItem) => currentPath === subItem.path
      );
      if (isSubItemActive) {
        return "bg-red-600 text-white";
      }
    }
    return "text-gray-900 hover:bg-gray-100";
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center">
            <img
              className="block h-8 w-auto"
              src="/images/logo.png"
              alt="Car Service Logo"
            />
            <span className="ml-2 text-xl font-bold text-gray-800">
              Szervíz
            </span>
          </div>

          <div className="hidden sm:flex sm:ml-10 space-x-6">
            {menuItems.map(
              (item) =>
                (!item.requiredRoles ||
                  (user &&
                    ((!item.requiredRoles ||
                      item.requiredRoles.includes(user.roleId)) && !item.special ))) && (
                  <div
                    key={item.title}
                    className="relative group"
                    onMouseEnter={() =>
                      item.hasDropdown && openDropdown(item.title)
                    }
                    onMouseLeave={() => item.hasDropdown && closeDropdown()}
                  >
                    <Link
                      to={item.path || "#"}
                      className={`px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                        item.hasDropdown ? "cursor-pointer" : ""
                      } ${isActive(item)}`}
                    >
                      {item.title}
                      {item.hasDropdown && (
                        <ChevronDown size={16} className="ml-2" />
                      )}
                    </Link>
                    {item.hasDropdown && item.subItems && (
                      <div
                        className={`absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md z-50 transition-all duration-300 ${
                          menuState.dropdownOpen === item.title
                            ? "opacity-100 scale-100 visible"
                            : "opacity-0 scale-95 invisible"
                        }`}
                        onMouseEnter={() => openDropdown(item.title)}
                        onMouseLeave={closeDropdown}
                      >
                        {item.subItems.map((sub) => (
                          <Link
                            key={sub.title}
                            to={sub.path}
                            className={`block px-4 py-2 text-gray-900 hover:bg-gray-100`}
                          >
                            {sub.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}
          </div>

          <div className="hidden sm:flex sm:items-center">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((open) => !open)}
                  className="flex items-center text-gray-900 px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                >
                  Üdv, {user.name}! <ChevronDown size={16} className="ml-1" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md z-50">
                    <Link
                      to="/auth/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Profilom
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Kijelentkezés
                    </button>
                  </div>
                )}
              </div>
            ) : (
              authItems.map((auth) => (
                <Link
                  key={auth.title}
                  to={auth.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    auth.special
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {auth.title}
                </Link>
              ))
            )}

            {menuItems.map(
              (item) =>
                (item.special &&
                  (user &&
                    ((!item.requiredRoles ||
                      item.requiredRoles.includes(user.roleId)) ))) && (
                      <Link
                        key={item.title}
                        to={item.path || "#"}
                        className={`px-3 py-2 rounded-md text-sm font-medium text-gray-900 bg-red-600 text-white`}
                      >
                        {item.title}
                      </Link>
                      )
                    )
                  }
            
          </div>

          <div className="sm:hidden flex items-center">
            <button
              onClick={() => toggleMenu("mainOpen")}
              className="text-gray-900 hover:bg-gray-100 p-2 rounded-md"
            >
              {menuState.mainOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={`sm:hidden transition-all duration-300 ${menuState.mainOpen ? "block" : "hidden"}`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-md">
          {menuItems.map(
            (item) =>
              (!item.requiredRoles ||
                (user &&
                  (!item.requiredRoles ||
                    item.requiredRoles.includes(user.roleId) && !item.special))) && (
                <div key={item.title}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          toggleMenu("mobileDropdownOpen", item.title)
                        }
                        className="flex justify-between w-full px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md text-base font-medium"
                      >
                        {item.title}
                        <ChevronDown
                          size={16}
                          className={`transform transition-transform ${menuState.mobileDropdownOpen === item.title ? "rotate-180" : ""}`}
                        />
                      </button>
                      {menuState.mobileDropdownOpen === item.title &&
                        item.subItems?.map((sub) => (
                          <Link
                            key={sub.title}
                            to={sub.path}
                            className={`block px-6 py-2 text-gray-900 hover:bg-gray-100`}
                          >
                            {sub.title}
                          </Link>
                        ))}
                    </>
                  ) : (
                    <Link
                      to={item.path || "#"}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(item)}`}
                    >
                      {item.title}
                    </Link>
                  )}
                </div>
              )
          )}

          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <>
                <button
                  onClick={() => setMobileUserOpen((v) => !v)}
                  className="flex justify-between w-full px-3 py-2 text-gray-900 hover:bg-gray-100 rounded-md"
                >
                  <span>Üdv, {user.name}!</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform ${mobileUserOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileUserOpen && (
                  <div className="mt-2 space-y-1 px-3">
                    <Link
                      to="/auth/profile"
                      className="block px-3 py-2 rounded-md text-gray-900 hover:bg-gray-100"
                    >
                      Profilom
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-gray-100"
                    >
                      Kijelentkezés
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                {authItems.map((auth) => (
                  <Link
                    key={auth.title}
                    to={auth.path}
                    className={`block w-full text-center px-3 py-2 rounded-md text-base font-medium ${
                      auth.special
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {auth.title}
                  </Link>
                ))}
              </div>
            )}
             {menuItems.map(
              (item) =>
                (item.special &&
                  (user &&
                    ((!item.requiredRoles ||
                      item.requiredRoles.includes(user.roleId)) ))) && (
                        <Link
                        key={item.title}
                        to={item.path}
                        className={`block w-full text-center px-3 py-2 rounded-md text-base font-medium ${
                          item.special
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "text-gray-900 hover:bg-gray-100"
                        }`}
                        >
                        {item.title}
                        </Link>
                      )
                    )
                  }
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
