import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as auth from './auth';
import { DEFAULT_ADMIN_PASSWORD, DEFAULT_ADMIN_USERNAME } from './auth';
import { colors } from './theme';
import type { User } from './types';

interface Props {
  onAuthenticated: (user: User) => void;
}

export default function LoginScreen({ onAuthenticated }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) return;
    setLoading(true);
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await auth.login(trimmedUsername, password)
          : await auth.register(trimmedUsername, password);
      onAuthenticated(user);
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'USERNAME_TAKEN'
          ? 'Ese nombre de usuario ya existe.'
          : 'Usuario o contraseña incorrectos.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode((current) => (current === 'login' ? 'register' : 'login'));
    setError(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.badge}>
        <Text style={styles.badgeMark}>✓</Text>
      </View>
      <Text style={styles.appTitle}>MyToDos</Text>
      <Text style={styles.title}>{mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}</Text>
      {mode === 'login' && (
        <Text style={styles.hint}>
          Cuenta de ejemplo: {DEFAULT_ADMIN_USERNAME} / {DEFAULT_ADMIN_PASSWORD}
        </Text>
      )}
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <View style={styles.passwordRow}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.passwordToggle}
          onPress={() => setShowPassword((current) => !current)}
        >
          <Text style={styles.passwordToggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
        </TouchableOpacity>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>{mode === 'login' ? 'Entrar' : 'Registrarme'}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={toggleMode}>
        <Text style={styles.switchText}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
  },
  badge: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeMark: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: colors.primaryText,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.text,
  },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 13,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: 12,
    backgroundColor: colors.surface,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  passwordToggle: {
    paddingHorizontal: 12,
  },
  passwordToggleText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  error: {
    color: colors.coral,
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    color: colors.primary,
  },
});
