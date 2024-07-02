import React, { useState } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

// Component for resetting the password
const ResetPwd = () => {
  // State variables to manage password visibility and input values
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to toggle the visibility of the password
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Function to handle the password reset process
  const handleResetPassword = () => {
    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    setIsLoading(true);
    // Get the current user and their credentials
    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, oldPassword);

    // Reauthenticate the user with their old password
    reauthenticateWithCredential(user, credential)
      .then(() => {
        // Update the password with the new password
        updatePassword(user, newPassword)
          .then(() => {
            setIsLoading(false);
            Alert.alert('Success', 'Password changed successfully');
          })
          .catch((error) => {
            setIsLoading(false);
            Alert.alert('Error', error.message);
          });
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert('Error', error.message);
      });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <View style={styles.container}>
        <Text style={styles.title}>Change password</Text>

        {/* Input field for old password */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter old password"
            secureTextEntry={!showPassword}
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>

        {/* Input field for new password */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>

        {/* Input field to confirm new password */}
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>

        {/* Button to trigger password reset */}
        <TouchableOpacity 
          style={styles.resetBtn} 
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.resetbtnText}>Reset</Text>
          )}
        </TouchableOpacity>
      </View>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    width: '100%',
    height: 60,
    fontSize: 18,
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'lightgray',
    color: 'black'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    backgroundColor: 'lightgray',
    borderRadius: 10
  },
  resetBtn: {
    width: 300,
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  resetbtnText: {
    color: 'white',
    fontSize: 20,
  },
  icon: {
    marginLeft: 10,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default ResetPwd;
