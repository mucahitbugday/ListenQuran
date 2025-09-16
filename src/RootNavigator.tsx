import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import * as screens from './screens';
import { DefaultTheme, PaperProvider } from 'react-native-paper';

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
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }} >
                    <Stack.Screen name="QuranSurahListScreen" component={screens.QuranSurahListScreen} />
                    <Stack.Screen name="QuranDetailScreen" component={screens.QuranDetailScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    )
}