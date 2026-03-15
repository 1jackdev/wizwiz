import { NavigationContainer } from '@react-navigation/native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import * as SecureStore from 'expo-secure-store';

import * as authApi from '../api/auth';
import * as characterApi from '../api/character';
import { AuthProvider } from '../context/AuthContext';
import RootNavigator from '../navigation/RootNavigator';

jest.mock('../api/auth');
jest.mock('../api/character');
jest.mock('expo-secure-store');

const mockedLogin = jest.mocked(authApi.login);
const mockedRegister = jest.mocked(authApi.register);
const mockedGetItem = jest.mocked(SecureStore.getItemAsync);
const mockedListCharacters = jest.mocked(characterApi.listCharacters);

// Build a valid JWT-shaped token so decodeJwtPayload works in AuthContext
function makeTestToken(userId = 'test-user-id', username = 'testuser') {
  const payload = btoa(JSON.stringify({ sub: userId, username, exp: 9999999999 }));
  return `header.${payload}.signature`;
}

function renderApp() {
  return render(
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

describe('auth flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetItem.mockResolvedValue(null);
    mockedListCharacters.mockResolvedValue([]);
  });

  it('shows sign in screen on launch when not authenticated', async () => {
    renderApp();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Username')).toBeTruthy();
      expect(screen.getByPlaceholderText('Password')).toBeTruthy();
    });
  });

  it('shows bottom tabs after successful sign in', async () => {
    mockedLogin.mockResolvedValue({ access_token: makeTestToken(), token_type: 'bearer' });

    renderApp();

    await waitFor(() => screen.getByPlaceholderText('Username'));
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'jack');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Characters')).toBeTruthy();
      expect(screen.getByText('Combat')).toBeTruthy();
      expect(screen.getByText('Account')).toBeTruthy();
    });
  });

  it('shows bottom tabs after successful sign up', async () => {
    mockedRegister.mockResolvedValue(undefined);
    mockedLogin.mockResolvedValue({ access_token: makeTestToken(), token_type: 'bearer' });

    renderApp();

    await waitFor(() => screen.getByText("Don't have an account? Sign up"));
    fireEvent.press(screen.getByText("Don't have an account? Sign up"));

    await waitFor(() => screen.getByText('Sign Up'));
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'newuser');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123');
    fireEvent.press(screen.getByText('Sign Up'));

    await waitFor(() => {
      expect(screen.getByText('Characters')).toBeTruthy();
      expect(screen.getByText('Combat')).toBeTruthy();
      expect(screen.getByText('Account')).toBeTruthy();
    });
  });

  it('shows an error message on failed sign in', async () => {
    mockedLogin.mockRejectedValue(new Error('Invalid username or password'));

    renderApp();

    await waitFor(() => screen.getByPlaceholderText('Username'));
    fireEvent.changeText(screen.getByPlaceholderText('Username'), 'jack');
    fireEvent.changeText(screen.getByPlaceholderText('Password'), 'wrongpassword');
    fireEvent.press(screen.getByText('Sign In'));

    await waitFor(() => {
      expect(screen.getByText('Invalid username or password')).toBeTruthy();
    });
  });
});
