import Components from "./_components";

export default async function Page({ params }: { params: { project_id: string } }) {
  const { project_id } = params;
  console.log(project_id);

  return (
    <div className="w-full h-full">
      <Components.Whiteboard />
    </div>
  );
}
