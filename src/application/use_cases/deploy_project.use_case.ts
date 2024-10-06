/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import fetch from "node-fetch";
import crypto from "crypto";
import { serverClient } from "@/data/infrastructures/supabase/server";
import TABLES from "@/data/infrastructures/supabase/tables";
import { Tables } from "../dao/database.types";

export interface FormValues {
  PROJECT_NAME: string;
  supabaseId: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  vercelToken: string;
  supabaseToken: string;
  supabaseDBPassword: string;
}

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

// export default async function createEmptyProjectUseCase() {
//   // Supabase client
//   const supabase = serverClient();

//   const PROJECT_NAME = "next14_shadcn_ddd";
//   const supabaseToken = "sbp_58cb12b580e68edd51f01360747e09999b8ca673";
//   const supabaseDBPassword = "supabase";
//   const vercelToken = "WxEfexDHtSK4TPYqs4xCODyD";
export default async function deployProjectUseCase(projectId: string) {
  // Supabase 클라이언트를 생성합니다.
  const supabase = serverClient();

  try {
    let project: VercelProject | null = null;
    let projectRow: Tables<"project"> | null = null;

    // Retrieve projectRow from database
    const { data: existingProject, error: getProjectError } = await supabase
      .from(TABLES.PROJECT)
      .select("*")
      .eq("id", projectId)
      .single();

    if (getProjectError || !existingProject) {
      throw new Error("Error fetching project information from database.");
    }

    projectRow = existingProject;
    const projectRef = projectRow?.supabase_ref;
    const vercelToken = projectRow?.vercel_api_key;
    const PROJECT_NAME = projectRow?.title;

    // Ensure projectRow is available
    if (!projectRow) {
      throw new Error("Unable to retrieve project information from database.");
    }

    console.log("Checking if Vercel project exists...");
    const getProjectResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_NAME}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });
    if (getProjectResponse.ok) {
      project = (await getProjectResponse.json()) as VercelProject;
      console.log(`Vercel project already exists: ${project.name}`);
    }

    // Continue with file uploads and deployment...
    console.log("Uploading files...");
    const uploadedFiles: UploadedFile[] = [];

    const { data: filesData, error: filesError } = await supabase
      .from(TABLES.CODE)
      .select("filepath, content")
      .eq("project_id", projectRow.id)
      .eq("latest", true);
    // console.log(filesData?.find((file) => file.filepath === "package.json")?.content);
    for (const file of filesData ?? []) {
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
          file: file.filepath,
          sha: sha1sum,
        });

        const fileExtension = file.filepath.slice(file.filepath.lastIndexOf("."));

        // Update existing code records to latest: false
        const { error: updateError } = await supabase
          .from(TABLES.CODE)
          .update({ latest: false })
          .eq("project_id", projectRow.id)
          .eq("filepath", file.filepath);

        if (updateError) {
          throw new Error(`Error updating existing code records (${file.filepath}): ${updateError.message}`);
        }

        // Insert new code record
        const { error: codeInsertError } = await supabase.from(TABLES.CODE).insert({
          project_id: projectRow.id,
          content: file.content.trim(),
          filepath: file.filepath,
          extension: fileExtension,
          latest: true,
          metadata: {},
          sha1sum,
        });

        if (codeInsertError) {
          throw new Error(`Error saving code information to database (${file.filepath}): ${codeInsertError.message}`);
        }
      } else {
        const error = (await uploadResponse.json()) as VercelAPIError;
        throw new Error(`Error uploading file (${file.filepath}): ${error.error.message}`);
      }
    }
    console.log("Files uploaded and code saved.");

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
        project: project?.id,
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

    // 배포된 프로젝트의 URL 반환
    const deploymentURL = deployment.url;
    const projectID = projectRow.id;
    return { deploymentURL, projectID };
  } catch (error) {
    console.error(error);
    throw error;
  }
}
