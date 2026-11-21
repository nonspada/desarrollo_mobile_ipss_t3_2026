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

export async function register(username: string, password: string): Promise<User> {
  const users = await getUsers();
  if (findByUsername(users, username)) {
    throw new Error('USERNAME_TAKEN');
  }
  const salt = Crypto.randomUUID();
  const user: User = {
    id: Crypto.randomUUID(),
    username,
    passwordHash: await hashPassword(password, salt),
    passwordSalt: salt,
    createdAt: new Date().toISOString(),
  };
  await addUser(user);
  await SecureStore.setItemAsync(SESSION_KEY, user.id);
  return user;
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
