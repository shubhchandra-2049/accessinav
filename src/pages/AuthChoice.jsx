import { Link } from "react-router-dom";
import { Accessibility, LogIn, UserPlus } from "lucide-react";

function AuthChoice() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Accessibility className="w-8 h-8 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900">
            AccessiNav
          </h1>

          <p className="mt-3 text-slate-600">
            Accessible transit navigation for everyone.
          </p>

          <div className="mt-8 space-y-3">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700"
            >
              <LogIn size={20} />
              Login
            </Link>

            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-700 font-medium hover:bg-slate-50"
            >
              <UserPlus size={20} />
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthChoice;