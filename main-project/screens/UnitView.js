import React, { useState, useEffect } from "react";
import { ScrollView, Text, View, StyleSheet,SafeAreaView,TouchableOpacity,Linking,RefreshControl } from "react-native";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { useRoute } from "@react-navigation/native";
import { auth } from '../firebase';
import { Icon } from "react-native-elements";
import { useNavigation } from "@react-navigation/native";
import { ref, getDownloadURL } from "firebase/storage";


const db = getFirestore();

const UnitView=()=>{
  const navigation = useNavigation();
    const [topics, setTopics] = useState([]);
    const [subjectName, setSubjectName] = useState('');
    const route = useRoute();
    const { sbj_id } = route.params;
    const [teacher, setTeacher] = useState(null);
    const [refreshing, setRefreshing] = useState(false);


    
    const fetchSubjectName = async () => {
      try {
        const q = query(collection(db, "Subject"), where("sbj_id", "==", sbj_id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const subjectData = querySnapshot.docs[0].data();
          setSubjectName(subjectData.sbj_name);
        }
      } catch (error) {
        console.error("Error fetching subject name:", error);
      }
    };
    
    const fetchTeacher = async () => {
      try {
        const q = query(collection(db, "Teachers"), where("sbj_id", "==", sbj_id));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const teacherData = querySnapshot.docs[0].data();
          setTeacher(teacherData);
        }
      } catch (error) {
        console.error("Error fetching teacher:", error);
      }
    };

    const fetchTopics = async () => {
      try {
        const q = query(collection(db, "Topics"), where("sbj_id", "==", sbj_id));
        const querySnapshot = await getDocs(q);
        const topicsData = querySnapshot.docs.map(doc => doc.data());
        setTopics(topicsData);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    useEffect(() => {
      
      fetchSubjectName();
      fetchTopics();
      fetchTeacher();
    }, [sbj_id]);


    const onRefresh = async () => {
      setRefreshing(true);
      await fetchSubjectName();
      await fetchTopics();
      await fetchTeacher();
      setRefreshing(false);
    };

    const normalTopics = topics.filter(topic => topic.Type === 'Normal');
    const extraTopics = topics.filter(topic => topic.Type === 'Extra');


    const gotoForm=()=>{
      navigation.navigate('Add course content',{sbj_id})
    }
    const handleOpenURL = (url) => {
      const validUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `http://${url}`;
      Linking.openURL(validUrl).catch(err => console.error("Failed to open URL:", err));
    }

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
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        >
        <Text style={styles.title}>{subjectName}</Text>
        {teacher && (
          <View style={styles.teacherContainer}>
            <Text style={styles.teacherName}>Teacher: {teacher.F_name} {teacher.L_name}</Text>
            <Text style={styles.teacherEmail}>Email: {teacher.Email}</Text>
            <Text style={styles.teacherOffice}>Office: {teacher.Office}</Text>
          </View>
        )}
        <Text style={styles.sectionTitle}>Normal Topics</Text>
        {normalTopics.map((topic, index) => (
          <View key={index} style={styles.topicContainer}>
            <Text style={styles.topicName}>{topic.Name}</Text>
            <Text style={styles.topicFile}>File: {topic.File}</Text>
            {topic.URL && (
              <TouchableOpacity onPress={() =>handleOpenURL(topic.URL)}>
                <Text style={styles.topicURL}>URL: {topic.URL}</Text>
              </TouchableOpacity>
            )}
        
          </View>
        ))}
        <Text style={styles.sectionTitle}>Extra Topics</Text>
        {extraTopics.map((topic, index) => (
          <View key={index} style={styles.topicContainer}>
            <Text style={styles.topicName}>{topic.Name}</Text>
            <Text style={styles.topicFile}>File: {topic.File}</Text>
            {topic.URL && (
              <TouchableOpacity onPress={() => handleOpenURL(topic.URL)}>
                <Text style={styles.topicURL}>URL: {topic.URL}</Text>
              </TouchableOpacity>
            )}
            {topic.File && (
              <TouchableOpacity onPress={() => handleFileDownload(topic.File)}>
                <Text style={styles.topicFile}>Download File</Text>
              </TouchableOpacity>
            )}
        
            <Text style={styles.topicReason}>Reason: {topic.Reason}</Text>
          </View>
        ))}
        <TouchableOpacity onPress={gotoForm} style={styles.addContainer}>
          <Icon name="plus" type="material-community" size={30} color="#fff"></Icon>
        </TouchableOpacity>
            </ScrollView>
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    container: {
        padding:20
      },
      title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#444',
        textAlign: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
      },
      teacherContainer: {
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
      },
      teacherName: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 5,
        color: '#1a73e8',
      },
      teacherEmail: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
      },
      teacherOffice: {
        fontSize: 16,
        color: '#555',
      },
      topicContainer: {
        marginBottom: 16,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderLeftWidth: 5,
        borderLeftColor: '#1a73e8',
      },
      sectionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
        textTransform: 'uppercase',
      },
      topicName: {
        fontSize: 22,
        fontWeight: '600',
        marginBottom: 10,
        color: '#1a73e8',
        textTransform: 'capitalize',
      },
      topicFile: {
        fontSize: 18,
        marginBottom: 6,
        color: '#555',
        fontStyle: 'italic',
      },
      topicURL: {
        fontSize: 18,
        color: '#1a73e8',
        textDecorationLine: 'underline',
      },
      addContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#1a73e8',
        borderRadius: 50,
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        
      },
    
  });
  
export default UnitView