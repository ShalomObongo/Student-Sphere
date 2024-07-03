import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity, Alert, ImageBackground } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
    const [isLoading, setIsLoading] = useState(true);

    const fetchUserDetails = useCallback(async () => {
        if (auth.currentUser) {
            setIsLoading(true);
            try {
                const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    setFirstName(userData.firstName);
                    setEmail(userData.email);
                    setRole(userData.role);
                    setNumber(userData.phoneNumber);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.log("No user is currently logged in.");
            setIsLoading(false);
            // Clear user data when no user is logged in
            setFirstName('');
            setEmail('');
            setRole('');
            setNumber('');
        }
    }, []);

    useEffect(() => {
        fetchUserDetails();
    }, [fetchUserDetails]);

    useFocusEffect(
        useCallback(() => {
            fetchUserDetails();
            return () => {
                setIsLoading(true);
            };
        }, [fetchUserDetails])
    );

    const handleSignout = () => {
        if (auth.currentUser) {
            signOut(auth)
                .then(() => {
                    Alert.alert('Logout Successful');
                    console.log('Successful logout');
                    // Clear user data immediately after logout
                    setFirstName('');
                    setEmail('');
                    setRole('');
                    setNumber('');
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

    const renderGhostProfile = () => (
        <View style={styles.content}>
            <View style={styles.ghostHeaderBackground}>
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.gradient}
                >
                    <View style={styles.headerContent}>
                        <View style={styles.ghostWelcomeTxt} />
                        <View style={styles.ghostRoleTxt} />
                    </View>
                </LinearGradient>
            </View>
            <View style={styles.infoContainer}>
                <View style={styles.infoItem}>
                    <View style={styles.ghostIcon} />
                    <View style={styles.ghostInfoText} />
                </View>
                <View style={styles.infoItem}>
                    <View style={styles.ghostIcon} />
                    <View style={styles.ghostInfoText} />
                </View>
            </View>
            <View style={styles.profileNavigation}>
                {[1, 2, 3, 4].map((_, index) => (
                    <View key={index} style={[styles.profileButton, styles.ghostProfileButton]} />
                ))}
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {isLoading ? renderGhostProfile() : (
                    <View style={styles.content}>
                        <ImageBackground
                            source={require('../images/full_logo.png')}
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
                    </View>
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
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        flex: 1,
    },
    headerBackground: {
        height: 250,
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
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    roleTxt: {
        fontSize: 20,
        color: '#fff',
        marginTop: 5,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    infoContainer: {
        backgroundColor: '#fff',
        borderRadius: 15,
        margin: 20,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    infoText: {
        marginLeft: 15,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    buttonText: {
        marginLeft: 15,
        fontSize: 18,
        color: '#fff',
        fontWeight: '600',
    },
    ghostHeaderBackground: {
        height: 250,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    ghostWelcomeTxt: {
        width: '70%',
        height: 32,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
        marginBottom: 10,
    },
    ghostRoleTxt: {
        width: '50%',
        height: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 4,
    },
    ghostIcon: {
        width: 24,
        height: 24,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
    },
    ghostInfoText: {
        width: '70%',
        height: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 4,
        marginLeft: 15,
    },
    ghostProfileButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
});

export default ProfileScreen;
