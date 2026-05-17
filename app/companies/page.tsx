"use client";

import { Fragment, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Collapse,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { PageContainer } from "../../components/PageContainer";
import { getAuthEmail, getAuthToken, subscribeAuth } from "../../components/authClient";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  type ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { apiFetch } from "../../components/apiClient";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

type Me = { email: string; role: "admin" | "manager" | "user" };

function formatNumber(n: number) {
  return n.toLocaleString();
}

function efficiency(revenue: number, employees: number) {
  if (!employees) return 0;
  return revenue / employees;
}

function efficiencyBg(e: number) {

  if (e >= 800) return "#d1fae5";
  if (e >= 300) return "#fef9c3";
  return "#fee2e2";
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

function toNumberOrNull(v: string) {
  const t = v.trim();
  if (t === "") return null;
  const n = Number(t);
  if (Number.isNaN(n)) return null;
  return n;
}

function inRange(value: number, minStr: string, maxStr: string) {
  const min = toNumberOrNull(minStr);
  const max = toNumberOrNull(maxStr);
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

export default function CompaniesPage() {
  const currentEmail = useSyncExternalStore(subscribeAuth, getAuthEmail, () => "");
  const token = useSyncExternalStore(subscribeAuth, getAuthToken, () => "");
  const [searchName, setSearchName] = useState("");
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [fCode, setFCode] = useState("");
  const [fName, setFName] = useState("");
  const [fLevel, setFLevel] = useState("2");
  const [fCountry, setFCountry] = useState("");
  const [fCity, setFCity] = useState("");
  const [fYear, setFYear] = useState("2000");
  const [fRevenue, setFRevenue] = useState("100000");
  const [fEmployees, setFEmployees] = useState("100");

  const levelOptions = useMemo(
    () => Array.from(new Set(companies.map((c) => c.level))).sort((a, b) => a - b),
    [companies]
  );
  const countryOptions = useMemo(() => Array.from(new Set(companies.map((c) => c.country))).sort(), [companies]);
  const cityOptions = useMemo(() => Array.from(new Set(companies.map((c) => c.city))).sort(), [companies]);

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

  

  const canWrite = me?.role === "admin" || me?.role === "manager";

  useEffect(() => {
    if (!currentEmail || !token) window.location.href = "/login";
  }, [currentEmail, token]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!currentEmail || !token) return;
      setLoading(true);
      setError("");
      try {
        const meData = await apiFetch<Me>("/users/me");
        const list = await apiFetch<Company[]>("/companies");
        if (cancelled) return;
        setMe(meData);
        setCompanies(list);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };

  }, [currentEmail, token]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const byLevel = request.filter.level.length === 0 ? true : request.filter.level.includes(c.level);
      const byCountry =
        request.filter.country.length === 0 ? true : request.filter.country.includes(c.country);
      const byCity = request.filter.city.length === 0 ? true : request.filter.city.includes(c.city);
      const byYear = inRange(c.founded_year, request.filter.founded_year.start, request.filter.founded_year.end);
      const byRevenue = inRange(
        c.annual_revenue,
        request.filter.annual_revenue.min,
        request.filter.annual_revenue.max
      );
      const byEmployees = inRange(c.employees, request.filter.employees.min, request.filter.employees.max);
      const byName =
        searchName.trim() === ""
          ? true
          : c.company_name.toLowerCase().includes(searchName.trim().toLowerCase());
      return byLevel && byCountry && byCity && byYear && byRevenue && byEmployees && byName;
    });
  }, [companies, request.filter, searchName]);

  const [barFromApi, setBarFromApi] = useState<{ key: string; count: number }[]>([]);
  const [barTotal, setBarTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function loadBar() {
      if (!currentEmail) return;
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
        items.sort((a, b) => a.key.localeCompare(b.key));
        setBarFromApi(items);
      } catch {
        if (cancelled) return;
        setBarFromApi([]);
        setBarTotal(0);
      }
    }
    void loadBar();
    return () => {
      cancelled = true;
    };

  }, [currentEmail, request]);

  const barData = useMemo(() => {
    const labels = barFromApi.map((x) => x.key);
    return {
      labels,
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
      plugins: {
        legend: { display: false },
        tooltip: { intersect: false },
      },
      scales: {
        y: { ticks: { precision: 0 } },
      },
    }),
    []
  );

  if (!currentEmail || !token) {
    return (
      <PageContainer maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5">Please login</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You need to login to view companies.
          </Typography>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  function openAddCompany() {
    setEditingCode(null);
    setFCode("");
    setFName("");
    setFLevel("2");
    setFCountry("");
    setFCity("");
    setFYear("2000");
    setFRevenue("100000");
    setFEmployees("100");
    setCompanyDialogOpen(true);
  }

  function openEditCompany(c: Company) {
    setEditingCode(c.company_code);
    setFCode(c.company_code);
    setFName(c.company_name);
    setFLevel(String(c.level));
    setFCountry(c.country);
    setFCity(c.city);
    setFYear(String(c.founded_year));
    setFRevenue(String(c.annual_revenue));
    setFEmployees(String(c.employees));
    setCompanyDialogOpen(true);
  }

  async function saveCompany() {
    if (!canWrite) return;
    setError("");
    try {
      if (editingCode) {
        await apiFetch(`/companies/${editingCode}`, {
          method: "PATCH",
          body: JSON.stringify({
            company_name: fName.trim(),
            level: Number(fLevel),
            country: fCountry.trim(),
            city: fCity.trim(),
            founded_year: Number(fYear),
            annual_revenue: Number(fRevenue),
            employees: Number(fEmployees),
          }),
        });
      } else {
        await apiFetch(`/companies`, {
          method: "POST",
          body: JSON.stringify({
            company_code: fCode.trim(),
            company_name: fName.trim(),
            level: Number(fLevel),
            country: fCountry.trim(),
            city: fCity.trim(),
            founded_year: Number(fYear),
            annual_revenue: Number(fRevenue),
            employees: Number(fEmployees),
          }),
        });
      }
      const list = await apiFetch<Company[]>("/companies");
      setCompanies(list);
      setCompanyDialogOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function deleteCompany(code: string) {
    if (!canWrite) return;
    setError("");
    try {
      await apiFetch(`/companies/${code}`, { method: "DELETE" });
      const list = await apiFetch<Company[]>("/companies");
      setCompanies(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function toggleOpen(code: string) {
    setOpenRows((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  return (
    <PageContainer maxWidth="lg">
      <Stack spacing={2} component={Paper} sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
        <Box>
          <Typography variant="h4">Companies</Typography>
          <Typography variant="body2" color="text.secondary">
            Collapsible table
          </Typography>
        </Box>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : null}

        {error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary">
            Current role: {me?.role || "-"}
          </Typography>
          {canWrite ? (
            <Button variant="contained" onClick={openAddCompany}>
              Add Company
            </Button>
          ) : null}
        </Box>

        {}
        <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflowX: "auto" }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "action.hover" }}>
              <TableRow>
                <TableCell width={50}></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>
                  Profit efficiency
                  <Typography variant="caption" display="block" color="text.secondary">
                    annual revenue / employees
                  </Typography>
                </TableCell>
                {canWrite ? <TableCell align="right">Actions</TableCell> : null}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCompanies.map((c) => {
                const eff = efficiency(c.annual_revenue, c.employees);
                const opened = !!openRows[c.company_code];
                return (
                  <Fragment key={c.company_code}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleOpen(c.company_code)}
                          aria-label={opened ? "Collapse row" : "Expand row"}
                        >
                          {opened ? "▾" : "▸"}
                        </IconButton>
                      </TableCell>
                      <TableCell>{c.company_name}</TableCell>
                      <TableCell>{c.level}</TableCell>
                      <TableCell>{c.country}</TableCell>
                      <TableCell sx={{ backgroundColor: efficiencyBg(eff) }}>
                        {eff.toFixed(2)}
                      </TableCell>
                      {canWrite ? (
                        <TableCell align="right">
                          <Button size="small" onClick={() => openEditCompany(c)}>
                            Edit
                          </Button>
                          <Button size="small" color="error" onClick={() => deleteCompany(c.company_code)}>
                            Delete
                          </Button>
                        </TableCell>
                      ) : null}
                    </TableRow>

                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={canWrite ? 6 : 5}>
                        <Collapse in={opened} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap" }}>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  City
                                </Typography>
                                <Typography>{c.city}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Founded year
                                </Typography>
                                <Typography>{c.founded_year}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Annual revenue
                                </Typography>
                                <Typography>{formatNumber(c.annual_revenue)}</Typography>
                              </Box>
                              <Box>
                                <Typography variant="caption" color="text.secondary">
                                  Employees
                                </Typography>
                                <Typography>{formatNumber(c.employees)}</Typography>
                              </Box>
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                );
              })}

              {filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canWrite ? 6 : 5}>
                    <Typography variant="body2" color="text.secondary">
                      No results
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 2 }}>
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

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Filters
            </Typography>
            <Button size="small" variant="text" onClick={() => setFiltersOpen((v) => !v)} sx={{ minWidth: 120 }}>
              {filtersOpen ? "Hide" : "Show"}
            </Button>
          </Box>

          <Collapse in={filtersOpen}>
            <Box
              sx={{
                display: "grid",
                gap: 1.5,
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
                mt: 1.5,
              }}
            >
              <TextField
                label="Search by company name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="small"
              />

              <Autocomplete
                multiple
                options={levelOptions}
                value={request.filter.level}
                onChange={(_, v) => setRequest((prev) => ({ ...prev, filter: { ...prev.filter, level: v } }))}
                renderInput={(params) => <TextField {...params} label="Level (multi)" size="small" />}
              />

              <Autocomplete
                multiple
                options={countryOptions}
                value={request.filter.country}
                onChange={(_, v) => setRequest((prev) => ({ ...prev, filter: { ...prev.filter, country: v } }))}
                renderInput={(params) => <TextField {...params} label="Country (multi)" size="small" />}
              />

              <Autocomplete
                multiple
                options={cityOptions}
                value={request.filter.city}
                onChange={(_, v) => setRequest((prev) => ({ ...prev, filter: { ...prev.filter, city: v } }))}
                renderInput={(params) => <TextField {...params} label="City (multi)" size="small" />}
              />

              <TextField
                label="Founded year start"
                type="number"
                size="small"
                value={request.filter.founded_year.start}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, founded_year: { ...prev.filter.founded_year, start: e.target.value } },
                  }))
                }
              />
              <TextField
                label="Founded year end"
                type="number"
                size="small"
                value={request.filter.founded_year.end}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, founded_year: { ...prev.filter.founded_year, end: e.target.value } },
                  }))
                }
              />

              <TextField
                label="Revenue min"
                type="number"
                size="small"
                value={request.filter.annual_revenue.min}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, annual_revenue: { ...prev.filter.annual_revenue, min: e.target.value } },
                  }))
                }
              />
              <TextField
                label="Revenue max"
                type="number"
                size="small"
                value={request.filter.annual_revenue.max}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, annual_revenue: { ...prev.filter.annual_revenue, max: e.target.value } },
                  }))
                }
              />

              <TextField
                label="Employees min"
                type="number"
                size="small"
                value={request.filter.employees.min}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, employees: { ...prev.filter.employees, min: e.target.value } },
                  }))
                }
              />
              <TextField
                label="Employees max"
                type="number"
                size="small"
                value={request.filter.employees.max}
                onChange={(e) =>
                  setRequest((prev) => ({
                    ...prev,
                    filter: { ...prev.filter, employees: { ...prev.filter.employees, max: e.target.value } },
                  }))
                }
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchName("");
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
                  });
                }}
              >
                Reset
              </Button>
            </Box>
          </Collapse>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Box sx={{ height: 260 }}>
            <Bar data={barData} options={barOptions} />
          </Box>
        </Paper>

        <Dialog open={companyDialogOpen} onClose={() => setCompanyDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>{editingCode ? "Edit Company" : "Add Company"}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Company code" value={fCode} onChange={(e) => setFCode(e.target.value)} disabled={!!editingCode} />
              <TextField label="Company name" value={fName} onChange={(e) => setFName(e.target.value)} />
              <TextField label="Level" type="number" value={fLevel} onChange={(e) => setFLevel(e.target.value)} />
              <TextField label="Country" value={fCountry} onChange={(e) => setFCountry(e.target.value)} />
              <TextField label="City" value={fCity} onChange={(e) => setFCity(e.target.value)} />
              <TextField label="Founded year" type="number" value={fYear} onChange={(e) => setFYear(e.target.value)} />
              <TextField label="Annual revenue" type="number" value={fRevenue} onChange={(e) => setFRevenue(e.target.value)} />
              <TextField label="Employees" type="number" value={fEmployees} onChange={(e) => setFEmployees(e.target.value)} />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCompanyDialogOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveCompany} disabled={!canWrite || !fName.trim() || (!editingCode && !fCode.trim())}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </PageContainer>
  );
}

