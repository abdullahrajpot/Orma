export default function InstallPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-20">
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-accent">Install Orma</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Add Orma to Chrome in one click</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">
          Once the extension is published to the Chrome Web Store, users can click the install button below.
          Until then, developers can load the unpacked extension from the extension folder in Developer mode.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <a
            href="https://chrome.google.com/webstore/detail/orma-automatic-screen-memory/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-accent px-6 py-3 text-center font-semibold text-white"
          >
            Install from Chrome Web Store
          </a>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-ink"
          >
            Download unpacked ZIP
          </a>
          <a
            href="chrome://extensions"
            className="rounded-lg border border-border px-6 py-3 text-center font-semibold text-ink"
          >
            Open Chrome Extensions
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-8">
        <h2 className="font-display text-xl font-semibold text-ink">For developers</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-[14px] leading-relaxed text-ink-soft">
          <li>Open Chrome Extensions.</li>
          <li>Turn on Developer mode.</li>
          <li>Click Load unpacked and choose the Orma extension folder.</li>
          <li>Pin the extension to the toolbar and sign in.</li>
        </ol>
      </div>
    </div>
  );
}
