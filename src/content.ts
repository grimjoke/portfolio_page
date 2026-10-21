// All site copy lives here. Edit this file, not the components.
// Anything marked TODO is a placeholder to replace with real data.

export type Link = { label: string; href: string };

export type Project = {
  title: string;
  year: string;
  summary: string;
  tags: string[];
  links?: Link[];
};

export type Publication = {
  title: string;
  authors: string;
  venue: string;
  year: string;
  href?: string;
};

export type Role = {
  period: string;
  title: string;
  org: string;
  note?: string;
};

export const site = {
  name: "Konstantinos Mitsopoulos",
  short: "Kostas",
  role: "Robotic Systems Engineer · PhD candidate",
  org: "BERD Lab, Aristotle University of Thessaloniki",
  location: "Thessaloniki, GR",
  tagline:
    "I build rehabilitation robots and the signal pipelines that tell them what the body is doing.",
  // Short paragraph for the about section.
  about: [
    "I work where biosignals meet control: surface EMG, IMU and EEG feeding into systems that adapt rehabilitation to the person using them.",
    "Day to day that means systems engineering (MBSE in Capella), musculoskeletal simulation, embedded and robot software, and running studies with real participants. I also teach in the AUTH MSc in Biomedical Engineering and supervise student projects.",
  ],
  links: [
    { label: "GitHub", href: "https://github.com/grimjoke" },
    { label: "Google Scholar", href: "#" }, // TODO
    { label: "ORCID", href: "#" }, // TODO
    { label: "LinkedIn", href: "#" }, // TODO
    { label: "Email", href: "mailto:you@example.com" }, // TODO
  ] satisfies Link[],
};

// Channel names drawn on the hero signal canvas. Keep to 4-6.
export const channels = ["EMG · biceps", "EMG · triceps", "IMU · ω", "EEG · C3", "Ctrl · u(t)"];

export const focus: { title: string; body: string }[] = [
  {
    title: "Biofeedback for rehabilitation",
    body: "Using EMG and EEG to select and adapt interventions for people recovering from stroke.",
  },
  {
    title: "Rehabilitation robotics",
    body: "Wearable and stationary systems, from requirements and architecture to firmware and control.",
  },
  {
    title: "Musculoskeletal simulation",
    body: "OpenSim and MuJoCo models driven by IMU-derived kinematics to close the loop in silico first.",
  },
  {
    title: "Systems engineering",
    body: "Model-based systems engineering for medical devices, including architecture elicitation methods.",
  },
];

export const projects: Project[] = [
  {
    title: "TODO: Project one",
    year: "2025",
    summary: "One or two sentences on what it is and what you did.",
    tags: ["robotics", "control"],
    links: [{ label: "Code", href: "#" }],
  },
  {
    title: "TODO: Project two",
    year: "2024",
    summary: "One or two sentences on what it is and what you did.",
    tags: ["biosignals", "EMG"],
  },
  {
    title: "TODO: Project three",
    year: "2023",
    summary: "One or two sentences on what it is and what you did.",
    tags: ["simulation", "systems"],
  },
];

export const publications: Publication[] = [
  {
    title: "TODO: Paper title",
    authors: "Mitsopoulos K., et al.",
    venue: "Sensors",
    year: "2024",
    href: "#",
  },
  {
    title: "TODO: Paper title",
    authors: "Mitsopoulos K., et al.",
    venue: "Frontiers",
    year: "2023",
    href: "#",
  },
];

export const timeline: Role[] = [
  {
    period: "TODO – now",
    title: "Robotic Systems Engineer & PhD candidate",
    org: "BERD Lab, AUTH",
  },
  {
    period: "TODO",
    title: "Teaching, MSc in Biomedical Engineering",
    org: "AUTH",
  },
  { period: "TODO", title: "TODO: earlier role or degree", org: "TODO" },
];

export const stack = [
  "Python", "C/C++", "Rust", "ROS 2", "MuJoCo", "OpenSim",
  "Unity", "Docker", "Capella / MBSE", "EMG", "IMU", "EEG",
];
