export function decimalToNumber(value: { toNumber(): number } | number | null) {
  if (value === null || value === undefined) return 0
  return typeof value === 'number' ? value : value.toNumber()
}

export function generateOrderNo() {
  const now = new Date()
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
    pad(now.getMilliseconds(), 3),
    Math.floor(Math.random() * 9000 + 1000),
  ].join('')
}
