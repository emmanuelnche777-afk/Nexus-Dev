export default function GlobalNotFound() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 | Page not found</title>
        <style>{`
          html, body { min-height: 100%; margin: 0; background: #fff; color: #111; }
          body { display: grid; place-items: center; font-family: Arial, Helvetica, sans-serif; }
          main { padding: 2rem; text-align: center; }
          h1 { margin: 0 0 .75rem; font-size: 3rem; font-weight: 600; }
          p { margin: 0; color: #555; font-size: 1rem; }
        `}</style>
      </head>
      <body>
        <main>
          <h1>404</h1>
          <p>Page not found</p>
        </main>
      </body>
    </html>
  );
}
