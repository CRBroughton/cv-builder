import {
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  FieldError,
  FieldInput,
  Grid,
  Stack,
  Text,
} from "@cv-builder/components";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@cv-builder/api";

type CV = {
  id: string;
  title: string;
  created_at: string;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    api.cvs.list().then((result) => {
      if (result.isOk()) {
        setCvs(result.value);
      } else {
        setError("Failed to load CVs. Please try again.");
      }
      setIsLoading(false);
    });
  }, []);

  async function handleCreate(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setIsCreating(true);
    setCreateError(null);
    const result = await api.cvs.create({ title: newTitle.trim() });
    if (result.isOk()) {
      navigate(`/${result.value.id}`);
    } else {
      setCreateError("Failed to create CV. Please try again.");
      setIsCreating(false);
    }
  }

  async function handleDelete(id: string) {
    const result = await api.cvs.delete(id);
    if (result.isOk()) {
      setCvs((prev) => prev.filter((cv) => cv.id !== id));
    } else {
      setError("Failed to delete CV. Please try again.");
    }
  }

  return (
    <Container>
      <Stack gap={4}>
        <h1>Your CVs</h1>

        <form onSubmit={handleCreate}>
          <Stack gap={2}>
            <Stack direction="row" gap={2} align="flex-end">
              <Box grow>
                <FieldInput
                  label="New CV title"
                  placeholder="e.g. Software Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </Box>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating…" : "Create CV"}
              </Button>
            </Stack>
            {createError && <FieldError>{createError}</FieldError>}
          </Stack>
        </form>

        {error && <FieldError>{error}</FieldError>}

        {isLoading ? (
          <Text variant="secondary">Loading…</Text>
        ) : cvs.length === 0 ? (
          <EmptyState>
            <Text>No CVs yet.</Text>
            <Text size="sm">Create your first one above.</Text>
          </EmptyState>
        ) : (
          <Grid cols={1} gap={2}>
            {cvs.map((cv) => (
              <Card key={cv.id} interactive onClick={() => navigate(`/${cv.id}`)}>
                <Stack direction="row" align="center" justify="space-between">
                  <Stack gap={1}>
                    <Text as="strong" weight="semibold">{cv.title}</Text>
                    <Text as="span" size="sm" variant="secondary">
                      Created{" "}
                      {new Date(cv.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                  </Stack>
                  <Button onClick={(e) => { e.stopPropagation(); handleDelete(cv.id); }}>
                    Delete
                  </Button>
                </Stack>
              </Card>
            ))}
          </Grid>
        )}
      </Stack>
    </Container>
  );
}
