export const metadata = { title: "Iron Trace terms of use" };
export default function Page() {
  return (
    <article
      className="mx-auto max-w-3xl p-6 leading-7"
      style={{ maxHeight: "100dvh", overflowY: "auto" }}
    >
      <a href="/">Home</a>
      <h1 className="text-3xl font-bold my-6">Iron Trace terms of use</h1>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Using the service</h2>
        <p>
          This is an experimental analysis tool, not an official alert system.
          Do not use inferred trajectories for safety decisions. Follow official
          emergency instructions.
        </p>
      </section>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Responsible use</h2>
        <p>
          Do not harass others, publish unlawful material, infringe content
          rights, bypass access controls, or disrupt the service. You retain
          rights in content you submit; submit only material you have permission
          to share.
        </p>
      </section>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Availability and rights</h2>
        <p>
          Features and availability may change. Verify information before
          relying on it. Nothing in these terms limits rights that cannot be
          excluded under applicable law.
        </p>
      </section>
      <nav aria-label="Site information" className="flex flex-wrap gap-4">
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="/cookies">Cookies</a>
        <a href="/delete">Data deletion</a>
      </nav>
    </article>
  );
}
