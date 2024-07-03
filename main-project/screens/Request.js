import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Icon } from 'react-native-elements';
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const db = getFirestore();

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchRequests = async () => {
      const requestsCollection = collection(db, 'Requests');
      const requestSnapshot = await getDocs(requestsCollection);
      const requestList = requestSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequests(requestList);
    };

    fetchRequests();
  }, []);

  const gotoRequest = (requestId) => {
    navigation.navigate('Process ID Request', { Request_ID: requestId });
  };

  const renderItem = ({ item, index }) => (
    <Animatable.View 
      animation="fadeInUp" 
      delay={index * 100} 
      style={styles.requestItem}
    >
      <TouchableOpacity style={styles.touchable} onPress={() => gotoRequest(item.id)}>
        <LinearGradient
          colors={['#4b7bec', '#3867d6']}
          style={styles.gradientBackground}
        >
          <View style={styles.textContainer}>
            <Text style={styles.requestName}>{item.Name}</Text>
            <Text style={styles.requestDescription}>{item.Description}</Text>
            <Text style={styles.requestId}>Request ID: {item.Request_ID}</Text>
          </View>
          <Icon name="chevron-right" type="material-community" color="#fff" size={30} />
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Animatable.Text 
        animation="fadeInDown" 
        style={styles.title}
      >
        Requests
      </Animatable.Text>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  listContainer: {
    padding: 16,
  },
  requestItem: {
    marginBottom: 16,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  touchable: {
    flex: 1,
  },
  gradientBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  textContainer: {
    flex: 1,
  },
  requestName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  requestDescription: {
    fontSize: 14,
    color: '#e6e6e6',
    marginBottom: 5,
  },
  requestId: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});

export default Requests;
