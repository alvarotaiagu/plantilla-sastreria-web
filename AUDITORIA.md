# Auditoría de accesibilidad — Sastrería Arume

Hecha con **axe-core 4.x** inyectado en la página y ejecutado con
`axe.run(document, { runOnly: wcag2a, wcag2aa, wcag21a, wcag21aa, best-practice })`
desde Playwright (Chromium).

## Cómo se pasó

Cada pasada: carga la página, espera a la cortina de entrada, **cierra el aviso
de cookies**, **recorre la página entera con la rueda** (26 × 900 px) para que
todo lo que aparece con `IntersectionObserver` —los sesenta cuadrados de las
horas, las fotos— esté ya revelado, vuelve arriba e inyecta axe.

Pasadas: **portada en escritorio (1440×900) y en móvil (390×844)**, la chaqueta
**por el revés** y **por el derecho** (son dos caras distintas del mismo
elemento, y una de las dos siempre está oculta), **una pieza señalada**, el
**menú móvil abierto**, el **aviso legal** y el **404** (escritorio y móvil).

## Resultado

| Pasada | Violaciones |
|---|---|
| Portada · escritorio | **0** |
| Portada · móvil | **0** |
| Portada · chaqueta por el revés | **0** |
| Portada · chaqueta por el derecho | **0** |
| Portada · una pieza señalada | **0** |
| Portada · menú móvil abierto | **0** |
| Aviso legal | **0** |
| 404 · escritorio y móvil | **0** |

Cero a la primera pasada. La paleta se calculó con el script de razón WCAG
**antes de escribir el CSS**, midiendo cada token contra el peor de los fondos en
los que iba a aparecer.

## Los tokens, con su medida

| Token | Valor | Dónde | Razón |
|---|---|---|---|
| `--tinta` | `#2b2622` | texto principal, pie y cortina | 10,70 sobre `--panel` · 12,41 sobre el fondo |
| `--tinta-media` | `#5d554c` | párrafos secundarios | 5,23 sobre `--panel` |
| `--tinta-suave` | `#645d51` | antetítulos, `dt`, pies de foto, notas | **4,65** sobre `--panel` (el peor), 5,40 y 6,15 en el resto |
| `--burdeos` | `#7d2b32` | marca, cifras, precios, botones | 6,63 panel · 7,69 fondo · 8,76 crema; con `--crema` encima, 8,76 |
| `--burdeos-claro` | `#d4838a` | títulos y enlaces del pie oscuro y de la cortina | 5,28 sobre `--tinta` |
| `--crema-suave` | `#b9a88f` | texto apagado del pie y la palabra de la cortina | 6,46 sobre `--tinta` |
| `--forro` | `#6b4f3a` | **solo relleno** del forro dibujado | nunca es color de texto |

**Un apunte honesto sobre el color de marca.** En las dos plantillas anteriores
el color de marca no llegaba a AA como texto y hubo que derivarle una variante
(el celadón de la cerámica daba 2,56; el ámbar de la apicultura, 2,80). Aquí
**el burdeos pasa de largo**: 6,63 sobre el fondo más oscuro donde aparece. Así
que se usa como texto sin más, y la variante clara existe solo para el fondo
oscuro del pie, donde el burdeos original daría muy poco. No todo color de marca
hay que corregirlo: hay que **medirlo**, y a veces la medida sale bien.

## Lo que axe no mira, y aquí se ha mirado a mano

- **Texto dentro de un SVG.** El único de esta plantilla son los **seis números**
  del revés de la chaqueta: van sobre un círculo de `--crema` con el número en
  `--tinta` (14,14), y cuando la pieza está señalada, sobre `--burdeos` con el
  número en `--crema` (8,76). Los dos casos medidos con el script.
- **Opacidad sobre texto:** los números que *no* están señalados bajan al 35 % de
  opacidad. Eso es una atenuación sobre texto, que es justo lo que el pliego
  prohíbe **para contenido**. Aquí se acepta porque **ese número no es
  contenido**: es un puntero al elemento de la lista, y el mismo número está
  escrito en la lista de al lado, en texto normal y a contraste completo. Nada
  de lo que dice el dibujo deja de estar escrito.
- **La cara oculta de la chaqueta.** Al girarla, la cara que queda de espaldas
  lleva `aria-hidden="true"` y la que se ve, `aria-hidden="false"`, para que un
  lector de pantalla no anuncie las dos descripciones a la vez. Verificado en la
  pasada del §7: `derecho aria-hidden:false · revés aria-hidden:true` al empezar,
  y al revés después de girar.
- **La etiqueta del cursor** va sobre su propia mancha: `rgba(43,38,34,.82)`, con
  el texto crema muy por encima de AA.
- **Los sesenta cuadrados** son `aria-hidden`: el número de horas de cada tarea
  está escrito al lado («9 h»), así que no se pierde ningún dato si no se pintan.

## Lo que la plantilla hace bien de serie

- `main`, `header`, `nav`, `footer`, saltar al contenido y foco visible.
- Los dos botones de girar la chaqueta son un par con `aria-pressed`, no un
  toggle mudo, y el texto de estado («Estás viendo el revés») lo dice en palabras.
- Cada una de las seis piezas es una parada de tabulador, y al recibir el foco
  **gira la chaqueta al revés sola**: de nada sirve señalar una pieza de la cara
  que no se está viendo.
- El botón del menú móvil tiene `aria-label` (por debajo de 620 px la palabra
  «Menú» se oculta) y `aria-expanded`, que cambia también el `aria-label`.
- Tablas con `<th scope>` y `<caption>`; titulares partidos en letras con su
  `aria-label` completo.
- **Con movimiento reducido el contenido sigue ahí**: la cortina se retira al
  instante, la chaqueta gira igual con los botones (sin transición) y los sesenta
  cuadrados están pintados. Medido con `reducedMotion: 'reduce'`.
