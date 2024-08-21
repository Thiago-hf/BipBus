import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as Location from 'expo-location';
import LoginScreen from './screens/LoginScreen';
import CadastroScreen from './screens/CadastroScreen';
import PrincipalScreen from './screens/PrincipalScreen';

const Stack = createStackNavigator();

const App = () => {
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        // Solicitar permissões de localização em primeiro plano
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        if (foregroundStatus !== 'granted') {
          Alert.alert(
            'Permissão de Localização',
            'A permissão de localização é necessária para o funcionamento do aplicativo.',
            [{ text: 'OK' }]
          );
        }

        // Solicitar permissões de localização em segundo plano
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          Alert.alert(
            'Permissão de Localização em Segundo Plano',
            'A permissão de localização em segundo plano é necessária para o funcionamento do aplicativo.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Erro ao solicitar permissões:', error);
        Alert.alert(
          'Erro',
          'Erro ao solicitar permissões.',
          [{ text: 'OK' }]
        );
      }
    };

    requestPermissions();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Cadastro" component={CadastroScreen} />
        <Stack.Screen name="Principal" component={PrincipalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
