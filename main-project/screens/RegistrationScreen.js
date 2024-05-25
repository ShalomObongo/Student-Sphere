import React, { useState } from 'react';
import { KeyboardAvoidingView, View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth,db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification} from 'firebase/auth';

import { useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';

const RegistrationScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('student');
  const [status,setStatus]=useState('');
  const navigation = useNavigation();

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const lowerCase = /[a-z]/;
    const upperCase = /[A-Z]/;
    const number = /[0-9]/;
    return minLength.test(password) && lowerCase.test(password) && upperCase.test(password) && number.test(password);
  };

  const handleRegistration = async () => {
    if (!validatePassword(password)) {
      Alert.alert('Password Requirements', 'Password must be more than 8 characters long, contain a lowercase letter, an uppercase letter, and a number.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
  
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;
      console.log('Registered with:', user.email);

      // This saves user details to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: firstName,
        password: password, 
        role: role,
        active: true, 
      });

      await setDoc(doc(db,'User roles',user.uid),{
        firstName:firstName,
        role:role
      })
  
      // Send email verification
      await sendVerificationEmail(user);
  
      Alert.alert('Registration Successful', 'A verification email has been sent to your email address.');
  
      navigation.navigate('Dashboard');

    } catch (error) {
      Alert.alert('Registration Failed', error.message);
      console.log('Registered with ', user.email, ' failed');
    }
  };
  
  // Function to send email verification
  const sendVerificationEmail = async (user) => {
    try {
      await sendEmailVerification(user, {
        url: 'https://studentsphere-1fb98.firebaseapp.com', 
        handleCodeInApp: true,
      });
    } catch (error) {
      console.error('Error sending verification email:', error.message);
      throw error;
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.container}>
        <Text style={styles.title}>Registration</Text>

        <View style={styles.inputBox}>
          <Text style={styles.text}>First Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.text}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter a valid email"
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
            placeholder="Enter a password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.text}>Confirm Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.text}>Role:</Text>
          <Picker
            selectedValue={role}
            style={styles.picker}
            onValueChange={(itemValue) => setRole(itemValue)}
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="Teacher" value="teacher" />
          </Picker>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegistration}>
          <Text style={styles.registerbtnTxt}>Register</Text>
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
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    fontSize: 15,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },
  picker: {
    height: 40,
    flex: 1,
  },
  registerBtn: {
    width: 200,
    padding: 10,
    backgroundColor: 'lightgrey',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerbtnTxt: {
    color: 'black',
    fontSize: 20,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 10,
  },
});

export default RegistrationScreen;
