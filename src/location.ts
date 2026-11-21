import * as Location from 'expo-location';
import type { TaskLocation } from './types';

const ACCURACY_THRESHOLD_METERS = 50;
const TIMEOUT_MS = 8000;

const EMPTY_COORDS = { latitude: null, longitude: null, accuracyMeters: null, capturedAt: null } as const;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const { promise: timeoutPromise, reject } = Promise.withResolvers<T>();
  const timer = setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), ms);
  promise.finally(() => clearTimeout(timer)).catch(() => undefined);
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Captura la ubicación actual para una nueva tarea. Nunca lanza: ante permiso
 * denegado, timeout o cualquier error de hardware devuelve un status que lo
 * explica, para que la creación de la tarea nunca quede bloqueada.
 */
export async function captureLocation(): Promise<TaskLocation> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return { status: 'denied', ...EMPTY_COORDS };
    }

    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.LocationAccuracy.Balanced }),
      TIMEOUT_MS
    );

    const { latitude, longitude, accuracy: accuracyMeters } = position.coords;
    const isNullIsland = latitude === 0 && longitude === 0;
    if (isNullIsland) {
      // (0, 0) es el valor centinela clásico de un GPS sin fix real: nunca se persiste
      // como coordenada válida.
      return { status: 'unavailable', ...EMPTY_COORDS };
    }

    const reading = {
      latitude,
      longitude,
      accuracyMeters,
      capturedAt: new Date(position.timestamp).toISOString(),
    };
    const isLowAccuracy = accuracyMeters !== null && accuracyMeters > ACCURACY_THRESHOLD_METERS;
    return { status: isLowAccuracy ? 'low_accuracy' : 'granted', ...reading };
  } catch {
    return { status: 'unavailable', ...EMPTY_COORDS };
  }
}
