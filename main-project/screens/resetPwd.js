import React, { useState } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ResetPwd = () => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handlePasswordReset = () => {
    if (email === '') {
      Alert.alert('Please enter your email address to reset your password');
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Password Reset Email Sent', 'Please check your email to reset your password.');
      })
      .catch((error) => Alert.alert('Error', error.message));
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <View style={styles.container}>
        <Text style={styles.title}>Change password</Text>

        <View style={styles.inputBox}>
          {/* <Text style={styles.text}>Password:</Text> */}
          <TextInput
            style={styles.input}
            placeholder="Enter old password"
            secureTextEntry={!showPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        <View style={styles.inputBox}>
          {/* <Text style={styles.text}>Password:</Text> */}
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        <View style={styles.inputBox}>
          {/* <Text style={styles.text}>Password:</Text> */}
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            secureTextEntry={!showPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>
        <TouchableOpacity style={styles.resetBtn} >
          <Text style={styles.resetbtnText}>Reset</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
};
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
});

export default ResetPwd