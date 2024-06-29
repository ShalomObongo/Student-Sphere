import React,{useEffect, useState,useCallback} from 'react';
import { View, Text, Button, StyleSheet, Alert, Touchable, TouchableOpacity } from 'react-native';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Icon } from 'react-native-elements';

const db = getFirestore();

const DashboardScreen = () => {
  /* State variable to store the user's first name */
  const [firstName, setFirstName] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    /* Fetch the user's name from Firestore when the component mounts */
    const fetchUserName = async () => {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        /* Set the state with the fetched first name */
        setFirstName(userDoc.data().firstName);
      } else {
        console.log("No such document!");
      }
    };

    fetchUserName();
  }, []);

  const GoToProfile=()=>{
    /* Navigate to the Profile screen when the "Go to profile" button is pressed */
    navigation.navigate('Profile screen')
  }

  const GoToAnnounce=()=>{
    navigation.navigate('Announcements')
  }

  const GoToUnits=()=>{
    navigation.navigate('Units')
  }

  const handleSignout = () => {
    /* Handle sign-out functionality */
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

      <View style={styles.greeting}>
        <Text style={styles.welcomeTxt}>Welcome back, {firstName}</Text>
        {/* <Text>Email: {auth.currentUser?.email}</Text> */}
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity style={styles.profile} onPress={GoToProfile}>
            <Icon style={styles.icon} size={65} color='black' name='account' type='material-community'></Icon>
            <Text style={styles.profileTxt}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile} onPress={GoToAnnounce}>
            <Icon style={styles.icon} size={65} color='black'  name='message-alert-outline' type='material-community'></Icon>
            <Text style={styles.profileTxt} onPress={GoToAnnounce}>Announcements</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile} onPress={GoToUnits}>
            <Icon style={styles.icon} size={65} color='black'  name='book-open-page-variant-outline' type='material-community'></Icon>
            <Text style={styles.profileTxt} onPress={GoToUnits}>Units</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile}>
            <Icon style={styles.icon} size={65} color='black'  name='clock-time-eight' type='material-community'></Icon>
            <Text style={styles.profileTxt}>Tasks</Text>
          </TouchableOpacity>
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
    backgroundColor: '#f5f5f5',

  },
  greeting:{
    top:0
  },
  profileContainer:{
    flexDirection: 'row',
    flexWrap:'wrap',
    width: '80%',
    justifyContent: 'space-between',
    marginTop: 20,
    // backgroundColor:'lightgray'
  },
  profile:{
    width: '45%',
    height:130,
    padding: 10,
    backgroundColor: 'grey',
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    justifyContent:'space-between'
  },
  profileTxt:{
    fontWeight: 'bold',
    fontSize: 14,
    marginRight: 10,
    color:'#2EE49B'
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
    color:'#2EE49B'
  },
  icon:{
    size:20,
    color:'red',
  }
});

export default DashboardScreen;
