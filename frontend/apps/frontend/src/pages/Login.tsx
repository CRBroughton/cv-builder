import { Button, FieldInput, Stack } from "@cv-builder/components";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.js";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const err = await login(email, password);
    if (err) {
      setError(err);
      setIsLoading(false);
    } else {
      navigate("/");
    }
  }

  return (
    <Stack style={{ padding: "2rem", maxWidth: 360, margin: "4rem auto" }}>
      <h1>Sign in</h1>
      <form onSubmit={handleSubmit}>
        <Stack gap={3}>
          <FieldInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FieldInput
            label="Password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p role="alert" style={{ color: "red", margin: 0 }}>
              {error}
            </p>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </Stack>
      </form>
      <p>
        No account? <Link to="/register">Register</Link>
      </p>
    </Stack>
  );
}
