# Plantilla · Sastrería a medida — «El revés»

> **Sitio de demostración.** *Sastrería Arume* es un taller **ficticio**. El
> nombre, la dirección, los teléfonos, el correo, las personas, los precios, los
> plazos y las notas del libro de encargos están inventados. **No se publica
> ninguna titulación, ninguna escuela, ningún premio ni ningún taller famoso por
> el que se haya pasado**, y tampoco un número de registro de artesanía: el aviso
> legal explica cuál es el dato que iría en cada hueco y por qué en este oficio
> importa tanto.

**Demo:** https://alvarotaiagu.github.io/plantilla-sastreria-web/

---

## El concepto

Las dos imágenes evidentes del sector estaban descartadas de antemano: **la
balda de lomos** (la librería con prendas colgadas como libros) y **el
escaparate con percha**. La entrada es otra:

> **Lo que se ve de una chaqueta es la mitad. La otra mitad está por dentro.**

La entretela cosida al pecho, la hombrera que no se nota, la sisa alta, el forro
cosido a mano en el bajo: eso es lo único que separa una prenda a medida de una
comprada, y es exactamente lo que no se ve al probártela. Por eso la sección
protagonista **gira la chaqueta**: la misma prenda del hero, dada la vuelta, con
seis piezas numeradas y una lista al lado que se señalan entre sí.

No es una galería ni un carrusel: es **un objeto con dos caras**, y la web te
deja ver la que nadie enseña.

## Recursos de movimiento (todos salen del concepto)

1. **La chaqueta se gira** de verdad (`rotateY` sobre un contenedor en 3D, con
   `backface-visibility` en las dos caras). Se gira sola la primera vez que entra
   en pantalla y, a partir de ahí, mandan los dos botones.
2. **Resaltado cruzado**: al pasar por encima —o al llegar con el tabulador— a
   una de las seis piezas de la lista, el dibujo apaga las otras cinco y enciende
   la señalada, con su número en burdeos. Y si estabas viendo el derecho, **se
   gira sola**, porque señalar una pieza de la cara que no se ve no sirve de nada.
3. **Los sesenta cuadrados**: un cuadrado por hora de trabajo, repartidos en
   nueve tareas, que aparecen escalonados al llegar a ellos. Es un recuento, no
   un gráfico: se cuentan con el dedo.
4. **La cortina de entrada** cose una puntada, la aguja la remata, una costura de
   hilván recorre el borde de abajo y **la cortina se levanta por esa costura**,
   con el borde curvado. `expo.inOut`, entrega al hero y retirada garantizada.
5. Titulares partidos en letras, cinta, cursor con etiqueta, botones magnéticos,
   máscaras de foto y contadores.

Y un dato vivo: **si el taller está abierto ahora mismo**, calculado con la fecha
del navegador, con el día de hoy marcado en la tabla de horarios.

## Lo que se ha verificado (§7)

`node verificar-generico.js <repo> <salida> <puerto> conf-sastreria.json`

| Prueba | Resultado |
|---|---|
| Recorrido completo, escritorio 1440×900 | 21 capturas, sin errores de consola |
| Recorrido completo, móvil 390×844 | 25 capturas + menú |
| Girar al revés | `volteada:true`, `matrix3d(-1, 0, 0, …)`, botón con `aria-pressed="true"` y el estado en palabras |
| Volver al derecho | `volteada:false`, y el `aria-hidden` de las dos caras intercambiado |
| Señalar una pieza | `activa dibujo:4 · fila activa:4` |
| Cuadrados de las horas | **60 cuadrados en 9 tareas**, que es la suma que dice el texto |
| Piezas | 6 en la lista · 6 grupos dibujados · 6 números |
| Aviso de cookies | aparece, se cierra y no vuelve |
| Mapa de Google | 0 iframes hasta pulsar, 1 después |
| **Sin GSAP** (CDN cortado) | `has-motion:false`, **cortina retirada** (`display:none`), titular legible, los 60 cuadrados pintados, foto sin recortar, contador con su cifra **y la chaqueta sigue girando al pulsar el botón** |
| **Movimiento reducido** | cortina retirada, `volteada:true` al pulsar, cuadrados a escala 1: el contenido está, lo que falta es la transición |
| **Tareas largas** (`PerformanceObserver`, 10 s) | **ninguna** en tres cargas en frío con la caché deshabilitada (`Network.setCacheDisabled`); en una carga con caché templada se registró una de 51 ms |

