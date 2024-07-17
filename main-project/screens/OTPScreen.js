// ./screens/OTPScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

const OtpScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirm, setConfirm] = useState(null);

  const sendOTP = async () => {
    try {
      const confirmation = await auth().signInWithPhoneNumber(phoneNumber);
      setConfirm(confirmation);
      Alert.alert('OTP sent to your phone.');
    } catch (error) {
      Alert.alert('Failed to send OTP:', error.message);
    }
  };

  const confirmCode = async () => {
    try {
      await confirm.confirm(otp);
      Alert.alert('Phone number authenticated successfully.');
      navigation.navigate('Dashboard');
    } catch (error) {
      Alert.alert('Invalid OTP:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {!confirm ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            onChangeText={(text) => setPhoneNumber(text)}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.button} onPress={sendOTP}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            onChangeText={(text) => setOtp(text)}
            keyboardType="number-pad"
          />
          <TouchableOpacity style={styles.button} onPress={confirmCode}>
            <Text style={styles.buttonText}>Confirm OTP</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    width: '100%',
    padding: 15,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#28a745',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default OtpScreen;
