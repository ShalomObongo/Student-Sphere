import React, { useEffect, useState, useCallback } from "react";
import { Platform, View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput, Alert, KeyboardAvoidingView, ScrollView } from "react-native";
import { Card, Title, Paragraph, Button, Modal } from 'react-native-paper';
import { db, auth } from "../firebase";
import { collection, getDocs, query, where, doc, getDoc, addDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import AddAnnouncement from './addAnnounce';
import { Icon } from 'react-native-elements';

const Announcements = () => {
  const [generalAnnouncements, setGeneralAnnouncements] = useState([]);
  const [enrolledUnits, setEnrolledUnits] = useState([]);
  const [allUnits, setAllUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [isTeacher, setIsTeacher] = useState(false);
  const [isAddAnnouncementVisible, setIsAddAnnouncementVisible] = useState(false);

  const checkUserRole = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setIsTeacher(userDoc.data().role === 'teacher');
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
      const generalData = generalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
    }
  }, [isTeacher]);

  useFocusEffect(
    useCallback(() => {
      fetchAnnouncements();
    }, [fetchAnnouncements])
  );

  const renderGhostAnnouncement = () => (
    <Card style={[styles.card, styles.ghostCard]}>
      <Card.Content>
        <View style={styles.ghostTitle} />
        <View style={styles.ghostDescription} />
      </Card.Content>
    </Card>
  );

  const renderGhostUnit = () => (
    <View style={[styles.unitStack, styles.ghostUnitStack]}>
      <View style={styles.ghostUnitName} />
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.container}
      >
        <Text style={styles.sectionTitle}>General Announcements</Text>
        <FlatList
          data={[1, 2, 3]}
          renderItem={renderGhostAnnouncement}
          keyExtractor={(item) => item.toString()}
        />

        <Text style={styles.sectionTitle}>
          {isTeacher ? "All Unit Announcements" : "Enrolled Unit Announcements"}
        </Text>
        <FlatList
          data={[1, 2, 3, 4, 5]}
          renderItem={renderGhostUnit}
          keyExtractor={(item) => item.toString()}
        />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <Text style={styles.sectionTitle}>General Announcements</Text>
      {isTeacher && (
        <Button 
          mode="contained" 
          onPress={() => setIsAddAnnouncementVisible(true)} 
          style={styles.addButton}
        >
          Add Announcement
        </Button>
      )}
      <FlatList
        data={generalAnnouncements}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <Title>{item.Title}</Title>
              <Paragraph>{item.Description}</Paragraph>
            </Card.Content>
          </Card>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No general announcements</Text>}
      />

      <Text style={styles.sectionTitle}>
        {isTeacher ? "All Unit Announcements" : "Enrolled Unit Announcements"}
      </Text>
      <FlatList
        data={isTeacher ? allUnits : enrolledUnits}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.unitStack}
            onPress={() => navigation.navigate('View Announcement', { unitId: item.id, isTeacher })}
          >
            <Text style={styles.unitName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {isTeacher ? "No units available" : "No enrolled units"}
          </Text>
        }
      />

      {isAddAnnouncementVisible && (
        <AddAnnouncement
          onClose={() => setIsAddAnnouncementVisible(false)}
          onAnnouncementAdded={() => {
            setIsAddAnnouncementVisible(false);
            fetchAnnouncements();
          }}
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  card: {
    marginBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#fff',
    marginTop: 10,
  },
  unitStack: {
    backgroundColor: '#4b7bec',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  unitName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    marginBottom: 10,
  },
  ghostCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20,
  },
  ghostTitle: {
    width: '70%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
  ghostDescription: {
    width: '100%',
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
  },
  ghostUnitStack: {
    backgroundColor: 'rgba(75,123,236,0.3)',
  },
  ghostUnitName: {
    width: '70%',
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
});

export default Announcements;
