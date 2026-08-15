import { Button, FieldInput, Stack } from "@cv-builder/components";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.js";

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const err = await register(email, password);
    if (err) {
      setError(err);
      setIsLoading(false);
    } else {
      navigate("/");
    }
  }

  return (
    <Stack style={{ padding: "2rem", maxWidth: 360, margin: "4rem auto" }}>
      <h1>Create account</h1>
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
            {isLoading ? "Creating account…" : "Create account"}
          </Button>
        </Stack>
      </form>
      <p>
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </Stack>
  );
}
