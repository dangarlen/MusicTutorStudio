export default function generateMermaid({ devices, connections }) {
  let out = 'graph LR\n'
  for (const d of devices || []) {
    out += `  ${d.id}[\"${d.name}\"]\n`
  }
  for (const c of connections || []) {
    out += `  ${c.from} -->|${c.type}| ${c.to}\n`
  }
  return out
}
