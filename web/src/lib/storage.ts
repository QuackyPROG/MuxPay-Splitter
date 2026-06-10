import type { Employee, PayrollRun, WorkspaceSettings } from './types';

const MAX_RUNS = 50;

function key(wallet: string, ns: string) {
  return `muxpay:v1:${wallet}:${ns}`;
}

function safeLoad<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadEmployees(wallet: string): Employee[] {
  return safeLoad<Employee[]>(key(wallet, 'employees'), []);
}

export function saveEmployees(wallet: string, employees: Employee[]): void {
  localStorage.setItem(key(wallet, 'employees'), JSON.stringify(employees));
}

export function loadRuns(wallet: string): PayrollRun[] {
  return safeLoad<PayrollRun[]>(key(wallet, 'runs'), []);
}

export function saveRun(wallet: string, run: PayrollRun): void {
  const runs = loadRuns(wallet);
  const next = [run, ...runs].slice(0, MAX_RUNS);
  localStorage.setItem(key(wallet, 'runs'), JSON.stringify(next));
}

export function updateRun(wallet: string, run: PayrollRun): void {
  const runs = loadRuns(wallet);
  const next = runs.map((r) => (r.id === run.id ? run : r));
  localStorage.setItem(key(wallet, 'runs'), JSON.stringify(next));
}

export function loadSettings(wallet: string): WorkspaceSettings {
  return safeLoad<WorkspaceSettings>(key(wallet, 'settings'), {});
}

export function saveSettings(wallet: string, s: WorkspaceSettings): void {
  localStorage.setItem(key(wallet, 'settings'), JSON.stringify(s));
}
