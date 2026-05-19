export const ROLE_PERMISSIONS: Record<string,string[]> = {
  WORKER:['dashboard:view','trucks:view','faults:view','tasks:view','charging:view'],
  TECHNICIAN:['dashboard:view','trucks:view','faults:report','faults:view','tasks:view','tasks:update'],
  SUPERVISOR:['*'],
  CHARGING_OPERATOR:['dashboard:view','trucks:view','charging:log','charging:view','faults:view','tasks:view'],
}
export function hasPermission(role: string, perm: string) {
  const p = ROLE_PERMISSIONS[role] || []
  return p.includes('*') || p.includes(perm)
}
export const ROLE_LABELS: Record<string,string> = {
  WORKER:'Worker',TECHNICIAN:'Technician',SUPERVISOR:'Supervisor',CHARGING_OPERATOR:'Charging Operator'
}
export const ROLE_COLORS: Record<string,string> = {
  WORKER:'bg-slate-500/20 text-slate-400',TECHNICIAN:'bg-blue-500/20 text-blue-400',
  SUPERVISOR:'bg-purple-500/20 text-purple-400',CHARGING_OPERATOR:'bg-green-500/20 text-green-400'
}
