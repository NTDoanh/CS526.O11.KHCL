// InstructionScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

const InstructionScreen = ({ onClose }) => {
  return (
    <View style={styles.container}>
      <ScrollView>
        <Image
          source={require('../image/image-loto.png')}
          style={styles.imageStyle}
        />
        <Text style={styles.title}>Lô Tô Truyền Thống</Text>

        <Text style={styles.titleText}>Hướng dẫn cách chơi trò chơi lô tô</Text>

        <Text style={styles.modalText}>
          Khi bạn bè, gia đình tụ họp đông đủ, để chơi lô tô, trước tiên bạn cần
          chọn ra người làm "cái". Người làm "cái" là người có nhiệm vụ bốc cờ
          lô tô một cách ngẫu nhiên và "hô" (công bố) cho mọi người biết và dò
          theo.
        </Text>

        <Text style={styles.modalText}>
          Số lượng người làm "cái" mỗi một ván cờ chỉ có một nhưng số người chơi
          có thể rất nhiều. Mỗi người chơi có thể mua 1 hoặc hơn các tấm vé để
          dò số.
        </Text>

        <Text style={styles.modalText}>
          Người chơi chỉ cần dò số hay đánh dấu vào tấm vé mình đã mua nếu con
          số được bốc trùng với con số trên tấm vé của mình.
        </Text>

        <Text style={styles.modalText}>
          Nếu người nào may mắn có đủ 5 con số trên tấm vé theo hàng ngang thì
          hãy hô to "kinh" (Tôi thắng rồi) và trở thành người chiến thắng.
        </Text>

        <Text style={styles.modalText}>
          Người làm "cái" sẽ có nhiệm vụ kiểm tra lại các con số trên tấm vé của
          người thắng cuộc xem có đúng hay không. Nếu sai hoặc chưa đủ số sẽ
          tiếp tục ván cờ còn người kêu "kinh" có thể bị phạt (khi đã ra luật
          trước đó). Nếu kết quả đúng thì, người "kinh" sẽ giành chiến thắng và
          được trao thưởng.
        </Text>
      </ScrollView>
      <TouchableOpacity style={styles.hideModalButton} onPress={onClose}>
        <Text style={styles.buttonText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  imageStyle: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
    marginTop: 0,
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalText: {
    fontSize: 12,
    marginBottom: 15,
  },
  titleText: {
    fontWeight: 'bold', // Đây là dòng mới để in đậm
    fontSize: 14, // Tăng kích thước chữ
    marginBottom: 15,
    textAlign: 'center',
  },
  hideModalButton: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonText: {
    color: 'white',
  },
});

export default InstructionScreen;
