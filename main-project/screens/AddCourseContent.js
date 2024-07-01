import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';

const db = getFirestore();

const AddCourseContent = () => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const { sbj_id } = route.params;

  const handleSubmit = async () => {
    try {
      await addDoc(collection(db, "Topics"), {
        URL: url,
        File: file,
        Name: name,
        Reason: reason,
        sbj_id: sbj_id,
        Type: "Extra"
      });
      Alert.alert("Success", "Course content added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Failed to add course content.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Course Content</Text>
      <TextInput
        style={styles.input}
        placeholder="URL"
        value={url}
        onChangeText={setUrl}
      />
      <TextInput
        style={styles.input}
        placeholder="File"
        value={file}
        onChangeText={setFile}
      />
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Reason"
        value={reason}
        onChangeText={setReason}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Content</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#444',
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddCourseContent;
