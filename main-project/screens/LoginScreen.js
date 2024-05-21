import React, { useState } from 'react';
import { KeyboardAvoidingView, View, Text, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
        Alert.alert('Login Successful', `Welcome, ${user.email}`);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      })
      .catch((error) => Alert.alert('Login Failed. Email or password is incorrect', error.message));
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
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>
        <View style={styles.inputBox}>
          <Text style={styles.text}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter valid email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.text}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginbtnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={handlePasswordReset}>
          <Text style={styles.resetBtnText}>Reset Password</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },
  loginBtn: {
    width: 200,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginbtnText: {
    color: 'white',
    fontSize: 20,
  },
  resetBtn: {
    width: 200,
    padding: 10,
    backgroundColor: '#ffcccc',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  resetBtnText: {
    color: 'white',
    fontSize: 20,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 20,
    marginRight: 10,
  },
});

export default LoginScreen;
