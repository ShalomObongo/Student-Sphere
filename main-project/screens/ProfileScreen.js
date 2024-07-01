import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';

const db = getFirestore();

const Sections = [];

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [role,setRole]=useState('');
    const [email,setEmail]=useState('');
    const [phoneNumber,setNumber]=useState('');

    useEffect(() => {
        const fetchUserDetails = async () => {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                setFirstName(userDoc.data().firstName);
                setEmail(userDoc.data().email);
                setRole(userDoc.data().role);
                setNumber(userDoc.data().phoneNumber)
            } else {
                console.log("No such document!");
            }
        };

        fetchUserDetails();
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
            console.error('Sign out error', error);
          });
      };

    const gotoEdit = () => {
        navigation.navigate('Edit Profile')
    }
    const gotoTasks=()=>{
        navigation.navigate('Task Screen')
      }
      const gotoUnits=()=>{
        navigation.navigate('Unit Screen')
      }


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <View style={styles.profile}>
                    <Text>Hello, {firstName}</Text>
                    {/* <Text style={styles.profileSecond}></Text> */}
                    <Text style={styles.profileSecond}>Email: {email}</Text>
                    <Text style={styles.profileSecond}>Role: {role}</Text>
                    <Text style={styles.profileSecond}>Number: {phoneNumber}</Text>
                    
                </View>
                <View style={styles.profileNaviagtion}>
                    <TouchableOpacity style={styles.taskBtn} onPress={gotoTasks}><Text style={styles.taskTxt}>View tasks</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.unitBtn} onPress={gotoUnits}><Text style={styles.unitTxt}>View units</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.editBtn} onPress={gotoEdit}><Text style={styles.editTxt}>Edit Profile</Text></TouchableOpacity>
                    <TouchableOpacity style={styles.logoutBtn} onPress={handleSignout}><Text style={styles.logoutTxt} >Logout</Text></TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        paddingVertical: 24,
        backgroundColor: '#f5f5f5',
      },
      profile: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginHorizontal: 20,
        elevation: 3,
        marginBottom: 20,
      },
      welcomeTxt: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#414d63',
        textAlign: 'center',
        marginBottom: 10,
      },
      profileSecond: {
        marginTop: 5,
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
      },
      profileNavigation: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
      },
      taskBtn: {
        backgroundColor: '#4CAF50',
        width: '100%',
        borderRadius: 10,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
      },
      unitBtn: {
        backgroundColor: '#2196F3',
        width: '100%',
        borderRadius: 10,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
      },
      editBtn: {
        backgroundColor: '#FFC107',
        width: '100%',
        borderRadius: 10,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
      },
      logoutBtn: {
        width: '100%',
        padding: 15,
        backgroundColor: '#E53935',
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 30,
        elevation: 2,
      },
      taskTxt: {
        fontSize: 20,
        color: '#fff',
      },
      unitTxt: {
        fontSize: 20,
        color: '#fff',
      },
      editTxt: {
        fontSize: 20,
        color: '#fff',
      },
      logoutTxt: {
        fontSize: 20,
        color: '#fff',
      },
});
export default ProfileScreen;