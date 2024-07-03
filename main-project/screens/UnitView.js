import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Linking, RefreshControl, Alert, Image, ActivityIndicator } from "react-native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, deleteDoc } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { auth } from '../firebase';
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from '../firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Animated } from 'react-native';

const db = getFirestore();

const UnitView = () => {
  const navigation = useNavigation();
  const [content, setContent] = useState([]);
  const [unitName, setUnitName] = useState('');
  const [unitDescription, setUnitDescription] = useState('');
  const route = useRoute();
  const { unitID } = route.params;
  const [teacher, setTeacher] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingContent, setDeletingContent] = useState(null);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (unitID) {
      fetchData();
    } else {
      console.error('No unitID provided');
      navigation.goBack();
    }
  }, [unitID]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const checkUserRole = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setIsTeacher(userDoc.data().role === 'teacher');
      }
    }
  };

  const fetchUnitDetails = async () => {
    if (!unitID) return;
    try {
      const unitDoc = await getDoc(doc(db, "units", unitID));
      if (unitDoc.exists()) {
        const unitData = unitDoc.data();
        setUnitName(unitData.name);
        setUnitDescription(unitData.description || 'No description available');
      } else {
        console.error("Unit not found");
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
    }
  };
  
  const fetchTeacher = async () => {
    if (!unitID) return;
    try {
      const q = query(collection(db, "Teachers"), where("unitID", "==", unitID));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const teacherData = querySnapshot.docs[0].data();
        setTeacher(teacherData);
      }
    } catch (error) {
      console.error("Error fetching teacher:", error);
    }
  };

  const fetchContent = async () => {
    if (!unitID) return;
    try {
      const q = query(collection(db, "Topics"), where("unitID", "==", unitID));
      const querySnapshot = await getDocs(q);
      const contentData = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setContent(contentData);
    } catch (error) {
      console.error("Error fetching content:", error);
    }
  };

  const deleteContent = async (contentId) => {
    setDeletingContent(contentId);
    try {
      await deleteDoc(doc(db, "Topics", contentId));
      Alert.alert("Success", "Content deleted successfully");
      fetchContent(); // Refresh the content list
    } catch (error) {
      console.error("Error deleting content:", error);
      Alert.alert("Error", "Failed to delete content");
    } finally {
      setDeletingContent(null);
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUnitDetails(),
        fetchContent(),
        fetchTeacher(),
        checkUserRole()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const gotoForm = () => {
    navigation.navigate('Add course content', { unitID });
  };

  const handleOpenURL = (url) => {
    const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
    Linking.openURL(validUrl).catch(err => console.error("Failed to open URL:", err));
  };

  const handleFileDownload = async (fileName) => {
    try {
      const storageRef = ref(storage, `course_files/${fileName}`);
      const downloadURL = await getDownloadURL(storageRef);
      Linking.openURL(downloadURL);
    } catch (error) {
      console.error("Error downloading file:", error);
      Alert.alert("Error", "Failed to download the file.");
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
              <Text style={styles.unitName}>{unitName}</Text>
              <Text style={styles.unitDescription}>{unitDescription}</Text>
            </Animated.View>
            
            {teacher && (
              <Animated.View style={[styles.teacherContainer, { opacity: fadeAnim }]}>
                <Icon name="school" type="material" size={40} color="#fff" />
                <Text style={styles.teacherName}>{teacher.F_name} {teacher.L_name}</Text>
                <Text style={styles.teacherEmail}>{teacher.Email}</Text>
                <Text style={styles.teacherOffice}>Office: {teacher.Office}</Text>
              </Animated.View>
            )}
            
            <Text style={styles.sectionTitle}>Course Content</Text>
            {content.map((item) => (
              <Animated.View key={item.id} style={[styles.contentCard, { opacity: fadeAnim }]}>
                <Text style={styles.contentName}>{item.Name}</Text>
                <Text style={styles.contentType}>{item.Type}</Text>
                {item.URL && (
                  <TouchableOpacity style={styles.button} onPress={() => handleOpenURL(item.URL)}>
                    <Icon name="link" type="material" color="#fff" size={20} />
                    <Text style={styles.buttonText}>Open URL</Text>
                  </TouchableOpacity>
                )}
                {item.File && (
                  <TouchableOpacity style={styles.button} onPress={() => handleFileDownload(item.File)}>
                    <Icon name="file-download" type="material" color="#fff" size={20} />
                    <Text style={styles.buttonText}>Download File</Text>
                  </TouchableOpacity>
                )}
                {item.Reason && (
                  <Text style={styles.contentReason}>Reason: {item.Reason}</Text>
                )}
                {isTeacher && (
                  <TouchableOpacity 
                    style={[styles.button, styles.deleteButton]} 
                    onPress={() => {
                      Alert.alert(
                        "Delete Content",
                        "Are you sure you want to delete this content?",
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", onPress: () => deleteContent(item.id) }
                        ]
                      );
                    }}
                    disabled={deletingContent === item.id}
                  >
                    {deletingContent === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <Icon name="delete" type="material" color="#fff" size={20} />
                        <Text style={styles.buttonText}>Delete</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </Animated.View>
            ))}
          </ScrollView>
        )}
        {isTeacher && (
          <TouchableOpacity onPress={gotoForm} style={styles.addContainer}>
            <Icon name="plus" type="material-community" size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  unitName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  unitDescription: {
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  teacherContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  teacherName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
  },
  teacherEmail: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 5,
  },
  teacherOffice: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  contentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  contentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  contentType: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86C1',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
  },
  contentReason: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#e0e0e0',
    marginTop: 10,
  },
  addContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2E86C1',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    minWidth: 100,
    justifyContent: 'center',
  },
});

export default UnitView;
