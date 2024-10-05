import Components from "./_components";

export default async function Page({ params }: { params: { project_id: string } }) {
  const { project_id } = params;

  return (
    <div className="w-full h-screen">
      <Components.Whiteboard projectID={project_id} />
    </div>
  );
}
