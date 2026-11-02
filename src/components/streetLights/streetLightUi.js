export const statusStyles = {
  ON: {
    label: 'ON',
    className: 'border-[#73ffba]/20 bg-[#73ffba]/10 text-[#b1ffd3]',
    dot: '#73ffba',
  },
  OFF: {
    label: 'OFF',
    className: 'border-slate-300/15 bg-slate-400/10 text-slate-300',
    dot: '#94a3b8',
  },
  DIM: {
    label: 'DIM',
    className: 'border-[#72e7ff]/20 bg-[#72e7ff]/10 text-[#91dff3]',
    dot: '#72e7ff',
  },
  FAULT: {
    label: 'FAULT',
    className: 'border-[#ff9b8d]/20 bg-[#ff9b8d]/12 text-[#ffb4a8]',
    dot: '#ff9b8d',
  },
};

export function normalizeLightForm(light = {}) {
  return {
    id: light.id || '',
    area: light.area || 'Main Road',
    status: light.status || 'ON',
    mode: light.mode || 'Auto',
    brightness: light.brightness ?? 100,
    powerRating: light.powerRating ?? 80,
    faultStatus: light.faultStatus || 'No Fault',
  };
}

export function getStreetLightStats(lights, summary) {
  return summary.map((item) => ({
    ...item,
    value:
      item.value ??
      (item.status === 'TOTAL'
        ? lights.length
        : lights.filter((light) => light.status === item.status).length),
  }));
}
