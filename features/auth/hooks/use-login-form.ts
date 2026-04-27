import { getApiErrorMessage } from "@/lib/api";
import { persistAuthSession } from "@/lib/auth-session";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signIn } from "../api";

export function useLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data } = await signIn({ email, password });
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
    showPassword,
    setShowPassword,
    loading,
    error,
    handleLogin,
  };
}
