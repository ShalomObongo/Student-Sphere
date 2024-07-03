import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, StyleSheet, TouchableOpacity, RefreshControl } from "react-native";
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth } from '../firebase';

const db = getFirestore();

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [selectedType, setSelectedType] = useState('general');
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role); 
        } else {
          console.log("No such document for user!");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      let q;
      if (selectedType === 'general') {
        q = query(collection(db, "Announcements"), where("Type", "==", "General"));
      } else {
        if (userRole !== 'admin') {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          const userClassID = userDoc.exists() ? userDoc.data().Class_ID : null;
          q = query(collection(db, "Announcements"), where("Class_ID", "==", userClassID), where("Type", "==", "Class"));
        }
      }

      if (q) {
        const querySnapshot = await getDocs(q);
        const fetchedAnnouncements = [];
        querySnapshot.forEach((doc) => {
          fetchedAnnouncements.push({ id: doc.id, ...doc.data() });
        });
        setAnnouncements(fetchedAnnouncements);
      }
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedType, userRole]);

  const viewAnnouncement = (announcement) => {
    navigation.navigate('View Announcement', { announcement });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnnouncements();
    setRefreshing(false);
  };

  const gotoForm = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const userClassID = userDoc.data().Class_ID;
        navigation.navigate('Submit Announcement', { Class_ID: userClassID });
      } else {
        console.log("No such document for user!");
      }
    } catch (error) {
      console.error("Error fetching user class ID:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollViewContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, selectedType === 'general' && styles.activeButton]}
            onPress={() => setSelectedType('general')}
          >
            <Text style={styles.buttonText}>General</Text>
          </TouchableOpacity>
          {userRole !== 'admin' && (
            <TouchableOpacity
              style={[styles.button, selectedType === 'class' && styles.activeButton]}
              onPress={() => setSelectedType('class')}
            >
              <Text style={styles.buttonText}>Class</Text>
            </TouchableOpacity>
          )}
        </View>
        {announcements.length === 0 ? (
          <Text style={styles.noAnnouncementsText}>No announcements available</Text>
        ) : (
          announcements.map((item) => (
            <TouchableOpacity key={item.id} style={styles.announceBox} onPress={() => viewAnnouncement(item)}>
              <Text style={styles.announceTitle}>{item.Title}</Text>
              <Icon name='arrow-right-circle' type="material-community" />
            </TouchableOpacity>
          ))
        )}
        {selectedType === 'class' && userRole !== 'admin' && (
          <TouchableOpacity style={styles.fab} onPress={gotoForm}>
            <Icon name="plus" type="material-community" color="#fff" size={30} />
          </TouchableOpacity>
        )}
        { userRole === 'admin' && (
        <TouchableOpacity style={styles.fab} onPress={gotoForm}>
            <Icon name="plus" type="material-community" color="#fff" size={30} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  button: {
    padding: 10,
    backgroundColor: '#4b7bec',
    marginHorizontal: 5,
    borderRadius: 20,
    width: 100,
  },
  activeButton: {
    backgroundColor: '#1a73e8',
    borderWidth: 2,
    borderColor: 'black',
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  announceBox: {
    padding: 20,
    width: 300,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    backgroundColor: '#ffffff',
    borderLeftWidth: 5,
    borderLeftColor: '#1a73e8',
  },
  announceTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  noAnnouncementsText: {
    fontSize: 16,
    color: '#888',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    right: 0,
    bottom: 20,
    backgroundColor: '#1a73e8',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default Announcements;
