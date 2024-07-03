import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { db, storage } from '../firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddCourseContent = () => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const route = useRoute();
  const navigation = useNavigation();
  const { sbj_id } = route.params;

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.type === 'success') {
        const fileUri = result.uri;
        const fileName = result.name;
        const fileType = result.mimeType;

        console.log('Selected file:', fileName);

        const storageRef = ref(storage, `course_files/${fileName}`);
        const response = await fetch(fileUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob, { contentType: fileType });

        const downloadURL = await getDownloadURL(storageRef);
        console.log('Download URL:', downloadURL); 
        setUrl(downloadURL);
        setFile(fileName);  // Ensure file state is updated correctly
        Alert.alert("File uploaded", "File has been uploaded successfully!");
      }
    } catch (err) {
      console.error("Error picking file: ", err);
      Alert.alert("Error", "Failed to pick or upload the file.");
    }
  };

  const handleSubmit = async () => {
    if (!url) {
      Alert.alert("Error", "Please upload a file first.");
      return;
    }
    
    try {
      console.log('File to be added:', file); 
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
      <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
        <Text style={styles.fileButtonText}>Pick File</Text>
      </TouchableOpacity>
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
  fileButton: {
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
