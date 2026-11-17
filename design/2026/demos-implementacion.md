# Ola 7b · «Cómo se implementa de verdad»: borrador para aprobar

Borrador de Opus (17/11/2026). **Nada de esto se publica hasta que Ignacio lo apruebe.** Es el texto del paso `real`
de la plantilla de casos (`design/2026/casos.md`). Ese paso explica qué backend, qué base de datos y qué seguridad
tendría cada demo que hoy es solo frontend.

## Fuentes y reglas

- Todo sale de los repos de cada demo, leídos el 17/11/2026 (clones de solo lectura; no se corrió nada). Cada
  afirmación cita su archivo. Las fichas de Notion que los repos mencionan no se leyeron, y lo que solo está en Notion
  no se usa.
- Cuando el repo no planifica un backend, el texto lo dice. Si se propone algo igual, va marcado como **propuesta mía,
  a aprobar**.
- No aparecen marcas ni datos de clientes:
  - de Velmar, ni su Instagram (`src/config/brand.ts`) ni la investigación de competidores;
  - de Supernova, ni el cliente final ni la empresa que nombra `docs/backend-prompt.md`;
  - en Lucero, no aparece el negocio real que sirvió de referencia.
- No se muestran pantallas de dinero.
- El paso lleva la **nota de MVP** donde corresponde (ver la pregunta 1).

## Lo que necesito que decidas

1. **La nota de MVP.** Propongo el mismo texto en Volta, Velmar, DentalOS, games-market y Lucero:
   > «Es solo frontend a propósito: primero se valida con quien lo va a usar y recién después se construye el
   > servidor (la idea de The Lean Startup).»

   Ojo con Volta y Velmar: sus repos dicen que la demo es «para mostrar antes de la seña», y el backend es «el corte
   después de cobrar la seña». La nota es fiel a eso, pero si preferís decirlo así de directo, la cambio por:
   > «Es una demo para mostrar antes de la seña; el servidor se construye después.»
2. **DentalOS no tiene backend previsto.** Su spec dice lo contrario: «solo frontend local y datos ficticios; los
   roles son vistas, no seguridad». ¿Querés:
   - (a) decir solo eso, sin inventar un backend, o
   - (b) que agregue una propuesta mía, rotulada como tal (abajo)?

   Recomiendo (a).
3. **Lucero se contradice en la retención de datos del comensal.** El SDD dice «anonimizar a los 90 días» y el
   ROADMAP, «12 meses». ¿Cuál vale? Hasta que lo decidas, el texto no da ningún plazo.
4. **Supernova Eventos: sin paso `real`.** Su repo trae una propuesta de backend que nombra al cliente y a otra
   empresa. Propongo:
   - una sola línea en el paso `status`: «Prototipo sin backend ni SSO: la autorización, los cupos y los correos van
     en el servidor, que no existe»;
   - ningún paso `real`.

   ¿Ok?
5. **HandyX no es «solo frontend».** Hay un backend en curso (repos privados) y un diseño de autenticación ya
   decidido. Su estado es **MVP**, y la plantilla limita `real` a Demo, Prototipo y Banco de pruebas. Tengo dos
   opciones:
   - (a) usar el paso `security` («Seguridad») con lo decidido, más una línea en `status` («el backend está en
     construcción, todavía no conectado»), o
   - (b) habilitar `real` también para MVP.

   Recomiendo (a), porque `real` está pensado para lo que todavía no existe.
6. **¿Se puede nombrar `Foody-be` en Render como «backend existente»?** Es un relay de salas y sincronización de
   pedidos. Su código no se leyó (está en otro repo), así que solo describiría lo que se ve desde el frontend.

---

## Volta · Demo

**Hoy.** Es una tienda de suplementos con panel, clickeable de punta a punta. Todo vive en el navegador
(`localStorage`) y se reinicia con «Reiniciar demo». No procesa pagos, no crea pedidos reales y no llama a servicios
externos. El panel no tiene login a propósito y los datos son ficticios.

**Texto propuesto para el paso:**

