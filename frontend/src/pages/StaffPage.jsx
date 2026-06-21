import { useNavigate } from 'react-router-dom';

export default function StaffPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="card p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Staff Portal</h1>

        <button
          onClick={() => navigate('/kitchen')}
          className="btn-primary w-full mb-4"
        >
          👨‍🍳 Kitchen Dashboard
        </button>

        <button
          onClick={() => navigate('/admin')}
          className="btn-primary w-full"
        >
          👨‍💼 Admin Dashboard
        </button>
      </div>
    </div>
  );
}