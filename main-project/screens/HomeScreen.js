import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';

const Homescreen = () => {
  const navigation = useNavigation();
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
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Registration');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Student-Sphere</Text>
      <Text style={styles.slogan}>Empowering Students Everywhere</Text>
      <Animated.Image
        source={require('../images/logo2.png')}
        style={[styles.logo, { transform: [{ rotate: spin }] }]}
      />
      <Text style={styles.subtitle}>What would you like to do?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.btnText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.btnText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  logo: {
    width: 260,
    height: 260,
    marginBottom: 40,
    marginTop: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2E86C1', // Adjusted to match the logo color
    marginBottom: 20,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 20,
    color: '#6c757d',
    marginBottom: 20,
    textAlign: 'center',
    zIndex: 100,
  },
  subtitle: {
    fontSize: 24,
    color: '#6c757d',
    marginBottom: 150,
    textAlign: 'center',
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
    backgroundColor: '#000', // Changed to black
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  registerBtn: {
    width: '75%',
    paddingVertical: 15,
    backgroundColor: '#000', // Changed to black
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
  },
  btnText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Homescreen;