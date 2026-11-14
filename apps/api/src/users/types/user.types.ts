export interface PublicUser {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRow = PublicUser & { seedKey: string | null };

export type UserInput = Pick<UserRow, "name" | "email"> &
  Partial<Pick<UserRow, "seedKey" | "createdAt" | "updatedAt">>;
