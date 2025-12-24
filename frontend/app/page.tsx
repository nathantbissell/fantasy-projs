"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Anchor,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Standing = {
  name: string;
  wins: number;
  losses: number;
  ties?: number;
  pointsFor: number;
  pointsAgainst: number;
  seed?: number;
  owner?: string;
};

const FALLBACK_STANDINGS: Standing[] = [
  {
    name: "Staten Island Sailors",
    wins: 12,
    losses: 2,
    ties: 0,
    pointsFor: 1780,
    pointsAgainst: 1450,
    seed: 1,
    owner: "Nate B",
  },
  {
    name: "Queens Sidewinders",
    wins: 10,
    losses: 4,
    ties: 0,
    pointsFor: 1665,
    pointsAgainst: 1510,
    seed: 2,
    owner: "M. Harris",
  },
  {
    name: "Brooklyn Blitz",
    wins: 9,
    losses: 5,
    pointsFor: 1612,
    pointsAgainst: 1588,
    seed: 3,
    owner: "T. Young",
  },
  {
    name: "Harlem Heat",
    wins: 8,
    losses: 6,
    pointsFor: 1540,
    pointsAgainst: 1499,
    seed: 4,
    owner: "R. Kelly",
  },
  {
    name: "Bronx Bombers",
    wins: 7,
    losses: 7,
    pointsFor: 1492,
    pointsAgainst: 1533,
    seed: 5,
    owner: "S. Reyes",
  },
  {
    name: "Jersey Fury",
    wins: 6,
    losses: 8,
    pointsFor: 1446,
    pointsAgainst: 1575,
    seed: 6,
    owner: "C. Lowe",
  },
  {
    name: "Hudson Valley Hawks",
    wins: 5,
    losses: 9,
    pointsFor: 1380,
    pointsAgainst: 1601,
    seed: 7,
    owner: "L. Porter",
  },
  {
    name: "Garden State Grit",
    wins: 3,
    losses: 11,
    pointsFor: 1288,
    pointsAgainst: 1692,
    seed: 8,
    owner: "D. Webb",
  },
];

function normalizeStandings(payload: unknown): Standing[] {
  const unwrap = (value: any) => {
    if (value && typeof value === "object" && "data" in value) {
      return (value as { data: unknown }).data;
    }
    return value;
  };

  const root = unwrap(payload) as any;
  const rows: any[] =
    (root && Array.isArray(root.standings) && root.standings) ||
    (root && Array.isArray(root.teams) && root.teams) ||
    [];

  return rows.map((team, index) => ({
    name: team.teamName || team.name || `Team ${index + 1}`,
    wins: Number(team.wins ?? team.record?.wins ?? 0),
    losses: Number(team.losses ?? team.record?.losses ?? 0),
    ties: Number(team.ties ?? team.record?.ties ?? 0) || undefined,
    pointsFor: Number(
      team.pointsFor ?? team.points ?? team.stats?.pointsFor ?? 0
    ),
    pointsAgainst: Number(team.pointsAgainst ?? team.stats?.pointsAgainst ?? 0),
    seed: team.seed ?? team.playoffSeed ?? index + 1,
    owner: team.owner ?? team.manager ?? undefined,
  }));
}

export default function Page() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const loadStandings = useCallback(
    async (signal?: AbortSignal) => {
      if (!baseUrl) {
        setStandings(FALLBACK_STANDINGS);
        setError("Set NEXT_PUBLIC_API_BASE_URL to load live standings.");
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${baseUrl}/league/2025`, { signal });
        if (!response.ok) {
          throw new Error(
            `API responded with ${response.status} for /league/2025`
          );
        }
        const payload = await response.json();
        const parsed = normalizeStandings(payload);
        setStandings(parsed.length ? parsed : FALLBACK_STANDINGS);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setStandings(FALLBACK_STANDINGS);
        setError(
          err instanceof Error ? err.message : "Unable to load league standings"
        );
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadStandings(controller.signal);
    return () => controller.abort();
  }, [loadStandings]);

  const chartData = useMemo(
    () =>
      standings.map((team) => ({
        name: team.name,
        pointsFor: team.pointsFor,
      })),
    [standings]
  );

  const totalPoints = useMemo(
    () => standings.reduce((sum, team) => sum + team.pointsFor, 0),
    [standings]
  );

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6}>
            <Title order={2}>CPFFL 2025 Standings</Title>
            <Text c="dimmed">
              Live league data pulled from the CPFFL Lambda & DynamoDB service.
              Plug in your ESPN SWID/ESPN_S2 to keep this in sync.
            </Text>
            <Group gap="xs">
              <Badge size="lg" variant="gradient" gradient={{ from: "indigo", to: "cyan" }}>
                2025 Season
              </Badge>
              <Badge size="lg" variant="light">
                ESPN Historical Archive
              </Badge>
            </Group>
          </Stack>
          <Button
            variant="gradient"
            gradient={{ from: "cyan", to: "indigo" }}
            loading={loading}
            onClick={() => loadStandings()}
          >
            Refresh
          </Button>
        </Group>

        {error && (
          <Card withBorder radius="md" bg="rgba(255,255,255,0.05)">
            <Text fw={600}>Heads up</Text>
            <Text c="dimmed" size="sm" mt={4}>
              {error}
            </Text>
            <Text size="sm" mt="sm">
              Set <Badge color="indigo">NEXT_PUBLIC_API_BASE_URL</Badge> to your deployed
              API Gateway URL so this page can read{" "}
              {baseUrl ? (
                <Anchor href={`${baseUrl}/league/2025`} target="_blank" c="cyan">
                  /league/2025
                </Anchor>
              ) : (
                "/league/2025"
              )}{" "}
              data from DynamoDB.
            </Text>
          </Card>
        )}

        <Card withBorder radius="md" padding="lg" bg="rgba(255,255,255,0.03)">
          <Group justify="space-between" align="center">
            <Stack gap={2}>
              <Text c="dimmed" size="sm">
                League total points
              </Text>
              <Title order={3}>{totalPoints.toLocaleString()} pts</Title>
            </Stack>
            {loading && <Loader size="sm" />}
          </Group>
          <Divider my="md" />
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="name" tick={{ fill: "#cdd5f5" }} />
                <YAxis tick={{ fill: "#cdd5f5" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }}
                  labelStyle={{ color: "#e8ecf6" }}
                />
                <Bar dataKey="pointsFor" fill="url(#pointsGradient)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="pointsGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card withBorder radius="md" padding="lg" bg="rgba(255,255,255,0.03)">
          <Group justify="space-between" mb="md">
            <Title order={4}>Standings</Title>
            <Text c="dimmed" size="sm">
              Sorted by playoff seed
            </Text>
          </Group>
          <Table striped highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Team</Table.Th>
                <Table.Th>Owner</Table.Th>
                <Table.Th>Record</Table.Th>
                <Table.Th>Points For</Table.Th>
                <Table.Th>Points Against</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {standings.map((team) => (
                <Table.Tr key={team.name}>
                  <Table.Td>
                    <Badge radius="sm" variant="light">
                      {team.seed ?? "-"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{team.name}</Table.Td>
                  <Table.Td>{team.owner ?? "—"}</Table.Td>
                  <Table.Td>
                    {team.wins}-{team.losses}
                    {team.ties ? `-${team.ties}` : ""}
                  </Table.Td>
                  <Table.Td>{team.pointsFor.toLocaleString()}</Table.Td>
                  <Table.Td>{team.pointsAgainst.toLocaleString()}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      </Stack>
    </Container>
  );
}
