# FastOrder S.A. — aplicaciones de demostración

Workspace Angular con tres aplicaciones independientes para el cliente, la cocina y administración. No incluye backend, base de datos ni API.

## Requisitos

- Node.js compatible con Angular CLI 22.
- pnpm 12 (el repositorio fija `pnpm@12.4.2`).
- Navegador moderno. El service worker funciona en HTTPS o en `localhost`.

## Instalación

Desde la raíz del repositorio:

```bash
pnpm install
```

## Estructura

```text
projects/
  fastorder-client/
    public/                 # manifiesto, ícono, fallback y service worker
    src/app/                # experiencia del cliente
    src/app.routes.ts
  fastorder-kitchen/
    public/
    src/app/                # panel de cocina
    src/app.routes.ts
  fastorder-admin/
    public/
    src/app/                # administración
    src/app.routes.ts
angular.json                # tres aplicaciones Angular CLI
```

Los proyectos tienen sus propias entradas, componentes standalone, estilos, rutas y configuración de build/serve. El `src/` de la raíz es la plantilla inicial conservada; no es una cuarta aplicación del workspace.

## Ejecutar cada aplicación

Cada comando inicia una aplicación independiente:

```bash
pnpm run start:client       # http://localhost:4203
pnpm run start:kitchen      # http://localhost:4201
pnpm run start:admin        # http://localhost:4202
```

También se puede ejecutar directamente con Angular CLI:

```bash
pnpm exec ng serve fastorder-client
pnpm exec ng serve fastorder-kitchen
pnpm exec ng serve fastorder-admin
```

## Compilar

```bash
pnpm run build:client
pnpm run build:kitchen
pnpm run build:admin
pnpm run build:all
```

Las salidas se generan por proyecto debajo de `dist/`.

## Funcionalidades

### FastOrder Client

- Menú disponible directamente, sin inicio de sesión ni registro.
- Catálogo adaptable a móvil, categorías, búsqueda y fotografías externas con imagen local de respaldo.
- Ficha de producto y extras, carrito con cantidades y eliminación.
- Checkout validado con recojo o delivery, costo de envío de muestra y confirmación con identificador simulado.
- Seguimiento visual, actualización local del estado e historial persistido en `localStorage`.
- Alternancia de tema claro/oscuro y botón **Descargar app**. El navegador muestra la instalación PWA cuando la admite; de lo contrario, el botón indica cómo añadirla desde el menú del navegador.

### FastOrder Kitchen

- Tablero de comandas disponible directamente, sin inicio de sesión.
- Tablero de comandas de muestra con productos, cantidades, observaciones, cliente y hora.
- Barra lateral de navegación por estado, modo oscuro, búsqueda, conteos y avance de estado mediante selector o acción rápida.

### FastOrder Admin

- Inicio de sesión de administrador con cuenta de muestra; no hay registro de cuentas desde la interfaz.
- Indicadores calculados a partir de los pedidos de muestra visibles en la aplicación.
- Catálogo CRUD de productos con validación, filtro, disponibilidad y confirmación al eliminar; el catálogo local se persiste en `localStorage`.
- Búsqueda, detalle y cambio de estado de pedidos.
- Gráfico semanal ilustrativo y descarga local de reporte CSV.
- Alternancia de tema claro/oscuro.

### PWA

Cada proyecto incluye un manifiesto, ícono SVG y service worker con caché de la aplicación y recursos del mismo origen para abrir el shell después de haberlo visitado en línea. El service worker se registra tanto en `ng serve` como en builds de producción, y requiere HTTPS o `localhost`. Después de abrir cada aplicación con conexión, espera a que el service worker se active antes de probar el modo sin conexión. La instalación depende de que el navegador admita PWA; si no ofrece el diálogo, el botón del cliente muestra cómo añadirla desde su menú. Las fotografías remotas necesitan conexión; si fallan, se muestra una ilustración local.

## Limitaciones de la demostración

- Los pagos no se procesan y los identificadores, pedidos, ventas, horas y estados de ejemplo no corresponden a operaciones reales.
- No hay comunicación automática entre aplicaciones. Cocina y administración usan sus propios pedidos de muestra; no reciben pedidos del cliente.
- El historial del cliente y el catálogo administrativo se guardan localmente en el navegador; no se comparten entre usuarios, dispositivos, aplicaciones ni puertos.
- Las cuentas y sesiones también son exclusivamente locales. Las contraseñas de muestra se almacenan sin cifrado: el acceso solo demuestra el flujo y no es autenticación segura ni debe usarse para datos reales. El registro administrativo no crea un rol protegido ni sustituye un servidor de identidad.
- Los ingresos del dashboard son una suma de los pedidos de demostración en memoria. El gráfico semanal usa un índice ilustrativo, no ventas diarias reales.
- En el modo sin conexión puede abrirse la última versión cargada del shell. Las fotos alojadas externamente no se garantizan offline.

## Pruebas manuales

1. Abre cliente y cocina directamente. En el cliente, ejecuta `pnpm run start:client`; cambia categoría, busca un producto, abre su detalle, agrega extras y modifica cantidades del carrito. En administración, inicia sesión con la cuenta de muestra `admin@fastorder.demo` / `admin123`.
2. Completa el checkout con datos válidos. En delivery, comprueba que se solicite dirección; verifica el identificador, seguimiento e historial. Recarga y confirma que el historial siga disponible.
3. Ejecuta `pnpm run start:kitchen`; busca un pedido, filtra por estado y avanza su estado con ambos controles.
4. Ejecuta `pnpm run start:admin`; crea, edita y elimina un producto (confirma la eliminación), revisa los pedidos, cambia un estado y descarga el CSV.
5. Cambia entre los temas claro y oscuro en cada aplicación y recarga para comprobar que la preferencia persiste. Comprueba los diseños en móvil y escritorio.
6. En cada aplicación, ábrela una vez con conexión y espera a que el service worker quede activo y la página bajo su control; luego prueba el modo sin conexión desde las herramientas del navegador. Esto funciona tanto con `ng serve` como con producción. El modo offline requiere esa carga inicial y conserva el shell/recursos del mismo origen, no las fotos externas.
7. En el cliente, prueba **Descargar app** desde un navegador compatible con instalación PWA; en iOS u otros navegadores sin diálogo automático sigue las instrucciones mostradas por el botón.

La validación de compilación disponible se ejecuta con `pnpm run build:all`. Este workspace no configura suites automatizadas; la lista anterior es una guía de verificación manual.
