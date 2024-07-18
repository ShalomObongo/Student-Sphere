import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import { getFirestore, collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../firebase';
import { RouteProp } from '@react-navigation/native';

const db = getFirestore();

type RootStackParamList = {
  ThreadView: { threadId: string };
  CreateThread: { categoryId: string };
};

const CreateThreadScreen = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CreateThread'>>();
  const categoryId = route.params?.categoryId;

  // Add this useEffect hook to handle missing categoryId
  useEffect(() => {
    if (!categoryId) {
      Alert.alert(
        'Error',
        'Category ID is missing. Please select a category first.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [categoryId, navigation]);

  const handleCreateThread = async () => {
    if (!categoryId) {
      Alert.alert('Error', 'Category ID is missing. Please try again.');
      return;
    }

    if (title.trim() === '' || content.trim() === '') {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'You must be logged in to create a thread.');
        return;
      }

      // Fetch the user's firstName from the 'users' collection
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const firstName = userDoc.exists() ? userDoc.data().firstName : 'Anonymous';

      const threadData = {
        categoryId,
        title,
        content,
        authorId: user.uid,
        authorName: firstName,
        createdAt: new Date(),
        replyCount: 0,
      };
      const docRef = await addDoc(collection(db, 'ForumThreads'), threadData);
      navigation.navigate('ThreadView', { threadId: docRef.id });
    } catch (error) {
      console.error('Error creating thread:', error);
      Alert.alert('Error', 'Failed to create thread. Please try again.');
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <Text style={styles.header}>Create New Thread</Text>
      <TextInput
        style={styles.input}
        placeholder="Thread Title"
        placeholderTextColor="#999"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="Thread Content"
        placeholderTextColor="#999"
        value={content}
        onChangeText={setContent}
        multiline
      />
      <TouchableOpacity style={styles.createButton} onPress={handleCreateThread}>
        <Text style={styles.createButtonText}>Create Thread</Text>
        <Icon name="check" type="material-community" color="#fff" size={24} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 16,
  },
  contentInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  createButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default CreateThreadScreen;