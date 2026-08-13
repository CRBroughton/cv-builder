import { api } from "@cv-builder/api";
import { Button } from "@cv-builder/components";
import { useState } from "react";

export function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleLogin() {
    const result = await api.auth.login(email, password);
    if (result.isOk()) {
      setStatus(`logged in — token: ${result.value.access_token?.slice(0, 20)}...`);
    } else {
      setStatus(`error ${result.error.status}: ${result.error.message}`);
    }
  }

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>CV Builder</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: 320 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={handleLogin}>Login</Button>
        {status && <p>{status}</p>}
      </div>
    </div>
  );
}

export default App;
