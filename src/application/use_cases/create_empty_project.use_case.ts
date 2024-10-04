/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import fetch from "node-fetch";
import crypto from "crypto";
import { createClient } from "@/data/infrastructures/supabase/server";
import TABLES from "@/data/infrastructures/supabase/tables";
import { Tables } from "../dao/database.types";
import { Next14ShadcnDDD } from "@/core/files/type1/next14_shadcn_ddd";

// interface FormValues {
//   title: string;
//   supabaseUrl: string;
//   supabaseAnonKey: string;
//   vercelToken: string;
// }

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

interface UploadedFile {
  file: string;
  sha: string;
}

export default async function createEmptyProjectUseCase() {
  // export default async function createEmptyProjectUseCase(formData: FormValues) {
  // Supabase 클라이언트를 생성합니다.
  const supabase = createClient();

  // const { title, supabaseUrl, supabaseAnonKey, vercelToken } = formData;
  const PROJECT_NAME = "next14_shadcn_ddd";
  const supabaseId = "hkmmkrotpewlzazmgcju";
  const supabaseUrl = "https://hkmmkrotpewlzazmgcju.supabase.co";
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrbW1rcm90cGV3bHphem1nY2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgwNjQ4ODUsImV4cCI6MjA0MzY0MDg4NX0.Q9pmAThZpiaTCNoFEgNHzNFUBPlKZQThevnXpx0d5gc";
  const vercelToken = "WxEfexDHtSK4TPYqs4xCODyD";

  // 사용자 정보를 가져옵니다.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("사용자 정보를 가져올 수 없습니다.");
  }

  // user_id를 사용하여 profile 정보를 가져옵니다.
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    throw new Error(`프로필 정보를 가져오는 중 오류 발생: ${profileError.message}`);
  }

  console.log(`프로필 정보: ${profileData.id} (${profileData.email})`);

  try {
    let project: VercelProject | null = null;
    let projectRow: Tables<"project"> | null = null;
    let projectExists = false;

    // 프로젝트 존재 여부 확인
    console.log("프로젝트 존재 여부 확인 중...");
    const getProjectResponse = await fetch(`https://api.vercel.com/v10/projects/${PROJECT_NAME}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
      },
    });

    if (getProjectResponse.ok) {
      project = (await getProjectResponse.json()) as VercelProject;
      projectExists = true;
      console.log(`프로젝트가 이미 존재합니다: ${project.name}`);

      // 기존 프로젝트의 경우, 데이터베이스에서 projectRow를 가져옵니다.
      const { data: existingProject, error: getProjectError } = await supabase
        .from(TABLES.PROJECT)
        .select("*")
        .eq("title", PROJECT_NAME)
        .single();

      if (getProjectError || !existingProject) {
        throw new Error("데이터베이스에서 프로젝트 정보를 가져오는 중 오류가 발생했습니다.");
      }

      projectRow = existingProject;
    } else {
      const error = (await getProjectResponse.json()) as VercelAPIError;
      if (error.error.code === "not_found") {
        console.log("프로젝트가 존재하지 않습니다. 새로운 프로젝트를 생성합니다.");
      } else {
        throw new Error(`프로젝트 조회 중 오류: ${error.error.message}`);
      }
    }

    // 프로젝트가 없으면 생성
    if (!projectExists) {
      console.log("프로젝트 생성 중...");
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
        throw new Error(`프로젝트 생성 중 오류: ${error.error.message}`);
      }

      project = (await createProjectResponse.json()) as VercelProject;
      console.log(`프로젝트 생성 완료: ${project.name}`);

      // 프로젝트가 생성되었으므로, Supabase에 프로젝트 정보를 저장합니다.
      const { data: insertedProject, error: projectInsertError } = await supabase
        .from(TABLES.PROJECT)
        .insert({
          title: PROJECT_NAME,
          profile_id: profileData.id,
          supabase_url: supabaseUrl,
          supabase_anon_key: supabaseAnonKey,
          supabase_api_key: "", // 필요한 경우 설정하세요.
          vercel_api_key: vercelToken,
          domain: project.autoAssignCustomDomains,
        })
        .select()
        .single();

      if (projectInsertError) {
        throw new Error(`프로젝트 정보를 데이터베이스에 저장하는 중 오류 발생: ${projectInsertError.message}`);
      }
      projectRow = insertedProject;
      console.log("프로젝트 정보를 데이터베이스에 저장했습니다.");
    }

    // projectRow가 없으면 오류 발생
    if (!projectRow) {
      throw new Error("프로젝트 정보를 데이터베이스에서 가져올 수 없습니다.");
    }

    // 파일 업로드는 항상 수행
    console.log("파일 업로드 중...");
    const uploadedFiles: UploadedFile[] = [];

    const files = Next14ShadcnDDD(PROJECT_NAME, supabaseId);
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
        body: contentBuffer,
      });

      if (uploadResponse.ok || uploadResponse.status === 409) {
        uploadedFiles.push({
          file: file.filePath,
          sha: sha1sum,
        });

        const fileExtension = file.filePath.slice(file.filePath.lastIndexOf("."));

        // 동일한 project_id와 filepath를 가진 기존 레코드들을 모두 latest: false로 업데이트
        const { error: updateError } = await supabase
          .from(TABLES.CODE)
          .update({ latest: false })
          .eq("project_id", projectRow.id)
          .eq("filepath", file.filePath);

        if (updateError) {
          throw new Error(
            `기존 코드의 latest 필드를 false로 업데이트하는 중 오류 발생 (${file.filePath}): ${updateError.message}`
          );
        }

        // 새로운 code 레코드 삽입
        const { error: codeInsertError } = await supabase.from(TABLES.CODE).insert({
          project_id: projectRow.id, // projectRow의 id 사용
          content: file.content.trim(),
          filepath: file.filePath,
          extension: fileExtension,
          latest: true,
          metadata: {},
          sha1sum,
        });

        if (codeInsertError) {
          throw new Error(
            `코드 정보를 데이터베이스에 저장하는 중 오류 발생 (${file.filePath}): ${codeInsertError.message}`
          );
        }
      } else {
        const error = (await uploadResponse.json()) as VercelAPIError;
        throw new Error(`파일 업로드 중 오류 (${file.filePath}): ${error.error.message}`);
      }
    }
    console.log("파일 업로드 및 코드 저장 완료");

    // 프로젝트가 새로 생성된 경우에만 환경 변수 설정
    if (!projectExists && project) {
      console.log("환경 변수 설정 중...");
      const envVariables = [
        {
          key: "SUPABASE_URL",
          value: supabaseUrl,
          type: "plain",
          target: ["production", "preview", "development"],
        },
        {
          key: "SUPABASE_ANON_KEY",
          value: supabaseAnonKey,
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
          throw new Error(`환경 변수 설정 중 오류 (${envVar.key}): ${error.error.message}`);
        }
      }
      console.log("환경 변수 설정 완료");
    } else {
      console.log("프로젝트가 이미 존재하므로 환경 변수 설정을 건너뜁니다.");
    }

    // 배포 생성
    if (!project) {
      throw new Error("프로젝트 정보가 없습니다.");
    }
    console.log("배포 생성 중...");
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
      throw new Error(`배포 생성 중 오류: ${error.error.message}`);
    }

    const deployment = (await deploymentResponse.json()) as VercelDeployment;
    console.log(`배포 생성 완료: ${deployment.url}`);

    // 배포 정보를 데이터베이스에 저장
    const { error: deploymentInsertError } = await supabase.from(TABLES.DEPLOYMENT).insert({
      project_id: projectRow.id, // projectRow의 id 사용
      url: deployment.url,
    });

    if (deploymentInsertError) {
      throw new Error(`배포 정보를 데이터베이스에 저장하는 중 오류 발생: ${deploymentInsertError.message}`);
    }

    // 배포된 프로젝트의 URL 반환
    return deployment.url;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
