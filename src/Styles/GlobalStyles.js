import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

:root,
html.light-mode {
  /* Brand */
  --color-brand-50: #eef2ff;
  --color-brand-100: #e0e7ff;
  --color-brand-200: #c7d2fe;
  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  --color-brand-700: #4338ca;
  --color-brand-800: #3730a3;
  --color-brand-900: #312e81;

  /* Neutrals */
  --color-grey-0: #ffffff;
  --color-grey-50: #f9fafb;
  --color-grey-100: #f3f4f6;
  --color-grey-200: #e5e7eb;
  --color-grey-300: #d1d5db;
  --color-grey-400: #9ca3af;
  --color-grey-500: #6b7280;
  --color-grey-600: #4b5563;
  --color-grey-700: #374151;
  --color-grey-800: #1f2937;
  --color-grey-900: #111827;

  /* Surfaces & Semantic Colors */
  --bg-main: #ffffff;
  --bg-surface: #ffffff;
  --bg-surface-soft: #f8fafc;
  --bg-card: #ffffff;
  --text-primary: #111827;
  --text-secondary: #4b5563;
  --text-muted: #6b7280;
  --border-color: #e5e7eb;
  --header-bg: rgba(255, 255, 255, 0.95);
  --footer-bg: #f8f9fa;
  --card-border: #e5e7eb;

  /* Accents */
  --color-brown: #7c2d12;
  --color-brown-hover: #5c200c;
  --color-blue-100: #e0f2fe;
  --color-blue-700: #0369a1;
  --color-green-100: #dcfce7;
  --color-green-700: #15803d;
  --color-yellow-100: #fef9c3;
  --color-yellow-700: #a16207;
  --color-silver-100: #e5e7eb;
  --color-silver-700: #374151;
  --color-indigo-100: #e0e7ff;
  --color-indigo-700: #4338ca;
  --color-red-100: #fee2e2;
  --color-red-700: #b91c1c;
  --color-red-800: #991b1b;

  --backdrop-color: rgba(0, 0, 0, 0.4);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);

  --border-radius-tiny: 3px;
  --border-radius-sm: 5px;
  --border-radius-md: 7px;
  --border-radius-lg: 9px;

  --pattern-opacity: 0.05;
}

html.dark-mode {
  /* Brand */
  --color-brand-50: #1e1b4b;
  --color-brand-100: #312e81;
  --color-brand-200: #3730a3;
  --color-brand-500: #6366f1;
  --color-brand-600: #818cf8;
  --color-brand-700: #a5b4fc;
  --color-brand-800: #c7d2fe;
  --color-brand-900: #e0e7ff;

  /* Inverted Greys */
  --color-grey-0: #182234;
  --color-grey-50: #111827;
  --color-grey-100: #1f2937;
  --color-grey-200: #374151;
  --color-grey-300: #4b5563;
  --color-grey-400: #6b7280;
  --color-grey-500: #9ca3af;
  --color-grey-600: #d1d5db;
  --color-grey-700: #e5e7eb;
  --color-grey-800: #f3f4f6;
  --color-grey-900: #f9fafb;

  /* Dark Theme Surfaces */
  --bg-main: #0b0f17;
  --bg-surface: #111827;
  --bg-surface-soft: #1a2234;
  --bg-card: #141c2c;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-muted: #9ca3af;
  --border-color: #273549;
  --header-bg: rgba(17, 24, 39, 0.95);
  --footer-bg: #090d14;
  --card-border: #222f44;

  /* Accents */
  --color-brown: #ea580c;
  --color-brown-hover: #c2410c;
  --color-blue-100: #0c4a6e;
  --color-blue-700: #38bdf8;
  --color-green-100: #064e3b;
  --color-green-700: #4ade80;
  --color-yellow-100: #713f12;
  --color-yellow-700: #facc15;
  --color-silver-100: #374151;
  --color-silver-700: #e5e7eb;
  --color-indigo-100: #312e81;
  --color-indigo-700: #818cf8;
  --color-red-100: #7f1d1d;
  --color-red-700: #f87171;
  --color-red-800: #ef4444;

  --backdrop-color: rgba(0, 0, 0, 0.7);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);

  --pattern-opacity: 0.02;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  transition: background-color 0.3s ease, border-color 0.3s ease, color 0.2s ease;
}

html {
  font-size: 62.5%;
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
  scrollbar-width: thin;
  scrollbar-color: var(--color-grey-400) transparent;

  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--color-grey-400);
    border-radius: 4px;
  }
}

body {
  font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  min-height: 100vh;
  line-height: 1.6;
  font-size: 1.6rem;
  background-color: var(--bg-main);
  color: var(--text-primary);
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
}

#root {
  overflow-x: hidden;
  max-width: 100vw;
  width: 100%;
}

p, h1, h2, h3, h4, h5, h6 {
  overflow-wrap: break-word;
  color: var(--text-primary);
}

a {
  text-decoration: none;
  font-weight: 500;
  color: inherit;
}

button {
  cursor: pointer;
  font-family: inherit;
}

ul {
  list-style: none;
}

img {
  max-width: 100%;
  height: auto;
}

input, textarea, select {
  font-family: inherit;
  color: var(--text-primary);
  background-color: var(--bg-card);
}

input:focus,
textarea:focus,
select:focus {
  outline-offset: -1px;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
  cursor: not-allowed;
}

.no-scroll {
  overflow: hidden;
}
`;

export default GlobalStyles;