Las capturas están en `screenshots/`, en JPEG de calidad 72.

## Accesibilidad

**axe-core: 0 violaciones** en las nueve pasadas. Detalle en
[`AUDITORIA.md`](AUDITORIA.md), incluido el único sitio donde esta plantilla
**sí** atenúa con `opacity` (los números del dibujo que no están señalados) y por
qué ahí está justificado: ese número no es contenido, es un puntero, y el mismo
número está escrito en la lista a contraste completo.

Apunte que merece la pena: **el burdeos de marca pasa AA como texto** (6,63), al
contrario que el celadón de la cerámica (2,56) y el ámbar de la apicultura
(2,80), que hubo que derivar. No todo color de marca hay que corregirlo; hay que
medirlo.

## La línea roja del sector

En sastrería la trampa no es sanitaria, es **de credenciales y de vocabulario**:

- **Credenciales.** Aquí no se cuelga ningún título, escuela, premio ni taller de
  paso. En una web real irían, con centro y año, y comprobables.
- **Vocabulario.** «A medida», «semi-medida» y «confección» no son sinónimos y la
  diferencia son miles de euros. La sección **«Qué se hace aquí y qué no»** dice
  cuál de las tres se hace, admite que también se hace semi-medida y que se vende
  como tal, y niega por escrito los trajes en cuarenta y ocho horas.
- **Fotos.** Las tres son de archivo y **lo dicen en su pie**, en la página, no
  solo en los créditos: enseñar como propio el trabajo de otro es el clásico de
  este oficio.

Al reskinear, esa sección debería mantenerse.

## Cómo está hecho

HTML + CSS + un `main.js`. Sin framework, sin compilación, sin npm y sin
servidor. GSAP + ScrollTrigger + Lenis por CDN, y si no llegan, la página sigue
entera.

```
index.html · aviso-legal.html · privacidad.html · 404.html
css/estilo.css · js/main.js
assets/fotos/ (3 fotos de archivo) · assets/og.png · favicon.svg
screenshots/ · CREDITOS.md · AUDITORIA.md
```

- **Tipografía:** EB Garamond (titulares) + Inter Tight (texto).
- **Paleta:** hueso `#efe9e1`, topo `#e1d9cd`, crema `#fbf8f4`, tinta `#2b2622`,
  burdeos `#7d2b32`, forro `#6b4f3a`.
- **Imágenes:** tres fotografías de archivo de Pexels, guardadas en el repo y
  acreditadas en `CREDITOS.md`. Todo lo demás —las dos caras de la chaqueta, la
  aguja del logotipo, la cortina, los cuadrados de las horas y la chaqueta
  hilvanada del 404— está dibujado aquí.

## Para reskinear a una sastrería real

1. Sustituir nombre, dirección, teléfonos y correo (el dominio `.example` está
   puesto a propósito).
2. Rellenar las credenciales del aviso legal, o dejar el hueco si no las hay.
3. Ajustar las seis piezas del revés: cada una es un `<li data-pieza="N">` en la
   lista y un `<g class="pieza pieza--N">` en el dibujo, más su número. Si se
   añade una séptima, hay que tocar los tres sitios.
4. Ajustar las horas: el número va en `--horas` de cada `<li>` **y** escrito en
   el `<em>` de al lado; los cuadrados los genera `js/main.js` leyendo `--horas`.
   Si se cambian, hay que rehacer también el total.
5. **No tocar la sección «Qué se hace aquí y qué no»** ni los pies de foto que
   dicen «foto de archivo» mientras las fotos sigan siendo de archivo.
6. Quitar el sello de demostración del pie, del `<head>` (`robots: noindex`) y de
   los comentarios de cada HTML.
