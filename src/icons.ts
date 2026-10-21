// Line icons for the discipline cards. 32x32, stroke = currentColor. Trusted constants, not content.

const svg = (body: string) =>
  `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

export const icons = {
  // robot arm on a pedestal with gripper
  robot: svg(
    `<path d="M5 28h14M8 28l2-4h4l2 4"/><path d="M12 24l3-9 9-3"/><circle cx="12" cy="24" r="1.6"/><circle cx="15" cy="15" r="1.6"/><circle cx="24" cy="12" r="1.6"/><path d="M24 12l3-3M24 12l4 1M27 9l1 1.5M28 13l-.5 1.8"/>`,
  ),
  // block diagram: architecture with interfaces
  systems: svg(
    `<rect x="11" y="3" width="10" height="7" rx="1"/><rect x="3" y="22" width="9" height="7" rx="1"/><rect x="20" y="22" width="9" height="7" rx="1"/><path d="M16 10v6M7.5 22v-6h17v6"/><circle cx="16" cy="16" r="1" fill="currentColor"/>`,
  ),
  // EMG burst on a baseline
  signal: svg(
    `<path d="M2 18h6l1.5-3 1.5 7 1.5-12 1.5 15 1.5-11 1.5 8 1.5-5 1.5 3H30"/><path d="M2 27h28" opacity=".4"/>`,
  ),
  // upper limb: shoulder, elbow, wrist with a muscle line
  sim: svg(
    `<circle cx="7" cy="7" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="25" cy="23" r="2"/><path d="M8 9l3.2 8M14 19.6l9 2.8"/><path d="M5 10c-1 6 2 10 6 11" stroke-dasharray="2 2"/>`,
  ),
  // microcontroller with pins
  chip: svg(
    `<rect x="8" y="8" width="16" height="16" rx="2"/><rect x="12.5" y="12.5" width="7" height="7" rx="1"/><path d="M12 4v4M16 4v4M20 4v4M12 24v4M16 24v4M20 24v4M4 12h4M4 16h4M4 20h4M24 12h4M24 16h4M24 20h4"/>`,
  ),
  // participant + measurement
  research: svg(
    `<circle cx="10" cy="9" r="3.5"/><path d="M3.5 27c0-5 3-8.5 6.5-8.5s6.5 3.5 6.5 8.5"/><path d="M19 27V17M23 27V12M27 27V20"/>`,
  ),
} as const;

export type IconName = keyof typeof icons;
