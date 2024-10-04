import Card from "@/presentation/components/card";
import Components from "./_components";

export default function Home() {
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: "#fdfdfd" }}>
      <aside className="min-w-[200px] shadow hover:shadow-lg transition-all duration-300 px-8 pt-12 pb-6 flex flex-col justify-between">
        <Components.ProfileGroup />
        <Components.LogOutButton />
      </aside>
      <div className="w-full px-16 py-12 flex flex-col gap-8">
        <div className="flex flex-col gap-1">
          <div className="text-heading-3">Hello, {}</div>
          <div className="text-body-regular text-gray-600">Continue with your Latifundium projects.</div>
        </div>
        <hr />
        <div className="flex flex-col gap-6">
          <div className="w-full flex items-center justify-between">
            <div className="text-title-3">My Projects</div>
            <Components.CreateProjectButton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full">
            {Array.from({ length: 10 }).map((_, index) => (
              <Card
                key={index}
                front={{ title: `Front Title ${index + 1}`, content: `Front Content ${index + 1}` }}
                back={{ title: `Back Title ${index + 1}`, content: `Back Content ${index + 1}` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
