import type { User } from "@/features/users/types/user.types";
import type { z } from "zod";
import type { userFormSchema } from "../schemas/user-form.schema";

export type UserFormProps = {
  user?: User;
  onSuccess: () => void;
};

export type UserFormValues = z.infer<typeof userFormSchema>;
