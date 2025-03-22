type MenuItem = {
    title: string;
    path?: string;
    hasDropdown?: boolean;
    requiredRoles?: string[];
    subItems?: { title: string; path: string }[];
  };

export default MenuItem;