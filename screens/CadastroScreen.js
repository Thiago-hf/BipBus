// screens/CadastroScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';

export default function CadastroScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [modalVisible3, setModalVisible3] = useState(false);



  const handleCadastro = async () => {
    if (!email || !password || !confirmPassword) {
      setModalVisible1(true);
      return;
    }

    if (password !== confirmPassword) {
      setModalVisible2(true);
      return;
    }

    try {
      const checkResponse = await axios.post('http://10.224.33.157:3000/check-email', { email });
      if (!checkResponse.data.available) {
        setModalVisible3(true);
        return;
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao conectar ao servidor para verificar o email.');
      return; // Interromper a função se ocorrer um erro na verificação do email
    }
  
    // Continuar com o cadastro se o email não estiver em uso
    try {
      const response = await axios.post('http://10.224.33.157:3000/cadastro', { email, password });
      if (!response.data.success) {
        Alert.alert('Erro', response.data.message);
      } else {
        Alert.alert('Sucesso', 'Cadastro realizado com sucesso!');
        // Navegar para outra tela ou fazer algo mais após o sucesso
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro ao conectar ao servidor durante o cadastro.');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topBackground} />
      <View style={styles.container}>
        <Text style={styles.title}>CRIE SUA CONTA!</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Verificar Senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={handleCadastro}>
          <Text style={{textAlign: 'center', marginTop: 10, borderRadius: 40, backgroundColor: 'white', padding: 10,
            fontWeight: 'bold', color: 'rgba(39, 59, 245, 0.8)', marginTop: 80}}>Cadastrar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={{textAlign: 'center', marginTop: 10, color: 'white'}}>Ja tem uma conta? <Text style={{fontWeight: 'bold'}}>Entre!</Text></Text>
        </TouchableOpacity>

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
                <Text style={styles.modalText}>Preencha todos os campos!</Text>
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
                <Text style={styles.modalText}>As senhas não coincidem</Text>
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
                <Text style={styles.modalText}>Parece que ja temos este email cadastrado!</Text>
                <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible3(false)}>
                  <Text style={styles.buttonText}>Tentar Novamente</Text>
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
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 80,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 255)',
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