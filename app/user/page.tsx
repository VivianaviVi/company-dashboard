"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Autocomplete,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
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
import { apiFetch } from "../../components/apiClient";

type BackendRole = "admin" | "manager" | "user";
type BackendStatus = "active" | "inactive";

type BackendUser = {
  id: string;
  name: string;
  email: string;
  title: string;
  status: BackendStatus;
  role: BackendRole;
};

export default function UserPage() {
  const router = useRouter();
  const currentEmail = useSyncExternalStore(subscribeAuth, getAuthEmail, () => "");
  const token = useSyncExternalStore(subscribeAuth, getAuthToken, () => "");

  useEffect(() => {
    if (!currentEmail || !token) window.location.href = "/login";
  }, [currentEmail, token]);

  const [searchName, setSearchName] = useState("");
  const [roleFilter, setRoleFilter] = useState<BackendRole[]>([]);
  const [rows, setRows] = useState<BackendUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [me, setMe] = useState<BackendUser | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formRole, setFormRole] = useState<BackendRole>("user");
  const [formStatus, setFormStatus] = useState<BackendStatus>("active");

  

  async function loadAll() {
    setLoading(true);
    setError("");
    try {
      const meData = await apiFetch<BackendUser>("/users/me");
      setMe(meData);
      if (meData.role === "user") {
        setRows([]);
        setSelectedIds([]);
        return;
      }
      const list = await apiFetch<BackendUser[]>("/users");
      setRows(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentEmail) return;
    void loadAll();

  }, [currentEmail]);

  const roleOptions = useMemo(() => ["admin", "manager", "user"] as BackendRole[], []);

  if (!currentEmail || !token) {
    return (
      <PageContainer maxWidth="sm">
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h5">Please login</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            You need to login to manage users.
          </Typography>
          <Button variant="contained" href="/login" sx={{ mt: 2 }}>
            Go to Login
          </Button>
        </Paper>
      </PageContainer>
    );
  }

  const filteredRows = rows.filter((r) => {
    const byRole = roleFilter.length === 0 ? true : roleFilter.includes(r.role);
    const byName =
      searchName.trim() === ""
        ? true
        : r.name.toLowerCase().includes(searchName.trim().toLowerCase());
    return byRole && byName;
  });

  function canManageUsers() {
    return me?.role === "admin" || me?.role === "manager";
  }

  function canEditRow(r: BackendUser) {
    if (!me) return false;
    if (me.role === "admin") return true;
    if (me.role === "manager") return r.role === "user";
    return false;
  }

  function canDeleteRow(r: BackendUser) {
    if (!me) return false;
    if (me.role === "admin") return r.id !== me.id;
    if (me.role === "manager") return r.role === "user";
    return false;
  }

  function openAddDialog() {
    setEditingId(null);
    setFormName("");
    setFormEmail("");
    setFormTitle("");
    setFormRole("user");
    setFormStatus("active");
    setDialogOpen(true);
  }

  function openEditDialog(user: BackendUser) {
    setEditingId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormTitle(user.title || "");
    setFormRole(user.role);
    setFormStatus(user.status);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
  }

  async function saveUser() {
    if (!me) return;
    setError("");
    const name = formName.trim();
    const email = formEmail.trim();
    const title = formTitle.trim();
    if (!name) return;
    if (!editingId && !email) return;

    try {
      if (editingId) {
        const body: Record<string, unknown> = { name, title, status: formStatus };
        if (me.role === "admin") body.role = formRole;
        await apiFetch(`/users/${editingId}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        const body: Record<string, unknown> = { email, name, title, status: formStatus };
        if (me.role === "admin") body.role = formRole;

        await apiFetch(`/users`, { method: "POST", body: JSON.stringify(body) });
      }
      setDialogOpen(false);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  async function deleteUser(id: string) {
    setError("");
    try {
      await apiFetch(`/users/${id}`, { method: "DELETE" });
      setSelectedIds((prev) => prev.filter((x) => x !== id));
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll(checked: boolean) {
    if (!checked) {
      setSelectedIds([]);
      return;
    }
    const deletable = filteredRows.filter((r) => canDeleteRow(r)).map((r) => r.id);
    setSelectedIds(deletable);
  }

  async function deleteSelected() {
    if (selectedIds.length === 0) return;
    setError("");
    try {
      await Promise.all(
        selectedIds.map((id) =>
          apiFetch(`/users/${id}`, { method: "DELETE" }).catch(() => null)
        )
      );
      setSelectedIds([]);
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    }
  }

  if (loading) {
    return (
      <PageContainer maxWidth="lg">
        <Stack spacing={2} component={Paper} sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        </Stack>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <Stack spacing={2} component={Paper} sx={{ p: { xs: 1.5, sm: 2 }, width: "100%" }}>
        <Box>
          <Typography variant="h4">Users</Typography>
          <Typography variant="body2" color="text.secondary">
            Current user: {currentEmail}
          </Typography>
        </Box>

        {error ? (
          <Chip
            label={error}
            color="error"
            variant="outlined"
            sx={{ alignSelf: "flex-start" }}
          />
        ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1}
          sx={{ flexWrap: "wrap", alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
        >
          <Typography variant="body2" color="text.secondary">
            Role: {me?.role || "-"}
          </Typography>
          <Button variant="outlined" size="small" onClick={() => router.push("/user/account")}>
            Account
          </Button>
        </Stack>

        {me?.role === "user" ? (
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1">No permission to manage users</Typography>
            <Typography variant="body2" color="text.secondary">
              You can edit your own profile in Account.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexWrap: "wrap", alignItems: "center" }}>
              <TextField
                label="Search by name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                size="small"
                sx={{ width: { xs: "100%", sm: 260 } }}
              />

              <Autocomplete
                multiple
                options={roleOptions}
                value={roleFilter}
                onChange={(_, v) => setRoleFilter(v)}
                renderInput={(params) => <TextField {...params} label="Role filter (multi)" size="small" />}
                sx={{ width: { xs: "100%", sm: 320 } }}
              />

              {canManageUsers() ? (
                <Button variant="contained" onClick={openAddDialog}>
                  Add User
                </Button>
              ) : null}

              <Button
                variant="outlined"
                color="error"
                disabled={selectedIds.length === 0}
                onClick={deleteSelected}
              >
                Delete Selected ({selectedIds.length})
              </Button>
            </Stack>

            <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 1, overflowX: "auto" }}>
              <Table size="small">
                <TableHead sx={{ backgroundColor: "action.hover" }}>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={filteredRows.length > 0 && selectedIds.length === filteredRows.length}
                        indeterminate={selectedIds.length > 0 && selectedIds.length < filteredRows.length}
                        onChange={(e) => toggleSelectAll(e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Title/Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRows.map((r) => (
                    <TableRow key={r.id} hover selected={selectedIds.includes(r.id)}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(r.id)}
                          disabled={!canDeleteRow(r)}
                          onChange={() => toggleSelectOne(r.id)}
                        />
                      </TableCell>
                      <TableCell>{r.name}</TableCell>
                      <TableCell>{r.email}</TableCell>
                      <TableCell>
                        {r.title ? r.title : "-"} ({r.role})
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={r.status === "active" ? "Active" : "Inactive"}
                          color={r.status === "active" ? "success" : "default"}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => openEditDialog(r)} disabled={!canEditRow(r)}>
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => deleteUser(r.id)}
                          disabled={!canDeleteRow(r)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {filteredRows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">
                          No results
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Edit User" : "Add User"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            <TextField
              label="Email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              disabled={!!editingId}
            />
            <TextField label="Title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            {me?.role === "admin" ? (
              <TextField
                select
                label="Permission role"
                value={formRole}
                onChange={(e) => setFormRole(e.target.value as BackendRole)}
              >
                <option value="admin">admin</option>
                <option value="manager">manager</option>
                <option value="user">user</option>
              </TextField>
            ) : (
              <TextField label="Permission role" value="user" disabled />
            )}
            <TextField
              select
              label="Status"
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value as BackendStatus)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveUser}
            disabled={!formName.trim() || (!editingId && !formEmail.trim())}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

