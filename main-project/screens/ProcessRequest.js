import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { useRoute } from '@react-navigation/native';

const db = getFirestore();

const ProcessRequest = () => {
  const route = useRoute();
  const { Request_ID } = route.params;
  const [request, setRequest] = useState(null);
  const [classId, setClassId] = useState('');

  useEffect(() => {
    const fetchRequestDetails = async () => {
      const requestDoc = doc(db, 'Requests', Request_ID);
      const docSnap = await getDoc(requestDoc);

      if (docSnap.exists()) {
        setRequest(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchRequestDetails();
  }, [Request_ID]);

  const handleSave = async () => {
    const requestDoc = doc(db, 'Requests', Request_ID);
    try {
      await updateDoc(requestDoc, { Class_ID: classId });
      Alert.alert('Success', 'Class ID updated successfully');
    } catch (error) {
      console.error('Error updating document: ', error);
      Alert.alert('Error', 'Failed to update Class ID');
    }
  };

  if (!request) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{request.Name}</Text>

      <Text style={styles.label}>Type:</Text>
      <Text style={styles.value}>{request.Type}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Class ID"
        value={classId}
        onChangeText={setClassId}
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 20,
    backgroundColor: '#fff',
  },
});

export default ProcessRequest;
