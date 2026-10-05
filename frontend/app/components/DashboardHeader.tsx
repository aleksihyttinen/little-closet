import Image from "next/image";
import type { Language, Messages } from "../messages";
import type { ClothingItem } from "../types";

type DashboardHeaderProps = {
  t: Messages;
  items: ClothingItem[];
};

export default function DashboardHeader({
  t,
}: DashboardHeaderProps) {
  return (
    <>
      <header className="mb-8 flex flex-col gap-5  sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex gap-3 items-center ">
            <Image
              src="/favicon.svg"
              alt="Little Closet logo"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <h1 className="text-3xl font-semibold text-[#60766b] tracking-tight sm:text-4xl">
              {t.pageTitle}
            </h1>
          </div>
          <p className="mt-2 text-sm text-[#65716b]">{t.pageSubtitle}</p>
        </div>
      </header>
    </>
  );
}