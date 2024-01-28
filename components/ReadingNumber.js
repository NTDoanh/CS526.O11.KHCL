//ReadingNumber
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TouchableWithoutFeedback,
  TextInput,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import soundAssets from './soundAssets';
import RandomTable from './RTicket';

const totalNumbers = 90; // Tổng số lượng số trong game lô tô
// Trộn mảng sử dụng thuật toán Fisher-Yates
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

const ReadingNumber = ({ onBack }) => {
  const [calledNumbers, setCalledNumbers] = useState([]);
  const [currentNumber, setCurrentNumber] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [callInterval, setCallInterval] = useState(3000);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSoundPlaying, setIsSoundPlaying] = useState(false);
  const [isBackModalVisible, setIsBackModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [isRandomTableVisible, setIsRandomTableVisible] = useState(false);
  const [checkStatus, setCheckStatus] = useState(Array(5).fill('unknown'));
  const [checkNumbers, setCheckNumbers] = useState(Array(5).fill(null));
  const [table, setTable] = useState([]); // State for the table
  const [markedCells, setMarkedCells] = useState([]); // State for marked cells
  const [completedRows, setCompletedRows] = useState([]);
  const intervalRef = useRef();
  const availableNumbers = useRef(
    Array.from({ length: totalNumbers }, (_, i) => i + 1)
  );
  shuffleArray(availableNumbers.current);

  const handleRowCompletion = (numbers) => {
    setCompletedRows([numbers]); // Luôn cập nhật với hàng mới nhất
  };
  const playSound = async (number) => {
    const soundObject = new Audio.Sound();
    try {
      setIsSoundPlaying(true);
      await soundObject.loadAsync(soundAssets[number]);
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          soundObject.unloadAsync();
          setIsSoundPlaying(false);
          if (isPlaying && availableNumbers.current.length > 0) {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(getRandomNumber, callInterval);
          }
        }
      });
    } catch (error) {
      console.error(
        `Không thể tải hoặc phát âm thanh cho số ${number}:`,
        error
      );
      setIsSoundPlaying(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || isSoundPlaying) {
      clearInterval(intervalRef.current);
      return;
    }
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(getRandomNumber, callInterval);
  }, [callInterval, isPlaying, isSoundPlaying]);

  const toggleRandomTable = () => {
    setIsRandomTableVisible(!isRandomTableVisible);
  };
  const togglePlay = () => {
    const shouldPlay = !isPlaying;
    setIsPlaying(shouldPlay);
    if (shouldPlay && !isSoundPlaying) {
      getRandomNumber();
      intervalRef.current = setInterval(getRandomNumber, callInterval);
    } else {
      clearInterval(intervalRef.current);
    }
  };

  const getRandomNumber = () => {
    if (availableNumbers.current.length === 0) {
      if (isPlaying) {
        alert('Tất cả số đã được gọi!');
        setIsPlaying(false);
        clearInterval(intervalRef.current);
      }
      return;
    }
    if (isSoundPlaying) {
      return;
    }
    const randomNumber = availableNumbers.current.shift();
    setCurrentNumber(randomNumber);
    setCalledNumbers((prev) => [...prev, randomNumber]);
    playSound(randomNumber);
  };

  const resetGame = () => {
    setCalledNumbers([]);
    setCurrentNumber(null);
    setIsPlaying(false);
    setIsSoundPlaying(false);
    clearInterval(intervalRef.current);
    shuffleArray(availableNumbers.current);
  };

  const renderNumber = ({ item }) => {
    let backgroundColor = calledNumbers.includes(item)
      ? item === currentNumber
        ? 'green'
        : 'red'
      : 'black';
    return (
      <View style={[styles.numberContainer, { backgroundColor }]}>
        <Text style={styles.number}>{item}</Text>
      </View>
    );
  };

  const handleIntervalChange = (newInterval) => {
    setCallInterval(newInterval);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const confirmBack = () => {
    setIsBackModalVisible(false);
    onBack();
  };

  const confirmReset = () => {
    resetGame();
    setIsResetModalVisible(false);
  };
  const handleCheckPress = () => {
    setIsCheckMode(!isCheckMode);
  };
  const handleNumberInput = (text, index) => {
    let newNumbers = [...checkNumbers];
    let newStatus = [...checkStatus];

    newNumbers[index] = text;
    setCheckNumbers(newNumbers);

    // Automatically check if the number is in the calledNumbers
    newStatus[index] = calledNumbers.includes(parseInt(text))
      ? 'called'
      : 'notCalled';
    setCheckStatus(newStatus);
  };
  const resetCheckMode = () => {
    setCheckNumbers(Array(5).fill(''));
    setCheckStatus(Array(5).fill('unknown'));
    setIsCheckMode(false);
  };
  const handleBackPress = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current);
    setIsBackModalVisible(true);
  };

  const handleResetPress = () => {
    setIsResetModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <FontAwesome name="arrow-left" size={30} color="#4CAF50" />
        </TouchableOpacity>
        <Text style={styles.title}>Số Đã Ra</Text>
      </View>

      <FlatList
        data={Array.from({ length: totalNumbers }, (_, index) => index + 1)}
        renderItem={renderNumber}
        keyExtractor={(item) => item.toString()}
        numColumns={9}
        style={styles.numbersContainer}
      />

      <TouchableOpacity
        style={styles.clockButton}
        onPress={() => setIsModalVisible(true)}>
        <FontAwesome5 name="clock" size={24} color="white" />
      </TouchableOpacity>
      {/* Hiển thị các số hoàn thành */}
      {completedRows.map((row, index) => (
        <View key={index} style={styles.completedRow}>
          <Text style={styles.completedRowText}>
            {'Hàng đã hoàn thành: ' + row.join(', ')}
          </Text>
        </View>
      ))}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={closeModal}>
        <TouchableWithoutFeedback onPress={closeModal}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>
                  Thời gian gọi số hiện tại: {callInterval / 1000}s
                </Text>
                <Picker
                  selectedValue={callInterval}
                  style={styles.picker}
                  onValueChange={handleIntervalChange}>
                  <Picker.Item label="1s" value={1000} />
                  <Picker.Item label="2s" value={2000} />
                  <Picker.Item label="3s" value={3000} />
                  <Picker.Item label="4s" value={4000} />
                  <Picker.Item label="5s" value={5000} />
                  <Picker.Item label="7s" value={7000} />
                </Picker>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Check Mode Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCheckMode}
        onRequestClose={resetCheckMode}>
        <View style={styles.modalOverlay}>
          <View style={styles.checkModeContainer}>
            <Text style={styles.checkModeText}>Nhập 5 số cần kiểm tra:</Text>
            <View style={styles.checkNumbersContainer}>
              {checkNumbers.map((number, index) => (
                <TextInput
                  key={index}
                  style={[
                    styles.numberInput,
                    checkStatus[index] === 'called'
                      ? styles.numberInputCalled
                      : checkStatus[index] === 'notCalled'
                      ? styles.numberInputNotCalled
                      : {},
                  ]}
                  keyboardType="numeric"
                  maxLength={2}
                  onChangeText={(text) => handleNumberInput(text, index)}
                  value={number}
                />
              ))}
            </View>
            <TouchableOpacity
              style={styles.closeCheckModeButton}
              onPress={resetCheckMode}>
              <Text style={styles.checkModeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal xác nhận khi nhấn nút Quay lại */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isBackModalVisible}
        onRequestClose={() => setIsBackModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsBackModalVisible(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Quay lại là mất hết đó...</Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={confirmBack}>
                    <Text style={styles.checkText}>Dõ dàng</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsBackModalVisible(false)}>
                    <Text style={styles.checkText}>Giỡn á</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal xác nhận khi nhấn nút Reset */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isResetModalVisible}
        onRequestClose={() => setIsResetModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsResetModalVisible(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Muốn reset sao? Thật sự?</Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={confirmReset}>
                    <Text style={styles.checkText}>OK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsResetModalVisible(false)}>
                    <Text style={styles.checkText}>Nah...</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.footer}>
        {/* Nút "Giấy dò" */}
        <TouchableOpacity
          style={[styles.button, styles.ticketButton]}
          onPress={toggleRandomTable} // Toggle the visibility of RandomTable
        >
          <FontAwesome name="file-text-o" size={30} color="#87CEFA" />
          <Text style={styles.buttonText}>Giấy dò</Text>
        </TouchableOpacity>
        {/* RandomTable Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isRandomTableVisible}
          onRequestClose={toggleRandomTable}>
          <View style={styles.modalOverlay}>
            <View style={styles.randomTableModal}>
              <RandomTable
                onBack={toggleRandomTable}
                table={table}
                setTable={setTable}
                markedCells={markedCells}
                setMarkedCells={setMarkedCells}
                onRowComplete={handleRowCompletion}
              />
            </View>
          </View>
        </Modal>
        {/* Nút "Play/Pause" */}
        <TouchableOpacity
          style={[styles.button, styles.playButton]}
          onPress={togglePlay}>
          {isPlaying ? (
            <FontAwesome5 name="stop" size={25} color="#87CEFA" />
          ) : (
            <FontAwesome5 name="play" size={40} color="#87CEFA" />
          )}
        </TouchableOpacity>
        {/* Nút "Check" */}
        <TouchableOpacity
          style={[styles.button, styles.checkButton]}
          onPress={handleCheckPress}>
          <FontAwesome name="search" size={30} color="#87CEFA" />
          <Text style={styles.buttonText}>Check</Text>
        </TouchableOpacity>
        {/* Nút "Reset" */}
        <TouchableOpacity
          style={[styles.button, styles.resetButton]}
          onPress={handleResetPress}>
          <FontAwesome name="undo" size={30} color="#87CEFA" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 80,
    marginBottom: 30,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#FFF', // Màu nền cho footer
    borderTopWidth: 2,
    borderTopColor: '#87CEFA', // Đường viền phân cách footer với nội dung phía trên
  },
  backButton: {
    position: 'absolute',
    left: 40,
    top: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 50,
  },
  numbersContainer: {
    marginBottom: 20,
  },
  numberContainer: {
    width: 30,
    height: 30,
    margin: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  number: {
    color: 'white',
  },
  button: {
    flex: 1, // Đảm bảo rằng các nút có cùng độ rộng
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 5, // Khoảng cách giữa các nút
  },
  checkButton: {
    marginBottom: 10,
    marginLeft: 15,
  },
  ticketButton: {
    // Đặc điểm cho nút "Giấy dò"
    marginLeft: 35, // Khoảng cách bên phải cho đều với các nút khác
    marginRight: 35,
    marginBottom: 10,
  },
  playButton: {
    // Đặc điểm cho nút "Play/Pause"
    marginHorizontal: 8, // Khoảng cách lớn hơn bên cạnh để tạo ra không gian giữa các nút
    marginBottom: 20,
    marginLeft: 10,
  },

  resetButton: {
    //Đặc điểm cho nút "Gọi lại"
    marginLeft: 10, // Khoảng cách bên trái cho đều với các nút khác
    marginBottom: 10,
  },
  buttonText: {
    fontSize: 14,
    color: '#87CEFA', // Màu sắc cho văn bản
    marginTop: 5,
    textAlign: 'center', // Căn giữa văn bản trong nút
  },
  modalText: {
    fontSize: 18,
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền mờ cho modal
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '80%', // Đặt chiều rộng của modal
    maxWidth: 300, // Đặt chiều rộng tối đa để tránh quá lớn trên các thiết bị lớn
    alignSelf: 'center', // Đảm bảo rằng modal luôn ở giữa theo chiều ngang
  },
  clockButton: {
    backgroundColor: '#2196F3', // Màu nền xanh dương
    padding: 10, // Đệm xung quanh nút
    borderRadius: 50, // Làm tròn viền để tạo hình tròn
    width: 50, // Chiều rộng của nút
    height: 50, // Chiều cao của nút
    justifyContent: 'center', // Căn giữa nội dung theo chiều dọc
    alignItems: 'center', // Căn giữa nội dung theo chiều ngang
    position: 'absolute', // Định vị tuyệt đối
    right: 30, // Khoảng cách từ cạnh phải
    top: 70, // Khoảng cách từ cạnh trên
    shadowColor: '#000', // Màu bóng
    shadowOffset: { width: 0, height: 2 }, // Vị trí bóng
    shadowOpacity: 0.25, // Độ trong suốt của bóng
    shadowRadius: 3.84, // Bán kính bóng
    elevation: 5, // Độ cao (cho Android)
  },
  confirmationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: '#4CAF50', // Màu xanh lá
    paddingHorizontal: 20, // Padding ngang
    paddingVertical: 10, // Padding dọc
    borderRadius: 5, // Làm tròn viền
    minWidth: 100, // Chiều rộng tối thiểu
    marginRight: 10, // Khoảng cách giữa các nút
  },
  cancelButton: {
    backgroundColor: '#f44336', // Màu đỏ
    paddingHorizontal: 20, // Padding ngang
    paddingVertical: 10, // Padding dọc
    borderRadius: 5, // Làm tròn viền
    minWidth: 100, // Chiều rộng tối thiểu
  },
  checkText: {
    color: 'white',
    fontSize: 16,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  checkModeContainer: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkNumbersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  numberInput: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ccc',
    textAlign: 'center',
    fontSize: 24,
    marginHorizontal: 5,
    backgroundColor: '#F5F5F5',
  },
  numberInputCalled: {
    color: 'green', // Background color for called numbers
  },
  numberInputNotCalled: {
    color: 'red', // Background color for not called numbers
  },
  closeCheckModeButton: {
    marginTop: 10,
    backgroundColor: '#FF4136',
    borderRadius: 5,
    padding: 10,
  },
  checkModeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  completedRow: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#eef',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  completedRowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ReadingNumber;
