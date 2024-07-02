import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, View, Text, TextInput, Alert, TouchableOpacity, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000, // 10 seconds for a full rotation
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleLogin = () => {
    setIsLoading(true);
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        console.log('Logged in with:', user.email);
        Alert.alert('Login Successful', `Welcome, ${user.email}`);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
        setIsLoading(false);
      })
      .catch((error) => {
        Alert.alert('Login Failed. Email or password is incorrect', error.message);
        setIsLoading(false);
      });
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

  const toggleShowPassword = () => { 
    setShowPassword(!showPassword); 
  };

  const gotoRegister=()=>{
    navigation.navigate('Registration')
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Log in to your account</Text>
        <Text style={styles.subtitle}>Welcome back! Please enter your details</Text>
        <Animated.Image
          source={require('../images/logo2.png')}
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
        <View style={styles.inputBox}>
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
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={toggleShowPassword} style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={showPassword ? 'eye-off' : 'eye'} 
              size={24} 
              color="#aaa"
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.signupText}>Don't have an account?
          <Text style={styles.signupLink} onPress={gotoRegister}> Sign up</Text>
        </Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.loginBtn} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.btnText}>Login</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={handlePasswordReset}>
          <Text style={styles.btnText}>Reset Password</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  innerContainer: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2E86C1',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  iconContainer: {
    position: 'absolute',
    right: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    width: '115%',
    backgroundColor: '#2E86C1',
    paddingVertical: 20,
    alignItems: 'center',
    borderRadius: 30,
  },
  loginBtn: {
    width: '75%',
    paddingVertical: 15,
    backgroundColor: '#000',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  resetBtn: {
    width: '75%',
    paddingVertical: 15,
    backgroundColor: '#dc3545',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupText: {
    marginTop: 20,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 140,
  },
  signupLink: {
    color: '#007bff',
    fontWeight: 'bold',
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
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
    marginTop: 20,
  },
});

export default LoginScreen;