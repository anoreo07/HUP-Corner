import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.tsx",
    "./node_modules/rizzui/dist/*.{js,ts,jsx,tsx}", // must use this line to compile and generate our RizzUI components style
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
