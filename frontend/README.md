# NightGuard - Sistema de Auditoría Hotelera

PWA para auditoría nocturna de hoteles con check-ins NFC y evidencia fotográfica.

## Requisitos

- Node.js 18+
- Cuenta de Supabase

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la carpeta `frontend/`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Para crear usuarios (solo servidor)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 2. Configurar Base de Datos

Ejecuta los scripts SQL en tu proyecto Supabase:

1. **Schema principal**: `supabase/advanced_schema.sql`
2. **Storage policies**: `supabase/storage_policies.sql`
3. **Funciones RPC**: `supabase/functions/get_nightly_stats.sql`

### 3. Crear Usuario Admin

En Supabase Dashboard:

1. Ve a **Authentication** → **Users**
2. Click en **Add user** → **Create new user**
3. Ingresa email y contraseña
4. En **User metadata**, agrega:
   ```json
   {"full_name": "Admin"}
   ```
5. Después de crear, edita el usuario y en **app_metadata** agrega:
   ```json
   {"role": "admin"}
   ```

### 4. Instalar y Ejecutar

```bash
cd frontend
npm install
npm run dev
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Landing page |
| `/login` | Inicio de sesión |
| `/dashboard/staff` | Dashboard personal del staff |
| `/dashboard/admin` | Panel de control del administrador |
| `/dashboard/admin/users` | Gestión de usuarios |

## Roles

### Staff
- Ver sus asignaciones del día
- Realizar check-ins con evidencia fotográfica
- Reportar incidencias
- Solo puede ver sus propios datos

### Admin
- Ver estadísticas de todos los usuarios
- Crear nuevos usuarios staff
- Asignar rondas a usuarios
- Ver todas las incidencias

## Estructura del Proyecto

```
frontend/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   ├── dashboard/           # Páginas de dashboard
│   └── login/               # Página de login
├── src/
│   ├── admin/               # Dominio: Administración
│   ├── dashboard/           # Dominio: Dashboard
│   ├── rounds_execution/    # Dominio: Ejecución de rondas
│   └── shared/              # Infraestructura compartida
└── public/                  # Assets estáticos + PWA

supabase/
├── advanced_schema.sql      # Tablas + RLS
├── storage_policies.sql     # Bucket + políticas
└── functions/               # Funciones RPC
```

## Políticas RLS

- **Staff**: Solo puede leer/escribir sus propios registros
- **Admin**: Puede leer todos los registros
- Roles basados en `app_metadata.role` del JWT

## PWA

La aplicación es instalable como PWA:
- Manifest configurado
- Service Worker para cache offline
- Optimizada para móviles
