/**
 * Mocks oficiales/estándar: AsyncStorage en memoria (mock que trae el propio
 * paquete), expo-secure-store y expo-crypto con una implementación
 * determinística en JS (sin depender de módulos nativos).
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

jest.mock('expo-crypto', () => {
  let uuidCounter = 0;
  return {
    CryptoDigestAlgorithm: { SHA256: 'SHA256' },
    digestStringAsync: jest.fn(async (_algorithm: string, data: string) => `hashed:${data}`),
    randomUUID: jest.fn(() => `uuid-${uuidCounter++}`),
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as auth from '../src/auth';
import * as storage from '../src/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('auth.register', () => {
  it('crea un usuario con la contraseña hasheada, nunca en texto plano', async () => {
    const user = await auth.register('Ana', 'secreta123');
    expect(user.username).toBe('Ana');
    expect(user.passwordHash).not.toBe('secreta123');
    expect(user.passwordHash).toContain('hashed:');
  });

  it('rechaza username duplicado sin distinguir mayúsculas/minúsculas', async () => {
    await auth.register('Ana', 'secreta123');
    await expect(auth.register('ana', 'otra-clave')).rejects.toThrow('USERNAME_TAKEN');
  });
});

describe('auth.login', () => {
  it('autentica con credenciales válidas', async () => {
    await auth.register('Ana', 'secreta123');
    const user = await auth.login('Ana', 'secreta123');
    expect(user.username).toBe('Ana');
  });

  it('rechaza contraseña incorrecta con error genérico', async () => {
    await auth.register('Ana', 'secreta123');
    await expect(auth.login('Ana', 'incorrecta')).rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('rechaza usuario inexistente con el mismo error genérico (sin enumeración)', async () => {
    await expect(auth.login('fantasma', 'cualquiera')).rejects.toThrow('INVALID_CREDENTIALS');
  });
});

describe('auth.seedDefaultAdmin', () => {
  it('crea la cuenta admin de ejemplo y permite loguearse con ella', async () => {
    await auth.seedDefaultAdmin();

    const user = await auth.login(auth.DEFAULT_ADMIN_USERNAME, auth.DEFAULT_ADMIN_PASSWORD);

    expect(user.username).toBe(auth.DEFAULT_ADMIN_USERNAME);
  });

  it('es idempotente: no duplica la cuenta admin si ya existe', async () => {
    await auth.seedDefaultAdmin();
    await auth.seedDefaultAdmin();

    const users = await storage.getUsers();
    const admins = users.filter(
      (candidate) => candidate.username.toLowerCase() === auth.DEFAULT_ADMIN_USERNAME
    );
    expect(admins).toHaveLength(1);
  });

  it('no inicia sesión automáticamente al sembrar la cuenta', async () => {
    await auth.seedDefaultAdmin();
    await expect(auth.restoreSession()).resolves.toBeNull();
  });
});

describe('auth.restoreSession', () => {
  it('devuelve null si no hay sesión guardada', async () => {
    await expect(auth.restoreSession()).resolves.toBeNull();
  });

  it('restaura el usuario de la sesión activa', async () => {
    const registered = await auth.register('Ana', 'secreta123');
    const restored = await auth.restoreSession();
    expect(restored?.id).toBe(registered.id);
  });

  it('limpia una sesión que apunta a un usuario que ya no existe', async () => {
    await auth.register('Ana', 'secreta123');
    await AsyncStorage.setItem('users', JSON.stringify([]));
    await expect(auth.restoreSession()).resolves.toBeNull();
  });
});

describe('aislamiento de tareas por usuario (storage.ts)', () => {
  it('namespacea las tareas por ownerId: un usuario nunca ve las del otro', async () => {
    const userA = await auth.register('Ana', 'secreta123');
    const userB = await auth.register('Beto', 'otraclave');

    await storage.saveTasks(userA.id, [
      { id: 't1', ownerId: userA.id, title: 'De Ana', description: '', photoUri: null, location: null, createdAt: '' },
    ]);
    await storage.saveTasks(userB.id, [
      { id: 't2', ownerId: userB.id, title: 'De Beto', description: '', photoUri: null, location: null, createdAt: '' },
    ]);

    const tasksA = await storage.getTasks(userA.id);
    const tasksB = await storage.getTasks(userB.id);

    expect(tasksA).toHaveLength(1);
    expect(tasksA[0].title).toBe('De Ana');
    expect(tasksB).toHaveLength(1);
    expect(tasksB[0].title).toBe('De Beto');
  });
});
