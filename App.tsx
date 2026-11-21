import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Platform, SafeAreaView, StatusBar as RNStatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as auth from './src/auth';
import LoginScreen from './src/LoginScreen';
import * as storage from './src/storage';
import TaskForm from './src/TaskForm';
import TaskItem from './src/TaskItem';
import type { Task, TaskLocation, User } from './src/types';
import { colors } from './src/theme';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const [restoringSession, setRestoringSession] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    (async () => {
      try {
        await auth.seedDefaultAdmin();
        const user = await auth.restoreSession();
        if (user) {
          setCurrentUser(user);
          setTasks(await storage.getTasks(user.id));
        }
      } catch (error) {
        console.warn('No se pudo inicializar la sesión:', error);
      } finally {
        setRestoringSession(false);
      }
    })();
  }, []);

  const handleAuthenticated = async (user: User) => {
    setCurrentUser(user);
    setTasks(await storage.getTasks(user.id));
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (error) {
      console.warn('No se pudo borrar la sesión de forma segura, se cierra igual:', error);
    } finally {
      setCurrentUser(null);
      setTasks([]);
      setEditingTask(null);
    }
  };

  const persistTasks = (userId: string, next: Task[]) => {
    setTasks(next);
    storage.saveTasks(userId, next);
  };

  const handleCreate = (title: string, description: string, photoUri: string | null, location: TaskLocation) => {
    if (!currentUser) return;
    const task: Task = {
      id: createId(),
      ownerId: currentUser.id,
      title,
      description,
      photoUri,
      location,
      createdAt: new Date().toISOString(),
    };
    persistTasks(currentUser.id, [...tasks, task]);
  };

  const handleUpdate = (title: string, description: string) => {
    if (!currentUser || !editingTask) return;
    const next = tasks.map((task) =>
      task.id === editingTask.id ? { ...task, title, description } : task
    );
    persistTasks(currentUser.id, next);
    setEditingTask(null);
  };

  const handleDelete = (id: string) => {
    if (!currentUser) return;
    Alert.alert('Eliminar tarea', '¿Seguro que deseas eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          persistTasks(currentUser.id, tasks.filter((task) => task.id !== id));
          if (editingTask?.id === id) setEditingTask(null);
        },
      },
    ]);
  };

  if (restoringSession) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return <LoginScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Mis Tareas</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
      <TaskForm
        key={editingTask?.id ?? 'new'}
        editingTask={editingTask}
        ownerId={currentUser.id}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        onCancelEdit={() => setEditingTask(null)}
      />
      <FlatList
        data={tasks}
        keyExtractor={(task) => task.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay tareas pendientes. ¡Agrega una!</Text>
        }
        renderItem={({ item }) => (
          <TaskItem task={item} onEdit={setEditingTask} onDelete={handleDelete} />
        )}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const androidStatusBarInset = Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 24 : 0;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: androidStatusBarInset,
  },
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: androidStatusBarInset,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryText,
  },
  logout: {
    color: colors.coral,
    fontWeight: '600',
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: colors.muted,
    fontSize: 15,
  },
});
