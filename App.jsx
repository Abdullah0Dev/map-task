import React, { useState, useRef } from 'react';
import { View, Text, Button, Modal, StyleSheet, TouchableOpacity, FlatList, TextInput, Pressable } from 'react-native';
import MapView, { Polygon, Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Ionicons';
import * as turf from '@turf/turf';

const AreaList = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [polygons, setPolygons] = useState([]);
  const [currentPolygon, setCurrentPolygon] = useState([]);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [polygonNames, setPolygonNames] = useState([]);
  const [selectedPolygon, setSelectedPolygon] = useState(null);
  const mapRef = useRef(null);

  const handleMapPress = (e) => {
    if (!drawing) return;
    setCurrentPolygon([...currentPolygon, e.nativeEvent.coordinate]);
  };

  const handleFinishPolygon = () => {
    setNameModalVisible(true);
  };

  const handleSavePolygon = () => {
    setPolygons([...polygons, currentPolygon]);
    setPolygonNames([...polygonNames, currentName]);
    setCurrentPolygon([]);
    setCurrentName('');
    setDrawing(false);
    setNameModalVisible(false);
  };

  const handleDeletePolygon = (index) => {
    const newPolygons = polygons.filter((_, i) => i !== index);
    const newPolygonNames = polygonNames.filter((_, i) => i !== index);
    setPolygons(newPolygons);
    setPolygonNames(newPolygonNames);
    setSelectedPolygon(null);
  };

  const handleSelectPolygon = (index) => {
    const polygon = polygons[index];
    if (mapRef.current) {
      const coordinates = polygon;
      const latitudes = coordinates.map(coord => coord.latitude);
      const longitudes = coordinates.map(coord => coord.longitude);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      const latitudeDelta = maxLat - minLat + 0.01;
      const longitudeDelta = maxLng - minLng + 0.01;

      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLng,
        latitudeDelta,
        longitudeDelta,
      });
    }
    setSelectedPolygon(index);
    setModalVisible(false);
  };

  const calculatePolygonCenter = (coordinates) => {
    const latitudes = coordinates.map(coord => coord.latitude);
    const longitudes = coordinates.map(coord => coord.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const midLat = (minLat + maxLat) / 2;
    const midLng = (minLng + maxLng) / 2;
    return { latitude: midLat, longitude: midLng };
  };

  const calculateArea = (polygon) => {
    const coordinates = polygon.map(coord => [coord.longitude, coord.latitude]);
    coordinates.push(coordinates[0]); // Close the polygon by adding the first coordinate at the end
    const turfPolygon = turf.polygon([coordinates]);
    const areaInSquareMeters = turf.area(turfPolygon);
    const areaInSquareFeet = areaInSquareMeters * 10.7639; // Convert square meters to square feet
    return areaInSquareFeet.toFixed(2); // Return the area rounded to 2 decimal places
  };
 
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        onPress={handleMapPress}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      >
        {polygons.map((polygon, index) => (
          <React.Fragment key={index}>
            <Polygon
              coordinates={polygon}
      Z        strokeColor={selectedPolygon === index ? "#FFD700" : "#F00"}
              fillColor={selectedPolygon === index ? "rgba(255,215,0,0.5)" : "rgba(255,0,0,0.5)"}
            />
            <Marker
              coordinate={calculatePolygonCenter(polygon)}
              title={polygonNames[index]}
            />
          </React.Fragment>
        ))}
        {currentPolygon.length > 0 && (
          <Polygon coordinates={currentPolygon} strokeColor="#00F" fillColor="rgba(0,0,255,0.3)" />
        )}
      </MapView>
      <TouchableOpacity style={styles.icon} onPress={() => setModalVisible(true)}>
        <Icon name="list" size={30} color="black" />
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View
        
          style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Shapes</Text>
          {/* <Button title="Create Area"/> */}
          <Pressable onPress={() => { setDrawing(true); setModalVisible(false); }}  >
                    <Text className='text-white bg-blue-600 text-lg  font-semibold py-1 px-3 rounded-lg'>Create Area</Text>
                  </Pressable>
          <FlatList
            data={polygons}
            renderItem={({ item, index }) => (
              <Pressable   onPress={() => handleSelectPolygon(index)} style={styles.listItem}>
                <Text style={styles.listItemText}>{polygonNames[index]} - {calculateArea(item)} SF</Text>
                <View>
                  <Pressable onPress={() => handleDeletePolygon(index)} >
                    <Text className='text-white bg-red-500 text-lg mt-1 font-semibold py-1 px-3 rounded-xl'>Delete</Text>
                  </Pressable>
                </View>
              </Pressable>
            )}
            keyExtractor={(item, index) => index.toString()}
          />
          {/* <Button title="Close" /> */}
          <Pressable onPress={() => setModalVisible(false)}>
            <Text className='text-white mb-3 bg-blue-500 text-lg  font-semibold py-1 px-7 rounded-xl'>Close</Text>
          </Pressable>
        </View>
      </Modal>
      {drawing && (
        <TouchableOpacity style={styles.finishButton} onPress={handleFinishPolygon}>
          <Text style={styles.finishButtonText}>Finished</Text>
        </TouchableOpacity>
      )}
      <Modal visible={nameModalVisible} transparent={true} animationType="slide">
        <View style={styles.nameModalContainer}>
          <Text style={styles.modalTitle}>Name Your Area</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Area Name"
            value={currentName}
            onChangeText={setCurrentName}
          />
          <Pressable onPress={handleSavePolygon}>
            <Text className='text-white bg-blue-500 text-lg  font-semibold py-1 px-7 rounded-xl'>Save</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  icon: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 50,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'white',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 10,
    marginVertical: 5,
    width: '90%',
    alignSelf: 'center',
    borderRadius: 5,
    flexWrap: 'wrap'
  },
  listItemText: {
    fontSize: 16,
  },
  finishButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  finishButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  nameModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  textInput: {
    height: 45,
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    marginBottom: 20,
    width: '80%',
    borderRadius: 7,
  },
});

export default AreaList;
