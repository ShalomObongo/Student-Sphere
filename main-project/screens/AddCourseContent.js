import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { db, storage } from '../firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

const AddCourseContent = () => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState('');
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const route = useRoute();
  const navigation = useNavigation();
  const { unitID } = route.params;
  const [inputType, setInputType] = useState('file');

  const handleFilePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({});
      if (result.assets && result.assets.length > 0) {
        setIsLoading(true);
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name;
        const fileType = result.assets[0].mimeType;

        const storageRef = ref(storage, `course_files/${fileName}`);
        const response = await fetch(fileUri);
        const blob = await response.blob();

        await uploadBytes(storageRef, blob, { contentType: fileType });

        const downloadURL = await getDownloadURL(storageRef);
        setUrl(downloadURL);
        setFile(fileName);

        if (fileType.startsWith('image/')) {
          setPreviewUrl(downloadURL);
        } else if (fileType === 'application/pdf') {
          setPreviewUrl(`https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(downloadURL)}`);
        } else {
          setPreviewUrl('');
        }

        Alert.alert("Success", "File has been uploaded successfully!");
      }
    } catch (err) {
      console.error("Error picking file: ", err);
      Alert.alert("Error", "Failed to pick or upload the file.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!url) {
      Alert.alert("Error", "Please upload a file first.");
      return;
    }
    
    try {
      setIsLoading(true);
      await addDoc(collection(db, "Topics"), {
        URL: url,
        File: file,
        Name: name,
        Reason: reason,
        unitID: unitID,
        Type: "Extra",
        PreviewUrl: previewUrl,
      });
      Alert.alert("Success", "Course content added successfully!");
      navigation.goBack();
    } catch (error) {
      console.error("Error adding document: ", error);
      Alert.alert("Error", "Failed to add course content.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeIn" style={styles.content}>
          <Text style={styles.title}>Add Course Content</Text>
          
          <View style={styles.inputTypeContainer}>
            <TouchableOpacity
              style={[styles.inputTypeButton, inputType === 'file' && styles.activeInputType]}
              onPress={() => setInputType('file')}
            >
              <Text style={styles.inputTypeText}>File</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.inputTypeButton, inputType === 'url' && styles.activeInputType]}
              onPress={() => setInputType('url')}
            >
              <Text style={styles.inputTypeText}>URL</Text>
            </TouchableOpacity>
          </View>

          {inputType === 'file' ? (
            <TouchableOpacity style={styles.fileButton} onPress={handleFilePick}>
              <Icon name="file-upload" type="material" color="#fff" size={24} />
              <Text style={styles.fileButtonText}>Pick File</Text>
            </TouchableOpacity>
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Enter URL"
              placeholderTextColor="#bbb"
              value={url}
              onChangeText={setUrl}
            />
          )}

          {previewUrl && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewText}>Preview:</Text>
              {previewUrl.startsWith('http') ? (
                <Image source={{ uri: previewUrl }} style={styles.previewImage} resizeMode="contain" />
              ) : (
                <Text style={styles.noPreviewText}>Preview not available for this file type</Text>
              )}
            </View>
          )}
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#bbb"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Reason"
            placeholderTextColor="#bbb"
            value={reason}
            onChangeText={setReason}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Add Content</Text>
          </TouchableOpacity>
        </Animatable.View>
      </ScrollView>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a73e8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '100%',
  },
  fileButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  previewText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  noPreviewText: {
    color: '#fff',
    fontStyle: 'italic',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  inputTypeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeInputType: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  inputTypeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddCourseContent;

