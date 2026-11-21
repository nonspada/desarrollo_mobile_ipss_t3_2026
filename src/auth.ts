import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { addUser, getUsers } from './storage';
import type { User } from './types';

const SESSION_KEY = 'session.userId';

function hashPassword(password: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

function findByUsername(users: User[], username: string): User | undefined {
  const needle = username.toLowerCase();
  return users.find((user) => user.username.toLowerCase() === needle);
}

/** Usuario de ejemplo preconfigurado: permite iniciar sesión sin registrarse antes. */
export const DEFAULT_ADMIN_USERNAME = 'admin';
export const DEFAULT_ADMIN_PASSWORD = 'admin123';

async function createUser(username: string, password: string): Promise<User> {
  const salt = Crypto.randomUUID();
  return {
    id: Crypto.randomUUID(),
    username,
    passwordHash: await hashPassword(password, salt),
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };
}

export async function register(username: string, password: string): Promise<User> {
  const users = await getUsers();
  if (findByUsername(users, username)) {
    throw new Error('USERNAME_TAKEN');
  }
  const user = await createUser(username, password);
  await addUser(user);
  await SecureStore.setItemAsync(SESSION_KEY, user.id);
  return user;
}

/**
 * Crea el usuario "admin" de ejemplo la primera vez que la app corre en el
 * dispositivo. Idempotente (no duplica si ya existe) y no inicia sesión:
 * solo deja la cuenta disponible para que cualquiera pueda loguearse con ella.
 */
export async function seedDefaultAdmin(): Promise<void> {
  const users = await getUsers();
  if (findByUsername(users, DEFAULT_ADMIN_USERNAME)) return;
  const admin = await createUser(DEFAULT_ADMIN_USERNAME, DEFAULT_ADMIN_PASSWORD);
  await addUser(admin);
}

export async function login(username: string, password: string): Promise<User> {
  const users = await getUsers();
  const user = findByUsername(users, username);
  const hash = user ? await hashPassword(password, user.passwordSalt) : null;
  if (!user || hash !== user.passwordHash) {
    // Mensaje genérico: no revela si falló el usuario o la contraseña.
    throw new Error('INVALID_CREDENTIALS');
  }
  await SecureStore.setItemAsync(SESSION_KEY, user.id);
  return user;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}

export async function restoreSession(): Promise<User | null> {
  const userId = await SecureStore.getItemAsync(SESSION_KEY);
  if (!userId) return null;
  const users = await getUsers();
  const user = users.find((candidate) => candidate.id === userId);
  if (!user) {
    await SecureStore.deleteItemAsync(SESSION_KEY);
    return null;
  }
  return user;
}
