'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

type LoginResponse = {
  token: {
    api_key: string;
    jwt_token: string;
  };
  user: {
    id: number;
    email: string;
  };
};

type SignupResponse = LoginResponse;

const AUTH_TOKEN_KEY = "auth_token";

export function LoginDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setMode("login");
      setError(null);
      setSuccessMessage(null);
      setPassword("");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint =
        mode === "signup" ? "/api/v1/register" : "/api/v1/login";
      const payload =
        mode === "signup"
          ? {
              first_name: firstName,
              last_name: lastName,
              email,
              password,
              phone_number: phoneNumber || undefined,
            }
          : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as
        | LoginResponse
        | SignupResponse
        | { error?: string };
      if (!res.ok) {
        const message =
          data && typeof data === "object" && "error" in data
            ? data.error
            : null;
        throw new Error(message || "Login failed.");
      }

      if (data && "token" in data) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token.jwt_token);
      }

      setSuccessMessage(
        mode === "signup"
          ? "Account created successfully."
          : "Logged in successfully."
      );
      setPassword("");
      if (mode === "signup") {
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
      }
      setIsOpen(false);
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to log in.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Log in
      </DialogTrigger>
      <DialogContent className="w-[92vw] max-w-md rounded-2xl bg-background p-6">
        <DialogHeader className="gap-1">
          <DialogTitle className="text-xl font-semibold">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signup"
              ? "Set up an account to manage your chatbot configuration."
              : "Log in to manage your chatbot configuration."}
          </DialogDescription>
        </DialogHeader>
        <DialogClose />

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "signup" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  First name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Jane"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Last name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Doe"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="••••••••"
            />
          </div>

          {mode === "signup" && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Phone number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="+1 555 0100"
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {successMessage && (
            <p className="text-sm text-emerald-600">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            type="button"
            onClick={() =>
              setMode((current) => (current === "signup" ? "login" : "signup"))
            }
            className="font-medium text-primary hover:text-primary/80"
          >
            {mode === "signup" ? "Sign in" : "Create one"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