> **Backend.** Una sola app Next.js (tienda, panel y API) en Node. Las reglas que hoy corren en el navegador
> (precios, cupones, lotes por vencimiento, recompra) pasan a servicios del servidor, que recalcula todo: el cliente
> nunca decide un precio. Las mutaciones van por Server Actions y Route Handlers, validadas con Zod.
>
> **Base de datos.** PostgreSQL con Prisma. Productos, variantes, lotes, cupones, pedidos y comprobantes; cada cambio
> de estado de un pedido pasa por una transición dentro de una transacción, que deja su registro en un historial y en
> una auditoría. El stock se reserva dentro de la misma transacción.
>
> **Seguridad.**
> - **Panel:** usuario y contraseña con Better Auth, rol de administrador verificado en el servidor en cada ruta y
>   cada acción, sesión más corta para el panel y límite de intentos.
> - **Pagos:** un pedido queda pagado solo por un webhook firmado y verificado (monto, moneda y referencia) o por la
>   aprobación de un administrador.
> - **Comprobantes:** en almacenamiento privado, servidos con autorización.
>
> **Lo que la demo simula.** Los datos son compartidos entre equipos. El pago se confirma solo, los correos llegan y
> las gift cards y la ruleta («uno por cuenta») las emite y controla el servidor.

**Fuentes:**
- `README.md`.
- `docs/demo-pages.md` («Corte demo → producción»).
- `docs/referencia-velmar/panel-demo.md` («Diferencias obligatorias»). Es una referencia heredada de Velmar, aclarada
  en `docs/README.md`.
- `docs/manual-del-dueno.md` §1 y §17.
- `src/demo/types.ts`, `src/demo/admin/types.ts`.

**No está en el repo, y el texto no lo afirma:** el esquema Prisma, los endpoints, el hosting elegido y los rate
limits concretos.

## Velmar · Demo

**Hoy.** Es la tienda de Velmar (Mar del Plata), clickeable de punta a punta. No procesa pagos, no crea pedidos reales
y no llama a servicios externos. En la demo no hay ningún login, rol, sesión, cookie, API, webhook, base de datos,
archivo privado ni correo.

**Texto propuesto para el paso:**

> **Backend.** Una sola app Next.js (tienda, panel y API) en Node. Las reglas de negocio viven en servicios del
> servidor, que recalcula precios, stock, cupones, vigencias, límites de la ruleta y transiciones. La configuración
> pasa a una tabla de ajustes.
>
> **Base de datos.** PostgreSQL multiusuario: en el navegador solo queda el carrito. Los cambios de estado de un pedido
> van en una transacción con su historial y su auditoría. El stock se reserva dentro de la transacción y un proceso
> programado vence las reservas viejas. La búsqueda también es en Postgres.
>
> **Seguridad.**
> - **Panel y pagos:** rol de administrador verificado en el servidor, sesión corta y límite de intentos. Un pedido
>   queda pagado solo por un webhook firmado.
> - **Tarjetas:** se cobran con el formulario seguro de Mercado Pago (tokenización); la tienda nunca recibe ni guarda
>   el número ni el código.
> - **Ingreso con Google:** OAuth en el servidor.
> - **Archivos:** los de los compradores son privados.
> - **Correos:** se escriben con React Email y salen por Nodemailer.

**Fuentes:**
- `README.md`.
- `AGENTS.md` («Capas»).
- `docs/panel-demo.md` («Simulado» y «Diferencias obligatorias»).
- `docs/fuera-de-especificacion.md`.
- `docs/demo-pages.md`.
- `src/stores/checkout.ts`.

**Nota:** la tarjeta guardada en la demo solo muestra la marca, los últimos 4 números y el vencimiento. No se nombra
nada de la marca del cliente fuera de «Velmar».

## DentalOS · Demo

**Hoy.** Es el circuito administrativo de un consultorio odontológico, solo frontend y local, con datos sintéticos e
identificadores `P-001…` en lugar de documentos.
- **Lo que no tiene:** backend, base de datos, IA, autenticación, mensajes, llamadas, cobros, analítica ni
  integraciones.
