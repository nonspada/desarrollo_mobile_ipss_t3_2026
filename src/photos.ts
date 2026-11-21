import * as ImagePicker from 'expo-image-picker';
import { Directory, File, Paths } from 'expo-file-system';

/**
 * Abre la cámara nativa y, si el usuario toma una foto, la copia de forma
 * persistente a documentDirectory/photos/<ownerId>/. Nunca lanza: permiso
 * denegado, cancelación o cualquier error de la cámara/filesystem devuelven
 * `null` para que el alta de la tarea no quede bloqueada.
 */
export async function capturePhoto(ownerId: string): Promise<string | null> {
  try {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    const asset = result.canceled ? null : result.assets[0];
    if (!asset) return null;

    const ownerDir = new Directory(Paths.document, 'photos', ownerId);
    ownerDir.create({ intermediates: true, idempotent: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
    const destination = new File(ownerDir, filename);
    await new File(asset.uri).copy(destination);
    return destination.uri;
  } catch {
    return null;
  }
}
