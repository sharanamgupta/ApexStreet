export const initialAutomationRules = [
  {
    id: 'rule-1',
    time: '06:00 AM',
    action: 'OFF',
    brightness: 0,
    lightsAffected: 500,
    description: 'Turn off all automatic street lights at sunrise.',
  },
  {
    id: 'rule-2',
    time: '06:30 PM',
    action: 'ON',
    brightness: 100,
    lightsAffected: 500,
    description: 'Turn on all automatic street lights at sunset.',
  },
  {
    id: 'rule-3',
    time: '10:00 PM',
    action: 'DIM',
    brightness: 50,
    lightsAffected: 500,
    description: 'Reduce brightness during late-night hours to save energy.',
  },
];

export const initialAutomationStats = {
  status: 'Active',
  currentMode: 'Automatic',
  currentPhase: 'Night Dimming',
  currentBrightness: '50%',
  nextTransition: '06:00 AM (OFF)',
  lightsAffected: 320,
};
