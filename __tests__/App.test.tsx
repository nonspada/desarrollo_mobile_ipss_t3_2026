jest.mock('../src/auth', () => ({
  seedDefaultAdmin: jest.fn().mockResolvedValue(undefined),
  restoreSession: jest.fn().mockResolvedValue(null),
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn().mockResolvedValue(undefined),
  DEFAULT_ADMIN_USERNAME: 'admin',
  DEFAULT_ADMIN_PASSWORD: 'admin123',
}));

jest.mock('../src/storage', () => ({
  getTasks: jest.fn().mockResolvedValue([]),
  saveTasks: jest.fn().mockResolvedValue(undefined),
}));

import { fireEvent, render } from '@testing-library/react-native';
import App from '../App';
import * as auth from '../src/auth';

const mockedLogin = auth.login as jest.Mock;
const mockedLogout = auth.logout as jest.Mock;

const adminUser = {
  id: 'admin-id',
  username: 'admin',
  passwordHash: 'x',
  passwordSalt: 'y',
  createdAt: '2024-01-01T00:00:00.000Z',
};

beforeEach(() => {
  mockedLogin.mockReset();
  mockedLogout.mockReset().mockResolvedValue(undefined);
});

describe('App: login con admin + logout', () => {
  it('loguea con admin y luego el botón "Cerrar sesión" vuelve al login', async () => {
    mockedLogin.mockResolvedValue(adminUser);

    const view = await render(<App />);

    await view.findByText('Iniciar sesión');

    await fireEvent.changeText(view.getByPlaceholderText('Usuario'), 'admin');
    await fireEvent.changeText(view.getByPlaceholderText('Contraseña'), 'admin123');
    await fireEvent.press(view.getByText('Entrar'));

    await view.findByText('Mis Tareas');
    expect(mockedLogin).toHaveBeenCalledWith('admin', 'admin123');

    await fireEvent.press(view.getByText('Cerrar sesión'));

    await view.findByText('Iniciar sesión');
    expect(mockedLogout).toHaveBeenCalled();
  });

  it('vuelve al login aunque auth.logout() falle (no debe quedar colgado)', async () => {
    mockedLogin.mockResolvedValue(adminUser);
    mockedLogout.mockRejectedValue(new Error('SecureStore no disponible'));

    const view = await render(<App />);
    await view.findByText('Iniciar sesión');
    await fireEvent.changeText(view.getByPlaceholderText('Usuario'), 'admin');
    await fireEvent.changeText(view.getByPlaceholderText('Contraseña'), 'admin123');
    await fireEvent.press(view.getByText('Entrar'));
    await view.findByText('Mis Tareas');

    await fireEvent.press(view.getByText('Cerrar sesión'));

    await view.findByText('Iniciar sesión');
  });
});
