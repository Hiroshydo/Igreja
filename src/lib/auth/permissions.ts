import type { PermissionKey, SystemRoleCode } from "@/types";

const developerRoleCode = "DEV";

export function isDeveloper(roleCodes: string[]) {
  return roleCodes.includes(developerRoleCode);
}

export function canGrantDeveloperRole(actorRoleCodes: string[], requestedRoleCodes: string[]) {
  const actorIsDeveloper = isDeveloper(actorRoleCodes);
  const requestedDev = requestedRoleCodes.includes(developerRoleCode);

  return actorIsDeveloper ? false : requestedDev;
}

export function canRemoveDeveloperRole(actorRoleCodes: string[], roleCodes: string[]) {
  const actorIsDeveloper = isDeveloper(actorRoleCodes);
  const hasDevRole = roleCodes.includes(developerRoleCode);

  return Boolean(actorIsDeveloper && hasDevRole && roleCodes.length > 1);
}

export function hasPermission(permissionKeys: string[], roleCodes: string[], permission: PermissionKey) {
  return isDeveloper(roleCodes) || permissionKeys.includes(permission);
}

export const dashboardPermissionByTab = {
  dashboard: "dashboard.read",
  "admin-dashboard": "system.manage",
  "admin-membros": "members.read",
  "ministerios-musica": "music.read",
  "galeria-fotos": "media.read",
  "ebd-ensino": "education.read",
  "biblioteca-historia": "library.read",
  "centro-doutrinas": "doctrine.read",
  "scorecard-saude": "pastoral_care.read",
  "liturgia-comunicacao": "worship.read",
  "mapa-discipulado": "discipleship.read",
} satisfies Record<string, PermissionKey>;

export const systemRoleCodes: SystemRoleCode[] = [
  "DEV",
  "PASTOR",
  "CORPO_ECLESIASTICO",
  "TESOURARIA",
  "MIDIA",
  "MUSICOS",
  "MEMBROS",
  "VISITANTES",
];
