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
