import { FormValues } from "@/application/use_cases/create_empty_project.use_case";

export const emptyForm: FormValues = {
  PROJECT_NAME: "",
  // supabaseId: "",
  // supabaseUrl: "",
  // supabaseAnonKey: "",
  vercelToken: "",
  supabaseToken: "",
  supabaseDBPassword: "",
} as const;

export const convertFormKeys = (form: keyof typeof emptyForm) => {
  const conversionTable: Record<keyof typeof emptyForm, string> = {
    PROJECT_NAME: "Project Name",
    // supabaseId: "Supabase ID",
    // supabaseUrl: "Supabase URL",
    // supabaseAnonKey: "Supabase Anon Key",
    vercelToken: "Vercel Token",
    supabaseToken: "Supabase Token",
    supabaseDBPassword: "Supabase DB Password",
  };

  return conversionTable[form];
};

const PROJECT_NAME = "next14_shadcn_ddd";
const supabaseId = "hkmmkrotpewlzazmgcju";
const supabaseUrl = "https://hkmmkrotpewlzazmgcju.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrbW1rcm90cGV3bHphem1nY2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNjQ4ODUsImV4cCI6MjA0MzY0MDg4NX0.Q9pmAThZpiaTCNoFEgNHzNFUBPlKZQThevnXpx0d5gc";
const vercelToken = "WxEfexDHtSK4TPYqs4xCODyD";
