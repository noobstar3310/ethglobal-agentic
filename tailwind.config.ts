import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

function addVariablesForColors({ addBase, theme }: any) {
	const colors = theme("colors");
  
	const generateCSSVariables = (obj: Record<string, any>, prefix = ""): Record<string, string> => {
	  return Object.entries(obj).reduce((acc, [key, value]) => {
		if (typeof value === "string") {
		  acc[`--${prefix}${key}`] = value;
		} else if (typeof value === "object") {
		  Object.assign(acc, generateCSSVariables(value, `${prefix}${key}-`));
		}
		return acc;
	  }, {} as Record<string, string>);
	};
  
	addBase({
	  ":root": generateCSSVariables(colors),
	});
  }
  
  export default {
	darkMode: ["class"],
	content: [
	  "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
	  "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
	  extend: {
		colors: {
		  background: "hsl(var(--background))",
		  foreground: "hsl(var(--foreground))",
		  border: "hsl(var(--border))",
		  card: {
			DEFAULT: "hsl(var(--card))",
			foreground: "hsl(var(--card-foreground))",
		  },
		  primary: {
			DEFAULT: "hsl(var(--primary))",
			foreground: "hsl(var(--primary-foreground))",
		  },
		  secondary: {
			DEFAULT: "hsl(var(--secondary))",
			foreground: "hsl(var(--secondary-foreground))",
		  },
		  accent: {
			DEFAULT: "hsl(var(--accent))",
			foreground: "hsl(var(--accent-foreground))",
		  },
		  destructive: {
			DEFAULT: "hsl(var(--destructive))",
			foreground: "hsl(var(--destructive-foreground))",
		  },
		},
		animation: {
		  aurora: "aurora 60s linear infinite",
		},
		keyframes: {
		  aurora: {
			"0%": { backgroundPosition: "50% 50%" },
			"100%": { backgroundPosition: "350% 50%" },
		  },
		},
	  },
	},
	plugins: [addVariablesForColors],
  };
  