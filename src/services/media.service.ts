import { AppError } from "@/lib/http";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { hasServerEnv } from "@/lib/env";
import type { AccessContext } from "@/types";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface UploadAssetResult {
  id: string;
  url: string | null;
  mimeType: string;
  sizeBytes: number;
  objectPath: string;
  fileName: string;
}

export const mediaService = {
  async upload(file: File, context: AccessContext, congregationId: string | null = context.congregationId) {
    if (!hasServerEnv()) {
      throw new AppError("Ambiente de servidor indisponível", 500, "server_env_missing");
    }

    if (!congregationId) {
      throw new AppError("Usuário sem congregação vinculada", 400, "congregation_required");
    }

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      throw new AppError("Formato de imagem não suportado. Envie JPG, PNG ou WEBP", 415, "unsupported_media_type");
    }

    if (file.size > MAX_BYTES) {
      throw new AppError("Imagem excede o limite de 5 MB", 413, "media_file_too_large");
    }

    const admin = createAdminSupabaseClient();
    const objectPath = `${congregationId}/${crypto.randomUUID()}-${file.name}`;

    const { data: storageData, error: storageError } = await admin.storage
      .from("church-media")
      .upload(objectPath, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (storageError || !storageData) {
      throw new AppError("Não foi possível enviar a imagem para o storage", 500, "media_upload_failed");
    }

    const { data: publicUrlData } = admin.storage.from("church-media").getPublicUrl(objectPath);
    const url = publicUrlData?.publicUrl ?? null;

    const { data: assetRow, error: mediaError } = await admin
      .from("media_assets")
      .insert({
        congregation_id: congregationId,
        bucket_name: "church-media",
        object_path: objectPath,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        url,
        is_public: false,
        created_by: context.userId,
      })
      .select("id, url")
      .single();

    if (mediaError || !assetRow) {
      throw new AppError("Não foi possível registrar o upload no auditor", 500, "media_audit_insert_failed");
    }

    return {
      id: assetRow.id,
      url,
      mimeType: file.type,
      sizeBytes: file.size,
      objectPath,
      fileName: file.name,
    } satisfies UploadAssetResult;
  },
};
