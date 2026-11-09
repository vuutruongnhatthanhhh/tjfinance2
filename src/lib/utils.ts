export function isSafeRedirectPath(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

export function formatCurrency(amount: number): string {
  return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${formatDate(d)} ${hh}:${min}`;
}
