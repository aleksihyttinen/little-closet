"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  createClosetShare,
  clearActiveClosetOwnerId,
  fetchClosetShares,
  getActiveClosetOwnerId,
  revokeClosetShare,
  type ClosetShare,
} from "../api";
import type { Language, Messages } from "../messages";

type UserTabProps = {
  t: Messages;
  signedIn: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
  user: { name: string; email: string; image?: string | null } | null;
  onSignInClick: () => void;
  onLogout?: () => void;
  canShare?: boolean;
};

export default function UserTab({ t, language, onLanguageChange, user, signedIn, onSignInClick, onLogout, canShare = false }: UserTabProps) {
  const [shares, setShares] = useState<ClosetShare[]>([]);
  const [role, setRole] = useState<ClosetShare["role"]>("viewer");
  const [creatingShare, setCreatingShare] = useState(false);
  const [shareError, setShareError] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const sharedClosetActive = useSyncExternalStore(
    (callback) => {
      window.addEventListener("storage", callback);
      return () => window.removeEventListener("storage", callback);
    },
    () => Boolean(getActiveClosetOwnerId()),
    () => false,
  );

  useEffect(() => {
    if (!canShare) return;
    void fetchClosetShares()
      .then(setShares)
      .catch(() => setShareError(true));
  }, [canShare]);

  const returnToMyCloset = () => {
    clearActiveClosetOwnerId();
    window.location.reload();
  };

  const createShare = async () => {
    setCreatingShare(true);
    setShareError(false);
    setCopied(false);
    try {
      const result = await createClosetShare(role);
      setShares((current) => [result.share, ...current]);
      setInviteLink(`${window.location.origin}/share?token=${encodeURIComponent(result.invite_token)}`);
    } catch {
      setShareError(true);
    } finally {
      setCreatingShare(false);
    }
  };

  const revokeShare = async (share: ClosetShare) => {
    if (!window.confirm(t.confirmRevokeShare)) return;
    try {
      await revokeClosetShare(share.id);
      setShares((current) => current.map((item) =>
        item.id === share.id ? { ...item, revoked_at: new Date().toISOString() } : item,
      ));
    } catch {
      setShareError(true);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div role="group" aria-label={t.languageLabel} className="flex rounded-md border border-[#cbd3ca] bg-white p-1">
        {(["fi", "en"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={language === option}
            onClick={() => onLanguageChange(option)}
            className={`min-h-9 min-w-11 rounded px-3 text-xs font-bold transition ${language === option
              ? "bg-[#315c4c] text-white"
              : "text-[#45534b] hover:bg-[#f4f6f1]"
              }`}
          >
            {option.toUpperCase()}
          </button>
        ))}
      </div>
      {!signedIn ?
        <div role="tabpanel" aria-label="User" className="w-full px-4">
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
        :
        <div role="tabpanel" aria-label="User" className="w-full px-4">
          <section className="border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">
                  {t.userManagement || "User Management"}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{t.currentUser || "Current User"}</h2>
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

            <div className="mt-6 flex items-center gap-4 rounded-lg border border-[#d6dbd3] bg-[#f8faf7] p-4">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" referrerPolicy="no-referrer" className="size-14 rounded-full object-cover" />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-full bg-[#315c4c] text-xl font-semibold text-white">
                  {(user?.name || user?.email || "?").charAt(0).toUpperCase()}
                </div>
              )}
              <dl className="min-w-0 text-sm">
                <dt className="text-xs font-semibold text-[#718077]">{t.nameLabel}</dt>
                <dd className="truncate font-semibold text-[#202a27]">{user?.name || "-"}</dd>
                <dt className="mt-2 text-xs font-semibold text-[#718077]">{t.emailLabel}</dt>
                <dd className="truncate text-[#45534b]">{user?.email || "-"}</dd>
              </dl>
            </div>
            {sharedClosetActive ? (
              <button
                type="button"
                onClick={returnToMyCloset}
                className="mt-4 min-h-11 rounded-md border border-[#315c4c] px-4 text-sm font-semibold text-[#315c4c]"
              >
                {t.switchToMyCloset}
              </button>
            ) : null}
          </section>
          {canShare ? (
            <section className="mt-6 border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#718077]">{t.shareCloset}</p>
              <p className="mt-2 text-sm text-[#68746d]">{t.shareClosetHint}</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1 text-sm font-medium">
                  {t.shareRole}
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as ClosetShare["role"])}
                    className="mt-1 block min-h-11 w-full rounded-md border border-[#cbd3ca] bg-white px-3"
                  >
                    <option value="viewer">{t.viewer}</option>
                    <option value="editor">{t.editor}</option>
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => void createShare()}
                  disabled={creatingShare}
                  className="min-h-11 rounded-md bg-[#315c4c] px-5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {creatingShare ? t.creatingShareLink : t.createShareLink}
                </button>
              </div>
              {inviteLink ? (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input readOnly value={inviteLink} className="min-h-11 min-w-0 flex-1 rounded-md border border-[#cbd3ca] bg-[#f8faf7] px-3 text-sm" />
                  <button type="button" onClick={() => void copyInviteLink()} className="min-h-11 rounded-md border border-[#315c4c] px-4 text-sm font-semibold text-[#315c4c]">
                    {copied ? t.shareLinkCopied : t.copyShareLink}
                  </button>
                </div>
              ) : null}
              {shareError ? <p role="alert" className="mt-3 text-sm text-[#a83d2b]">{t.sharingFailed}</p> : null}
              {shares.length > 0 ? (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold">{t.activeShares}</h3>
                  <ul className="mt-3 space-y-2">
                    {shares.map((share) => (
                      <li key={share.id} className="flex flex-col gap-2 rounded-md border border-[#e1e6df] p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <span>
                          {share.role === "viewer" ? t.viewer : t.editor} · {share.accepted_at ? t.acceptedInvitation : share.revoked_at ? t.expiredInvitation : t.pendingInvitation}
                        </span>
                        {!share.revoked_at ? (
                          <button type="button" onClick={() => void revokeShare(share)} className="self-start text-sm font-semibold text-[#a83d2b] sm:self-auto">
                            {t.revokeShare}
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      }
    </div>
  )
}
