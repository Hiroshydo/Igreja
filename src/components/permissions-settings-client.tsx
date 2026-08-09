"use client";

import { useEffect, useMemo, useState } from "react";

interface PermissionMatrixResponse {
  roles: string[];
  permissions: string[];
  matrix: Array<{
    roleCode: string;
    roleName: string;
    permissions: string[];
  }>;
}

export function PermissionsSettingsClient() {
  const [roles, setRoles] = useState<string[]>([]);
  const [permissionKeys, setPermissionKeys] = useState<string[]>([]);
  const [matrix, setMatrix] = useState<Array<{ roleCode: string; roleName: string; permissions: string[] }>>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [userForm, setUserForm] = useState({ username: "", password: "", fullName: "" });
  const [userBusy, setUserBusy] = useState(false);
  const [userMessage, setUserMessage] = useState<string | null>(null);

  async function loadMatrix() {
    setLoading(true);
    try {
      const response = await fetch("/api/permissions", { method: "GET" });
      if (!response.ok) {
        throw new Error("Não foi possível carregar a matriz");
      }
      const payload = (await response.json()) as { success: boolean; data?: PermissionMatrixResponse };
      const data = payload.data;
      if (!data) {
        throw new Error("Matriz sem conteúdo");
      }

      setRoles(data.roles ?? []);
      setPermissionKeys(data.permissions ?? []);
      setMatrix(data.matrix ?? []);
      setSelectedRole((current) => current || (data.roles?.[0] ?? ""));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar a matriz");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMatrix();
  }, []);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    }
  }, [roles, selectedRole]);

  const normalizedMatrix = useMemo(() => {
    return matrix.map((row) => ({
      ...row,
      permissions: Array.from(new Set(row.permissions ?? [])),
    }));
  }, [matrix]);

  const permissionGroups = useMemo(() => {
    const groups = new Map<string, { key: string; label: string; permissions: string[] }>();

    permissionKeys.forEach((permission) => {
      const [prefix = "geral"] = permission.split(".");
      const labelMap: Record<string, string> = {
        system: "Sistema",
        members: "Membros",
        congregations: "Congregações",
        finance: "Financeiro",
        reports: "Relatórios",
        events: "Eventos",
        media: "Mídia",
        worship: "Louvor",
        ministries: "Ministérios",
        dashboard: "Dashboard",
        audit: "Auditoria",
        geral: "Geral",
      };

      const existing = groups.get(prefix) ?? { key: prefix, label: labelMap[prefix] ?? prefix.toUpperCase(), permissions: [] };
      existing.permissions.push(permission);
      groups.set(prefix, existing);
    });

    return Array.from(groups.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [permissionKeys]);

  function togglePermission(roleCode: string, permission: string, checked: boolean) {
    setMatrix((current) => current.map((row) => {
      if (row.roleCode !== roleCode) {
        return row;
      }

      const nextPermissions = new Set(row.permissions ?? []);
      if (checked) {
        nextPermissions.add(permission);
      } else {
        nextPermissions.delete(permission);
      }

      return {
        ...row,
        permissions: Array.from(nextPermissions),
      };
    }));
  }

  async function saveMatrix() {
    setBusy(true);
    setError(null);

    try {
      const payload = {
        matrix: normalizedMatrix.map((row) => ({
          roleCode: row.roleCode,
          permissions: row.permissions,
        })),
      };

      const response = await fetch("/api/permissions", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        const message = body?.error ?? "Erro ao salvar a matriz";
        throw new Error(message);
      }

      await loadMatrix();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar a matriz");
    } finally {
      setBusy(false);
    }
  }

  async function createUser() {
    if (!selectedRole || !userForm.username.trim() || !userForm.password.trim()) {
      setError("Informe usuário, senha e perfil para criar o acesso.");
      return;
    }

    setUserBusy(true);
    setError(null);
    setUserMessage(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userForm.username.trim(),
          password: userForm.password,
          fullName: userForm.fullName.trim(),
          roleCode: selectedRole,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Não foi possível criar o usuário");
      }

      const body = await response.json().catch(() => null);
      setUserMessage(body?.message ?? "Usuário criado com sucesso");
      setUserForm({ username: "", password: "", fullName: "" });
      await loadMatrix();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    } finally {
      setUserBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-slate-300">
        Carregando matriz de permissões...
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/60 p-6 shadow-[0_35px_80px_-40px_rgba(250,204,21,0.45)]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">Matriz de permissões</h2>
          <p className="mt-1 text-sm text-slate-400">Organize o acesso por área do sistema com controles claros e rápidos.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
            {roles.length} perfis
          </span>
          <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            {permissionKeys.length} permissões
          </span>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <section className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Configuração atual</h3>
            <p className="mt-1 text-sm text-slate-400">Defina o perfil em foco e crie um acesso rápido para um novo usuário.</p>
          </div>
          <span className="rounded-full border border-amber-300/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200">
            {selectedRole || "Selecione um perfil"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <label className="text-sm text-slate-300">
              <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Perfil em edição</span>
              <select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100">
                {roles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </label>
            <p className="mt-3 text-sm text-slate-400">As permissões marcadas abaixo serão aplicadas ao perfil selecionado e servirão como base para novos acessos.</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
            <h4 className="text-sm font-semibold text-slate-100">Criar usuário</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-slate-300 sm:col-span-2">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Nome completo</span>
                <input value={userForm.fullName} onChange={(event) => setUserForm((prev) => ({ ...prev, fullName: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="Ex: Maria Oliveira" />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Usuário</span>
                <input value={userForm.username} onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="maria" />
              </label>
              <label className="text-sm text-slate-300">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-500">Senha</span>
                <input type="password" value={userForm.password} onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))} className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-100" placeholder="••••••••" />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" disabled={userBusy} onClick={() => void createUser()} className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60">
                {userBusy ? "Criando..." : "Criar acesso"}
              </button>
              {userMessage ? <span className="text-sm text-emerald-200">{userMessage}</span> : null}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {permissionGroups.map((group) => (
          <div key={group.key} className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">{group.label}</h3>
              <span className="text-xs text-slate-500">{group.permissions.length} itens</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400">
                    <th className="pb-2 pr-4">Perfil</th>
                    {group.permissions.map((permission) => (
                      <th key={permission} className="pb-2 pr-3 whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
                        {permission.split(".").pop()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => {
                    const row = normalizedMatrix.find((item) => item.roleCode === role) ?? {
                      roleCode: role,
                      roleName: role,
                      permissions: [] as string[],
                    };

                    return (
                      <tr key={role} className="border-t border-white/10 text-slate-300">
                        <td className="py-2 pr-4 font-medium text-slate-100">{row.roleCode}</td>
                        {group.permissions.map((permission) => (
                          <td key={`${role}-${permission}`} className="py-2 pr-3">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-white/15 bg-transparent accent-amber-300"
                              aria-label={`Permissão ${permission} para ${role}`}
                              checked={row.permissions.includes(permission)}
                              onChange={(event) => togglePermission(role, permission, event.target.checked)}
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          className="rounded-xl bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => void saveMatrix()}
        >
          {busy ? "Salvando..." : "Salvar alterações"}
        </button>
        <button
          type="button"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          onClick={() => void loadMatrix()}
        >
          Recarregar
        </button>
      </div>
    </section>
  );
}
