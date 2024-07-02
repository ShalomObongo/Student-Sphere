import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { signOut } from 'firebase/auth';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

const db = getFirestore();

const ProfileScreen = () => {
    const navigation = useNavigation();
    const [firstName, setFirstName] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (auth.currentUser) {
                setIsLoading(true);
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    setFirstName(userDoc.data().firstName);
                    setEmail(userDoc.data().email);
                    setRole(userDoc.data().role);
                    setNumber(userDoc.data().phoneNumber);
                } else {
                    console.log("No such document!");
                }
                setIsLoading(false);
            } else {
                console.log("No user is currently logged in.");
            }
        };

        fetchUserDetails();
    }, []);

    const handleSignout = () => {
        if (auth.currentUser) {
            signOut(auth)
                .then(() => {
                    Alert.alert('Logout Successful');
                    console.log('Successful logout');
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Welcome' }],
                    });
                })
                .catch((error) => {
                    Alert.alert('Logout Failed', error.message);
                    console.error('Sign out error', error);
                });
        } else {
            Alert.alert('No user is currently logged in.');
        }
    };

    const gotoEdit = () => {
        navigation.navigate('Edit Profile');
    };

    const gotoTasks = () => {
        navigation.navigate('Task Screen');
    };

    const gotoUnits = () => {
        navigation.navigate('Units');
    };

    const ProfileButton = ({ icon, title, onPress, color }) => (
        <TouchableOpacity style={[styles.profileButton, { backgroundColor: color }]} onPress={onPress}>
            <Icon name={icon} size={24} color="#fff" />
            <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                {isLoading ? (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                ) : (
                    <>
                        <ImageBackground
                            // source={require('../assets/profile-bg.jpg')}
                            style={styles.headerBackground}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                style={styles.gradient}
                            >
                                <View style={styles.headerContent}>
                                    <Text style={styles.welcomeTxt}>Hello, {firstName}</Text>
                                    <Text style={styles.roleTxt}>{role}</Text>
                                </View>
                            </LinearGradient>
                        </ImageBackground>
                        <View style={styles.infoContainer}>
                            <View style={styles.infoItem}>
                                <Icon name="email" size={24} color="#007BFF" />
                                <Text style={styles.infoText}>{email}</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Icon name="phone" size={24} color="#28A745" />
                                <Text style={styles.infoText}>{phoneNumber}</Text>
                            </View>
                        </View>
                        <View style={styles.profileNavigation}>
                            <ProfileButton icon="assignment" title="View Tasks" onPress={gotoTasks} color="#007BFF" />
                            <ProfileButton icon="school" title="View Units" onPress={gotoUnits} color="#28A745" />
                            <ProfileButton icon="edit" title="Edit Profile" onPress={gotoEdit} color="#FFC107" />
                            <ProfileButton icon="exit-to-app" title="Logout" onPress={handleSignout} color="#DC3545" />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f0f0',
    },
    headerBackground: {
        height: 200,
        justifyContent: 'flex-end',
    },
    gradient: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    headerContent: {
        padding: 20,
    },
    welcomeTxt: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    roleTxt: {
        fontSize: 18,
        color: '#fff',
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 10,
        margin: 20,
        padding: 20,
        elevation: 5,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    profileNavigation: {
        padding: 20,
    },
    profileButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        elevation: 3,
    },
    buttonText: {
        marginLeft: 15,
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
});

export default ProfileScreen;
