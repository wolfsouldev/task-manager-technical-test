# Task Manager

Aplicación fullstack de gestión de tareas con **React, NestJS y TypeScript**, desarrollada como prueba técnica. Permite crear tareas con responsable, cambiar su estado y organizar el trabajo en un tablero Kanban o en una lista.

## Requisitos de la prueba y dónde está cada uno

| # | Requisito | Dónde |
|---|-----------|-------|
| 1 | API REST para crear, listar y cambiar el estado de tareas | `apps/api` · sección [API](#api) |
| 2 | Filtro por estado, validaciones y errores HTTP | DTOs con `class-validator` y `GET /api/tasks` |
| 3 | Persistencia SQLite o PostgreSQL | Drizzle ORM; SQLite por defecto y PostgreSQL configurable |
| 4 | Lista, filtros, formulario validado y cambio de estado | `apps/web/src/features/tasks` |
| 5 | Estados de carga, vacío y error | TanStack Query y componentes de feedback |
| 6 | Al menos dos pruebas backend y dos frontend | Jest/Supertest y Vitest/React Testing Library |
| 7 | Instrucciones, decisiones, mejoras y uso de IA | Este README |

## Tecnologías

- **Frontend:** React, TypeScript, Vite, Tailwind CSS y shadcn/ui.
- **Backend:** NestJS, TypeScript y Drizzle ORM.
- **Base de datos:** SQLite por defecto; PostgreSQL configurable con `DATABASE_URL`.
- **Datos y formularios:** TanStack Query, React Hook Form y Zod.
- **Interfaz:** dnd-kit para arrastrar tarjetas y Animate UI para controles animados.
- **Pruebas:** Jest y Supertest (API); Vitest y React Testing Library (web).
- **Infraestructura:** npm workspaces, Docker Compose y Nginx.

## Ejecución rápida

Con SQLite no hace falta crear manualmente la base, las tablas, carpetas ni un `.env`. El arranque crea la base de datos y aplica las migraciones.

### Desarrollo local

Requisitos: **Node.js 24.9 o superior** y **npm 11 o superior**.

```bash
npm ci
npm run demo
```

`npm run demo` aplica migraciones, carga datos de ejemplo e inicia API y frontend:

- Aplicación: <http://localhost:5173>
- API: <http://localhost:3000/api>

Para iniciar **sin** datos de demostración, ejecuta `npm run dev`. Puedes cargarlos después con `npm run db:seed`. El seed es opcional e idempotente: en una base vacía genera cuatro responsables y nueve tareas; repetirlo no duplica ni restablece registros.

### Docker Compose

Requisitos: Docker Engine y Docker Compose v2.

```bash
docker compose up --build -d
```

Abre <http://localhost:8080>. El seed de demostración se ejecuta solo cuando se solicita:

```bash
docker compose exec api node dist/database/seed.js
```

Detén los contenedores con `docker compose down`; el volumen SQLite se conserva. `docker compose down -v` elimina el volumen `task-manager_tasks_data` y sus datos.

### Usar PostgreSQL

La base y el usuario de PostgreSQL deben existir y tener permisos para aplicar migraciones. Copia la plantilla y cambia `DATABASE_URL`:

```bash
cp .env.example apps/api/.env
```

En `apps/api/.env`, configura, por ejemplo:

```dotenv
DATABASE_URL=postgresql://usuario:clave@localhost:5432/task_manager
```

También se acepta `postgres://`. La aplicación elige el driver, el adaptador Drizzle y las migraciones correspondientes. Cambiar la URL no copia los datos desde SQLite.

En Docker Compose, define `DATABASE_URL` en el entorno o en un archivo `.env` en la raíz del repositorio. `localhost` dentro del contenedor no apunta al host. Compose no crea un servidor PostgreSQL: se conecta a una instancia ya disponible.

## Verificación

Comandos disponibles:

```bash
npm run typecheck
npm run build
npm test
```

La suite contiene **12 casos backend** en `apps/api/test/api.spec.ts` y **10 casos frontend** en `apps/web/src/tests`, seleccionados para cubrir los flujos más importante
En las comprobaciones registradas de la implementación pasaron `typecheck` y `build`; también se hizo un recorrido funcional del API contra SQLite y PostgreSQL temporales y del frontend en navegador. Las escrituras de prueba se hicieron en bases temporales, no en la base de la aplicación. No atribuir estas comprobaciones del agente al candidato.

## Funcionalidades

- Crear, listar y editar tareas con descripción de texto enriquecido.
- Asignar y cambiar el responsable.
- Estados `pending`, `in_progress` y `done`, mostrados como Pendiente, En curso y Hecha.
- Tablero Kanban con drag & drop y vista de lista.
- Filtros por estado y responsable; búsqueda paginada de responsables.
- Paginación en la lista de tareas y el directorio de usuarios.
- CRUD de responsables, con protección contra borrado si tienen tareas asignadas.
- Validación en cliente y servidor; estados de carga, error, reintento y vacío.
- Tema claro/oscuro persistente y diseño adaptable a móvil.

Los usuarios son **responsables asignables**, no cuentas de acceso. No hay autenticación; no publicar la demo con información sensible.

## API

Prefijo: `/api`. Las tareas incluyen los datos del responsable y fechas en ISO 8601.

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/tasks` | Listar tareas; permite filtrar por estado y responsable |
| POST | `/api/tasks` | Crear tarea |
| GET | `/api/tasks/:id` | Obtener detalle de una tarea |
| PATCH | `/api/tasks/:id` | Editar título, descripción, estado o responsable |
| PATCH | `/api/tasks/:id/status` | Cambiar estado |
| GET | `/api/users` | Listar responsables |
| GET | `/api/users/:id` | Obtener un responsable |
| POST | `/api/users` | Crear responsable |
| PATCH | `/api/users/:id` | Editar responsable |
| DELETE | `/api/users/:id` | Eliminar si no tiene tareas asignadas |

La API responde `201` al crear, `400` ante entradas inválidas, `404` si no existe el recurso y `409` ante conflictos como correo duplicado o borrado de un responsable asignado.

## Decisiones técnicas

- **Monorepo con npm workspaces:** elegí mantener la web y la API en un mismo repositorio para que sea fácil revisar cómo se integran y ejecutar el proyecto. Hay una sola instalación y comandos desde la raíz; no hacía falta sumar Nx o Turborepo.
- **React + Vite:** una SPA ligera que se desarrolla y levanta rápidamente para probar las pantallas y los flujos principales.
- **NestJS:** separa controladores, DTOs validados y reglas de negocio, haciendo más sencillo seguir el recorrido de una solicitud. Los DTOs son clases porque sus decoradores validan en runtime.
- **Drizzle con SQLite por defecto:** seleccioné SQLite para que quien revise la prueba no tenga que instalar ni configurar un servidor de base de datos; el archivo y las tablas se preparan al arrancar. PostgreSQL sigue disponible al cambiar `DATABASE_URL`, sin cambiar la lógica de negocio.
- **TanStack Query:** gestiona caché y sincronización del estado remoto. El cambio de estado es optimista y se revierte si falla la API.
- **React Hook Form + Zod:** validan los formularios en cliente y ofrecen mensajes por campo, mientras el servidor vuelve a validar los datos.
- **Organización por funcionalidad:** modelos, props y schemas se agrupan junto a tareas, usuarios y componentes; los contratos compartidos quedan aparte.
- **Docker Compose + Nginx:** ofrece otra forma reproducible de revisar la app y conserva la base SQLite en un volumen.

## ¿Qué haría con más tiempo?

La prioridad de la prueba era entregar primero un núcleo funcional. Para una versión más completa, abordaría:

1. **Seguridad:** autenticación y autorización antes de abrir el acceso a más personas.
2. **Proyectos, equipos y colaboración:** crear equipos con sus miembros y permisos, y segmentar los tableros para mostrar y gestionar las tareas de cada equipo o proyecto.
3. **Modelo de tareas:** fechas de entrega, varios responsables, notas, subtareas, prioridad, etiquetas y comentarios.
4. **Accesibilidad y escala:** mejorar la operación por teclado del drag & drop y evaluar índices/paginación por cursor para volúmenes grandes.
5. **Trazabilidad:** historial de cambios y sincronización en tiempo real.
6. **Documentación:** publicar el contrato de la API con OpenAPI/Swagger.
7. **CRUD de estados de tarea:** permitir crear, renombrar, ordenar, archivar y eliminar estados configurables, reemplazando los tres estados fijos actuales y definiendo qué hacer con las tareas que ya utilicen un estado eliminado.


## Uso de inteligencia artificial

Utilicé Codex como asistente de programación con un proceso por etapas: **planificación → implementación incremental → revisión → corrección → verificación**. Los modelos tuvieron funciones distintas.

### 1. Planificación — GPT-6.1 Sol (`gpt-6.1-sol`)

Le pedí elaborar el plan técnico completo: alcance, prioridades, arquitectura, estructura del monorepo, tecnologías, criterios de aceptación y distribución del trabajo. El plan dejó claro que primero se debía completar el núcleo funcional y después abordar los diferenciadores y el pulido, evitando que los extras pusieran en riesgo los requisitos obligatorios.

### 2. Implementación — GPT-6 Luna (`gpt-6-luna`)

Le pedí implementar el proyecto siguiendo ese plan, de forma incremental y verificable. El trabajo se fue abordando por etapas: monorepo y API; persistencia, migraciones y validaciones; pantallas y formularios; gestión de responsables y Kanban; y, finalmente, ajustes de interfaz, PostgreSQL, organización de tipos y documentación.

No se trató de aceptar una generación única de código. Revisé el resultado entre etapas y fui indicando cambios concretos cuando algo no funcionaba o no coincidía con lo esperado.

### Revisión, feedback y correcciones

Durante el desarrollo revisé la aplicación de forma iterativa, reporté problemas observados y pedí ajustes específicos. Entre ellos estuvieron un error HTTP 500, la ubicación del selector de estado —debía estar en el modal de edición, no en las tarjetas del Kanban—, la búsqueda paginada de responsables y mejoras visuales en móvil. GPT-6 Luna aplicó las modificaciones correspondientes.

El agente también detectó y corrigió problemas de integración de componentes e imports, sincronización de la caché tras mutaciones, idempotencia del seed, ciclo de vida del editor de texto enriquecido y configuración del adaptador de base de datos. La revisión por etapas ayudó a detectar estas discrepancias antes de cerrar la implementación.

### Herramientas y límites

- **Taste Skill:** se revisó como referencia de diseño, pero no se ejecutó su inspector visual en navegador. No afirmo que la skill haya aprobado el diseño.
- **shadcn/ui y Animate UI:** se usaron como herramientas/componentes de interfaz.

### Qué corregí y revisé yo

- Corregí un problema relacionado con las migraciones que encontré al trabajar con la persistencia; después continué la implementación con el esquema y los motores configurados.
- Depuré el filtro de responsables de las tareas para que aplicara correctamente el **debounce** a la búsqueda y no tratara cada tecla como una búsqueda independiente.
- Ajusté la paginación para que se mantuviera coherente al cambiar los filtros y la búsqueda, incluida la página que se muestra para los resultados actuales.

Además, durante la revisión funcional y aclaré varios detalles de interacción: el selector de estado debía estar en el modal de edición, el Kanban debía conservar el drag & drop normal y la navegación de tareas debía agrupar las vistas de tablero y lista. También pedí retirar la etiqueta de persistencia local, mejorar la legibilidad de la gestión de usuarios, poder editar la descripción y reasignar una tarea desde su detalle, y adaptar la interfaz a móvil. Esos cambios de código los implementó Codex siguiendo mi feedback; aquí distingo esas decisiones de revisión de las correcciones que hice personalmente.

### Tiempo empleado

**2 horas y 45 minutos.**
