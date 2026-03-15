/**
 * Parse date từ backend (Jackson: dd/MM/yyyy HH:mm:ss) và format thống nhất.
 * Dùng chung cho: Quản lý học viên, Lịch sử bài thi, Profile, v.v.
 */
export function formatBackendDateTime(value: unknown): string {
  if (value == null || value === '') return '—';
  let date: Date;
  if (Array.isArray(value)) {
    date = new Date(value[0], (value[1] ?? 1) - 1, value[2] ?? 1, value[3] ?? 0, value[4] ?? 0, value[5] ?? 0);
  } else if (typeof value === 'string') {
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}):(\d{1,2}))?/);
    if (match) {
      const [, d, m, y, h = 0, min = 0, s = 0] = match.map(Number);
      date = new Date(y, m - 1, d, h, min, s);
    } else {
      date = new Date(value.replace(' ', 'T'));
    }
  } else {
    date = new Date(value as number);
  }
  if (isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
