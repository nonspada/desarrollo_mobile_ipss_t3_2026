jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('expo-file-system', () => {
  const toUri = (part: unknown): string => {
    if (typeof part === 'string') return part;
    if (part && typeof part === 'object' && 'uri' in part && typeof part.uri === 'string') {
      return part.uri;
    }
    throw new Error('mock Directory/File received a part without a string uri');
  };

  class MockDirectory {
    uri: string;
    createOptions: unknown;
    constructor(...parts: unknown[]) {
      this.uri = parts.map(toUri).join('/');
    }
    create(options: unknown) {
      this.createOptions = options;
    }
  }

  class MockFile {
    uri: string;
    constructor(...parts: unknown[]) {
      this.uri = parts.map(toUri).join('/');
    }
    copy = jest.fn(async () => undefined);
  }

  return {
    Directory: MockDirectory,
    File: MockFile,
    Paths: { document: 'file://document' },
  };
});

import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { capturePhoto } from '../src/photos';

const mockedRequestPermission = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const mockedLaunchCamera = ImagePicker.launchCameraAsync as jest.Mock;

beforeEach(() => {
  mockedRequestPermission.mockReset();
  mockedLaunchCamera.mockReset();
});

describe('capturePhoto', () => {
  it('devuelve null si el permiso de cámara es denegado, sin abrir la cámara', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: false });

    const result = await capturePhoto('user-1');

    expect(result).toBeNull();
    expect(mockedLaunchCamera).not.toHaveBeenCalled();
  });

  it('devuelve null si el usuario cancela la captura', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedLaunchCamera.mockResolvedValue({ canceled: true, assets: null });

    const result = await capturePhoto('user-1');

    expect(result).toBeNull();
  });

  it('copia la foto a un path persistente namespaced por ownerId', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedLaunchCamera.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://cache/tmp-photo.jpg' }],
    });

    const result = await capturePhoto('user-1');

    expect(result).toContain('photos/user-1/');
    expect(result).toMatch(/\.jpg$/);
  });

  it('nunca lanza si el filesystem falla: devuelve null', async () => {
    mockedRequestPermission.mockResolvedValue({ granted: true });
    mockedLaunchCamera.mockResolvedValue({
      canceled: false,
      assets: [{ uri: 'file://cache/tmp-photo.jpg' }],
    });
    jest.spyOn(FileSystem.Directory.prototype, 'create').mockImplementation(() => {
      throw new Error('disk full');
    });

    const result = await capturePhoto('user-1');

    expect(result).toBeNull();
  });
});
