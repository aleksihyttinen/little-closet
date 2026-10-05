export default function SplashScreen({ label }: { label: string }) {
  return (
    <main
      role="status"
      className="fixed inset-0 flex items-center justify-center bg-[#f4f3ed] bg-cover bg-center bg-no-repeat bg-[url('/apple-splash-1170-2532.png')] landscape:bg-[url('/apple-splash-2532-1170.png')]"
    >
      <div className="mt-[64vh] flex items-center gap-3 text-sm font-medium text-[#315c4c]">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-[#315c4c]/30 border-t-[#315c4c]"
        />
        {label}
      </div>
    </main>
  );
}
