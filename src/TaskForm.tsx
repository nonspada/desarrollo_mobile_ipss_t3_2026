import { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { captureLocation } from './location';
import { colors } from './theme';
import { capturePhoto } from './photos';
import type { Task, TaskLocation } from './types';

interface Props {
  editingTask: Task | null;
  ownerId: string;
  onCreate: (title: string, description: string, photoUri: string | null, location: TaskLocation) => void;
  onUpdate: (title: string, description: string) => void;
  onCancelEdit: () => void;
}

export default function TaskForm({ editingTask, ownerId, onCreate, onUpdate, onCancelEdit }: Props) {
  const [title, setTitle] = useState(editingTask?.title ?? '');
  const [description, setDescription] = useState(editingTask?.description ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTakePhoto = async () => {
    setTakingPhoto(true);
    const uri = await capturePhoto(ownerId);
    if (uri) setPhotoUri(uri);
    setTakingPhoto(false);
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (editingTask) {
      onUpdate(trimmedTitle, description.trim());
      setTitle('');
      setDescription('');
      return;
    }

    setSubmitting(true);
    const location = await captureLocation();
    onCreate(trimmedTitle, description.trim(), photoUri, location);
    setSubmitting(false);
    setTitle('');
    setDescription('');
    setPhotoUri(null);
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    onCancelEdit();
  };

  const busy = takingPhoto || submitting;

  return (
    <View style={styles.form}>
      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      {!editingTask && (
        <View style={styles.photoRow}>
          <TouchableOpacity
            style={[styles.photoButton, takingPhoto && styles.buttonDisabled]}
            onPress={handleTakePhoto}
            disabled={busy}
          >
            {takingPhoto ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.photoButtonText}>
                {photoUri ? '📷 Cambiar foto' : '📷 Tomar foto'}
              </Text>
            )}
          </TouchableOpacity>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.preview} />}
        </View>
      )}
      <View style={styles.actions}>
        {editingTask && (
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancel}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={busy}
        >
          {submitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.buttonText}>{editingTask ? 'Guardar cambios' : 'Agregar tarea'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  multiline: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  photoButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  photoButtonText: {
    color: colors.primary,
    fontWeight: '600',
  },
  preview: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  cancelButton: {
    backgroundColor: colors.muted,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