- **Red:** la CSP del build tiene `connect-src 'none'`, así que la app no puede llamar a la red.
- **Comandos:** son atómicos e idempotentes, con outbox y auditoría, pero locales. «Es una transacción local, no una
  garantía distribuida.»

**Texto propuesto (opción a, la recomendada):**

> **No tiene backend, y está decidido así.** Su especificación fija como límite que no cambia: solo frontend local y
> datos ficticios; los roles son vistas, no seguridad; ninguna comunicación, cobro ni sincronización real. Por eso la
> app no puede llamar a la red (su CSP tiene `connect-src 'none'`) y no es una historia clínica productiva.
>
> **Lo que ya está pensado para el día que lo tenga.**
> - Cada acción es un comando con un identificador, que no se aplica dos veces y deja un evento de auditoría.
> - Los recordatorios salen de una cola (outbox) que respeta la baja de cada persona.
> - El QR del turno no lleva datos personales ni secretos.

**Opción b (propuesta mía, a aprobar; no está en el repo):** el mismo texto, más un párrafo que diga que llevarlo a
producción exige:
- un servidor con autenticación y roles reales;
- datos de salud cifrados y con acceso auditado;
- cumplimiento de la ley de datos personales.

No daría tecnologías concretas, porque el repo no las elige.

**Fuentes:**
- `README.md` («Arquitectura»).
- `vite.config.ts` (línea 6).
- `docs/spec/README.md`.
- `docs/spec/requisitos.md` (R-QR-01, R-KID-03).
- `src/domain/commands.ts`, `src/domain/types.ts`.

## games-market · Banco de pruebas

**Hoy.** Es un banco de pruebas de 24 juegos para jugar en un proyector con los celulares como control. La red es un
transporte simulado (bots y latencia) o WebRTC con PeerJS, cuya señalización la pone el broker público. Jugar en la
batería nunca escribe una sesión, un participante ni un resultado.

**Texto propuesto para el paso:**

> **Sin servidor de juego, a propósito.** La autoridad de la partida es el proyector: los celulares le mandan sus
> entradas por WebRTC y él calcula el estado. Solo hace falta señalización para conectarlos, y un servidor TURN si los
> aparatos están en redes distintas.
>
> **Cuándo haría falta un backend.**
> - **Para que la partida sobreviva a que se cierre el proyector:** ahí entra un servidor de salas como Colyseus.
> - **Para un ranking:** el día que el puntaje valga algo, se valida en el servidor, nunca en el cliente.
>
> **Lo que ya cuida.** En las preguntas, la respuesta correcta no llega a la pantalla hasta que se contestó, y el
> texto libre se filtra antes de proyectarse.

**Fuentes:**
- `package.json`.
- `ROADMAP.md` (tanda 5, «Pendientes transversales», «Ranking y persistencia»).
- `games-guide/README.md` («Netcode»).
- `games-guide/02-BASES-NETCODE.md`.
- `games-guide/03-BASES-CORPORATIVAS.md` («Reglas»).
- `src/core/net/*`.

**Nota:** los juegos del paquete llevan «Supernova» en el nombre. En el sitio el proyecto se llama games-market y no
se muestra la marca del cliente, como ya hace el tráiler.

## Lucero · Demo

**Hoy.** Lucero es un restó-bar ficticio, con su etiqueta «Demo». Tiene la carta con Gus, la comanda, el ciclo pedido →
cocina → plato y un CRM. Funciona solo en el navegador: los pedidos se sincronizan entre pestañas y las salas de juego
van por WebRTC.

**Texto propuesto para el paso** (sujeto a las preguntas 3 y 6):

