import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

const GOOGLE_MAPS_API_KEY = 'AIzaSyALjUMxIckJhxsg6NSMFQ06zB-EYsAcwQs';

export default function PrincipalScreen() {
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);
  const [modalVisible4, setModalVisible4] = useState(false);
  const [watching, setWatching] = useState(false);
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: -19.9191, // Latitude de Belo Horizonte
    longitude: -43.9378, // Longitude de Belo Horizonte
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  useEffect(() => {
    (async () => {
      try {
        // Solicitar permissões para notificações
        const { status: notificationStatus } = await Notifications.getPermissionsAsync();
        if (notificationStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Erro', 'Permissão para notificações negada.');
            return;
          }
        }

        // Solicitar permissões para localização
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          setModalVisible1(true);
          return;
        }

        // Solicitar permissões para localização em segundo plano
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          setModalVisible1(false);
          return;
        }

        // Obter localização atual
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        // Iniciar o monitoramento da localização
        startWatching();
      } catch (error) {
        console.error('Erro ao solicitar permissões ou obter localização:', error);
        Alert.alert('Erro', 'Ocorreu um erro ao solicitar permissões ou obter localização.');
      }
    })();

    return () => {
      if (watching) {
        Location.removeWatchAsync(watching);
      }
    };
  }, []);

  const startWatching = async () => {
    if (watching) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Atualiza a cada 10 segundos
          distanceInterval: 10, // Atualiza a cada 10 metros
        },
        (location) => {
          if (currentLocation && region) {
            const distance = calculateDistance(
              currentLocation.latitude,
              currentLocation.longitude,
              region.latitude,
              region.longitude
            );
            console.log(`Distance to destination: ${distance} km`); // Log de verificação
            if (distance <= 1) {
              triggerNotification();
            }
          }
          setCurrentLocation(location.coords);
        }
      );
      setWatching(watchId);
    }
  };

  const handleLocalizar = async () => {
    if (!destination) {
      setModalVisible2(true);
      return;
    }
  
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
        params: {
          address: destination,
          key: GOOGLE_MAPS_API_KEY,
        },
      });
  
      const { results } = response.data;
  
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location;
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
  
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000); // Animação de 1 segundo
        }
  
        if (currentLocation) {
          const distance = calculateDistance(currentLocation.latitude, currentLocation.longitude, lat, lng);
          console.log(`Distance to destination: ${distance} km`); // Log de verificação
          const duration = await getTravelTime(currentLocation.latitude, currentLocation.longitude, lat, lng);
  
          // Verificar se a distância é menor ou igual a 1 km
          if (distance <= 1) {
            triggerNotification();
          }
        }
      } else {
        setModalVisible3(true);
      }
    } catch (error) {
      setModalVisible4(true);
      console.error(error);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distância em km
    return distance;
  };

  const getTravelTime = async (lat1, lon1, lat2, lon2) => {
    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
        params: {
          origin: `${lat1},${lon1}`,
          destination: `${lat2},${lon2}`,
          key: GOOGLE_MAPS_API_KEY,
        },
      });

      const { routes } = response.data;
      if (routes.length > 0) {
        const duration = routes[0].legs[0].duration.value / 60; // Duração em minutos
        return duration;
      }
    } catch (error) {
      console.error(error);
    }
    return null;
  };

  const triggerNotification = async () => {
    console.log('Triggering notification'); // Adicione este log
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Aviso",
          body: "Você está próximo(a) do seu destino.",
        },
        trigger: {
          seconds: 1, // Notificação após 1 segundo
        },
      });
      console.log('Notification scheduled'); // Adicione este log
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  return (
      <View style={styles.container}>
        {region && (
          <MapView
            style={styles.map}
            ref={mapRef}
            region={region} // Use `region` para inicializar o mapa
            scrollEnabled={false}
            zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
          >
            <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
          </MapView>
        )}
        <View style={styles.overlay}>
          <TextInput
            style={styles.input}
            placeholder="Insira o ponto de destino!"
            value={destination}
            onChangeText={setDestination}
          />
          <TouchableOpacity onPress={handleLocalizar}>
            <Text style={{ textAlign: 'center', marginTop: 10, borderRadius: 40, backgroundColor: 'rgba(39, 59, 245, 0.8)', padding: 10, fontWeight: 'bold', color: 'white' }}>Localizar</Text>
          </TouchableOpacity>
        </View>

          {/* MODAL 1 */}
          <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible1}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible1(!modalVisible);
          }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
              <LinearGradient
                colors={['#00c6ff', '#0083ff']}
                style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Por Favor!</Text>
              </LinearGradient>
                <Text style={styles.modalText}>Precisamos da sua localização para te ajudar!</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible1(false)}>
                  <Text style={styles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* MODAL 2 */}
          <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible2}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible2(!modalVisible);
          }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
              <LinearGradient
                colors={['#00c6ff', '#0083ff']}
                style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Parece que...</Text>
              </LinearGradient>
                <Text style={styles.modalText}>Insira o ponto de destino!</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible2(false)}>
                  <Text style={styles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* MODAL 3 */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible3}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setModalVisible3(!modalVisible3);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#00c6ff', '#0083ff']}
                  style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Que Pena..</Text>
                </LinearGradient>
                <Text style={styles.modalText}>Nenhum resultado foi encontrado para o destino.</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible3(false)}>
                  <Text style={styles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* MODAL 4 */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible4}
            onRequestClose={() => {
              Alert.alert('Modal has been closed.');
              setModalVisible4(!modalVisible4);
            }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <LinearGradient
                  colors={['#00c6ff', '#0083ff']}
                  style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Opa...</Text>
                </LinearGradient>
                <Text style={styles.modalText}>Erro ao localizar o seu destino.</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible4(false)}>
                  <Text style={styles.buttonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    marginTop: 40,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'white',
    height: '30%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    zIndex: 1,
  },
  map: {
    height: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  modalHeader: {
    backgroundColor: '#0083ff',
    width: '100%',
    alignItems: 'center',
    paddingVertical: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 50,
  },
  modalButton: {
    backgroundColor: '#0083ff',
    borderRadius: 10,
    marginBottom: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
});
