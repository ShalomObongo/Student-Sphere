import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity, Modal, KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { Card, Title, Paragraph, Button, TextInput } from 'react-native-paper';
import { db } from "../firebase";
import { collection, getDocs, query, where, addDoc, serverTimestamp } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';

const ViewAnnouncement = ({ route }) => {
  const { unitId, isTeacher, unitName } = route.params;
  const [unitAnnouncements, setUnitAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementDescription, setNewAnnouncementDescription] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchUnitAnnouncements();
  }, [unitId]);

  const fetchUnitAnnouncements = async () => {
    try {
      const announcementsQuery = query(
        collection(db, "Announcements"),
        where("Type", "==", "Class"),
        where("unitId", "==", unitId)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUnitAnnouncements(announcementsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching unit announcements: ", error);
      setLoading(false);
    }
  };

  const addAnnouncement = async () => {
    if (!isTeacher) {
      Alert.alert("Error", "Only teachers can add announcements.");
      return;
    }

    if (!newAnnouncementTitle || !newAnnouncementDescription) {
      Alert.alert("Error", "Please fill in both title and description.");
      return;
    }

    try {
      const newAnnouncement = {
        Title: newAnnouncementTitle,
        Description: newAnnouncementDescription,
        Type: "Class",
        unitId: unitId,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "Announcements"), newAnnouncement);
      setNewAnnouncementTitle('');
      setNewAnnouncementDescription('');
      Alert.alert("Success", "Announcement added successfully!");
      fetchUnitAnnouncements(); // Refresh the announcements list
    } catch (error) {
      console.error("Error adding announcement: ", error);
      Alert.alert("Error", "Failed to add announcement. Please try again.");
    }
  };

  const renderAnnouncement = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <Title style={styles.cardTitle}>{item.Title}</Title>
        <Paragraph style={styles.cardDescription}>{item.Description}</Paragraph>
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Announcements for {unitName}</Text>
      </View>
      <FlatList
        data={unitAnnouncements}
        renderItem={renderAnnouncement}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No announcements for this unit</Text>}
        contentContainerStyle={styles.listContainer}
      />
      {isTeacher && (
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Icon name="add" type="material" color="#ffffff" size={24} />
          <Text style={styles.addButtonText}>Add Announcement</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.addAnnouncementContainer}>
              <TextInput
                label="Announcement Title"
                value={newAnnouncementTitle}
                onChangeText={setNewAnnouncementTitle}
                style={styles.input}
                theme={{ colors: { primary: '#4c669f' } }}
              />
              <TextInput
                label="Announcement Description"
                value={newAnnouncementDescription}
                onChangeText={setNewAnnouncementDescription}
                multiline
                style={[styles.input, styles.textArea]}
                theme={{ colors: { primary: '#4c669f' } }}
              />
              <Button mode="contained" onPress={addAnnouncement} style={styles.submitButton}>
                Add Announcement
              </Button>
              <Button mode="outlined" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#ffffff',
    marginTop: 20,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2EE49B',
    borderRadius: 30,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
  },
  addButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  addAnnouncementContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
  },
  input: {
    marginBottom: 16,
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#4c669f',
  },
  cancelButton: {
    marginTop: 8,
    borderColor: '#4c669f',
  },
});

export default ViewAnnouncement;
