-- ============================================
-- NightGuard - Storage Policies
-- Configuración de Buckets y Políticas
-- ============================================

-- ============================================
-- BUCKET: evidence_photos
-- Almacena fotos de evidencia de check-ins
-- ============================================

-- Crear bucket privado para fotos de evidencia
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence_photos',
  'evidence_photos',
  false, -- Bucket PRIVADO
  5242880, -- 5MB límite por archivo
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- ============================================
-- POLÍTICAS DE STORAGE: evidence_photos
-- Estructura de path: {user_id}/{assignment_id}/{tipo}_{timestamp}.{ext}
-- Ejemplo: abc123/def456/proof_1699999999.jpg
-- ============================================

-- Staff puede SUBIR fotos en su propia carpeta
-- El path debe comenzar con su user_id
CREATE POLICY "Staff can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'evidence_photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Staff puede VER sus propias fotos
CREATE POLICY "Staff can view own photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidence_photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Staff puede ACTUALIZAR sus propias fotos (ej: reemplazar)
CREATE POLICY "Staff can update own photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'evidence_photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Staff puede ELIMINAR sus propias fotos (en caso de error)
CREATE POLICY "Staff can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidence_photos' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Admin puede VER TODAS las fotos
CREATE POLICY "Admins can view all photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'evidence_photos' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- Admin puede ELIMINAR cualquier foto (moderación)
CREATE POLICY "Admins can delete any photo"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'evidence_photos' AND
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

-- ============================================
-- BUCKET: avatars (opcional)
-- Almacena fotos de perfil de usuarios
-- ============================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Bucket PÚBLICO (avatares visibles)
  2097152, -- 2MB límite
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Usuarios pueden subir su propio avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Usuarios pueden actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Todos pueden ver avatares (bucket público)
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

