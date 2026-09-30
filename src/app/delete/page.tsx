import Link from "next/link";
export const metadata = { title: "Iron Trace data deletion" };
export default function Page() {
  return (
    <article
      className="mx-auto max-w-3xl p-6 leading-7"
      style={{ maxHeight: "100dvh", overflowY: "auto" }}
    >
      <Link href="/">Home</Link>
      <h1 className="text-3xl font-bold my-6">Iron Trace data deletion</h1>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Local data</h2>
        <p>
          Clear browser site data to remove locally stored preferences and
          credentials. This does not remove published content, server records,
          or copies others have saved.
        </p>
      </section>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Server records</h2>
        <p>
          A private request channel and verified deletion procedure must be
          designated before this draft is published. Do not send identifying
          information in public issues. Requests may require verification, and
          records required for security or legal obligations may need to be
          retained.
        </p>
      </section>
      <nav aria-label="Site information" className="flex flex-wrap gap-4">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/delete">Data deletion</Link>
      </nav>
    </article>
  );
}
