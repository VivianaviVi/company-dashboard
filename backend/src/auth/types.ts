export type CurrentUser = {
  id: string;
  email: string;
  role: "admin" | "manager" | "user";
};

