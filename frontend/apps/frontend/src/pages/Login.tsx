import { Button, Container, FieldError, FieldInput, Stack, Text } from "@cv-builder/components";
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

  async function handleSubmit(e: React.SyntheticEvent) {
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
    <Container maxWidth={400} style={{ marginTop: "4rem" }}>
      <Stack gap={4}>
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
            {error && <FieldError>{error}</FieldError>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </form>
        <Text>
          No account? <Link to="/register">Register</Link>
        </Text>
      </Stack>
    </Container>
  );
}
