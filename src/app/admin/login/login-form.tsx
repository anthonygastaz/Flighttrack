"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction } from "@/server/actions/auth-actions";

export function LoginForm({ disabled = false }: { disabled?: boolean }) {
  const [state, formAction, pending] = useActionState(signInAction, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Admin Email"
          required
          disabled={disabled}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required disabled={disabled} />
      </div>
      {state && !state.ok && (
        <p className="text-sm text-destructive">{state.error.message}</p>
      )}
      <Button
        type="submit"
        className="h-11 w-full rounded-full bg-brand-green text-white hover:bg-brand-green-hover"
        disabled={pending || disabled}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
