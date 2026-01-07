# CLAUDE.md - Tero (Gastro Cost System)

Este archivo proporciona contexto a Claude Code para trabajar con este proyecto.

## Descripción del Proyecto

**Tero** es un sistema de gestión de costos gastronómicos para restaurantes. Permite:
- Trackear precios de ingredientes con IVA y mermas
- Crear recetas con cálculo automático de costos
- Gestionar la carta con control de márgenes de ganancia
- Dashboard con alertas de rentabilidad

## Stack Tecnológico

```
Frontend:  Next.js 14 + React 18 + TypeScript
Styling:   Tailwind CSS
Icons:     Lucide React
Database:  MySQL (en VPS smartflex-prod)
Hosting:   VPS Google Cloud (35.198.14.142) puerto 8003
```

## Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm run start
```

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/               # API Routes (Next.js API)
│   │   ├── health/        # Health check endpoint
│   │   ├── insumos/       # CRUD de ingredientes
│   │   ├── precios/       # Historial de precios
│   │   ├── recetas/       # CRUD de recetas
│   │   ├── platos/        # CRUD de carta
│   │   ├── categorias/    # Categorías de insumos
│   │   ├── proveedores/   # Proveedores
│   │   ├── secciones/     # Secciones de carta
│   │   └── dashboard/     # Stats y alertas
│   ├── costos/            # Página de gestión de costos
│   ├── recetas/           # Página de recetas
│   ├── carta/             # Página de carta/menú
│   ├── dashboard/         # Dashboard principal
│   ├── layout.tsx         # Layout con Header
│   └── page.tsx           # Home page
├── components/
│   └── Header.tsx         # Navegación principal
├── lib/
│   └── db.ts              # Conexión MySQL pool
└── types/
    └── index.ts           # TypeScript interfaces
```

## Base de Datos

### Tablas Principales

| Tabla | Descripción |
|-------|-------------|
| `categorias` | Categorías de insumos (Carnes, Almacen, etc.) |
| `proveedores` | Proveedores de ingredientes |
| `insumos` | Ingredientes/materias primas |
| `precios` | Historial de precios de insumos |
| `recetas` | Recetas y subrecetas |
| `receta_ingredientes` | Ingredientes de cada receta |
| `secciones_carta` | Secciones del menú |
| `platos_carta` | Platos en la carta con precios |

### Crear Base de Datos

```bash
# Conectar al servidor
gcloud compute ssh smartflex-prod --zone=southamerica-east1-c

# Ejecutar schema
mysql -u root -p < schema.sql

# Crear usuario
mysql -u root -p -e "CREATE USER 'tero'@'%' IDENTIFIED BY 'PASSWORD'; GRANT ALL ON tero.* TO 'tero'@'%'; FLUSH PRIVILEGES;"
```

## Deploy al Servidor

### Ubicación en el VPS

```
/home/smartflex/tero/          # Código de la aplicación
├── .next/                     # Build de Next.js
├── node_modules/
├── package.json
└── .env                       # Variables de entorno
```

### Servicio Systemd

```ini
# /etc/systemd/system/tero.service
[Unit]
Description=Tero Gastro Cost System
After=network.target

[Service]
Type=simple
User=smartflex
WorkingDirectory=/home/smartflex/tero
ExecStart=/usr/bin/npm run start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=8003

[Install]
WantedBy=multi-user.target
```

### Apache Proxy

```apache
# En /etc/apache2/sites-enabled/wa.smartflex.com.ar-ssl.conf
ProxyPass /tero http://127.0.0.1:8003/tero
ProxyPassReverse /tero http://127.0.0.1:8003/tero
```

### Deploy Commands

```bash
# === Subir código ===
gcloud compute scp --recurse ./tero smartflex-prod:/home/smartflex/ --zone=southamerica-east1-c

# === En el servidor ===
cd /home/smartflex/tero
npm install
npm run build
sudo systemctl restart tero

# === Logs ===
sudo journalctl -u tero -f
```

## Variables de Entorno

```bash
# .env.local (desarrollo)
DB_HOST=35.198.14.142
DB_PORT=3306
DB_USER=tero
DB_PASSWORD=xxx
DB_NAME=tero
NEXT_PUBLIC_APP_URL=https://wa.smartflex.com.ar/tero
```

## API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/insumos` | GET, POST | Listar/crear insumos |
| `/api/insumos/[id]` | GET, PUT, DELETE | CRUD de insumo |
| `/api/insumos/[id]/precios` | POST | Agregar precio |
| `/api/categorias` | GET | Listar categorías |
| `/api/proveedores` | GET, POST | Listar/crear proveedores |
| `/api/recetas` | GET, POST | Listar/crear recetas |
| `/api/platos` | GET, POST | Listar/crear platos |
| `/api/secciones` | GET | Listar secciones |
| `/api/dashboard` | GET | Stats y alertas |

## Colaboradores

- joaquinaput-smartflex (owner)
- Fpidal (francisco.pidal@gmail.com)

## URLs

- **Producción**: https://wa.smartflex.com.ar/tero
- **GitHub**: https://github.com/joaquinaput-smartflex/tero
