import { React, useState, useCallback } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, ActivityIndicator, Image, FlatList } from "react-native";
import { Icon, SearchBar } from 'react-native-elements'
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, addDoc, deleteDoc } from "firebase/firestore";
import { auth } from '../firebase';
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';

const db = getFirestore();

const Units = () => {
    const [search, setSearch] = useState('');
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [units, setUnits] = useState([]);
    const [allUnits, setAllUnits] = useState([]);
    const [isTeacher, setIsTeacher] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [enrollingUnitId, setEnrollingUnitId] = useState(null);
    const [enrollments, setEnrollments] = useState({});

    const navigation = useNavigation()

    const fetchUnits = useCallback(async () => {
        setIsLoading(true);
        const user = auth.currentUser;
        if (user) {
            try {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setIsTeacher(userData.role === 'teacher');

                    let q;
                    if (userData.role === 'teacher') {
                        q = query(collection(db, "units"), where("teacherId", "==", user.uid));
                    } else {
                        q = query(collection(db, "units"));
                    }

                    const querySnapshot = await getDocs(q);
                    const unitsData = querySnapshot.docs.map(doc => ({
                        ...doc.data(),
                        id: doc.id
                    }));
                    setAllUnits(unitsData);
                    setUnits(unitsData);
                    setFilteredUnits(unitsData);

                    // Fetch user enrollments
                    const enrollmentsQuery = query(collection(db, "enrollments"), where("userId", "==", user.uid));
                    const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
                    const enrollmentsData = {};
                    enrollmentsSnapshot.forEach(doc => {
                        enrollmentsData[doc.data().unitId] = doc.id;
                    });
                    setEnrollments(enrollmentsData);
                } else {
                    console.warn("User document does not exist");
                }
            } catch (error) {
                console.error("Error fetching units:", error);
            } finally {
                setIsLoading(false);
            }
        } else {
            console.warn("No user authenticated");
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchUnits();
        }, [fetchUnits])
    );

    const updateSearch = (search) => {
        setSearch(search);
        const filtered = allUnits.filter(unit =>
            unit.name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredUnits(filtered);
    };

    const goToUnit = (unitId) => {
        navigation.navigate('View Unit', { unitID: unitId });
    }

    const addUnit = () => {
        navigation.navigate('AddUnit');
    };

    const toggleEnrollment = async (unitId) => {
        const user = auth.currentUser;
        if (user) {
            setEnrollingUnitId(unitId);
            try {
                if (enrollments[unitId]) {
                    // Unenroll
                    await deleteDoc(doc(db, "enrollments", enrollments[unitId]));
                    setEnrollments(prev => {
                        const newEnrollments = {...prev};
                        delete newEnrollments[unitId];
                        return newEnrollments;
                    });
                    alert("Successfully unenrolled from the unit!");
                } else {
                    // Enroll
                    const docRef = await addDoc(collection(db, "enrollments"), {
                        userId: user.uid,
                        unitId: unitId,
                        enrollmentDate: new Date()
                    });
                    setEnrollments(prev => ({...prev, [unitId]: docRef.id}));
                    alert("Successfully enrolled in the unit!");
                }
            } catch (error) {
                console.error("Error toggling enrollment:", error);
                alert("Failed to update enrollment. Please try again.");
            } finally {
                setEnrollingUnitId(null);
            }
        }
    };

    const renderGhostUnit = () => (
        <View style={[styles.unitCard, styles.ghostUnit]}>
            <View style={styles.unitContent}>
                <View style={styles.ghostUnitName} />
                <View style={styles.ghostUnitCode} />
                <View style={styles.ghostUnitDetails} />
            </View>
            <View style={[styles.enrollButton, styles.ghostEnrollButton]} />
            <View style={styles.ghostChevron} />
        </View>
    );

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Units</Text>
                <SearchBar
                    placeholder="Search Units..."
                    onChangeText={updateSearch}
                    value={search}
                    containerStyle={styles.searchBarContainer}
                    inputContainerStyle={styles.searchBarInputContainer}
                    inputStyle={styles.searchBarInput}
                    placeholderTextColor="#a0a0a0"
                />
            </View>

            {isLoading ? (
                <FlatList
                    data={[1, 2, 3, 4, 5]} // Render 5 ghost units
                    renderItem={renderGhostUnit}
                    keyExtractor={(item) => item.toString()}
                    contentContainerStyle={styles.scrollContent}
                />
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {filteredUnits.map((unit, index) => (
                        <TouchableOpacity key={unit.id} style={styles.unitCard} onPress={() => goToUnit(unit.id)}>
                            <View style={styles.unitContent}>
                                <Text style={styles.unitName}>{unit.name}</Text>
                                <Text style={styles.unitCode}>{unit.code}</Text>
                                <View style={styles.unitDetails}>
                                    <Icon name="book" type="font-awesome" size={16} color="#4c669f" />
                                    <Text style={styles.unitDetailsText}>{unit.credits} Credits</Text>
                                </View>
                            </View>
                            {!isTeacher && (
                                <TouchableOpacity 
                                    style={[
                                        styles.enrollButton, 
                                        enrollments[unit.id] && styles.enrolledButton
                                    ]} 
                                    onPress={() => toggleEnrollment(unit.id)}
                                    disabled={enrollingUnitId === unit.id}
                                >
                                    {enrollingUnitId === unit.id ? (
                                        <ActivityIndicator size="small" color="#ffffff" />
                                    ) : (
                                        <Text style={styles.enrollButtonText}>
                                            {enrollments[unit.id] ? "Enrolled" : "Enroll"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            <Icon name="chevron-right" type="font-awesome" size={20} color="#4c669f" />
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}

            {isTeacher && (
                <TouchableOpacity style={styles.addButton} onPress={addUnit}>
                    <Icon name="plus" type="font-awesome" size={24} color="#ffffff" />
                </TouchableOpacity>
            )}
        </LinearGradient>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 20,
    },
    searchBarContainer: {
        backgroundColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
        paddingHorizontal: 0,
    },
    searchBarInputContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 25,
    },
    searchBarInput: {
        color: '#ffffff',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    unitCard: {
        backgroundColor: '#ffffff',
        borderRadius: 15,
        padding: 20,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    unitContent: {
        flex: 1,
    },
    unitName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    unitCode: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    unitDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    unitDetailsText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#4c669f',
    },
    enrollButton: {
        backgroundColor: '#4c669f',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginRight: 10,
        minWidth: 80,
        alignItems: 'center',
    },
    enrolledButton: {
        backgroundColor: '#006400', // Dark green
    },
    enrollButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    addButton: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#4c669f',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ghostUnit: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    ghostUnitName: {
        width: '70%',
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        marginBottom: 5,
    },
    ghostUnitCode: {
        width: '40%',
        height: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: 5,
    },
    ghostUnitDetails: {
        width: '50%',
        height: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
    },
    ghostEnrollButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 80,
        height: 36,
    },
    ghostChevron: {
        width: 20,
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
    },
});

export default Units;

