type MenuItem = {
    title: string;
    path?: string;
    hasDropdown?: boolean;
    requiredRoles?: string[]; // TODO
    subItems?: { title: string; path: string }[];
  };

export default MenuItem;