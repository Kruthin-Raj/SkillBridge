import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        That link does not lead anywhere on SkillBridge.
      </p>
      <Link to="/" className="btn-primary mt-6">
        Back to browse
      </Link>
    </div>
  );
}
