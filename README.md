# Elma Burruel Salon & Spa

Sitio web de una página para Elma Burruel Salon & Spa. Muestra los servicios,
una galería de trabajos y permite agendar cita directamente por WhatsApp.

Hecho con HTML, CSS y un poco de JavaScript, sin frameworks.

## Estructura

```
index.html              Página completa (una sola)
css/style.css           Estilos, celular primero
js/main.js              Preloader, menú móvil, sombra del header y aparición suave
assets/images-src/      Fotos ORIGINALES en alta resolución (no se usan en el sitio)
assets/images/          Fotos optimizadas que sí carga el sitio (WebP + JPG)
assets/icons/           Favicon e íconos para móvil
scripts/optimize-images.js   Genera assets/images/ a partir de images-src/
```

## Imágenes

Las fotos originales pesaban 22 MB en total. El sitio carga versiones
redimensionadas y comprimidas que en conjunto pesan menos de 1 MB por visita.

Para agregar o cambiar una foto:

1. Pon el archivo original en `assets/images-src/`.
2. Agrégalo al grupo que le toque en `scripts/optimize-images.js`
   (hero, servicios o galería; cada grupo define anchos y proporción).
3. Corre:

   ```bash
   npm install
   npm run images
   ```

4. Úsala en `index.html` con `<picture>`, igual que las demás:
   `<source type="image/webp">` con las versiones WebP y `<img>` con las JPG
   como respaldo. Pon siempre `width` y `height` para evitar saltos al cargar.

## Correr en local

```bash
npm start
```

Abre `http://localhost:5173`. También puedes abrir `index.html` directo en el
navegador, pero algunas funciones (como el preload) se comportan mejor con
servidor.

## Decisiones

- **JavaScript solo como mejora.** Sin JS el sitio se ve completo: el menú se
  muestra expandido, no hay preloader y nada queda oculto. Con JS se agrega el
  comportamiento (clase `js` en `<html>`).
- **Menú móvil con `<button>` y `aria-expanded`**, no con checkbox. Se cierra
  al elegir una sección, con Escape o al tocar fuera.
- **Preloader** ligado a la foto principal: se oculta en cuanto carga, con un
  mínimo de 0.6 s para que no parpadee y un máximo de 4 s por si algo falla.
- **`prefers-reduced-motion`** respetado: sin animaciones para quien lo pida.
- **Un solo ícono de WhatsApp** definido como `<symbol>` y reutilizado con
  `<use>` en cada botón.

## Pendientes

- Precios de cada servicio (hoy dicen `[PRECIO]`).
- `og:image` y los campos `url` e `image` del bloque JSON-LD necesitan la URL
  absoluta del sitio publicado (dominio propio) para que WhatsApp muestre la
  vista previa y Google tome la foto del negocio.
