import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Icon } from 'react-native-elements';

const db = getFirestore();

const DashboardScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFirstName(userData.firstName);
        setRole(userData.role); 
      } else {
        console.log('No such document!');
      }
    };

    fetchUserData();
  }, []);

  const GoToProfile = () => {
    navigation.navigate('Profile screen');
  };

  const GoToAnnounce = () => {
    navigation.navigate('Announcements');
  };

  const handleSignout = () => {
    signOut(auth)
      .then(() => {
        Alert.alert('Logout Successful');
        console.log('Successful logout');
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
      <View style={styles.greeting}>
        <Text style={styles.welcomeTxt}>Welcome back, {firstName}</Text>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity style={styles.profile} onPress={GoToProfile}>
          <Icon style={styles.icon} size={65} color='#fff' name='account' type='material-community' />
          <Text style={styles.profileTxt}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.profile} onPress={GoToAnnounce}>
          <Icon style={styles.icon} size={65} color='#fff' name='message-alert-outline' type='material-community' />
          <Text style={styles.profileTxt}>Announcements</Text>
        </TouchableOpacity>

        {role === 'admin' ? (
          <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate('Table Options')}>
            <Icon style={styles.icon} size={65} color='#fff' name='table-multiple' type='material-community' />
            <Text style={styles.profileTxt}>Tables</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate('Units')}>
              <Icon style={styles.icon} size={65} color='#fff' name='book-open-page-variant-outline' type='material-community' />
              <Text style={styles.profileTxt}>Units</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.profile} onPress={() => navigation.navigate('Task Screen')}>
              <Icon style={styles.icon} size={65} color='black' name='clock-time-eight' type='material-community' />
              <Text style={styles.profileTxt}>Tasks</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
    backgroundColor: '#f0f4f7',
    paddingHorizontal: 20,
  },
  greeting: {
    marginBottom: 20,
  },
  profileContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  profile: {
    width: '45%',
    height: 150,
    padding: 20,
    backgroundColor: '#4b7bec',
    borderRadius: 15,
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  profileTxt: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
  welcomeTxt: {
    fontSize: 22,
    fontWeight: '600',
    color: '#333',
  },
  logout: {
    width: '80%',
    padding: 15,
    backgroundColor: '#fc5c65',
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    position: 'absolute',
    bottom: 30,
  },
  logoutTxt: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
  },
});

export default DashboardScreen;
