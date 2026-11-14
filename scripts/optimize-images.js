/**
 * Optimización de imágenes
 * ------------------------
 * Lee las fotos originales de `assets/images-src/` y genera en `assets/images/`
 * versiones redimensionadas en WebP (moderno, pesa menos) y JPG (respaldo).
 *
 * Uso:  npm run images
 *
 * Reglas:
 *  - Las originales NUNCA se tocan. Si cambias una foto, reemplázala en
 *    `images-src/` y vuelve a correr el script.
 *  - Cada grupo define los anchos que el sitio realmente necesita. Un ancho
 *    "1x" para pantallas normales y "2x" para pantallas retina.
 */

const path = require("node:path");
const fs = require("node:fs/promises");
const sharp = require("sharp");

const SRC_DIR = path.join(__dirname, "..", "assets", "images-src");
const OUT_DIR = path.join(__dirname, "..", "assets", "images");

/**
 * Cada grupo: qué archivos incluye, a qué anchos exportarlos y si se recorta
 * a una proporción fija (`aspect`) o se conserva la proporción original.
 */
const GROUPS = [
  {
    name: "hero",
    files: ["elma.jpeg"],
    widths: [480, 960],
    aspect: 4 / 5, // misma proporción que .hero-photo en el CSS
    // Recorte previo (fracciones del ancho/alto original) para centrar a Elma.
    crop: { left: 0.125, top: 0.27, width: 0.72, height: 0.72 },
  },
  {
    name: "servicios",
    files: [
      "tratamiento-facial-dermapen.jpg",
      "reduccion-corporal.jpg",
      "planchado-cabello.jpg",
      "corte-cabello.jpg",
      "maquillaje.jpg",
    ],
    widths: [480, 800],
    aspect: 4 / 3, // misma proporción que .card img en el CSS
  },
  {
    name: "galeria",
    files: [
      "galeria-corte.jpg",
      "galeria-facial.jpg",
      "galeria-planchado.jpg",
      "galeria-reduccion-corporal.jpg",
      "galeria-peinado.jpg",
      "galeria-facial2.jpg",
      "galeria-planchado2.jpg",
      "galeria-peinado2.jpg",
      "galeria-facial3.jpg",
    ],
    widths: [400, 800],
    aspect: null, // la galería es tipo mosaico, conserva la proporción original
  },
];

async function exportImage(file, width, aspect, crop) {
  const base = path.parse(file).name;
  let input = sharp(path.join(SRC_DIR, file)).rotate(); // respeta la orientación EXIF

  if (crop) {
    const meta = await input.metadata();
    const w = meta.width;
    const h = meta.height;
    input = input.extract({
      left: Math.round(w * crop.left),
      top: Math.round(h * crop.top),
      width: Math.round(w * crop.width),
      height: Math.round(h * crop.height),
    });
  }

  const resizeOptions = aspect
    ? { width, height: Math.round(width / aspect), fit: "cover" }
    : { width, withoutEnlargement: true };

  const pipeline = input.resize(resizeOptions);

  await Promise.all([
    pipeline
      .clone()
      .webp({ quality: 78 })
      .toFile(path.join(OUT_DIR, `${base}-${width}.webp`)),
    pipeline
      .clone()
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${base}-${width}.jpg`)),
  ]);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  for (const group of GROUPS) {
    for (const file of group.files) {
      for (const width of group.widths) {
        await exportImage(file, width, group.aspect, group.crop);
      }
      console.log(`✓ ${group.name.padEnd(10)} ${file}`);
    }
  }

  // Peso total resultante, para comparar con los originales.
  const files = await fs.readdir(OUT_DIR);
  let total = 0;
  for (const f of files) {
    total += (await fs.stat(path.join(OUT_DIR, f))).size;
  }
  console.log(`\n${files.length} archivos, ${(total / 1024).toFixed(0)} KB en total`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
