import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

// Mode hors ligne : au build, on fabrique /sw.js à partir du modèle pwa/sw.js,
// avec la liste de tous les fichiers de l'app à garder sur le téléphone.
function serviceWorker(): Plugin {
  return {
    name: 'heat-service-worker',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      // Les fichiers fabriqués par Vite (JS, CSS, polices, images)…
      const built = Object.keys(bundle).filter((file) => !file.endsWith('.map'))
      // … et ceux copiés tels quels depuis public/ (icônes, manifeste)
      const copied = readdirSync('public', { recursive: true, withFileTypes: true })
        .filter((entry) => entry.isFile())
        .map((entry) => path.relative('public', path.join(entry.parentPath, entry.name)))
        .map((file) => file.replaceAll('\\', '/'))
      const files = [...new Set(['index.html', ...built, ...copied])].sort()

      // La version change dès qu'un fichier change : le téléphone télécharge alors la nouvelle
      const hash = createHash('sha256')
      hash.update(readFileSync('index.html'))
      for (const file of files) {
        const output = bundle[file]
        if (output?.type === 'chunk') hash.update(output.code)
        else if (output?.type === 'asset') hash.update(output.source)
        else hash.update(file)
      }
      for (const file of copied) hash.update(readFileSync(path.join('public', file)))

      const source = readFileSync('pwa/sw.js', 'utf8')
        .replace("'__VERSION__'", JSON.stringify(hash.digest('hex').slice(0, 12)))
        .replace("['__FILES__']", JSON.stringify(files.map((file) => `/${file}`)))
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
})
