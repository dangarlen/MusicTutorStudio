import generateMermaid from './generateMermaid.js'
export default function generateMarkdown({ devices, connections }) {
  let md = `# Network Interconnect Overview\n\n`
  md += '```mermaid\n'
  md += generateMermaid({ devices, connections }) + '\n'
  md += '```\n\n'
  md += '## Devices\n\n'
  md += '| ID | Name | Category | Location | Notes |\n'
  md += '|----|------|----------|----------|-------|\n'
  for (const d of devices || []) {
    md += `| ${d.id} | ${d.name} | ${d.category} | ${d.location} | ${d.notes || ''} |\n`
  }
  md += '\n## Connections\n\n'
  md += '| From | To | Type |\n'
  md += '|------|----|------|\n'
  for (const c of connections || []) {
    md += `| ${c.from} | ${c.to} | ${c.type} |\n`
  }
  return md
}
