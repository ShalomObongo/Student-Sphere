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
                    {/* <Text style={styles.profileRole}></Text> */}
                    <Text style={styles.profileRole}>Role: Student</Text>
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
    },
    profile: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    profileName: {
        marginTop: 20,
        fontSize: 19,
        fontWeight: '600',
        color: '#414d63',
        textAlign: 'center'
    },
    profileRole: {
        marginTop: 5,
        fontSize: 16,
        color: '#989898',
        textAlign: 'center'

    },
    profileNaviagtion: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center'
    },
    taskBtn: {
        backgroundColor: 'grey',
        width: '100%',
        borderRadius: 2,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    unitBtn: {
        backgroundColor: 'grey',
        width: '100%',
        borderRadius: 2,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    editBtn: {
        backgroundColor: 'grey',
        width: '100%',
        borderRadius: 2,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    resetBtn: {
        backgroundColor: 'grey',
        width: '100%',
        borderRadius: 2,
        marginTop: 20,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    welcomeTxt: {
        fontSize: 20,
        fontWeight: '600',
        color: '#414d63',
        textAlign: 'center'
    },
    taskTxt: {
        fontSize: 20,
    },
    unitTxt: {
        fontSize: 20,
    },
    editTxt: {
        fontSize: 20,
    },
    logoutTxt: {
        fontSize: 20,
    },
    resetTxt: {
        fontSize: 20
    },
    logoutBtn: {
        width: 300,
        padding: 10,
        backgroundColor: 'red',
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
        bottom: -100,
    },
    logoutBtnText: {
        color: 'white',
        fontSize: 20,
    },
});
export default ProfileScreen;