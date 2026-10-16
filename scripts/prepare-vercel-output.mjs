import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(root, 'dist/vercel');
const apps = [
  ['fastorder-client', 'cliente'],
  ['fastorder-kitchen', 'cocina'],
  ['fastorder-admin', 'administracion'],
];

await rm(output, { recursive: true, force: true });

for (const [project, route] of apps) {
  const source = resolve(root, 'dist', project, 'browser');
  const destination = resolve(output, route);
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true });
}

await writeFile(
  resolve(output, 'index.html'),
  `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="refresh" content="0; url=/cliente/">
    <title>FastOrder</title>
  </head>
  <body>
    <p>Abriendo FastOrder. <a href="/cliente/">Continuar al menú</a></p>
  </body>
</html>
`,
);
