import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Task, TaskLocationStatus } from './types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const LOCATION_BADGE: Record<TaskLocationStatus, string> = {
  granted: '📍 ubicación registrada',
  low_accuracy: '📍 ubicación poco precisa',
  denied: '📍 sin ubicación',
  unavailable: '📍 sin ubicación',
};

export default function TaskItem({ task, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      {task.photoUri && <Image source={{ uri: task.photoUri }} style={styles.thumbnail} />}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{task.title}</Text>
        {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
        {task.location && (
          <Text style={styles.locationBadge}>{LOCATION_BADGE[task.location.status]}</Text>
        )}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => onEdit(task)} style={styles.iconButton}>
          <Text>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(task.id)} style={styles.iconButton}>
          <Text>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 6,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 4,
  },
  locationBadge: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
});
