import { mkdir, writeFile } from 'node:fs/promises';

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#0A1128" />
  <meta name="description" content="iBuddy is a privacy-first, AI-assisted browser being built for iPhone." />
  <title>iBuddy — Browse with a little more understanding</title>
  <style>
    *{box-sizing:border-box}html,body{margin:0;min-height:100%;background:#0A1128;color:#F5F7FF;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    body{min-height:100vh}.wrap{max-width:1040px;margin:auto;padding:0 28px}.nav{height:82px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #263657}.mark{width:38px;height:38px;border-radius:12px;background:#2D7BFF;display:grid;place-items:center;font-size:25px;font-weight:900}.brand{font-size:20px;font-weight:850;letter-spacing:-.4px}.pill{margin-left:auto;padding:8px 13px;border-radius:30px;background:#1B3159;color:#BBD0FF;font-size:10px;font-weight:800;letter-spacing:1.4px}
    .hero{padding:100px 0 76px}.eyebrow{color:#78A8FF;font-size:11px;font-weight:850;letter-spacing:2.3px}.hero h1{max-width:780px;margin:20px 0;font-size:clamp(42px,7vw,76px);line-height:1.04;letter-spacing:-3.5px}.lead{max-width:660px;color:#A8B4CC;font-size:18px;line-height:1.8}.notice{max-width:660px;margin-top:32px;padding:22px 24px;border:1px solid #2D7BFF;border-radius:17px;background:#142747}.notice strong{display:block;font-size:16px}.notice p{margin:9px 0 0;color:#C2D2EA;font-size:14px;line-height:1.7}
    .section{border-top:1px solid #263657;padding:32px 0}.section h2{font-size:24px;letter-spacing:-.6px}.features{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:24px}.feature{padding:22px;border:1px solid #263657;border-radius:16px;background:#111B36}.num{color:#78A8FF;font-size:12px;font-weight:900}.feature h3{margin:18px 0 8px;font-size:17px}.feature p{margin:0;color:#A8B4CC;font-size:14px;line-height:1.7}.footer{padding:38px 0 50px;color:#71809D;font-size:12px}
    @media(max-width:700px){.wrap{padding:0 20px}.hero{padding:72px 0 58px}.hero h1{letter-spacing:-2px}.features{grid-template-columns:1fr}.lead{font-size:16px}.nav{height:72px}}
  </style>
</head>
<body>
  <main class="wrap">
    <header class="nav"><div class="mark">i</div><div class="brand">iBuddy</div><div class="pill">IPHONE APP IN DEVELOPMENT</div></header>
    <section class="hero">
      <div class="eyebrow">YOUR BROWSER. WITH A BUDDY.</div>
      <h1>Browse with a little more understanding.</h1>
      <p class="lead">iBuddy is a privacy-first, AI-assisted browser being built for iPhone. Read and understand webpages when you choose, with safeguards that keep protected assessments off limits.</p>
      <div class="notice"><strong>The iPhone app is in development</strong><p>This website is the iBuddy product preview. The full browsing experience uses native iOS capabilities and will be delivered as an iPhone app.</p></div>
    </section>
    <section class="section">
      <h2>Built around your control</h2>
      <div class="features">
        <article class="feature"><div class="num">01</div><h3>Private browsing</h3><p>A focused browser experience designed around privacy and user control.</p></article>
        <article class="feature"><div class="num">02</div><h3>Read pages on demand</h3><p>Choose when iBuddy reads visible webpage content and helps explain it.</p></article>
        <article class="feature"><div class="num">03</div><h3>Assessment Lock</h3><p>Protected assessment pages stay excluded from page reading and AI analysis.</p></article>
      </div>
    </section>
    <footer class="footer">iBuddy · Privacy-first by design · iTec &amp; Company</footer>
  </main>
</body>
</html>`;

await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', html, 'utf8');
console.log('Wrote standalone iBuddy web preview to dist/index.html');
