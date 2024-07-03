import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Icon } from 'react-native-elements';

const db = getFirestore();

const Requests = () => {
  const [requests, setRequests] = useState([]);

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

  const renderItem = ({ item }) => (
    <View style={styles.requestItem}>
      <TouchableOpacity style={styles.touchable}>
        <View style={styles.textContainer}>
          <Text style={styles.requestName}>{item.Name}</Text>
          <Text style={styles.requestDescription}>{item.Description}</Text>
        </View>
        <Icon name="arrow-right-circle" type="material-community" color="#4b7bec" size={30} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  requestItem: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  touchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  requestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  requestDescription: {
    fontSize: 16,
    color: '#666',
  },
});

export default Requests;
