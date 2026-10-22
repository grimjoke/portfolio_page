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
    { label: "Google Scholar", href: "https://scholar.google.gr/citations?hl=en&user=PQaSvHwAAAAJ" },
    { label: "ORCID", href: "#" }, // TODO
    { label: "LinkedIn", href: "https://www.linkedin.com/in/konstantinos-mitsopoulos/" },
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

// Sources: public GitHub READMEs, the HEROES project site (heroes.med.auth.gr) and the MDPI / UTwente
// publication records. Years marked TODO are not confirmed by a public source.
export const projects: Project[] = [
  {
    title: "HEROES EMS Sim",
    year: "2026", // TODO: confirm start year (repo last updated Oct 2026)
    summary:
      "A headless, deterministic simulation of a person's arm in an EMS-only elbow exoskeleton, built for the HEROES stroke rehabilitation project. The exoskeleton has no motors: it reads surface EMG, infers what the user is trying to do and stimulates their own muscles. The simulation runs the real controller and safety supervisor against a MuJoCo/MyoSuite arm with modelled EMG, stimulation artifacts, fatigue and injected sensor faults, so they can be developed without hardware or a patient.",
    tags: ["simulation", "EMG", "control"],
    links: [
      { label: "Code", href: "https://github.com/grimjoke/heroes_ems" },
      { label: "HEROES", href: "https://heroes.med.auth.gr" },
    ],
  },
  {
    title: "NeuroSuitUp",
    year: "2023",
    summary:
      "A wearable robotics and serious game platform for motor rehabilitation: a robotic jacket and gloves with IMUs, finger bend and pressure sensors and EMG, driving a serious game. First-author paper on its system architecture and validation; validation with 10 healthy participants showed acceptable correlation in 23 of 30 arm exercises.",
    tags: ["robotics", "systems", "EMG"],
    links: [{ label: "Paper", href: "https://www.mdpi.com/1424-8220/23/6/3281" }],
  },
];

// Verified against MDPI, Frontiers, JMIR, UTwente and conference records (Oct 2026). Newest first.
// Not yet included, pending confirmation: a 2020 IoT COVID-19 triage paper listed on Google Scholar.
// Beware a namesake at IHMC (Florida) whose RL / epidemiology papers show up under this name.
export const publications: Publication[] = [
  {
    title: "Post Hoc Event-Related Potential Analysis of Kinesthetic Motor Imagery-Based Brain-Computer Interface Control of Anthropomorphic Robotic Arms",
    authors: "Spanos M., Gazea T., Triantafyllidis V., Mitsopoulos K., Vrahatis A., Hadjinicolaou M., Bamidis P.D., Athanasiou A.",
    venue: "Electronics 14(15), 3106",
    year: "2025",
    href: "https://www.mdpi.com/2079-9292/14/15/3106",
  },
  {
    title: "Integration and Validation of Soft Wearable Robotic Gloves for Sensorimotor Rehabilitation of Human Hand Function",
    authors: "Fiska V., Mitsopoulos K., Mantiou V., Petronikolou V., et al.",
    venue: "Applied Sciences 15(10), 5299",
    year: "2025",
    href: "https://www.mdpi.com/2076-3417/15/10/5299",
  },
  {
    title: "NeuroSuitUp: System Architecture and Validation of a Motor Rehabilitation Wearable Robotics and Serious Game Platform",
    authors: "Mitsopoulos K., et al.",
    venue: "Sensors 23(6), 3281",
    year: "2023",
    href: "https://www.mdpi.com/1424-8220/23/6/3281",
  },
  {
    title: "Does combined training of biofeedback and neurofeedback affect smoking status, behavior, and longitudinal brain plasticity?",
    authors: "Pandria N., ..., Mitsopoulos K., et al.",
    venue: "Frontiers in Behavioral Neuroscience 17",
    year: "2023",
    href: "https://www.frontiersin.org/journals/behavioral-neuroscience/articles/10.3389/fnbeh.2023.1096122/full",
  },
  {
    title: "Neurorehabilitation Through Synergistic Man-Machine Interfaces Promoting Dormant Neuroplasticity in Spinal Cord Injury: Protocol for a Nonrandomized Controlled Trial",
    authors: "Athanasiou A., Mitsopoulos K., Praftsiotis A., et al.",
    venue: "JMIR Research Protocols 11(9), e41152",
    year: "2022",
    href: "https://www.researchprotocols.org/2022/9/e41152",
  },
  {
    title: "Affect detection in rehabilitation using wearable robotics, multiple biosensors and serious gaming: a concept using the NeuroSuitUp platform",
    authors: "Athanasiou A., Antoniou P., Pandria N., Astaras A., Nizamis K., Mitsopoulos K., et al.",
    venue: "Medical Education Informatics (MEI 2021)",
    year: "2021",
    href: "https://research.utwente.nl/en/publications/affect-detection-in-rehabilitation-using-wearable-robotics-multip/",
  },
  {
    title: "Prototyping and proof-of-concept of a wearable robotic jacket integrating a wearable jacket with sensors and actuators for upper limb rehabilitation",
    authors: "Athanasiou A., Mitsopoulos K., Terzopoulos N., Papastergiou V., Arfaras G., Pandria N., Magras I., Astaras A., Bamidis P.D.",
    venue: "8th Panhellenic Conference on Biomedical Technology, extended abstract",
    year: "2020",
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
