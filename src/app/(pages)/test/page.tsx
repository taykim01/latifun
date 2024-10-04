import createEmptyProjectUseCase from "@/application/use_cases/create_empty_project.use_case";

export default function Home() {
  return (
    <form>
      <button formAction={createEmptyProjectUseCase}>가즈아아아</button>;
    </form>
  );
}
