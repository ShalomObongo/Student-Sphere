import React, { useState } from 'react';
import { TouchableOpacity, KeyboardAvoidingView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth } from '../firebase';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

const ResetPwd = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleResetPassword = () => {
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match');
      return;
    }

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, oldPassword);

    reauthenticateWithCredential(user, credential)
      .then(() => {
        updatePassword(user, newPassword)
          .then(() => {
            Alert.alert('Success', 'Password changed successfully');
          })
          .catch((error) => {
            Alert.alert('Error', error.message);
          });
      })
      .catch((error) => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior='padding'>
      <View style={styles.container}>
        <Text style={styles.title}>Change password</Text>

        <View style={styles.inputBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter old password"
            secureTextEntry={!showPassword}
            value={oldPassword}
            onChangeText={setOldPassword}
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
            placeholder="Enter new password"
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
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
            placeholder="Confirm new password"
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off' : 'eye'}
            size={24}
            color="#aaa"
            style={styles.icon}
            onPress={toggleShowPassword}
          />
        </View>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetPassword}>
          <Text style={styles.resetbtnText}>Reset</Text>
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
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'lightgray',
    color: 'black'
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    backgroundColor: 'lightgray',
    borderRadius: 10
  },
  resetBtn: {
    width: 300,
    padding: 10,
    backgroundColor: 'black',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  resetbtnText: {
    color: 'white',
    fontSize: 20,
  },
  icon: {
    marginLeft: 10,
  },
});

export default ResetPwd;
