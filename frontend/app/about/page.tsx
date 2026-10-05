import Link from "next/link";

export const metadata = {
  title: "Little Closet",
  description:
    "Little Closet is a wardrobe app for parents to keep track of their children's clothes and get daily outfit suggestions.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-[#293730]">
      <h1 className="text-3xl font-semibold">Little Closet</h1>
      <section lang="en" className="mt-4">
        <p className="text-base leading-7 text-[#45534b]">
          Little Closet is a wardrobe app for parents. Keep track of your
          child&apos;s clothes by category and size, and get daily outfit
          suggestions based on the weather. You can also identify a clothing
          item from a photo.
        </p>
        <p className="mt-3 text-sm leading-6 text-[#45534b]">
          Sign in with Google or email. We only use your name, email address and
          profile picture to create your account. Your wardrobe data is visible
          only to you.
        </p>
      </section>
      <section lang="fi" className="mt-8">
        <p className="text-base leading-7 text-[#45534b]">
          Little Closet on vanhemmille tarkoitettu vaatekaappisovellus lasten
          vaatteiden hallintaan. Pidä kirjaa vaatteista kategorioittain ja
          kooittain ja saat päivittäisiä pukeutumisehdotuksia sään mukaan.
          Voit myös tunnistaa vaatteen kuvasta.
        </p>
        <p className="mt-3 text-sm leading-6 text-[#45534b]">
          Kirjaudu Googlella tai sähköpostilla. Käytämme vain nimeäsi,
          sähköpostiosoitettasi ja profiilikuvaasi tilin luomiseen.
          Vaatekaappisi tiedot näkyvät vain sinulle.
        </p>
      </section>
      <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold text-[#315c4c]">
        <Link href="/auth/sign-in" className="hover:underline">Sign in</Link>
        <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
        <Link href="/terms" className="hover:underline">Terms of Service</Link>
      </div>
    </main>
  );
}
