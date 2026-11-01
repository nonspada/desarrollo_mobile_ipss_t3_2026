import { useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TaskForm from './src/TaskForm';
import TaskItem from './src/TaskItem';
import type { Task } from './src/types';

const createId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleSubmit = (title: string, description: string) => {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id ? { ...task, title, description } : task
        )
      );
      setEditingTask(null);
    } else {
      setTasks((prev) => [...prev, { id: createId(), title, description }]);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar tarea', '¿Seguro que deseas eliminar esta tarea?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          setTasks((prev) => prev.filter((task) => task.id !== id));
          if (editingTask?.id === id) setEditingTask(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Mis Tareas</Text>
      <TaskForm
        key={editingTask?.id ?? 'new'}
        editingTask={editingTask}
        onSubmit={handleSubmit}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 16,
    color: '#111827',
  },
  list: {
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    color: '#6b7280',
    fontSize: 15,
  },
});
