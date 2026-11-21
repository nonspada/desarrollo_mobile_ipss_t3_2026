import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, User } from './types';

const USERS_KEY = 'users';
const tasksKey = (userId: string) => `tasks:${userId}`;

export async function getUsers(): Promise<User[]> {
  const raw = await AsyncStorage.getItem(USERS_KEY);
  return raw ? (JSON.parse(raw) as User[]) : [];
}

export async function addUser(user: User): Promise<void> {
  const users = await getUsers();
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify([...users, user]));
}

export async function getTasks(userId: string): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(tasksKey(userId));
  return raw ? (JSON.parse(raw) as Task[]) : [];
}

export async function saveTasks(userId: string, tasks: Task[]): Promise<void> {
  await AsyncStorage.setItem(tasksKey(userId), JSON.stringify(tasks));
}
