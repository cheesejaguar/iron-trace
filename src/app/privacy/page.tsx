export const metadata = { title: "Iron Trace privacy notice" };
export default function Page() {
  return (
    <article
      className="mx-auto max-w-3xl p-6 leading-7"
      style={{ maxHeight: "100dvh", overflowY: "auto" }}
    >
      <a href="/">Home</a>
      <h1 className="text-3xl font-bold my-6">Iron Trace privacy notice</h1>
      <section className="my-6">
        <h2 className="text-xl font-semibold">
          Requests and external resources
        </h2>
        <p>
          The site processes requests to deliver public alert data and analysis.
          Hosting and external map-resource providers receive the network
          information needed to respond, such as an IP address, requested
          resource, and browser details.
        </p>
      </section>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Local settings</h2>
        <p>
          Browser storage may retain display preferences. Use browser settings
          to inspect and clear it. The public analysis interface does not
          require a visitor account.
        </p>
      </section>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Limits</h2>
        <p>
          This notice covers the website, not the public alert providers or
          external links. Do not submit personal information through public
          project issues.
        </p>
      </section>
      <section className="my-6">
        <h2 className="text-xl font-semibold">Questions and retention</h2>
        <p>
          A dedicated private privacy-request contact and service-specific
          retention schedule remain to be designated. Do not publish personal
          information in project issues. This draft notice must be completed
          with operator details before release.
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
