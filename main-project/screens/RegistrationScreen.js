import React, { useState, useEffect, useRef } from 'react';
import { KeyboardAvoidingView, ScrollView, View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, Image, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import CountryPicker from 'react-native-country-picker-modal';
import PhoneInput from 'react-native-phone-input';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { doc, setDoc } from 'firebase/firestore';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';

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
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const phoneInput = useRef(null);
  const validatePhoneNumber = () => {
    return phoneInput.current?.isValidNumber();
  };

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    expoClientId: '138270145629-v07v5rma51cjuualt4qlamh4k4sbgdqh.apps.googleusercontent.com',
    iosClientId: '138270145629-6fmkl6me04nm1dspr8o5ghb23svo73ad.apps.googleusercontent.com',
    androidClientId: '138270145629-v07v5rma51cjuualt4qlamh4k4sbgdqh.apps.googleusercontent.com',
    webClientId: '138270145629-v07v5rma51cjuualt4qlamh4k4sbgdqh.apps.googleusercontent.com'
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential);
    }
  }, [response]);

  const onSelectCountry = (country) => {
    setCountryCode(country.cca2);
    setSelectedCountry(country);
    setCountryPickerVisible(false);
  };

  const toggleCountryPicker = () => {
    setCountryPickerVisible(!countryPickerVisible);
  };

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

    if (!validatePhoneNumber()) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    if (!role) {
      Alert.alert('Validation Error', 'Please select a role.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredentials = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredentials.user;
      console.log('Registered with:', user.email);

      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: firstName,
        role: role,
        phoneNumber: `${countryCode} ${phoneNumber}`,
        active: true,
        password:password

      });

      if (role === 'student') {
        await setDoc(doc(db, 'Student_List', user.uid), {
          F_name: firstName,
          L_name: '',
          Class_ID: 'N/A',
        });
      }

      if (role === 'teacher') {
        await setDoc(doc(db, 'Teachers', user.uid), {
          F_name: firstName,
          L_name: '',
          sbj_id: 'N/A',
          Office: '',
          Email:user.email
        });
      }

      await setDoc(doc(db, 'User roles', user.uid), {
        firstName: firstName,
        role: role,
      });

      await sendVerificationEmail(user);

      setIsLoading(false);
      Alert.alert('Registration Successful', 'A verification email has been sent to your email address.');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Registration Failed', error.message);
      console.log('Registration failed:', error.message);
    }
  };

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

  const gotoLogin=()=>{
    navigation.navigate('Login')
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const result = await promptAsync();
    if (result.type === 'success') {
      const { id_token } = result.params;
      const credential = GoogleAuthProvider.credential(id_token);
      try {
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;
        
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          firstName: user.displayName,
          role: 'student', // Default role, you may want to ask the user to select a role
          phoneNumber: user.phoneNumber || '',
          active: true,
        });

        // Add user to Student_List collection (assuming default role is student)
        await setDoc(doc(db, 'Student_List', user.uid), {
          F_name: user.displayName,
          L_name: '',
          Class_ID: 'N/A',
        });

        // Add user role
        await setDoc(doc(db, 'User roles', user.uid), {
          firstName: user.displayName,
          role: 'student',
        });

        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        });
      } catch (error) {
        setIsLoading(false);
        console.error('Error during Google Sign-In:', error);
        Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
      }
    } else {
      setIsLoading(false);
    }
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        })
      )
    ]).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[
            styles.innerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}>
            <Animated.Image 
              source={require('../images/logo2.png')} 
              style={[
                styles.logo,
                { transform: [{ rotate: spin }] }
              ]} 
            />
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Student-Sphere today!</Text>

            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="account" size={24} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor="#ccc"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="email" size={24} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#ccc"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="lock" size={24} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#ccc"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={toggleShowPassword} style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="lock-check" size={24} color="#fff" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#ccc"
                secureTextEntry={!showConfirmation}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirmation)} style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name={showConfirmation ? 'eye-off' : 'eye'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="phone" size={24} color="#fff" style={styles.inputIcon} />
              <PhoneInput
                ref={phoneInput}
                initialCountry="us"
                onChangePhoneNumber={setPhoneNumber}
                textProps={{
                  placeholder: 'Phone Number',
                  placeholderTextColor: '#ccc',
                }}
                textStyle={styles.phoneInputText}
                style={styles.phoneInput}
              />
            </View>

            <View style={styles.inputBox}>
              <MaterialCommunityIcons name="account-group" size={24} color="#fff" style={styles.inputIcon} />
              {!open && (
                <DropDownPicker
                  open={open}
                  value={role}
                  items={items}
                  setOpen={setOpen}
                  setValue={setRole}
                  setItems={setItems}
                  style={styles.picker}
                  dropDownContainerStyle={styles.dropdownContainerStyle}
                  placeholder="Select Role"
                  placeholderStyle={styles.placeholderStyle}
                  labelStyle={styles.labelStyle}
                  listMode="SCROLLVIEW"
                />
              )}
            </View>

            <TouchableOpacity 
              style={styles.registerBtn} 
              onPress={handleRegistration}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerBtnText}>Register</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.googleBtn} 
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Text style={styles.googleBtnText}>Sign up with Google</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.loginText}>
              Already have an account? <Text style={styles.loginLink} onPress={gotoLogin}>Login</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      {open && (
        <View style={styles.dropdownOverlay}>
          <DropDownPicker
            open={open}
            value={role}
            items={items}
            setOpen={setOpen}
            setValue={setRole}
            setItems={setItems}
            style={styles.picker}
            dropDownContainerStyle={styles.dropdownContainerStyle}
            placeholder="Select Role"
            placeholderStyle={styles.placeholderStyle}
            labelStyle={styles.labelStyle}
            listMode="SCROLLVIEW"
          />
        </View>
      )}
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
    width: '100%',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  innerContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#fff',
    fontSize: 16,
  },
  iconContainer: {
    padding: 10,
  },
  phoneInput: {
    flex: 1,
    height: 50,
  },
  phoneInputText: {
    color: '#fff',
    fontSize: 16,
  },
  picker: {
    flex: 1,
    height: 50,
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  dropdownContainerStyle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 0,
  },
  placeholderStyle: {
    color: '#ccc',
  },
  labelStyle: {
    color: '#fff',
  },
  registerBtn: {
    width: '100%',
    backgroundColor: '#2E86C1',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  registerBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  googleBtn: {
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  googleBtnText: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    fontSize: 16,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginLink: {
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});

export default RegistrationScreen;