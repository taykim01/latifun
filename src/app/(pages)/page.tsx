import Card from "@/presentation/components/card";
import Components from "./_components";
import getUser from "@/data/infrastructures/supabase/get_user";
import { redirect } from "next/navigation";
import readMyProfile from "@/application/use_cases/read_my_profile.use_case";
import readMyProjectsUseCase from "@/application/use_cases/read_my_projects.use_case";
import { formatDate } from "@/core/utils/format_date";
import { Tables } from "../../../database.types";

export default async function Home() {
  const userData = await getUser();
  if (userData) {
    try {
      const profileData: Tables<"profile"> = await readMyProfile(userData.id);
      if (!profileData) redirect("/onboarding");
      const myProjects = await readMyProjectsUseCase();

      return <UI myProjects={myProjects} userName={profileData.name} />;
    } catch (error) {
      return <UI myProjects={[]} />;
    }
  } else {
    return <UI myProjects={[]} />;
  }
}

function UI(props: {
  myProjects?: {
    id: string;
    created_at: string;
    title: string;
  }[];
  userName?: string;
}) {
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: "#fdfdfd" }}>
      <aside className="min-w-[200px] h-screen shadow hover:shadow-lg transition-all duration-300 px-8 pt-12 pb-6 flex flex-col justify-between">
        <Components.ProfileGroup userName={props.userName} />
        <Components.LogOutButton />
      </aside>
      <div className="w-full px-16 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold">Hello, {props.userName}</div>
          <div className="text-md text-gray-600">Continue with your Latifundium projects.</div>
        </div>
        <hr />
        <div className="flex flex-col gap-6">
          <div className="w-full flex items-center justify-between">
            <div className="text-xl font-semibold">My Projects</div>
            <Components.CreateProjectButton />
          </div>
          <div className="flex flex-wrap gap-5 w-full">
            {props.myProjects?.map((project, index) => (
              <Card
                key={index}
                clickURL={`/project/${project.id}`}
                front={{ title: project.title, content: formatDate(project.created_at) }}
                back={{
                  title: (
                    <div>
                      <span className="text-xl font-bold">{project.title}</span>
                      <br />
                      Click to check out
                    </div>
                  ),
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
