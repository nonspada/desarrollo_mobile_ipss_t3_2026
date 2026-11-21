jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  LocationAccuracy: { Balanced: 3 },
}));

import * as Location from 'expo-location';
import { captureLocation } from '../src/location';

const mockedRequestPermission = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockedGetPosition = Location.getCurrentPositionAsync as jest.Mock;

beforeEach(() => {
  mockedRequestPermission.mockReset();
  mockedGetPosition.mockReset();
});

describe('captureLocation', () => {
  it('devuelve status "denied" si el permiso es rechazado, sin lanzar', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: false });

    const result = await captureLocation();

    expect(result.status).toBe('denied');
    expect(result.latitude).toBeNull();
    expect(mockedGetPosition).not.toHaveBeenCalled();
  });

  it('devuelve status "granted" cuando la precisión es aceptable (<= 50m)', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedGetPosition.mockResolvedValue({
      coords: { latitude: -34.6, longitude: -58.4, accuracy: 20 },
      timestamp: 1700000000000,
    });

    const result = await captureLocation();

    expect(result.status).toBe('granted');
    expect(result.latitude).toBe(-34.6);
    expect(result.accuracyMeters).toBe(20);
  });

  it('devuelve status "low_accuracy" cuando la precisión supera el umbral (> 50m)', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedGetPosition.mockResolvedValue({
      coords: { latitude: -34.6, longitude: -58.4, accuracy: 120 },
      timestamp: 1700000000000,
    });

    const result = await captureLocation();

    expect(result.status).toBe('low_accuracy');
    expect(result.latitude).toBe(-34.6);
  });

  it('devuelve status "unavailable" ante un error de hardware/timeout, sin lanzar', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedGetPosition.mockRejectedValue(new Error('hardware error'));

    const result = await captureLocation();

    expect(result.status).toBe('unavailable');
    expect(result.latitude).toBeNull();
  });

  it('rechaza (0, 0) como lectura inválida (centinela de GPS sin fix)', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedGetPosition.mockResolvedValue({
      coords: { latitude: 0, longitude: 0, accuracy: 5 },
      timestamp: 1700000000000,
    });

    const result = await captureLocation();

    expect(result.status).toBe('unavailable');
    expect(result.latitude).toBeNull();
  });
});
