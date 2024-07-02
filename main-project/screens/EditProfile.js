import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import PhoneInput from 'react-native-phone-input';

const EditProfile = () => {
  const [firstName, setFirstName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [user, setUser] = useState(null);

  const validatePhoneNumber = (number) => {
    const phoneNumberPattern = /^\+[1-9]{1}[0-9]{3,14}$/;
    return phoneNumberPattern.test(number);
  };

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
  const navigation = useNavigation();
  const GoToResetPwd = () => {
    navigation.navigate('Reset password');
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

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        firstName: firstName,
        phoneNumber: phoneNumber,
      });

      Alert.alert('Update Successful', 'Your profile has been updated.');
    } catch (error) {
      Alert.alert('Update Failed', error.message);
      console.log('Update failed:', error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <View style={styles.container}>
        <Text style={styles.title}>Edit profile</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter your first name"
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        <View style={styles.inputBox}>
          <Text style={styles.text}>Phone:</Text>
          <PhoneInput
            placeholder="Input phone number"
            value={phoneNumber}
            onChangePhoneNumber={(number) => setPhoneNumber(number)}
            style={styles.phoneInput}
          />
        </View>


        <TouchableOpacity style={styles.editBtn} onPress={handleUpdate}>
          <Text style={styles.editbtnText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={GoToResetPwd}
        >
          <Text style={styles.navBtnText}>Go to Reset Password</Text>
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
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
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
    zIndex: 1,
  },
  editBtn: {
    width: 300,
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    zIndex: 0,
  },
  editbtnText: {
    color: 'white',
    fontSize: 20,
  },
  phoneInput: {
    height: 40,
    width: '83%',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 5,
  },
  text: {
    marginLeft: 10,
    color: 'darkgray',
  },
  navBtn: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 15,
    alignItems: 'center',
  },
  navBtnText: {
    color: 'white',
    fontSize: 20,
  },

});

export default EditProfile;