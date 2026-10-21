// All site copy lives here. Edit this file, not the components.
// Anything marked TODO is a placeholder to replace with real data.

import type { IconName } from "./icons";

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
  // Short labels shown under the hero name.
  disciplines: ["Robotics", "Systems engineering", "Biosignals", "Simulation", "Embedded"],
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

// Systems engineering V-model stages, left arm top to bottom, then right arm bottom to top.
export type Stage = "needs" | "reqs" | "arch" | "build" | "integrate" | "verify" | "validate";

export const lifecycle: { id: Stage; label: string }[] = [
  { id: "needs", label: "User needs" },
  { id: "reqs", label: "Requirements" },
  { id: "arch", label: "Architecture" },
  { id: "build", label: "Design & build" },
  { id: "integrate", label: "Integration" },
  { id: "verify", label: "Verification" },
  { id: "validate", label: "Validation" },
];

export const core = {
  title: "Breadth, end to end",
  intro:
    "Rehabilitation robots fail at the seams between disciplines. I work across all of them: from what a patient and a clinician need, through architecture and firmware, to the study that shows it works.",
};

export type Discipline = {
  icon: IconName;
  title: string;
  body: string;
  tools: string[];
  stages: Stage[];
};

export const disciplines: Discipline[] = [
  {
    icon: "robot",
    title: "Robotics",
    body: "Wearable and stationary rehabilitation systems: kinematics, actuation, control loops and robot software.",
    tools: ["ROS 2", "C/C++", "Rust"],
    stages: ["arch", "build", "integrate", "verify"],
  },
  {
    icon: "systems",
    title: "Systems engineering",
    body: "Model-based systems engineering for medical devices, from requirements to architecture, including architecture elicitation methods.",
    tools: ["Capella / MBSE"],
    stages: ["needs", "reqs", "arch", "verify", "validate"],
  },
  {
    icon: "signal",
    title: "Biosignals",
    body: "Surface EMG, IMU and EEG acquisition and processing, used as biofeedback to select and adapt interventions after stroke.",
    tools: ["EMG", "IMU", "EEG", "Python"],
    stages: ["build", "integrate", "verify", "validate"],
  },
  {
    icon: "sim",
    title: "Musculoskeletal simulation",
    body: "OpenSim and MuJoCo models driven by IMU-derived kinematics, to close the loop in silico first.",
    tools: ["OpenSim", "MuJoCo", "Unity"],
    stages: ["arch", "build", "verify"],
  },
  {
    icon: "chip",
    title: "Embedded & software",
    body: "Firmware for sensing hardware, robot software and the tooling that ships it.",
    tools: ["C/C++", "Rust", "Python", "Docker"],
    stages: ["build", "integrate"],
  },
  {
    icon: "research",
    title: "Research & teaching",
    body: "Running studies with real participants. Teaching in the AUTH MSc in Biomedical Engineering and supervising student projects.",
    tools: ["Study design", "Supervision"],
    stages: ["needs", "validate"],
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
