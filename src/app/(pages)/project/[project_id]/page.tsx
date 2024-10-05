import Components from "./_components";

export default async function Page({ params }: { params: { project_id: string } }) {
  const { project_id } = params;

  return (
    <div className="w-full h-screen">
      <Components.Whiteboard projectId={project_id} />
    </div>
  );
}
