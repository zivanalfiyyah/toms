// Indeks pencarian untuk panel admin: menu, pengguna, permintaan akses,
// kategori, dan halaman di level berapa pun. Murni fungsi (tanpa jaringan).
import { tokenize } from './searchIndex'

export const GROUP_ORDER = ['Menu', 'Pengguna', 'Permintaan Akses', 'Kategori', 'Halaman']
export const PER_GROUP = 8

const LEVEL_LABELS = ['Halaman', 'Sub Halaman', 'Sub-sub Halaman']
const STATUS_LABELS = { pending: 'Menunggu', invited: 'Sudah Diundang', rejected: 'Ditolak' }

// Kategori & halaman dibuka di panel admin (Kategori & Halaman), lalu digulir dan disorot.
const focusTarget = (key) => ({ path: '/admin/categories', query: { focus: key } })

const roleNames = (u) => (u.roles || []).map((r) => r.name ?? r)

function entry(group, key, title, subtitle, badge, to, hayParts) {
  const t = String(title || '')
  return {
    group,
    key,
    title: t,
    subtitle: subtitle || '',
    badge: badge || '',
    to,
    _title: t.toLowerCase(),
    _hay: [t, ...hayParts].filter(Boolean).join(' ').toLowerCase()
  }
}

export function buildAdminIndex({ menu = [], users = [], requests = [], tree = [] } = {}) {
  const out = []

  for (const m of menu) {
    out.push(entry('Menu', `m-${m.to}`, m.label, 'Buka halaman', '', m.to, []))
  }

  for (const u of users) {
    const roles = roleNames(u)
    out.push(entry('Pengguna', `u-${u.id}`, u.name || u.email, u.email, roles.join(', '), '/admin/users', [u.email, ...roles]))
  }

  for (const r of requests) {
    const status = STATUS_LABELS[r.status] || r.status
    out.push(
      entry(
        'Permintaan Akses',
        `r-${r.id}`,
        r.name,
        [r.email, r.division].filter(Boolean).join(' · '),
        status,
        '/admin/access-requests',
        [r.email, r.division, r.reason, status]
      )
    )
  }

  for (const cat of tree) {
    out.push(
      entry('Kategori', `c-${cat.id}`, cat.name, `/${cat.slug}`, 'Kategori', focusTarget(`c-${cat.id}`), [cat.slug, cat.description])
    )

    const walk = (nodes, slugs, trail, depth) => {
      for (const node of nodes || []) {
        const next = [...slugs, node.slug]
        out.push(
          entry(
            'Halaman',
            `p-${node.id}`,
            node.title,
            [cat.name, ...trail].join(' › '),
            LEVEL_LABELS[depth] ?? `Level ${depth + 1}`,
            focusTarget(`p-${node.id}`),
            []
          )
        )
        walk(node.children, next, [...trail, node.title], depth + 1)
      }
    }
    walk(cat.pages, [], [], 0)
  }

  return out
}

/** Hasil pencarian per kelompok (maks. PER_GROUP per kelompok). */
export function searchAdminIndex(index, query) {
  const tokens = tokenize(query)
  if (!tokens.length) return []
  const phrase = tokens.join(' ')

  const byGroup = new Map(GROUP_ORDER.map((g) => [g, []]))
  index.forEach((item, i) => {
    if (!tokens.every((t) => item._hay.includes(t))) return
    const score = item._title.startsWith(phrase)
      ? 0
      : item._title.includes(phrase)
        ? 1
        : tokens.every((t) => item._title.includes(t))
          ? 2
          : 3
    byGroup.get(item.group).push({ item, score, i })
  })

  return GROUP_ORDER.map((label) => {
    const rows = byGroup.get(label)
    rows.sort((a, b) => a.score - b.score || a.i - b.i)
    return { label, total: rows.length, items: rows.slice(0, PER_GROUP).map((r) => r.item) }
  }).filter((g) => g.items.length)
}

/** Saat kueri kosong: tampilkan pintasan menu admin. */
export function menuShortcuts(index) {
  const items = index.filter((i) => i.group === 'Menu')
  return items.length ? [{ label: 'Menu', total: items.length, items }] : []
}
