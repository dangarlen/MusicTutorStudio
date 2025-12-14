export default async function loadData() {
  const res = await fetch('/data/network_topology.json');
  if (!res.ok) throw new Error('Failed to load network_topology.json');
  const data = await res.json();
  // Defensive: ensure both arrays exist
  return {
    devices: Array.isArray(data.devices) ? data.devices : [],
    connections: Array.isArray(data.connections) ? data.connections : []
  };
}
