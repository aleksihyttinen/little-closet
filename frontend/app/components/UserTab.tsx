"use client";

import type { Messages } from "../messages";

type UserTabProps = {
  t: Messages;
  signedIn: boolean;
  onSignInClick: () => void;
  onLogout?: () => void;
};

export default function UserTab({ t, signedIn, onSignInClick, onLogout }: UserTabProps) {
  if (!signedIn) {
    return (
      <div role="tabpanel" aria-label="User">
        <section className="mb-8 flex flex-col gap-4 border border-[#d6dbd3] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
              {t.adminAccess}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{t.signInToManage}</h2>
            <p className="mt-1 text-sm text-[#68746d]">
              {t.adminOnly}
            </p>
          </div>
          <button
            onClick={onSignInClick}
            className="min-h-11 rounded-md bg-[#315c4c] px-6 text-sm font-semibold text-white transition hover:bg-[#244738]"
          >
            {t.signIn || "Sign In"}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div role="tabpanel" aria-label="User">
      <section className="border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
              {t.userManagement || "User Management"}
            </p>
            <h2 className="mt-1 text-lg font-semibold">{t.currentUser || "Current User"}</h2>
            <p className="mt-3 text-sm text-[#68746d]">
              {t.userManagementComingSoon || "Multi-user support is coming soon. Currently, only the admin user is available."}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="min-h-11 rounded-md bg-[#a83d2b] px-6 text-sm font-semibold text-white transition hover:bg-[#8b3220] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a83d2b]"
            >
              {t.logOut || "Log Out"}
            </button>
          )}
        </div>

        <div className="mt-6 rounded-lg border border-[#d6dbd3] bg-[#f8faf7] p-4">
          <p className="text-xs font-semibold text-[#45534b]">
            {t.adminUser || "Admin User"}
          </p>
          <p className="mt-2 text-sm text-[#68746d]">
            {t.adminUserDescription || "You are logged in as the admin user with full access to the inventory management system."}
          </p>
        </div>
      </section>
    </div>
  );
}
