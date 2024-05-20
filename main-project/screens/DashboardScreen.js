import React from 'react';
import { View, Text, Button, StyleSheet, Alert, Touchable, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const DashboardScreen = () => {
  const navigation = useNavigation();

  const handleSignout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Logout Successful', 'You have been logged out.');
        console.log('Successful logout')
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      })
      .catch((error) => {
        Alert.alert('Logout Failed', error.message);
      });
  };


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.welcomeTxt}>Welcome to the dashboard!</Text>
      <Text style={styles.welcomeTxt}>Email: {auth.currentUser?.email}</Text>
      {/* <TouchableOpacity title="Logout" > */}
        <TouchableOpacity style={styles.logout} onPress={handleSignout}>
          <Text style={styles.logoutTxt}>Logout</Text>
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
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  welcomeTxt:{
    fontSize: 20
  },
  logout:{
    width: 200,
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    position:'absolute',
    bottom:10,
  },
  logoutTxt:{
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 10,
    color:'lightblue'
  }
});

export default DashboardScreen;
