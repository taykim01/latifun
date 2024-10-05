import "./create_project_loader.css";

export default function CreateProjectLoader() {
  return (
    <div
      className="grid place-items-center fixed inset-0 bg-gray-900 bg-opacity-30 transition-opacity duration-500"
      style={{ zIndex: 9999 }}
    >
      <div className="card">
        <div className="loader">
          <p>loading</p>
          <div className="words">
            <span className="word">Creating new project...</span>
            <span className="word">Creating files...</span>
            <span className="word">Uploading files...</span>
            <span className="word">Generating code...</span>
            <span className="word">Setting up environment variables...</span>
            <span className="word">Deploying website...</span>
            <span className="word">Almost finished...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
