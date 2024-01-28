//RandomTable
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Button,
  TouchableWithoutFeedback,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Audio } from 'expo-av'; // Import thư viện âm thanh
import {
  ticket1,
  ticket2,
  ticket3,
  ticket4,
  ticket5,
  ticket6,
} from '../ticket.js';

const RandomTable = ({
  onBack,
  table,
  setTable,
  markedCells,
  setMarkedCells,
  onRowComplete,
}) => {
  const colorList = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF3380'];
  const [soundObject, setSoundObject] = useState(new Audio.Sound()); // Tạo biến âm thanh
  const [isBackModalVisible, setIsBackModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);
  const [isNewTableModalVisible, setIsNewTableModalVisible] = useState(false);
  const recentTicketIndicesRef = useRef([]);

  const [sound, setSound] = useState();
  useEffect(() => {
    initializeTable();
    loadSound();
    // Unload sound khi component unmount
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadSound = async () => {
    try {
      const { sound: loadedSound } = await Audio.Sound.createAsync(
        require('../sound/another/win.mp3') // Thay thế với đường dẫn thực tế của file âm thanh
      );
      setSound(loadedSound);
    } catch (error) {
      console.error('Không thể tải file âm thanh', error);
    }
  };
  const handleNewTablePress = () => {
    setIsNewTableModalVisible(true);
  };

  // Hàm để phát âm thanh
  const playSound = async () => {
    try {
      await sound.setPositionAsync(0); // Đặt lại vị trí âm thanh để phát từ đầu
      await sound.playAsync();
    } catch (error) {
      console.error('Không thể phát âm thanh', error);
    }
  };
  const fisherYatesShuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const allTickets = [ticket1, ticket2, ticket3, ticket4, ticket5, ticket6];

  const selectNewTicket = () => {
    let selectedIndex;
    do {
      selectedIndex = Math.floor(Math.random() * allTickets.length);
    } while (recentTicketIndicesRef.current.includes(selectedIndex));

    recentTicketIndicesRef.current.push(selectedIndex);
    if (recentTicketIndicesRef.current.length > 2) {
      recentTicketIndicesRef.current.shift(); // Loại bỏ bảng cũ nhất nếu đã chọn hơn 2 bảng
    }

    return allTickets[selectedIndex];
  };

  const ticket = selectNewTicket();

  const determineHiddenColumnsForEachRow = () => {
    let hiddenColumnTable = [];
    for (let i = 0; i < ticket.length; i += 9) {
      let row = ticket.slice(i, i + 9);
      let hiddenColumns = row
        .map((value, index) => (value === 0 ? index : null))
        .filter((v) => v !== null);
      hiddenColumnTable.push(hiddenColumns);
    }
    console.log(hiddenColumnTable);
    return hiddenColumnTable;
  };

  const initializeTable = () => {
    let newTable = Array.from({ length: 9 }, () => new Array(9));

    for (let col = 0; col < 9; col++) {
      let colNumbers;
      if (col === 8) {
        colNumbers = Array.from(
          { length: 9 },
          (_, index) => col * 10 + index + 1 + (index === 8 ? 1 : 0)
        );
      } else {
        colNumbers = Array.from(
          { length: 9 },
          (_, index) => col * 10 + index + 1
        );
      }
      colNumbers = fisherYatesShuffle(colNumbers);

      for (let row = 0; row < 9; row++) {
        if (!newTable[row]) {
          newTable[row] = [];
        }
        newTable[row][col] = { number: colNumbers[row], isVisible: true };
      }
    }

    const randomColor = colorList[Math.floor(Math.random() * colorList.length)];

    let hiddenColumnTable = determineHiddenColumnsForEachRow();

    newTable = newTable.map((row, rowIndex) => {
      hiddenColumnTable[rowIndex].forEach((colIndex) => {
        row[colIndex].isVisible = false;
        row[colIndex].color = randomColor;
      });
      return row;
    });

    setTable(newTable);
  };

  const resetTable = () => {
    setMarkedCells([]); // Reset các ô đã đánh dấu
  };

  const handleCellPress = async (rowIndex, colIndex) => {
    const updatedMarkedCells = [...markedCells];
    const cell = table[rowIndex][colIndex];
    if (!cell.isVisible) return;

    const cellKey = `${rowIndex}-${colIndex}`;
    if (updatedMarkedCells.includes(cellKey)) {
      const index = updatedMarkedCells.indexOf(cellKey);
      updatedMarkedCells.splice(index, 1);
    } else {
      updatedMarkedCells.push(cellKey);
    }

    const rowCells = table[rowIndex];
    const isRowComplete = rowCells.every(
      (cell) =>
        !cell.isVisible ||
        updatedMarkedCells.includes(`${rowIndex}-${rowCells.indexOf(cell)}`)
    );

    if (isRowComplete) {
      try {
        await soundObject.playAsync();
        // Thêm mã thông báo ở đây (nếu cần)
      } catch (error) {
        console.error('Không thể phát âm thanh', error);
      }
    }

    setMarkedCells(updatedMarkedCells);

    const markedInRow = updatedMarkedCells.filter((cell) =>
      cell.startsWith(`${rowIndex}-`)
    ).length;
    if (markedInRow === 5) {
      await playSound();
      Alert.alert('Waooo!', 'Hên dữ vậy sao');
      const completedNumbers = table[rowIndex]
        .filter((cell) => cell.isVisible)
        .map((cell) => cell.number);
      onRowComplete(completedNumbers);
    }
  };
  const handleBackPress = () => {
    // Just call the onBack function provided by the parent component to hide the RandomTable
    onBack();
  };

  // Hàm mở modal xác nhận reset
  const handleResetPress = () => {
    setIsResetModalVisible(true);
  };

  // Hàm xử lý việc quay lại sau khi xác nhận
  const confirmBack = () => {
    setIsBackModalVisible(false);
    onBack();
  };

  // Hàm xử lý việc reset sau khi xác nhận
  const confirmReset = () => {
    resetTable();
    setIsResetModalVisible(false);
  };
  const handleNewTableConfirmation = () => {
    // Logic to create a new table
    initializeTable();
    setMarkedCells([]);
    setIsNewTableModalVisible(false);
  };
  return (
    <View style={styles.container}>
      {table.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, colIndex) => (
            <TouchableOpacity
              key={colIndex}
              style={[
                styles.cell,
                !cell.isVisible && { backgroundColor: cell.color }, // Đảm bảo rằng đây là màu sắc duy nhất được áp dụng cho ô bị ẩn
                markedCells.includes(`${rowIndex}-${colIndex}`) &&
                  cell.isVisible &&
                  styles.markedCell,
              ]}
              onPress={() => handleCellPress(rowIndex, colIndex)}
              activeOpacity={cell.isVisible ? 0.5 : 1} // Đặt độ mờ khi nhấn chỉ khi ô là hiển thị
            >
              <Text
                style={[
                  styles.cellText,
                  markedCells.includes(`${rowIndex}-${colIndex}`) &&
                    styles.markedCellText,
                ]}>
                {cell.isVisible ? cell.number : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      <View style={styles.containerButton}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <FontAwesome name="arrow-left" size={30} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.newTableButton}
          onPress={() => setIsNewTableModalVisible(true)}>
          <FontAwesome name="plus-square" size={30} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPress}>
          <FontAwesome name="undo" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal for New Table */}
      <Modal
        transparent={true}
        visible={isNewTableModalVisible}
        animationType="slide"
        onRequestClose={() => setIsNewTableModalVisible(false)}>
        <TouchableWithoutFeedback
          onPress={() => setIsNewTableModalVisible(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Muốn tạo phiếu dò mới?</Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleNewTableConfirmation}>
                    <Text style={styles.buttonText}>Đúng vậy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsNewTableModalVisible(false)}>
                    <Text style={styles.buttonText}>Nahhh</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Modal for confirming back action */}
      <Modal
        transparent={true}
        visible={isBackModalVisible}
        animationType="slide"
        onRequestClose={() => setIsBackModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setIsResetModalVisible(false)}>
          <View style={styles.centeredView}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Muốn thoát sao? Chắc chưa?</Text>
                <View style={styles.confirmationButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={confirmBack}>
                    <Text style={styles.buttonText}>Chắc</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsBackModalVisible(false)}>
                    <Text style={styles.buttonText}>Ở lại</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal for confirming reset action */}
      <Modal
        transparent={true}
        visible={isResetModalVisible}
        animationType="slide"
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
                    <Text style={styles.buttonText}>OK</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsResetModalVisible(false)}>
                    <Text style={styles.buttonText}>Nah...</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    right: 60,
    top: 0,
  },
  newTableButton: {
    position: 'absolute',
    left: 20, // Adjust this value as needed
    top: 0,
  },
  containerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  resetButton: {
    position: 'absolute',
    right: 10,
    top: 0,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#000000',
  },
  cell: {
    width: 36,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
    borderWidth: 0.5,
    borderColor: '#000000',
  },
  cellText: {
    fontSize: 16,
    color: '#000',
  },
  markedCell: {
    backgroundColor: '#708090', // Màu nền đen
    borderRadius: 0, // Bỏ borderRadius nếu bạn không muốn ô tròn
  },
  markedCellText: {
    color: '#FFFFFF', // Màu chữ trắng
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
  modalText: {
    fontSize: 18,
    alignItems: 'center',
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    alignItems: 'center',
  },
});

export default RandomTable;
