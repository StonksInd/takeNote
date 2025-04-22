import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, Pressable } from 'react-native';

jest.mock('../../context/AuthContext', () => ({
    useAuth: jest.fn().mockReturnValue({
        userToken: null,
        user: null,
        signIn: jest.fn(),
        signOut: jest.fn(),
        isLoading: false,
    }),
}));

import { useAuth } from '../../context/AuthContext';

const TestComponent = () => {
    const { userToken, signIn, signOut } = useAuth();

    return (
        <>
            <Text testID="status">{userToken ? 'Connecté' : 'Déconnecté'}</Text>
            <Pressable
                testID="login-button"
                onPress={() =>
                    signIn('test-token', {
                        id: 1,
                        name: 'Test',
                        email: 'test@example.com',
                    })
                }
            >
                <Text>Login</Text>
            </Pressable>
            <Pressable testID="logout-button" onPress={signOut}>
                <Text>Logout</Text>
            </Pressable>
        </>
    );
};

describe('AuthContext (Mocké)', () => {
    test('permet d\'interagir avec les fonctions d\'authentification', () => {
        const mockUseAuth = useAuth as jest.Mock;

        mockUseAuth.mockReturnValue({
            userToken: null,
            user: null,
            signIn: jest.fn().mockImplementation(() => {
                mockUseAuth.mockReturnValue({
                    userToken: 'test-token',
                    user: { id: 1, name: 'Test', email: 'test@example.com' },
                    signIn: jest.fn(),
                    signOut: jest.fn().mockImplementation(() => {
                        mockUseAuth.mockReturnValue({
                            userToken: null,
                            user: null,
                            signIn: jest.fn(),
                            signOut: jest.fn(),
                            isLoading: false,
                        });
                    }),
                    isLoading: false,
                });
            }),
            signOut: jest.fn(),
            isLoading: false,
        });

        const { getByTestId, rerender } = render(<TestComponent />);

        expect(getByTestId('status').props.children).toBe('Déconnecté');

        fireEvent.press(getByTestId('login-button'));

        rerender(<TestComponent />);

        expect(getByTestId('status').props.children).toBe('Connecté');

        fireEvent.press(getByTestId('logout-button'));

        rerender(<TestComponent />);

        expect(getByTestId('status').props.children).toBe('Déconnecté');
    });

    test('vérifie les erreurs de connexion', () => {
        const mockUseAuth = useAuth as jest.Mock;

        mockUseAuth.mockReturnValue({
            userToken: null,
            user: null,
            signIn: jest.fn().mockImplementation(() => {
                throw new Error('Erreur de connexion');
            }),
            signOut: jest.fn(),
            isLoading: false,
        });

        const { getByTestId } = render(<TestComponent />);

        expect(getByTestId('status').props.children).toBe('Déconnecté');

        expect(() => fireEvent.press(getByTestId('login-button'))).toThrow('Erreur de connexion');

        expect(getByTestId('status').props.children).toBe('Déconnecté');
    });

    test('vérifie les erreurs de déconnexion', () => {
        const mockUseAuth = useAuth as jest.Mock;

        mockUseAuth.mockReturnValue({
            userToken: 'test-token',
            user: { id: 1, name: 'Test', email: 'test@example.com' },
            signIn: jest.fn(),
            signOut: jest.fn().mockImplementation(() => {
                throw new Error('Erreur de déconnexion');
            }),
            isLoading: false,
        });

        const { getByTestId } = render(<TestComponent />);

        expect(getByTestId('status').props.children).toBe('Connecté');

        expect(() => fireEvent.press(getByTestId('logout-button'))).toThrow('Erreur de déconnexion');

        expect(getByTestId('status').props.children).toBe('Connecté');
    });
});