type MenuItem = {
    title: string;
    path?: string;
    hasDropdown?: boolean;
    requiredRoles?: number[];
    subItems?: { title: string; path: string }[];
  };

export default MenuItem;