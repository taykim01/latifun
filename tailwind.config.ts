import type { Config } from "tailwindcss";

const config: Config = {
    content: ["./src/presentation/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
        extend: {
            colors: {
                gray: {
                    white: "#fff",
                    black: "#000",
                    50: "#f9fafb",
                    100: "#f2f4f6",
                    200: "#e5e8eb",
                    300: "#d1d6db",
                    400: "#b0b8c1",
                    500: "#8b95a1",
                    600: "#6b7684",
                    700: "#4e5968",
                    800: "#333d4b",
                    900: "#191f28",
                },
                others: {
                    blue: {
                        100: "#e8f3ff",
                        200: "#c9e2ff",
                        300: "#3196f6",
                    },
                    red: {
                        100: "#fee",
                        200: "#ffd4d6",
                        300: "#f04466",
                    },
                    yellow: {
                        100: "#fff4d8",
                        200: "#ffefbf",
                        300: "#ee6711",
                    },
                    green: {
                        100: "#eaf8f2",
                        200: "#aeefd5",
                        300: "#03b280",
                    },
                },
            },
            fontSize: {
                "heading-1": ["62px", { lineHeight: "84px", fontWeight: 800 }],
                "heading-2": ["44px", { lineHeight: "60px", fontWeight: 800 }],
                "heading-3": ["32px", { lineHeight: "44px", fontWeight: 800 }],
                "title-1": ["26px", { lineHeight: "36px", fontWeight: 800 }],
                "title-2": ["23px", { lineHeight: "32px", fontWeight: 700 }],
                "title-3": ["20px", { lineHeight: "28px", fontWeight: 700 }],
                "title-4": ["18px", { lineHeight: "26px", fontWeight: 600 }],
                "body-emphasized": ["17px", { lineHeight: "24px", fontWeight: 700 }],
                "body-regular": ["17px", { lineHeight: "24px", fontWeight: 500 }],
                "subheadline-1": ["15px", { lineHeight: "22px", fontWeight: 500 }],
                "subheadline-2": ["14px", { lineHeight: "20px", fontWeight: 600 }],
                footnote: ["12px", { lineHeight: "16px", fontWeight: 600 }],
                caption: ["11px", { lineHeight: "14px", fontWeight: 500 }],
                "button-l-regualr": ["17px", { lineHeight: "24px", fontWeight: 500 }],
            },
        },
    },
    plugins: [],
};
export default config;
