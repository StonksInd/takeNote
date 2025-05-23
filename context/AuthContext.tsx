import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
};

type AuthContextType = {
    signIn: (token: string, userData: User) => Promise<void>;
    signOut: () => Promise<void>;
    getData: (
        endpoint: string,
        method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
        body?: object
    ) => Promise<any>;
    isLoading: boolean;
    userToken: string | null;
    user: User | null;
};

const SECURE_TOKEN_KEY = 'secure_user_token';
const SECURE_USER_DATA_KEY = 'secure_user_data';

const AuthContext = createContext<AuthContextType>({
    signIn: async () => { },
    signOut: async () => { },
    getData: async () => { },
    isLoading: true,
    userToken: null,
    user: null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const segments = useSegments();
    const apiUrl = 'https://keep.kevindupas.com/api';

    const checkAndRedirect = useCallback(() => {
        const inAuthGroup = segments[0] === '(auth)';

        if (!userToken && !inAuthGroup && !isLoading) {
            router.replace('/(auth)/login');
        } else if (userToken && inAuthGroup) {
            router.replace('/');
        }
    }, [userToken, isLoading, segments, router]);

    useEffect(() => {
        checkAndRedirect();
    }, [checkAndRedirect]);

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
                const userData = await SecureStore.getItemAsync(SECURE_USER_DATA_KEY);

                if (token) {
                    setUserToken(token);
                }

                if (userData) {
                    try {
                        const userInfo = JSON.parse(userData);

                        if (userInfo && userInfo.id && userInfo.email) {
                            setUser(userInfo);
                        } else {
                            console.error('Erreur lors de la récupération des données utilisateur');
                            await signOut();
                        }
                    } catch (error) {
                        console.error('Erreur lors de la conversion des données utilisateur en JSON', error);
                        await signOut();
                    }
                }
            } catch (error) {
                console.error('Erreur lors du chargement des informations de l\'utilisateur', error);
                await signOut();
            } finally {
                setIsLoading(false);
            }
        };

        loadToken();
    }, []);

    const signIn = async (token: string, userData: User) => {
        try {
            if (!token || !userData || !userData.id || !userData.email) {
                throw new Error('Token or user data is missing');
            }

            const secureStoreOptions = {
                keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
            };

            await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token, secureStoreOptions);
            await SecureStore.setItemAsync(SECURE_USER_DATA_KEY, JSON.stringify(userData), secureStoreOptions);

            setUserToken(token);
            setUser(userData);
        } catch (error) {
            console.error('Erreur lors de la connexion', error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
            await SecureStore.deleteItemAsync(SECURE_USER_DATA_KEY);

            setUserToken(null);
            setUser(null);
        } catch (error) {
            console.error('Erreur lors de la déconnexion', error);
            setUserToken(null);
            setUser(null);
            throw error;
        }
    };

    async function getData(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'GET', body?: object) {
        try {
            const options: RequestInit = {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${userToken}`,
                },
            };

            if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
                options.body = JSON.stringify(body);
            }

            console.log(`Requête ${method} à ${endpoint}:`, typeof options.body === 'string' ? JSON.parse(options.body) : 'Pas de corps');

            const response = await fetch(`${apiUrl}/${endpoint}`, options);

            const jsonData = await response.json();
            console.log(`Réponse de ${endpoint}:`, jsonData);

            if (jsonData.data) return jsonData.data;

            return jsonData;
        } catch (error) {
            console.error(`Erreur ${method} sur ${endpoint}:`, error);
            throw error;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                getData,
                isLoading,
                userToken,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}