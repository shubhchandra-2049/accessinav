import { Link } from "react-router-dom";
import { Accessibility, Building2, HeartHandshake, LogIn, UserRound } from "lucide-react";

const ROLES = [
  { role: "user", title: "I'm a User", description: "Find accessible routes, report issues and send SOS alerts.", Icon: UserRound },
  { role: "volunteer", title: "I'm a Volunteer", description: "Review and verify accessibility reports from the community.", Icon: HeartHandshake },
  { role: "ngo", title: "I'm an Organization", description: "Verify reports in bulk and respond to SOS alerts.", Icon: Building2 },
];

function AuthChoice() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
            <Accessibility className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">AccessiNav</h1>
          <p className="mt-3 text-slate-600">Accessible transit navigation for everyone.</p>
        </div>

        <section aria-labelledby="create-account-heading" className="mt-8">
          <h2 id="create-account-heading" className="text-sm font-semibold uppercase tracking-wide text-blue-800">Create an account</h2>
          <ul className="mt-3 grid gap-3">
            {ROLES.map(({ role, title, description, Icon }) => (
              <li key={role}>
                <Link
                  to={"/signup?role=" + role}
                  className="flex min-h-16 items-start gap-4 rounded-xl border-2 border-slate-200 p-4 hover:border-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700"><Icon size={22} aria-hidden="true" /></span>
                  <span>
                    <span className="block font-bold text-slate-900">{title}</span>
                    <span className="mt-0.5 block text-sm text-slate-600">{description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <Link
            to="/login"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-3 font-medium text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            <LogIn size={20} aria-hidden="true" />
            I already have an account · Log in
          </Link>
        </div>
      </div>
    </main>
  );
}

export default AuthChoice;
