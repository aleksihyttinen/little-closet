"use client";

import type { FormEventHandler } from "react";
import type { Messages } from "../messages";

type LoginDialogProps = {
  t: Messages;
  email: string;
  password: string;
  signingIn: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onClose: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
};

export default function LoginDialog({
  t,
  email,
  password,
  signingIn,
  onEmailChange,
  onPasswordChange,
  onClose,
  onSubmit,
}: LoginDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18251f]/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="w-full max-w-md border border-[#d6dbd3] bg-[#fffefa] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
              {t.inventoryAccess}
            </p>
            <h2 id="login-title" className="mt-1 text-xl font-semibold">
              {t.loginTitle}
            </h2>
          </div>
          <button
            type="button"
            disabled={signingIn}
            onClick={onClose}
            aria-label={t.close}
            className="rounded-md border border-[#cbd3ca] px-3 py-1.5 text-sm text-[#45534b] hover:bg-[#f4f6f1]"
          >
            {t.close}
          </button>
        </div>
        <form onSubmit={onSubmit} aria-busy={signingIn} className="space-y-4">
          <label className="block text-sm font-medium text-[#45534b]">
            {t.email}
            <input
              required
              type="email"
              disabled={signingIn}
              autoComplete="username"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
            />
          </label>
          <label className="block text-sm font-medium text-[#45534b]">
            {t.password}
            <input
              required
              type="password"
              disabled={signingIn}
              autoComplete="current-password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              className="mt-1.5 min-h-11 w-full rounded-md border border-[#cbd3ca] bg-white px-3 text-sm outline-none focus:border-[#527d67] focus:ring-2 focus:ring-[#527d67]/15"
            />
          </label>
          <button
            type="submit"
            disabled={signingIn}
            className="min-h-11 w-full rounded-md bg-[#315c4c] px-4 text-sm font-semibold text-white transition hover:bg-[#244738] disabled:cursor-not-allowed disabled:opacity-65"
          >
            {signingIn ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
                {t.signingIn}
              </span>
            ) : t.signIn}
          </button>
        </form>
      </section>
    </div>
  );
}