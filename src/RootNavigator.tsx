import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as screens from './screens';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { PlayerProvider } from './context/PlayerContext';

const Stack = createNativeStackNavigator();


function Provider({ children }: { children: React.ReactNode }) {
    const theme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            primary: '#445570',
            secondary: '#36445b',
            tertiary: '#1c283b'
        },
    };

    return (
        <PaperProvider theme={theme}>
            {children}
        </PaperProvider>
    )
}




export default function RootNavigator() {
    return (
        <Provider>
            <PlayerProvider>
                <NavigationContainer>
                    <Stack.Navigator screenOptions={{ headerShown: false }} >
                        <Stack.Screen name="MusicListScreen" component={screens.MusicListScreen} />
                        <Stack.Screen name="MusicDetailScreen" component={screens.MusicDetailScreen} />
                        <Stack.Screen name="SettingsScreen" component={screens.SettingsScreen} />
                        <Stack.Screen name="ProfileScreen" component={screens.ProfileScreen} />
                    </Stack.Navigator>
                </NavigationContainer>
            </PlayerProvider>
        </Provider>
    )
}