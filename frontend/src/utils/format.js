// Format number as Indian Rupees: 125000 → ₹1,25,000
export function formatINR(n) {
  if (n === null || n === undefined) return '—'
  return '₹' + Number(n).toLocaleString('en-IN')
}

// Format quantity in quintal
export function formatQtl(n) {
  if (n === null || n === undefined) return '—'
  return `${n} qtl`
}

// Format bags from quintal (1 qtl ≈ 2 bags of 50kg)
export function qtlToBags(qtl, bagKg = 50) {
  return Math.round((qtl * 100) / bagKg)
}

// Mask bank account: xxxxxxxx1234 → ••••1234
export function maskAccount(acc) {
  if (!acc) return '••••'
  return '••••' + String(acc).slice(-4)
}
