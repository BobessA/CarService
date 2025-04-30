type User = {
    name: string;
    userId: string;
    email: string;
    role: "admin" | "user"; // Todo: Tulajdonos, ügyintéző,szerelő, klies
  };

export default User;