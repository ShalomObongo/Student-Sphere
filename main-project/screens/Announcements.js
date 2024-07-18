import React, { useEffect, useState, useCallback } from "react";
import { Platform, View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import { Card, Title, Paragraph, Button, Modal } from 'react-native-paper';
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, addDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import AddAnnouncement from './addAnnounce';
import { Icon } from 'react-native-elements';
import * as Animatable from 'react-native-animatable';

const Announcements = () => {
  const [generalAnnouncements, setGeneralAnnouncements] = useState([]);
  const [enrolledUnits, setEnrolledUnits] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAddAnnouncementVisible, setIsAddAnnouncementVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const checkUserRole = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setIsTeacher(userDoc.data().role === 'teacher');
        setIsAdmin(userDoc.data().role === 'admin');
      }
    }
  }, []);

  useEffect(() => {
    checkUserRole();
  }, [checkUserRole]);

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch general announcements
      const generalQuery = query(collection(db, "Announcements"), where("Type", "==", "General"));
      const generalSnapshot = await getDocs(generalQuery);
      const generalData = generalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date() }));
      setGeneralAnnouncements(generalData);

      const userId = auth.currentUser.uid;
      
      if (isTeacher) {
        // Fetch all units for teachers
        const unitsSnapshot = await getDocs(collection(db, "units"));
        const unitsData = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllUnits(unitsData);
      } else {
        // Fetch user's enrollments
        const enrollmentsQuery = query(collection(db, "enrollments"), where("userId", "==", userId));
        const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
        const enrolledUnitIds = enrollmentsSnapshot.docs.map(doc => doc.data().unitId);

        // Fetch unit details for enrolled units
        const enrolledUnitsData = [];
        for (const unitId of enrolledUnitIds) {
          const unitDoc = await getDoc(doc(db, "units", unitId));
          if (unitDoc.exists()) {
            enrolledUnitsData.push({ id: unitDoc.id, ...unitDoc.data() });
          }
        }
        setEnrolledUnits(enrolledUnitsData);
      }
    } catch (error) {
      console.error("Error fetching announcements: ", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isTeacher]);

  useFocusEffect(
    useCallback(() => {
      if (loading) {
        fetchAnnouncements();
      }
    }, [fetchAnnouncements, loading])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const renderAnnouncementItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={800} style={styles.card}>
      <Card>
        <Card.Content>
          <Title style={styles.cardTitle}>{item.Title}</Title>
          <Paragraph style={styles.cardDescription}>{item.Description}</Paragraph>
          <Text style={styles.cardTimestamp}>
            {item.timestamp.toLocaleString()}
          </Text>
          {isAdmin && (
            <TouchableOpacity onPress={() => handleDeleteAnnouncement(item.id)} style={styles.deleteButton}>
              <Icon name="delete" type="material" color="#FF0000" size={24} />
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    </Animatable.View>
  );

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await deleteDoc(doc(db, "Announcements", announcementId));
      Alert.alert("Success", "Announcement deleted successfully!");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement: ", error);
      Alert.alert("Error", "Failed to delete announcement. Please try again.");
    }
  };

  const renderUnitItem = ({ item }) => (
    <Animatable.View animation="fadeInUp" duration={800}>
      <TouchableOpacity
        style={styles.unitStack}
        onPress={() => navigation.navigate('View Announcement', { unitId: item.id, isTeacher })}
      >
        <LinearGradient
          colors={['#4b7bec', '#3867d6']}
          style={styles.unitGradient}
        >
          <Text style={styles.unitName}>{item.name}</Text>
          <Icon name="chevron-right" type="material-community" color="#fff" size={24} />
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>General Announcements</Text>
            {isTeacher && (
              <Button 
                mode="contained" 
                onPress={() => setIsAddAnnouncementVisible(true)} 
                style={styles.addButton}
                icon="plus"
              >
                Add Announcement
              </Button>
            )}
            <FlatList
              data={generalAnnouncements}
              renderItem={renderAnnouncementItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={<Text style={styles.emptyText}>No general announcements</Text>}
              scrollEnabled={false}
            />

            <Text style={styles.sectionTitle}>
              {isTeacher ? "All Unit Announcements" : "Enrolled Unit Announcements"}
            </Text>
            <FlatList
              data={isTeacher ? allUnits : enrolledUnits}
              renderItem={renderUnitItem}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {isTeacher ? "No units available" : "No enrolled units"}
                </Text>
              }
              scrollEnabled={false}
            />
          </View>
        </ScrollView>

        {isAddAnnouncementVisible && (
          <AddAnnouncement
            onClose={() => setIsAddAnnouncementVisible(false)}
            onAnnouncementAdded={() => {
              setIsAddAnnouncementVisible(false);
              fetchAnnouncements();
            }}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  cardTimestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#fff',
    marginTop: 10,
  },
  unitStack: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
  },
  unitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  unitName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    marginBottom: 16,
    borderRadius: 8,
  },
});

export default Announcements;