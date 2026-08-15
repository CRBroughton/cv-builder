import { Button, Container, FieldError, FieldInput, Stack, Text } from "@cv-builder/components";
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

  async function handleSubmit(e: React.SyntheticEvent) {
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
    <Container maxWidth={400} style={{ marginTop: "4rem" }}>
      <Stack gap={4}>
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
            {error && <FieldError>{error}</FieldError>}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating account…" : "Create account"}
            </Button>
          </Stack>
        </form>
        <Text>
          Already have an account? <Link to="/login">Sign in</Link>
        </Text>
      </Stack>
    </Container>
  );
}
