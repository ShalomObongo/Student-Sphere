import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { useNavigation } from '@react-navigation/native';



const DashboardScreen = () => {
  const navigation=useNavigation()

  const logOut=()=>{
    navigation.navigate('Login')
   }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      {/* Below will display the user's name in the current sesstion */}
      <Text style={styles.welcomeTxt}>Welcome user</Text>
      <TouchableOpacity onPress={logOut} style={styles.logout}>
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