> **Lo que ya existe.** Un relay en Render (`Foody-be`) que sincroniza los pedidos entre aparatos y conecta las salas
> de juego por WebSocket, con una clave aleatoria por asiento.
>
> **El producto.**
> - **Stack:** Next.js para el front y el back, con Postgres (Neon) como base.
> - **Mesa:** una sesión de mesa firmada por el QR.
> - **Modelo de datos:** locales, usuarios y roles (comensal, mozo, encargado, cocina, dueño), mesas con QR, carta con
>   variantes y agregados, stock con límite y reservas como solicitud.
>
> **Seguridad.**
> - El QR abre un contexto, pero no autoriza cobros ni datos de otras mesas.
> - Un comensal nunca ve los datos de otra mesa, ni un local los de otro.
> - La app no cobra: se paga en la caja o con el postnet del local.
> - Del comensal se guardan solo el nombre y la mesa.
> - El medio de pago del local lo tokeniza el proveedor.

**Fuentes:**
- `docs/PLAN-EJECUCION.md` (fases 3–4 y 12).
- `docs/DEPLOY.md`.
- `CLAUDE.md`.
- `components/lucero/sync.ts`, `games/mesa/transport.ts`.
- `docs/SDD-0.1-DESCUBRIMIENTO.md` §4–§6, §11–§13 y D13.
- `docs/ROADMAP.md`.

**Pendiente:** el plazo de retención (pregunta 3) y la arquitectura de tiempo real, que el repo deja «a decidir en el
ADR de la fase 0.5». El texto no elige ninguna de las dos cosas. Tampoco aparecen los precios de los planes ni el
negocio que sirvió de referencia.

## Supernova Eventos · Prototipo (propuesta: sin paso `real`)

Una línea en `status`, según la pregunta 4:
> «Prototipo sin backend ni SSO: las inscripciones y los borradores son locales y los correos no se envían. La
> autorización, los cupos y los correos van en el servidor, que no existe.»

**Fuentes:** `README.md` (líneas 5 y 73) y `AGENTS.md` (líneas 3 y 20). No se usa `docs/backend-prompt.md`.

## HandyX · MVP · proyecto propio (propuesta: paso `security`, no `real`)

**Hoy.** Son dos PWA (la de usuario y la de especialistas), con mockup completo y datos ficticios.
- **Mock:** usa un servidor simulado con las reglas del negocio.
- **Build de producción:** falla si no hay API y verifica que el mock no quede en el bundle.
- **Backend:** el de usuario tiene un contrato v1 de 54 endpoints. El de especialistas tiene un OpenAPI de 42 rutas
  sobre Postgres (Neon). Los dos son repos privados, todavía sin conectar ni desplegar.

**Texto propuesto para el paso «Seguridad»:**

> **Decidido para implementar.**
> - **Contraseñas:** Argon2id.
> - **Cookies:** solo del host, HttpOnly, Secure y SameSite=Lax.
> - **Sesiones:** en una tabla, con el token hasheado, que vencen y se pueden revocar. El refresh rota y detecta
>   reutilización.
> - **CSRF y orígenes:** CSRF en cada escritura, `Origin` exacto y CORS cerrado.
> - **Tokens:** nada de JWT en JSON ni de tokens en el almacenamiento del navegador.
> - **Ataques de fuerza:** límite de intentos y bloqueo progresivo, con respuestas neutras.
>
> **Autorización en el servidor.**
> - La propiedad va en la consulta: un id ajeno responde 404.
> - La dirección exacta y el nombre del usuario solo se ven con un trabajo acordado.
> - Los campos del servidor (verificación, fee, montos) nunca se aceptan del cliente.
> - Cada escritura lleva su clave de idempotencia.
>
> **Datos.** La analítica no lleva datos personales ni el contenido de chats o documentos, y ningún dato va a un
> proveedor de IA. Handy no recibe pagos: un reporte manual no equivale a un cobro confirmado.

Más una línea en `status`: «El backend está en construcción y todavía no está conectado. Lo de arriba es el diseño
decidido, no algo que ya corre.»

**Fuentes:**
- `handyx-specialist-fe/docs/auth-permissions.md`.
- `docs/contracts.md` §1–§2.
- `docs/architecture.md`.
- `docs/api/openapi.yaml`.
- `handyx-client-fe/docs/contrato-mock.md`.
- `src/data/http/cliente-http.ts`.
- `src/contracts/v1/*`.
- `docs/handoff.md`.

**Nota:** no se muestran las pantallas de pago, de fee ni de caja.
