import React, { useState } from 'react';
import { KeyboardAvoidingView, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RegistrationScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState(null);
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: '--Select role--', value: null },
    { label: 'Student', value: 'student' },
    { label: 'Admin', value: 'admin' },
    { label: 'Teacher', value: 'teacher' },
  ]);

  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const lowerCase = /[a-z]/;
    const upperCase = /[A-Z]/;
    const number = /[0-9]/;
    return minLength.test(password) && lowerCase.test(password) && upperCase.test(password) && number.test(password);
  };

  const handleRegistration = async () => {
    if (!firstName) {
      Alert.alert('Validation Error', 'Please enter your first name.');
      return;
    }

    if (!email) {
      Alert.alert('Validation Error', 'Please enter a valid email.');
      return;
    }

    if (!password) {
      Alert.alert('Validation Error', 'Please enter a password.');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('Password Requirements', 'Password must be more than 8 characters long, contain a lowercase letter, an uppercase letter, and a number.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Validation Error', 'Passwords do not match.');
      return;
    }

    if (!role) {
      Alert.alert('Validation Error', 'Please select a role.');
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

      await setDoc(doc(db, 'User roles', user.uid), {
        firstName: firstName,
        role: role,
      });

      // Send email verification
      await sendVerificationEmail(user);

      Alert.alert('Registration Successful', 'A verification email has been sent to your email address.');

      navigation.navigate('Dashboard');

    } catch (error) {
      Alert.alert('Registration Failed', error.message);
      console.log('Registration failed:', error.message);
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirm = () => {
    setShowConfirm(!showConfirmation);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.container}>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.secondtitle}>Welcome! Please enter your details.</Text>
        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.inputBox}>
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
          <TextInput
            style={styles.input}
            placeholder="Enter a password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
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
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            secureTextEntry={!showConfirmation}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <MaterialCommunityIcons
            name={showConfirmation ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleConfirm}
          />
        </View>
        <View style={styles.inputBox}>
          <DropDownPicker
            open={open}
            value={role}
            items={items}
            setOpen={setOpen}
            setValue={setRole}
            setItems={setItems}
            style={styles.picker}
            placeholder="--Select role--"
            dropDownContainerStyle={styles.dropdownContainerStyle}
          />
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
  secondtitle: {
    fontSize: 18,
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
    backgroundColor: 'lightgray',
    color: 'black',
    borderWidth: 0,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
    backgroundColor: 'lightgray',
    borderRadius: 5,
    marginBottom: 20,
  },
  picker: {
    width: '100%',
  },
  dropdownContainerStyle: {
    width: '80%',
    zIndex: 100,
  },
  registerBtn: {
    width: 300,
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  registerbtnTxt: {
    color: 'white',
    fontSize: 20,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 10,
  },
  icon: {
    marginRight: 20,
  },
});

export default RegistrationScreen;