"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { interpolateZoom } from "d3-interpolate";
import { hierarchy, pack, type HierarchyCircularNode } from "d3-hierarchy";
import { select } from "d3-selection";
import "d3-transition";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ActiveElement,
  type ChartEvent,
  type ChartOptions,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type TooltipItem,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { PageContainer } from "../../components/PageContainer";
import { getAuthEmail, getAuthToken, subscribeAuth } from "../../components/authClient";
import { apiFetch } from "../../components/apiClient";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement
);

type Company = {
  company_code: string;
  company_name: string;
  level: number;
  country: string;
  city: string;
  founded_year: number;
  annual_revenue: number;
  employees: number;
};


type BubbleNode = {
  name: string;
  value?: number;
  company?: Company;
  children?: BubbleNode[];
};

type BubbleMode = "level" | "country" | "city";

function buildCompanyHierarchy(companies: Company[], mode: BubbleMode): BubbleNode {


  const root: BubbleNode = { name: "Companies", children: [] };
  const groups = new Map<string, BubbleNode>();

  function groupKey(c: Company) {
    if (mode === "country") return c.country;
    if (mode === "city") return c.city;
    return `Level ${c.level}`;
  }

  for (const c of companies) {
    const k = groupKey(c);
    if (!groups.has(k)) groups.set(k, { name: k, children: [] });
    groups.get(k)!.children!.push({
      name: c.company_name,
      company: c,
      value: Math.max(1, c.employees),
    });
  }

  const keys = Array.from(groups.keys());
  if (mode === "level") keys.sort((a, b) => Number(a.replace("Level ", "")) - Number(b.replace("Level ", "")));
  else keys.sort((a, b) => a.localeCompare(b));
  root.children = keys.map((k) => groups.get(k)!);
  return root;
}

function bubbleTooltip(d: HierarchyCircularNode<BubbleNode>) {
  if (!d.data.company) return d.data.name;
  const c = d.data.company;
  return [
    `Name: ${c.company_name}`,
    `Level: ${c.level}`,
    `Country: ${c.country}`,
    `City: ${c.city}`,
    `Founded year: ${c.founded_year}`,
    `Annual revenue: ${c.annual_revenue.toLocaleString()}`,
    `Employees: ${c.employees.toLocaleString()}`,
  ].join("\n");
}

