export type User = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type UserPageQuery = { page: number; limit: number; q?: string };

export type UserInput = { name: string; email: string };

export type UpdateUser = UserInput & { id: number };
