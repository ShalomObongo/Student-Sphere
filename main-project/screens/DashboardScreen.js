import React,{useEffect, useState,useCallback} from 'react';
import { View, Text, Button, StyleSheet, Alert, Touchable, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

const DashboardScreen = () => {
  const [firstName, setFirstName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserName = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setFirstName(userDoc.data().firstName);
      } else {
        console.log("No such document!");
      }
    };

    fetchUserName();
  }, []);

  const GoToProfile=()=>{
    navigation.navigate('Profile screen')
  }

  const handleSignout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Logout Successful');
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

      <Text style={styles.welcomeTxt}>Welcome to the dashboard, {firstName}</Text>
      <Text>Email: {auth.currentUser?.email}</Text>

      <TouchableOpacity style={styles.profile} onPress={GoToProfile}>
          <Text style={styles.logoutTxt}>Go to profile</Text>
        </TouchableOpacity>  
      
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
    width: 300,
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    position:'absolute',
    bottom:30,
  },
  logoutTxt:{
    fontWeight: 'bold',
    fontSize: 15,
    marginRight: 10,
    color:'lightblue'
  },
  lockScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lockScreenText: {
    fontSize: 25,
    color: 'white',
  },
});

export default DashboardScreen;
