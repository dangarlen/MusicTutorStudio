export default function validateData({ devices, connections }) {
  const errors = [];
  if (!Array.isArray(devices)) {
    errors.push('devices must be an array');
  } else {
    devices.forEach((d, i) => {
      if (!d.id) errors.push(`devices[${i}]: missing id`);
      if (!d.name) errors.push(`devices[${i}]: missing name`);
      if (!d.category) errors.push(`devices[${i}]: missing category`);
      if (!d.location) errors.push(`devices[${i}]: missing location`);
      if (!('notes' in d)) errors.push(`devices[${i}]: missing notes`);
    });
  }
  if (!Array.isArray(connections)) {
    errors.push('connections must be an array');
  } else {
    connections.forEach((c, i) => {
      if (!c.from) errors.push(`connections[${i}]: missing from`);
      if (!c.to) errors.push(`connections[${i}]: missing to`);
      if (!c.type) errors.push(`connections[${i}]: missing type`);
    });
  }
  return errors.length ? errors : null;
}
