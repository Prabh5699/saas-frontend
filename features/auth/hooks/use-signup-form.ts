import { getApiErrorMessage } from "@/lib/api";
import { persistAuthSession } from "@/lib/auth-session";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signUp } from "../api";

export function useSignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don’t match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        email: email.trim(),
        password,
      };

      const { data } = await signUp(body);
      persistAuthSession(data);
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Could not save session")) {
        setError(err.message);
      } else {
        setError(getApiErrorMessage(err, "Could not reach the server. Is it running?"));
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    handleSignup,
  };
}
