import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

const AddUnit = ({ navigation }) => {
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitDescription, setUnitDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const addUnit = async () => {
    if (!unitName || !unitCode || !unitDescription) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const user = auth.currentUser;
      const timestamp = Date.now();
      const unitID = `${unitCode.toLowerCase()}_${timestamp}`;

      await addDoc(collection(db, 'units'), {
        unitID: unitID,
        name: unitName,
        code: unitCode,
        description: unitDescription,
        teacherId: user.uid,
        createdAt: new Date(),
      });

      setIsLoading(false);
      Alert.alert('Success', 'Unit added successfully');
      navigation.goBack();
    } catch (error) {
      setIsLoading(false);
      console.error('Error adding unit:', error);
      Alert.alert('Error', 'Failed to add unit');
    }
  };

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Animatable.View animation="fadeInUp" style={styles.formContainer}>
            <Text style={styles.title}>Add New Unit</Text>
            <View style={styles.inputContainer}>
              <Icon name="book" type="font-awesome" color="#fff" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Unit Name"
                placeholderTextColor="#bbb"
                value={unitName}
                onChangeText={setUnitName}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="code" type="font-awesome" color="#fff" size={20} style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Unit Code"
                placeholderTextColor="#bbb"
                value={unitCode}
                onChangeText={setUnitCode}
              />
            </View>
            <View style={styles.inputContainer}>
              <Icon name="align-left" type="font-awesome" color="#fff" size={20} style={styles.icon} />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Unit Description"
                placeholderTextColor="#bbb"
                value={unitDescription}
                onChangeText={setUnitDescription}
                multiline
                numberOfLines={4}
              />
            </View>
            <TouchableOpacity style={styles.addButton} onPress={addUnit} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addButtonText}>Add Unit</Text>
              )}
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingVertical: 10,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#2E86C1',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AddUnit;
