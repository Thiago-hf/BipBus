import React, { useState} from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Image, TouchableOpacity, Modal } from 'react-native';
import { Divider } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  

  //MODAL
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setModalVisible(true);
      return;
    }
  
    try {
      //Sempre alterar o IP ao trocar de rede - BUILD para produção;
      //OBS: Caso use LocalHost para testes não funcionará corretamente;
      const response = await axios.post('http://10.224.33.157:3000/login', { email, password }); 
      if (response.data.success) {
        navigation.navigate('Principal');
      } else {
        Alert.alert('Erro', response.data.message);
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao conectar ao servidor.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBackground} />
      <View style={styles.container}>
        {/*<Image
          source={require('../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />*/}
        <Text style={styles.title}>BEM VINDO!</Text>
        <Text style={{marginBottom: 80, fontSize: 15, color: 'white', fontWeight: 'bold',
          textAlign: 'center', opacity: 0.5}}>Dê um Bip, já que o Bus, te deixa lá!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleLogin}>
          <Text style={{textAlign: 'center', marginTop: 10, borderRadius: 40, backgroundColor: 'white', padding: 10,
            fontWeight: 'bold', color: 'rgba(39, 59, 245, 0.8)', marginTop: 80}}>Entrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
          <Text style={{textAlign: 'center', marginTop: 10, color: 'white', fontWeight: 'bold'}}>Cadastre-se</Text>
        </TouchableOpacity>

        {/* MODAL */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            setModalVisible(!modalVisible);
          }}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
              <LinearGradient
                colors={['#00c6ff', '#0083ff']}
                style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Opa...</Text>
              </LinearGradient>
                <Text style={styles.modalText}>Preencha os campos corretamente!</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Tente novamente</Text>
                </TouchableOpacity>
              </View>
            </View>
      </Modal>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(39, 59, 245, 0.8)',
    height: '90%',
    marginHo8izontal: 20,
    borderTopLeftRadius: 120,
    position: 'absolute',
    bottom: 0,  // Posicione o container no fundo da tela
    left: 0,
    right: 0,
  },
  /*logo: {
    width: '100%',
    height: 250,
    marginBottom: 20,
  },*/
  title: {
    fontSize: 30,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 255)',
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderLeftColor: 'transparent',
    backgroundColor: 'rgba(255, 255, 255, 255)',
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
