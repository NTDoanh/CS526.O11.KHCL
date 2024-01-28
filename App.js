import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Modal,
} from 'react-native';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import InstructionScreen from './components/InstructionScreen';
import ReadingNumber from './components/ReadingNumber';
import Ticket from './components/Ticket'; // Make sure the import path is correct

export default function App() {
  const [modalVisible, setModalVisible] = useState(false);
  const [showReadingNumber, setShowReadingNumber] = useState(false);
  const [showTicket, setShowTicket] = useState(false); // New state for Ticket screen

  const handleBack = () => {
    setShowReadingNumber(false);
    setShowTicket(false); // Reset the state to show the main screen
  };

  let content;
  if (showReadingNumber) {
    content = <ReadingNumber onBack={handleBack} />;
  } else if (showTicket) {
    content = <Ticket onBack={handleBack} />; // Pass the handleBack if you want to use it in the Ticket component
  } else {
    content = (
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Image
          source={require('./image/image-loto.png')} // Make sure the path to your image is correct
          style={styles.image}
        />
        <Text style={styles.title}>Lô Tô Truyền Thống</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowReadingNumber(true)}>
          <FontAwesome name="volume-up" size={20} color="black" />
          <Text style={styles.buttonText}>Đọc Số</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setShowTicket(true)}>
          <MaterialIcons name="article" size={20} color="black" />
          <Text style={styles.buttonText}>Phiếu Dò</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}>
          <FontAwesome name="info-circle" size={20} color="black" />
          <Text style={styles.buttonText}>Hướng dẫn</Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}>
          <InstructionScreen onClose={() => setModalVisible(false)} />
        </Modal>
      </ScrollView>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 20,
  },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'contain',
    marginTop: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 50,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7E7E7',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 5,
    width: '50%',
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
  },
});