function BubbleChart({ companies, mode }: { companies: Company[]; mode: BubbleMode }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState(520);

  useEffect(() => {
    function update() {
      const el = wrapRef.current;
      if (!el) return;
      const w = el.getBoundingClientRect().width;
      const next = Math.max(320, Math.min(620, Math.floor(w)));
      setSize(next);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    el.innerHTML = "";

    const data = buildCompanyHierarchy(companies, mode);
    const root = pack<BubbleNode>()
      .size([size, size])
      .padding(3)(
        hierarchy(data)
          .sum((d) => d.value || 0)
          .sort((a, b) => (b.value || 0) - (a.value || 0))
      );

    let focus: HierarchyCircularNode<BubbleNode> = root;
    let view: [number, number, number] = [root.x, root.y, root.r * 2];

    const svg = select(el)
      .append("svg")
      .attr("width", "100%")
      .attr("height", size)
      .attr("viewBox", `-${size / 2} -${size / 2} ${size} ${size}`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("display", "block")
      .style("cursor", "pointer");

    const g = svg.append("g");


    const THEME_BLUE = "#60a5fa";

    const node = g
      .selectAll<SVGCircleElement, HierarchyCircularNode<BubbleNode>>("circle")
      .data(root.descendants().slice(1))
      .join("circle")
      .attr("fill", (d) => {
        if (!d.children) return "#ffffff";
        return THEME_BLUE;
      })

      .attr("stroke", "none")

      .attr("fill-opacity", (d) => (d.children ? 0.22 : 1))
      .on("click", (event: MouseEvent, d: HierarchyCircularNode<BubbleNode>) => {

        event.stopPropagation();
        if (focus !== d) {
          zoom(d);
        }
      });

    node.append("title").text((d) => bubbleTooltip(d));

    const label = g
      .selectAll<SVGTextElement, HierarchyCircularNode<BubbleNode>>("text")
      .data(root.descendants())
      .join("text")
      .attr("pointer-events", "none")
      .style("font-family", "Roboto, Helvetica, Arial, sans-serif")
      .style("font-size", (d) => {

        if (d.parent === root) return "15px";
        return "12px";
      })
      .style("font-weight", (d) => (d.parent === root ? "700" : "400"))
      .style("fill", "#0f172a")
      .style("text-anchor", "middle")
      .style("user-select", "none")
      .style("fill-opacity", (d) => (d.parent === root ? 1 : 0))
      .style("display", (d) => (d.parent === root ? "inline" : "none"))
      .text((d) => d.data.name);


    const details = g
      .append("text")
      .attr("text-anchor", "middle")
      .attr("pointer-events", "none")
      .style("font-family", "Roboto, Helvetica, Arial, sans-serif")
      .style("fill", "#0f172a")
      .style("user-select", "none")
      .style("display", "none");

    svg.on("click", () => zoom(focus.parent || root));

    function renderDetails() {
      const c = focus.data.company;
      if (!c) {
        details.style("display", "none");
        details.selectAll("tspan").remove();
        return;
      }
      details.style("display", "inline");
      const lines = [
        c.company_name,
        `Level ${c.level} • ${c.country}`,
        `Revenue: $${c.annual_revenue.toLocaleString()}`,
        `Employees: ${c.employees.toLocaleString()}`,
      ];
      details
        .selectAll<SVGTSpanElement, string>("tspan")
        .data(lines)
        .join("tspan")
        .attr("x", 0)
        .attr("dy", (_d, i) => (i === 0 ? "-1.2em" : "1.2em"))
        .style("font-size", (_d, i) => (i === 0 ? "14px" : "12px"))
        .style("font-weight", (_d, i) => (i === 0 ? "700" : "400"))
        .text((t) => t);
    }

    function zoomTo(v: [number, number, number]) {
      const k = size / v[2];
      view = v;

      label.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("transform", (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`);
      node.attr("r", (d) => d.r * k);
    }

    function zoom(d: HierarchyCircularNode<BubbleNode>) {
      focus = d;
      svg
        .transition("zoom")
        .duration(650)
        .tween("zoom", () => {
          const i = interpolateZoom(view, [focus.x, focus.y, focus.r * 2] as [number, number, number]);
          return (t: number) => zoomTo(i(t));
        });


      label.style("display", (x) => {
        if (x.parent !== focus) return "none";

        return x.r > 20 ? "inline" : "none";
      });
      label.transition("zoom").style("fill-opacity", (x) => (x.parent === focus ? 1 : 0));

      renderDetails();
    }

    zoomTo([root.x, root.y, root.r * 2]);
    renderDetails();
  }, [companies, mode, size]);

  return <Box ref={wrapRef} sx={{ width: "100%" }} />;
}

function formatBigNumber(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

function formatMoney(n: number) {
  return `$${formatBigNumber(n)}`;
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${((part / total) * 100).toFixed(1)}%`;
}

type Dimension = "level" | "country" | "city";

type RequestForm = {
  dimension: Dimension;
  filter: {
    level: number[];
    country: string[];
    city: string[];
    founded_year: { start: string; end: string };
    annual_revenue: { min: string; max: string };
    employees: { min: string; max: string };
  };
};

export default function DashboardPage() {
  const email = useSyncExternalStore(subscribeAuth, getAuthEmail, () => "");
  const token = useSyncExternalStore(subscribeAuth, getAuthToken, () => "");
  const [activeLevel, setActiveLevel] = useState<number | null>(null);
  const [barFiltersOpen, setBarFiltersOpen] = useState(false);
  const [bubbleMode, setBubbleMode] = useState<BubbleMode>("level");
  const [chartTab, setChartTab] = useState<"bar" | "bubble">("bar");


  const [request, setRequest] = useState<RequestForm>(() => ({
    dimension: "level",
    filter: {
      level: [],
      country: [],
      city: [],
      founded_year: { start: "", end: "" },
      annual_revenue: { min: "", max: "" },
      employees: { min: "", max: "" },
    },
  }));

  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [summary, setSummary] = useState({
    companyCount: 0,
    totalRevenue: 0,
    countriesCovered: 0,
    totalEmployees: 0,
  });
  const [levelShare, setLevelShare] = useState<{ total: number; items: { level: number; count: number; percent: number }[] }>({
    total: 0,
    items: [],
  });
  const [growth, setGrowth] = useState<{ points: { year: number; cumulative: number }[] }>({ points: [] });

  const [barFromApi, setBarFromApi] = useState<{ key: string; count: number }[]>([]);
  const [barTotal, setBarTotal] = useState(0);

  const [bubbleRoot, setBubbleRoot] = useState<BubbleNode | null>(null);
  const [bubbleTotal, setBubbleTotal] = useState(0);

  const levelOptions = useMemo(
    () => Array.from(new Set(allCompanies.map((c) => c.level))).sort((a, b) => a - b),
    [allCompanies]
  );
  const countryOptions = useMemo(() => Array.from(new Set(allCompanies.map((c) => c.country))).sort(), [allCompanies]);
  const cityOptions = useMemo(() => Array.from(new Set(allCompanies.map((c) => c.city))).sort(), [allCompanies]);

  useEffect(() => {
    let cancelled = false;
    async function loadBar() {
      try {
        const res = await apiFetch<{ data: Record<string, Company[]>; total: number }>("/companies/filter", {
          method: "POST",
          body: JSON.stringify(request),
        });
        if (cancelled) return;
        setBarTotal(res.total || 0);
        const items = Object.entries(res.data || {}).map(([k, arr]) => ({
          key: k,
          count: Array.isArray(arr) ? arr.length : 0,
        }));
        if (request.dimension === "level") {
          items.sort((a, b) => Number(a.key.replace("Level ", "")) - Number(b.key.replace("Level ", "")));
        } else {
          items.sort((a, b) => a.key.localeCompare(b.key));
        }
        setBarFromApi(items);
      } catch {
        if (cancelled) return;
        setBarFromApi([]);
        setBarTotal(0);
      }
    }
    if (!email) return;
    void loadBar();
    return () => {
      cancelled = true;
    };

  }, [email, request]);

  const barData = useMemo(() => {
    return {
      labels: barFromApi.map((x) => x.key),
      datasets: [
        {
          label: "Company count",
          data: barFromApi.map((x) => x.count),
          backgroundColor: "#60a5fa",
          borderRadius: 6,
        },
      ],
    };
  }, [barFromApi]);

  const barOptions: ChartOptions<"bar"> = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { intersect: false } },
      scales: { y: { ticks: { precision: 0 } } },
    }),
    []
  );

  useEffect(() => {
    if (!email || !token) window.location.href = "/login";
  }, [email, token]);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      if (!email || !token) return;
      try {
        const [companiesRes, summaryRes, levelShareRes, growthRes] = await Promise.all([
          apiFetch<Company[]>("/companies"),
          apiFetch<{ companyCount: number; totalRevenue: number; countriesCovered: number; totalEmployees: number }>("/dashboard/summary"),
          apiFetch<{ total: number; items: { level: number; count: number; percent: number }[] }>("/dashboard/level-share"),
          apiFetch<{ points: { year: number; cumulative: number }[] }>("/dashboard/growth"),
        ]);
        if (cancelled) return;
        setAllCompanies(companiesRes);
        setSummary(summaryRes);
        setLevelShare(levelShareRes);
        setGrowth(growthRes);
      } catch {
        if (cancelled) return;
        setAllCompanies([]);
        setSummary({ companyCount: 0, totalRevenue: 0, countriesCovered: 0, totalEmployees: 0 });
        setLevelShare({ total: 0, items: [] });
        setGrowth({ points: [] });
      }
    }
    void loadDashboard();
    return () => {
      cancelled = true;
    };

  }, [email, token]);

  useEffect(() => {
    let cancelled = false;
    async function loadBubble() {
      if (!email) return;
      try {
        const res = await apiFetch<{ name: string; children: BubbleNode[]; total: number }>("/dashboard/bubble", {
          method: "POST",
          body: JSON.stringify({ dimension: bubbleMode, filter: request.filter }),
        });
        if (cancelled) return;
        setBubbleRoot({ name: res.name, children: res.children });
        setBubbleTotal(res.total || 0);
      } catch {
        if (cancelled) return;
        setBubbleRoot(null);
        setBubbleTotal(0);
      }
    }
    void loadBubble();
    return () => {
      cancelled = true;
    };

  }, [email, bubbleMode, request.filter]);

  const companyCount = summary.companyCount;
  const totalRevenue = summary.totalRevenue;
  const totalEmployees = summary.totalEmployees;
  const countriesCovered = summary.countriesCovered;

  const bubbleCompanies = useMemo(() => {
    const out: Company[] = [];
    const groups = bubbleRoot?.children || [];
    for (const g of groups) {
      for (const n of g.children || []) {
        if (n.company) out.push(n.company);
      }
    }
    return out;
  }, [bubbleRoot]);

  const levelKeys = useMemo(() => levelShare.items.map((x) => x.level).sort((a, b) => a - b), [levelShare.items]);
  const levelCounts = useMemo(() => levelKeys.map((lvl) => levelShare.items.find((x) => x.level === lvl)?.count || 0), [levelKeys, levelShare.items]);

  const donutData = useMemo(
    () => ({
      labels: levelKeys.map((k) => `Level ${k}`),
      datasets: [
        {
          data: levelCounts,
          backgroundColor: ["#60a5fa", "#34d399", "#fbbf24", "#f87171"],
          borderWidth: 0,
        },
      ],
    }),
    [levelCounts, levelKeys]
  );

  const donutOptions: ChartOptions<"doughnut"> = {
    plugins: {
      legend: { position: "bottom" as const },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"doughnut">) => {
            const value = ctx.parsed as number;
            const total = companyCount;
            return `${ctx.label}: ${value} (${pct(value, total)})`;
          },
        },
      },
    },
    onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
      if (!elements || elements.length === 0) {
        setActiveLevel(null);
        return;
      }
      const idx = elements[0].index;
      const level = levelKeys[idx] ?? null;
      setActiveLevel(level);
    },
  };

  const lineData = useMemo(() => {
    const years = growth.points.map((p) => p.year);
    const cumulative = growth.points.map((p) => p.cumulative);
    return {
      labels: years,
      datasets: [
        {
          label: "Companies (cumulative)",
          data: cumulative,
          borderColor: "#60a5fa",
          backgroundColor: "rgba(96, 165, 250, 0.15)",
          tension: 0.25,
          fill: true,
          pointRadius: 3,
        },
      ],
    };
  }, [growth.points]);

  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { intersect: false, mode: "index" as const },
    },
    scales: {
      y: { ticks: { precision: 0 } },
    },
  };

  if (!email) {
    return (
      <PageContainer maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5">Welcome</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please login to view the dashboard.
          </Typography>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Paper>
      </PageContainer>
    );
  }
  if (!token) {
    return (
      <PageContainer maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5">Please login</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your session token is missing or expired. Please login again.
          </Typography>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <Stack
        spacing={2}
        component={Paper}
        sx={{
          p: { xs: 1.5, sm: 2 },
          width: "100%",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="h4">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Current user: {email}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          }}
        >
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, minHeight: 120 }}>
            <Typography variant="overline" color="text.secondary">
              Companies
            </Typography>
            <Typography variant="h5">{formatBigNumber(companyCount)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total companies
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, minHeight: 120 }}>
            <Typography variant="overline" color="text.secondary">
              Total revenue
            </Typography>
            <Typography variant="h5">{formatMoney(totalRevenue)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Sum of annual revenue
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, minHeight: 120 }}>
            <Typography variant="overline" color="text.secondary">
              Countries
            </Typography>
            <Typography variant="h5">{formatBigNumber(countriesCovered)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Unique countries covered
            </Typography>
          </Paper>
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, minHeight: 120 }}>
            <Typography variant="overline" color="text.secondary">
              Employees
            </Typography>
            <Typography variant="h5">{formatBigNumber(totalEmployees)}</Typography>
            <Typography variant="body2" color="text.secondary">
              Total employees
            </Typography>
          </Paper>
        </Box>

        <Stack spacing={2}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", md: "center" },
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ minWidth: { xs: "100%", sm: 260 } }}>
              <Typography variant="h6">Company charts</Typography>
              <Typography variant="body2" color="text.secondary">
                Switch between Bar and Bubble charts
              </Typography>
            </Box>

            <Tabs
              value={chartTab}
              onChange={(_, v) => setChartTab(v as "bar" | "bubble")}
              aria-label="Chart Tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
            >
              <Tab value="bar" label="Bar chart" />
              <Tab value="bubble" label="Bubble chart" />
            </Tabs>
          </Box>

          {chartTab === "bar" ? (
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "center" },
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box sx={{ minWidth: { xs: "100%", sm: 260 } }}>
                  <Typography variant="h6">Company distribution</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dimension: {request.dimension} • Results: {barTotal}
                  </Typography>
                </Box>

                <Tabs
                  value={request.dimension}
                  onChange={(_, v) => setRequest((p) => ({ ...p, dimension: v as Dimension }))}
                  aria-label="Dimension Tabs"
                  variant="scrollable"
                  scrollButtons="auto"
                  allowScrollButtonsMobile
                >
                  <Tab value="level" label="Level" />
                  <Tab value="country" label="Country" />
                  <Tab value="city" label="City" />
                </Tabs>
              </Box>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Filters
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setBarFiltersOpen((v) => !v)}
                    sx={{ minWidth: 120 }}
                  >
                    {barFiltersOpen ? "Hide" : "Show"}
                  </Button>
                </Box>
                <Collapse in={barFiltersOpen}>
                  <Box
                    sx={{
                      display: "grid",
                      gap: 1.5,
                      gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                      mt: 1.5,
                    }}
                  >
                    <Autocomplete
                      multiple
                      options={levelOptions}
                      value={request.filter.level}
                      onChange={(_, v) => setRequest((p) => ({ ...p, filter: { ...p.filter, level: v } }))}
                      renderInput={(params) => <TextField {...params} label="Level (multi)" size="small" />}
                    />
                    <Autocomplete
                      multiple
                      options={countryOptions}
                      value={request.filter.country}
                      onChange={(_, v) => setRequest((p) => ({ ...p, filter: { ...p.filter, country: v } }))}
                      renderInput={(params) => <TextField {...params} label="Country (multi)" size="small" />}
                    />
                    <Autocomplete
                      multiple
                      options={cityOptions}
                      value={request.filter.city}
                      onChange={(_, v) => setRequest((p) => ({ ...p, filter: { ...p.filter, city: v } }))}
                      renderInput={(params) => <TextField {...params} label="City (multi)" size="small" />}
                    />

                    <TextField
                      label="Founded year start"
                      type="number"
                      size="small"
                      value={request.filter.founded_year.start}
                      onChange={(e) =>
                        setRequest((p) => ({
                          ...p,
                          filter: { ...p.filter, founded_year: { ...p.filter.founded_year, start: e.target.value } },
                        }))
                      }
                    />
                    <TextField
                      label="Founded year end"
                      type="number"
                      size="small"
                      value={request.filter.founded_year.end}
                      onChange={(e) =>
                        setRequest((p) => ({
                          ...p,
                          filter: { ...p.filter, founded_year: { ...p.filter.founded_year, end: e.target.value } },
                        }))
                      }
                    />

                    <TextField
                      label="Revenue min"
                      type="number"
                      size="small"
                      value={request.filter.annual_revenue.min}
                      onChange={(e) =>
                        setRequest((p) => ({
                          ...p,
                          filter: { ...p.filter, annual_revenue: { ...p.filter.annual_revenue, min: e.target.value } },
                        }))
                      }
                    />
                    <TextField
                      label="Revenue max"
                      type="number"
                      size="small"
                      value={request.filter.annual_revenue.max}
                      onChange={(e) =>
                        setRequest((p) => ({
                          ...p,
                          filter: { ...p.filter, annual_revenue: { ...p.filter.annual_revenue, max: e.target.value } },
                        }))
                      }
                    />

                    <TextField
                      label="Employees min"
                      type="number"
                      size="small"
                      value={request.filter.employees.min}
                      onChange={(e) =>
                        setRequest((p) => ({
                          ...p,
                          filter: { ...p.filter, employees: { ...p.filter.employees, min: e.target.value } },
                        }))
                      }
                    />
                    <TextField
                      label="Employees max"
                      type="number"
                      size="small"
                      value={request.filter.employees.max}
                      onChange={(e) =>
                        setRequest((p) => ({
                          ...p,
                          filter: { ...p.filter, employees: { ...p.filter.employees, max: e.target.value } },
                        }))
                      }
                    />
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                    <Button
                      variant="outlined"
                      onClick={() =>
                        setRequest({
                          dimension: "level",
                          filter: {
                            level: [],
                            country: [],
                                city: [],
                            founded_year: { start: "", end: "" },
                            annual_revenue: { min: "", max: "" },
                            employees: { min: "", max: "" },
                          },
                        })
                      }
                    >
                      Reset
                    </Button>
                  </Box>
                </Collapse>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ height: 220 }}>
                  <Bar data={barData} options={barOptions} />
                </Box>
              </Paper>
            </Stack>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="subtitle1">Company hierarchy</Typography>
                <Typography variant="body2" color="text.secondary">
                  Click a bubble to zoom in. Click empty space to zoom out.
                </Typography>
              </Box>
                      <Tabs value={bubbleMode} onChange={(_, v) => setBubbleMode(v as BubbleMode)} aria-label="Bubble Dimension Tabs" sx={{ mt: 1 }}>
                        <Tab value="level" label="Level" />
                        <Tab value="country" label="Country" />
                        <Tab value="city" label="City" />
                      </Tabs>
              <Box sx={{ mt: 1.5 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Results: {bubbleTotal}
                        </Typography>
                        {bubbleRoot ? (
                          <BubbleChart companies={bubbleCompanies} mode={bubbleMode} />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Loading chart...
                          </Typography>
                        )}
              </Box>
            </Paper>
          )}
        </Stack>

        <Divider />

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" } }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Level share
            </Typography>
            <Box sx={{ height: 220 }}>
              <Doughnut data={donutData} options={donutOptions} />
            </Box>

            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Level</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Percent</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {levelKeys.map((lvl) => {
                  const count = levelShare.items.find((x) => x.level === lvl)?.count || 0;
                  const active = activeLevel === lvl;
                  return (
                    <TableRow
                      key={lvl}
                      sx={{
                        backgroundColor: active ? "action.hover" : "transparent",
                      }}
                    >
                      <TableCell>{`Level ${lvl}`}</TableCell>
                      <TableCell align="right">{count}</TableCell>
                      <TableCell align="right">{pct(count, companyCount)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Company growth (cumulative)
            </Typography>
            <Box sx={{ height: 220 }}>
              <Line data={lineData} options={lineOptions} />
            </Box>
          </Paper>
        </Box>
      </Stack>
    </PageContainer>
  );
}

