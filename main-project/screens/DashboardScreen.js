import React,{useEffect, useState,useCallback} from 'react';
import { View, Text, Button, StyleSheet, Alert, Touchable, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from "firebase/firestore";

const db = getFirestore();

const DashboardScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [inactiveTime, setInactiveTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setInactiveTime(inactiveTime + 1);
      if (inactiveTime >= 60) { 
        setIsLocked(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [inactiveTime]);

  const resetTimer = useCallback(() => {
    setInactiveTime(0);
    setIsLocked(false);
  }, []);

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
      {isLocked ? (
        <TouchableOpacity style={styles.lockScreen} onPress={resetTimer}>
          <Text style={styles.lockScreenText}>Locked! Tap to unlock</Text>
        </TouchableOpacity>
      ) : (
        <>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.welcomeTxt}>Welcome to the dashboard, {firstName}</Text>
      <Text>Email: {auth.currentUser?.email}</Text>
        <TouchableOpacity style={styles.logout} onPress={handleSignout}>
          <Text style={styles.logoutTxt}>Logout</Text>
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
