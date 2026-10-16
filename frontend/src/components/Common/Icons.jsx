import React from 'react';

const iconBase = {
  width: 15,
  height: 15,
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "1.35",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  style: { flexShrink: 0 }
};

export const IconRepo = ({ size = 15, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M2.5 3.5C2.5 2.67157 3.17157 2 4 2H12C12.8284 2 13.5 2.67157 13.5 3.5V13.5L8 10.5L2.5 13.5V3.5Z" />
    <path d="M2.5 5.5H13.5" />
  </svg>
);

export const IconLineage = ({ size = 15, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <circle cx="4.5" cy="4" r="2" />
    <circle cx="4.5" cy="12" r="2" />
    <circle cx="11.5" cy="8" r="2" />
    <path d="M4.5 6V10" />
    <path d="M4.5 8H7.5C8.8 8 10 7.2 10.5 6.5L11.5 6" />
  </svg>
);

export const IconSnapshot = ({ size = 15, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <rect x="2" y="2" width="12" height="12" rx="1.5" />
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 2V4.5" />
    <path d="M8 11.5V14" />
    <path d="M2 8H4.5" />
    <path d="M11.5 8H14" />
  </svg>
);

export const IconFile = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M3.5 2H9.5L13 5.5V13.5C13 13.8 12.8 14 12.5 14H3.5C3.2 14 3 13.8 3 13.5V2.5C3 2.2 3.2 2 3.5 2Z" />
    <path d="M9.5 2V5.5H13" />
  </svg>
);

export const IconFolder = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M2 3.5C2 3.2 2.2 3 2.5 3H6L7.5 5H13.5C13.8 5 14 5.2 14 5.5V12.5C14 12.8 13.8 13 13.5 13H2.5C2.2 13 2 12.8 2 12.5V3.5Z" />
  </svg>
);

export const IconFolderOpen = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M2 3.5C2 3.2 2.2 3 2.5 3H6L7.5 5H13.5C13.8 5 14 5.2 14 5.5V8H3.5L2 13V3.5Z" />
    <path d="M3.5 8L1.5 13.5C1.4 13.7 1.6 14 1.9 14H13.8C14.1 14 14.3 13.8 14.4 13.5L15.5 8H3.5Z" />
  </svg>
);

export const IconChevronRight = ({ size = 12, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M5.5 3.5L10 8L5.5 12.5" />
  </svg>
);

export const IconChevronDown = ({ size = 12, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M3.5 5.5L8 10L12.5 5.5" />
  </svg>
);

export const IconTerminal = ({ size = 15, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <rect x="2" y="2.5" width="12" height="11" rx="1.5" />
    <path d="M4.5 6L7 8L4.5 10" />
    <line x1="8.5" y1="10" x2="11.5" y2="10" />
  </svg>
);

export const IconRevert = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M3 6.5H9.5C11.5 6.5 13 8 13 10C13 12 11.5 13.5 9.5 13.5H4" />
    <path d="M5.5 4L3 6.5L5.5 9" />
  </svg>
);

export const IconIssue = ({ size = 15, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <circle cx="8" cy="8" r="6" />
    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
  </svg>
);

export const IconSettings = ({ size = 15, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" />
  </svg>
);

export const IconOffline = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M3 13.5H13C14.1 13.5 15 12.6 15 11.5C15 10.4 14.1 9.5 13 9.5H12.7C12.4 6.9 10.2 5 7.5 5C5.9 5 4.5 5.7 3.6 6.9C1.6 7.3 0 9.2 0 11.5C0 12.6 0.9 13.5 2 13.5" />
    <line x1="2" y1="2" x2="14" y2="14" strokeWidth="1.6" />
  </svg>
);

export const IconCheck = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M3.5 8.5L6.5 11.5L13 4" strokeWidth="1.6" />
  </svg>
);

export const IconAlert = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <path d="M8 2.5L14 13H2L8 2.5Z" />
    <line x1="8" y1="6" x2="8" y2="9.5" />
    <circle cx="8" cy="11.5" r="0.8" fill="currentColor" />
  </svg>
);

export const IconCopy = ({ size = 13, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <rect x="5.5" y="5.5" width="8" height="8" rx="1" />
    <path d="M3 10.5H2.5C2.2 10.5 2 10.3 2 10V2.5C2 2.2 2.2 2 2.5 2H10C10.3 2 10.5 2.2 10.5 2.5V3" />
  </svg>
);

export const IconSearch = ({ size = 13, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <circle cx="6.5" cy="6.5" r="4.5" />
    <line x1="10" y1="10" x2="14" y2="14" />
  </svg>
);

export const IconPlus = ({ size = 13, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

export const IconUser = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <circle cx="8" cy="5" r="3" />
    <path d="M2.5 13.5C2.5 11 5 9.5 8 9.5C11 9.5 13.5 11 13.5 13.5" />
  </svg>
);

export const IconInfo = ({ size = 14, ...props }) => (
  <svg {...iconBase} width={size} height={size} {...props}>
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="7" x2="8" y2="11" />
    <circle cx="8" cy="5" r="0.8" fill="currentColor" />
  </svg>
);
