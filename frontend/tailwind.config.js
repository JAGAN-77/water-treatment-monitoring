/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#311400",
        "on-secondary-container": "#a7b6cc",
        "tertiary": "#ffb786",
        "outline": "#8c909f",
        "error": "#ffb4ab",
        "inverse-primary": "#005ac2",
        "inverse-surface": "#dae2fd",
        "on-tertiary-container": "#461f00",
        "outline-variant": "#424754",
        "on-surface": "#dae2fd",
        "surface-tint": "#adc6ff",
        "surface-container-low": "#131b2e",
        "surface-container-lowest": "#060e20",
        "secondary-fixed": "#d4e4fa",
        "background": "#0b1326",
        "primary-container": "#4d8eff",
        "tertiary-fixed-dim": "#ffb786",
        "on-primary-fixed": "#001a42",
        "tertiary-fixed": "#ffdcc6",
        "secondary-container": "#39485a",
        "surface-bright": "#31394d",
        "on-error": "#690005",
        "on-tertiary": "#502400",
        "on-secondary": "#233143",
        "surface-container": "#171f33",
        "on-surface-variant": "#c2c6d6",
        "primary": "#adc6ff",
        "on-secondary-fixed-variant": "#39485a",
        "secondary-fixed-dim": "#b9c8de",
        "on-secondary-fixed": "#0d1c2d",
        "secondary": "#b9c8de",
        "on-primary-container": "#00285d",
        "on-primary-fixed-variant": "#004395",
        "surface-dim": "#0b1326",
        "inverse-on-surface": "#283044",
        "surface": "#0b1326",
        "primary-fixed-dim": "#adc6ff",
        "on-primary": "#002e6a",
        "on-tertiary-fixed-variant": "#723600",
        "error-container": "#93000a",
        "surface-container-highest": "#2d3449",
        "on-background": "#dae2fd",
        "primary-fixed": "#d8e2ff",
        "surface-variant": "#2d3449",
        "on-error-container": "#ffdad6",
        "tertiary-container": "#df7412",
        "surface-container-high": "#222a3d"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "gutter": "16px",
        "stack-md": "16px",
        "stack-sm": "8px",
        "stack-lg": "32px",
        "container-padding": "24px",
        "unit": "4px"
      },
      fontFamily: {
        "label-sm": ["Inter"],
        "headline-md": ["Inter"],
        "headline-lg": ["Inter"],
        "display-metrics": ["Inter"],
        "body-lg": ["Inter"],
        "label-mono": ["JetBrains Mono"],
        "body-md": ["Inter"]
      },
      fontSize: {
        "label-sm": ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-lg": ["32px", { lineHeight: "40px", fontWeight: "600" }],
        "display-metrics": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["18px", { lineHeight: "28px", fontWeight: "400" }],
        "label-mono": ["14px", { lineHeight: "20px", letterSpacing: "0.05em", fontWeight: "500" }],
        "body-md": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: [],
}
