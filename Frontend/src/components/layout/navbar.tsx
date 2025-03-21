import { useState, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import MenuItem from "../../models/MenuItem";
import AuthItem from "../../models/AuthItem";

export const menuItems: MenuItem[] = [
  { title: "Főoldal", path: "/" },
  { title: "Szolgáltatásaink", path: "/services" },
  { title: "Rólunk", path: "/aboutus" },
  { title: "Kapcsolat", path: "/contact" },
  {
    title: "DropDownTest",
    hasDropdown: true,
    subItems: [
      { title: "Test1", path: "/test1" },
      { title: "Test2", path: "/test2" },
      { title: "Test3", path: "/test3" },
    ],
  },
  {
    title: "Adminisztráció",
    requiredRoles: ["admin"], // TODO: AuthGuard kell
    path: "/admin",
  },
];

export const authItems: AuthItem[] = [
  { title: "Bejelentkezés", path: "/auth/login" },
  { title: "Regisztráció", path: "/auth/register", special: true },
];

const Navbar: React.FC = () => {
  const [menuState, setMenuState] = useState<{
    mainOpen: boolean;
    dropdownOpen: string;
    mobileDropdownOpen: string;
  }>({
    mainOpen: false,
    dropdownOpen: "",
    mobileDropdownOpen: "",
  });

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
            {menuItems.map((item) => (
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
            ))}
          </div>

          <div className="hidden sm:flex sm:items-center">
            {authItems.map((auth) => (
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
            ))}
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
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.hasDropdown ? (
                <>
                  <button
                    onClick={() => toggleMenu("mobileDropdownOpen", item.title)}
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
          ))}
          <div className="pt-4 pb-3 border-t border-gray-200">
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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
