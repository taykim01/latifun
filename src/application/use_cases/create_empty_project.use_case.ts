/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import fetch from "node-fetch";
import crypto from "crypto";
import { serverClient } from "@/data/infrastructures/supabase/server";
import TABLES from "@/data/infrastructures/supabase/tables";
import { Tables } from "../dao/database.types";
import { Next14ShadcnDDD } from "@/core/files/type1/next14_shadcn_ddd";

interface VercelAPIError {
  error: {
    code: string;
    message: string;
  };
}

interface VercelProject {
  id: string;
  name: string;
  [key: string]: any;
}

interface VercelDeployment {
  id: string;
  name: string;
  url: string;
  [key: string]: any;
}

interface SupabaseOrganization {
  id: string;
  name: string;
  [key: string]: any;
}

interface SupabaseProject {
  id: string;
  ref: string;
  name: string;
  status: string;
  [key: string]: any;
}

interface UploadedFile {
  file: string;
  sha: string;
}

export default async function createEmptyProjectUseCase() {
  // Supabase client
  const supabase = serverClient();

  const PROJECT_NAME = "next14_shadcn_ddd";
  const supabaseToken = "sbp_58cb12b580e68edd51f01360747e09999b8ca673";
  const supabaseDBPassword = "supabase";
  const vercelToken = "WxEfexDHtSK4TPYqs4xCODyD";

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unable to retrieve user information.");
  }

  // Get profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(`Error retrieving profile information: ${profileError.message}`);
  }

  console.log(`Profile info: ${profileData.id} (${profileData.email})`);

  try {
    let project: VercelProject | null = null;
    let projectRow: Tables<"project"> | null = null;
    let projectExists = false;
    let supabaseProjectRef = "";

    // Check if Vercel project exists
    console.log("Checking if Vercel project exists...");
    const getProjectResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_NAME}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (getProjectResponse.ok) {
      project = (await getProjectResponse.json()) as VercelProject;
      projectExists = true;
      console.log(`Vercel project already exists: ${project.name}`);

      // Retrieve projectRow from database
      const { data: existingProject, error: getProjectError } = await supabase
        .from(TABLES.PROJECT)
        .select("*")
        .eq("title", PROJECT_NAME)
        .single();

      if (getProjectError || !existingProject) {
        throw new Error("Error fetching project information from database.");
      }

      projectRow = existingProject;
    } else {
      const error = (await getProjectResponse.json()) as VercelAPIError;
      if (error.error.code === "not_found") {
        console.log("Vercel project does not exist. Creating a new project.");
      } else {
        throw new Error(`Error fetching Vercel project: ${error.error.message}`);
      }
    }

    // Create Vercel project if it doesn't exist
    if (!projectExists) {
      console.log("Creating Vercel project...");
      const createProjectResponse = await fetch("https://api.vercel.com/v10/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: PROJECT_NAME,
          framework: "nextjs",
          publicSource: false,
        }),
      });

      if (!createProjectResponse.ok) {
        const error = (await createProjectResponse.json()) as VercelAPIError;
        throw new Error(`Error creating Vercel project: ${error.error.message}`);
      }

      project = (await createProjectResponse.json()) as VercelProject;
      console.log(`Vercel project created: ${project.name}`);

      // get a project domain

      // Save project info to database
      const { data: insertedProject, error: projectInsertError } = await supabase
        .from(TABLES.PROJECT)
        .insert({
          title: PROJECT_NAME,
          profile_id: profileData.id,
          vercel_api_key: vercelToken,
          supabase_api_key: supabaseToken,
          // domain: project.autoAssignCustomDomains,
        })
        .select()
        .single();

      if (projectInsertError) {
        throw new Error(`Error saving project information to database: ${projectInsertError.message}`);
      }
      projectRow = insertedProject;
      console.log("Project information saved to database.");
    }

    // Ensure projectRow is available
    if (!projectRow) {
      throw new Error("Unable to retrieve project information from database.");
    }

    // Supabase Management API logic starts here
    let supabaseUrl = projectRow.supabase_url;
    if (!supabaseUrl) {
      console.log("Retrieving Supabase organizations...");
      const orgsResponse = await fetch("https://api.supabase.com/v1/organizations", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      });

      if (!orgsResponse.ok) {
        throw new Error(`Error fetching organizations: ${orgsResponse.statusText}`);
      }

      const organizations = (await orgsResponse.json()) as SupabaseOrganization[];

      if (!organizations.length) {
        throw new Error("No Supabase organizations found for the user.");
      }

      const organizationId = organizations[0].id; // Using the first organization

      // Check if Supabase project exists
      console.log("Checking if Supabase project exists...");
      const projectsResponse = await fetch("https://api.supabase.com/v1/projects", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${supabaseToken}`,
        },
      });

      if (!projectsResponse.ok) {
        throw new Error(`Error fetching Supabase projects: ${projectsResponse.statusText}`);
      }

      const supabaseProjects = (await projectsResponse.json()) as SupabaseProject[];

      let supabaseProject = supabaseProjects.find((proj) => proj.name === PROJECT_NAME);

      // Create Supabase project if it doesn't exist
      if (!supabaseProject) {
        console.log("Creating Supabase project...");
        const createSupabaseProjectResponse = await fetch("https://api.supabase.com/v1/projects", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${supabaseToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organization_id: organizationId,
            name: PROJECT_NAME,
            db_pass: supabaseDBPassword,
            region: "us-east-1", // Change region as needed
          }),
        });

        if (!createSupabaseProjectResponse.ok) {
          throw new Error(`Error creating Supabase project: ${createSupabaseProjectResponse.statusText}`);
        }

        supabaseProject = (await createSupabaseProjectResponse.json()) as SupabaseProject;
        console.log(`Supabase project created: ${supabaseProject.name}`);
      } else {
        console.log("Supabase project already exists.");
      }

      // Save Supabase project info to database
      const { error: updateProjectError } = await supabase
        .from(TABLES.PROJECT)
        .update({
          supabase_db_password: supabaseDBPassword,
          supabase_url: `https://${supabaseProject.id}.supabase.co`,
          supabase_ref: supabaseProject.id,
        })
        .eq("id", projectRow.id);

      if (updateProjectError) {
        throw new Error(`Error updating project information in database: ${updateProjectError.message}`);
      }

      supabaseProjectRef = supabaseProject.id;
      console.log("Supabase project information saved to database.");
    }

    // project 만들고 나서 sql 바로 실행하면 아직 supabase 세팅이 안되어있어서 에러가 난다.

    // Continue with file uploads and deployment...
    console.log("Uploading files...");
    const uploadedFiles: UploadedFile[] = [];

    const files = Next14ShadcnDDD(PROJECT_NAME, supabaseProjectRef || "");
    for (const file of files) {
      const contentBuffer = Buffer.from(file.content.trim(), "utf8");
      const sha1sum = crypto.createHash("sha1").update(contentBuffer).digest("hex");
      const size = contentBuffer.length;

      const uploadResponse = await fetch("https://api.vercel.com/v2/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          "x-vercel-digest": sha1sum,
          "x-vercel-size": size.toString(),
          "Content-Length": size.toString(),
        },
        body: contentBuffer as any,
      });

      if (uploadResponse.ok || uploadResponse.status === 409) {
        uploadedFiles.push({
          file: file.filePath,
          sha: sha1sum,
        });

        const fileExtension = file.filePath.slice(file.filePath.lastIndexOf("."));

        // Update existing code records to latest: false
        const { error: updateError } = await supabase
          .from(TABLES.CODE)
          .update({ latest: false })
          .eq("project_id", projectRow.id)
          .eq("filepath", file.filePath);

        if (updateError) {
          throw new Error(`Error updating existing code records (${file.filePath}): ${updateError.message}`);
        }

        // Insert new code record
        const { error: codeInsertError } = await supabase.from(TABLES.CODE).insert({
          project_id: projectRow.id,
          content: file.content.trim(),
          filepath: file.filePath,
          extension: fileExtension,
          latest: true,
          metadata: {},
          sha1sum,
        });

        if (codeInsertError) {
          throw new Error(`Error saving code information to database (${file.filePath}): ${codeInsertError.message}`);
        }
      } else {
        const error = (await uploadResponse.json()) as VercelAPIError;
        throw new Error(`Error uploading file (${file.filePath}): ${error.error.message}`);
      }
    }
    console.log("Files uploaded and code saved.");

    // Set environment variables if project is new
    if (!projectExists && project) {
      console.log("Setting environment variables...");
      const envVariables = [
        {
          key: "NEXT_PUBLIC_SUPABASE_URL",
          value: `https://${supabaseProjectRef}.supabase.co`,
          type: "plain",
          target: ["production", "preview", "development"],
        },
        {
          key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
          value: "YOUR_SUPABASE_ANON_KEY", // Replace with actual anon key
          type: "plain",
          target: ["production", "preview", "development"],
        },
      ];

      for (const envVar of envVariables) {
        const envResponse = await fetch(`https://api.vercel.com/v10/projects/${project.id}/env`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(envVar),
        });

        if (!envResponse.ok) {
          const error = (await envResponse.json()) as VercelAPIError;
          throw new Error(`Error setting environment variable (${envVar.key}): ${error.error.message}`);
        }
      }
      console.log("Environment variables set.");
    } else {
      console.log("Project already exists. Skipping environment variable setup.");
    }

    // Deploy the project
    if (!project) {
      throw new Error("Vercel project information is missing.");
    }
    console.log("Creating deployment...");
    const deploymentResponse = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: PROJECT_NAME,
        files: uploadedFiles,
        project: project.id,
        target: "production",
      }),
    });

    if (!deploymentResponse.ok) {
      const error = (await deploymentResponse.json()) as VercelAPIError;
      throw new Error(`Error creating deployment: ${error.error.message}`);
    }

    const deployment = (await deploymentResponse.json()) as VercelDeployment;
    console.log(`Deployment created: ${deployment.url}`);

    // Save deployment info to database
    const { error: deploymentInsertError } = await supabase.from(TABLES.DEPLOYMENT).insert({
      project_id: projectRow.id,
      url: deployment.url,
    });

    if (deploymentInsertError) {
      throw new Error(`Error saving deployment information to database: ${deploymentInsertError.message}`);
    }

    // Return the deployment URL
    return deployment.url;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
