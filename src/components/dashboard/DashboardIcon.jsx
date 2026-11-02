import React from 'react';

const paths = {
  activity: ['M4 12h4l3-7 4 14 3-7h2'],
  alert: [
    'M12 4 3 20h18L12 4Z',
    'M12 9v4',
    'M12 17h.01',
  ],
  automation: [
    'M5 12a7 7 0 0 1 12.5-4.3',
    'M19 5v5h-5',
    'M19 12a7 7 0 0 1-12.5 4.3',
    'M5 19v-5h5',
  ],
  bell: [
    'M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2Z',
    'M10 20h4',
  ],
  bolt: ['M13 2 5 13h6l-1 9 8-12h-6l1-8Z'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 16v-5', 'M12 16V8', 'M16 16v-8'],
  chevron: ['M9 6l6 6-6 6'],
  clock: [
    'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z',
    'M12 7v5l3 2',
  ],
  grid: [
    'M4 4h6v6H4z',
    'M14 4h6v6h-6z',
    'M4 14h6v6H4z',
    'M14 14h6v6h-6z',
  ],
  logOut: ['M10 17l5-5-5-5', 'M15 12H3', 'M21 4v16'],
  manual: ['M7 11V7a2 2 0 1 1 4 0v4', 'M11 11V6a2 2 0 1 1 4 0v6', 'M5 11v6a5 5 0 0 0 10 0v-5'],
  map: [
    'M9 18 3 20V6l6-2 6 2 6-2v14l-6 2-6-2Z',
    'M9 4v14',
    'M15 6v14',
  ],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  moon: ['M20 15.3A8 8 0 1 1 8.7 4 6.5 6.5 0 0 0 20 15.3Z'],
  edit: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z'],
  eye: ['M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z'],
  plus: ['M12 5v14', 'M5 12h14'],
  power: [
    'M12 3v8',
    'M7.1 6.1a7 7 0 1 0 9.8 0',
  ],
  report: ['M6 3h9l3 3v15H6z', 'M15 3v4h4', 'M9 13h6', 'M9 17h6', 'M9 9h2'],
  save: ['M5 3h12l2 2v16H5z', 'M8 3v6h8V3', 'M8 17h8'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'M21 21l-4.3-4.3'],
  settings: [
    'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z',
    'M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.3 3a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2L3.1 14.5l2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 3h5l.3-3a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z',
  ],
  street: ['M6 20h12', 'M12 20V6', 'M12 6c4 0 6 2 7 5', 'M18 11h3l-1 4h-4z'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  warning: ['M12 4 3 20h18L12 4Z', 'M12 10v3', 'M12 17h.01'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
  mail: ['M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z', 'm22 6-10 7L2 6'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
  check: ['M20 6L9 17l-5-5'],
};

function DashboardIcon({ name, className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    >
      {(paths[name] || paths.grid).map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  );
}

export default DashboardIcon;
