import React from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase'

const Homescreen = () => {
  const navigation = useNavigation();

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Registration');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Student-Sphere</Text>
      <Text style={styles.homeTxt}>What would you like to do?</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.homeTxt}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity  style={styles.registerBtn} onPress={handleRegister}>
        <Text style={styles.homeTxt}>Register</Text>
      </TouchableOpacity>
    </View>
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
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  loginBtn:{
    width: 200,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10
  },
  registerBtn:{
    width: 200,
    padding: 10,
    backgroundColor: '#7fffd4',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10
  },
  homeTxt:{
    fontSize:20
  }
});

export default Homescreen;