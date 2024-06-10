import React from 'react';
import { View, Text, Modal, Pressable, FlatList, useColorScheme } from 'react-native';
import styles from '../styles';


const PolygonModal = ({ modalVisible, setModalVisible, polygons, polygonNames, setDrawing, calculateArea, handleDeletePolygon, handleSelectPolygon }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  return (
    <Modal visible={modalVisible} transparent={true} animationType="slide">
      <View style={isDarkMode ? styles.modalContainerDark : styles.modalContainer}>
        <Text style={styles.modalTitle}>Shapes</Text>
        <Pressable onPress={() => { setDrawing(true); setModalVisible(false); }}>
          <Text style={styles.buttonText}>Create Area</Text>
        </Pressable>
        <FlatList
          data={polygons}
          renderItem={({ item, index }) => (
            <Pressable onPress={() => handleSelectPolygon(index)} style={isDarkMode ? styles.listItemDark : styles.listItem}>
              <Text style={isDarkMode ? styles.listItemTextDark : styles.listItemText}>{polygonNames[index]} - {calculateArea(item)} SF</Text>
              <Pressable onPress={() => handleDeletePolygon(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </Pressable>
            </Pressable>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
        <Pressable onPress={() => setModalVisible(false)}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
};

export default PolygonModal;
