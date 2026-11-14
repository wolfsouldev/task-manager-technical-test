import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api, ApiError } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { userFormSchema } from "./schemas/user-form.schema";
import type { UserFormProps, UserFormValues } from "./types/user-form.types";

export function UserForm({ user, onSuccess }: UserFormProps) {
  const client = useQueryClient();
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });
  const mutation = useMutation({
    mutationFn: (values: UserFormValues) =>
      user
        ? api.updateUser({ ...values, id: user.id })
        : api.createUser(values),
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["users"] }),
        client.invalidateQueries({ queryKey: ["tasks"] }),
      ]);
      toast.success(user ? "Usuario actualizado" : "Usuario creado");
      form.reset();
      onSuccess();
    },
  });
  async function submit(values: UserFormValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      if (error instanceof ApiError)
        for (const [key, message] of Object.entries(error.fieldErrors))
          if (key === "name" || key === "email")
            form.setError(key, { message });
    }
  }
  return (
    <form
      noValidate
      onSubmit={form.handleSubmit(submit)}
      className="form-stack"
    >
      <Field data-invalid={!!form.formState.errors.name}>
        <FieldLabel htmlFor="user-name">Nombre</FieldLabel>
        <Input
          id="user-name"
          autoFocus
          placeholder="Nombre y apellidos"
          {...form.register("name")}
          aria-invalid={!!form.formState.errors.name}
          aria-describedby="user-name-error"
        />
        <FieldError
          id="user-name-error"
          errors={[form.formState.errors.name]}
        />
      </Field>
      <Field data-invalid={!!form.formState.errors.email}>
        <FieldLabel htmlFor="user-email">Correo electrónico</FieldLabel>
        <Input
          id="user-email"
          type="email"
          placeholder="nombre@example.test"
          {...form.register("email")}
          aria-invalid={!!form.formState.errors.email}
          aria-describedby="user-email-error"
        />
        <FieldError
          id="user-email-error"
          errors={[form.formState.errors.email]}
        />
      </Field>
      {mutation.error && (
        <p role="alert" className="form-error">
          {mutation.error.message}
        </p>
      )}
      <div className="form-actions">
        <Button
          type="submit"
          disabled={mutation.isPending || form.formState.isSubmitting}
        >
          {mutation.isPending
            ? "Guardando…"
            : user
              ? "Guardar cambios"
              : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
