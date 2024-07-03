import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import PhoneInput from 'react-native-phone-input';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        setUser(null);
      }
    });

    return unsubscribe;
  }, []);

  const validatePhoneNumber = (number) => {
    const phoneNumberPattern = /^\+[1-9]{1}[0-9]{3,14}$/;
    return phoneNumberPattern.test(number);
  };

  const handleUpdate = async () => {
    if (!firstName) {
      Alert.alert('Validation Error', 'Please enter your first name.');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Validation Error', 'Please enter your phone number.');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: firstName,
        phoneNumber: phoneNumber,
      });

      Alert.alert('Update Successful', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Update Failed', error.message);
      console.log('Update failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const GoToResetPwd = () => {
    navigation.navigate('Reset password');
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.innerContainer}
      >
        <Image
          source={require('../images/logo2.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Edit Profile</Text>

        <View style={styles.inputBox}>
          <Icon name="person" type="material" color="#fff" size={24} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            placeholderTextColor="#bbb"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>

        <View style={styles.inputBox}>
          <Icon name="phone" type="material" color="#fff" size={24} style={styles.inputIcon} />
          <PhoneInput
            placeholder="Input phone number"
            placeholderTextColor="#bbb"
            value={phoneNumber}
            onChangePhoneNumber={(number) => setPhoneNumber(number)}
            style={styles.phoneInput}
            textStyle={styles.phoneInputText}
          />
        </View>

        <TouchableOpacity 
          style={styles.updateBtn} 
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.updateBtnText}>Update Profile</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetPwdBtn}
          onPress={GoToResetPwd}
        >
          <Text style={styles.resetPwdBtnText}>Reset Password</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

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
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
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
  phoneInput: {
    flex: 1,
    height: 50,
  },
  phoneInputText: {
    fontSize: 16,
    color: '#fff',
  },
  updateBtn: {
    backgroundColor: '#2ECC71',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetPwdBtn: {
    marginTop: 20,
  },
  resetPwdBtnText: {
    color: '#fff',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditProfile;
