import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, Modal } from "react-native";
import { Card, Text, Headline, Divider, TextInput, Button, FAB, ActivityIndicator } from "react-native-paper";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

const db = getFirestore();

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editableData, setEditableData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    Email: '', F_name: '', L_name: '', Office: '', sbj_id: ''
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "Teachers"));
      const teachersList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeachers(teachersList);
      setEditableData(teachersList.map(teacher => ({ ...teacher })));
    } catch (error) {
      console.error("Error fetching teacher data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = async (index) => {
    try {
      const teacher = editableData[index];
      await updateDoc(doc(db, "Teachers", teacher.id), {
        Email: teacher.Email,
        F_name: teacher.F_name,
        L_name: teacher.L_name,
        Office: teacher.Office,
        sbj_id: teacher.sbj_id
      });
      setEditingIndex(null);
      fetchTeachers();
    } catch (error) {
      console.error("Error updating teacher data: ", error);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditableData(teachers.map(teacher => ({ ...teacher })));
  };

  const handleInputChange = (text, field, index) => {
    const newData = [...editableData];
    newData[index][field] = text;
    setEditableData(newData);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const filteredTeachers = editableData.filter(teacher => 
    teacher.F_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.L_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    teacher.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddTeacher = async () => {
    try {
      await addDoc(collection(db, "Teachers"), newTeacher);
      setShowAddModal(false);
      setNewTeacher({ Email: '', F_name: '', L_name: '', Office: '', sbj_id: '' });
      fetchTeachers();
    } catch (error) {
      console.error("Error adding new teacher: ", error);
    }
  };

  const renderTeacherItem = ({ item, index }) => (
    <Animatable.View animation="fadeIn" delay={index * 100}>
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{`${item.F_name} ${item.L_name}`}</Text>
            <Text style={styles.email}>{item.Email}</Text>
          </View>
          {editingIndex === index ? (
            <View style={styles.editForm}>
              <TextInput
                label="Email"
                value={item.Email}
                onChangeText={(text) => handleInputChange(text, "Email", index)}
                style={styles.input}
              />
              <TextInput
                label="First Name"
                value={item.F_name}
                onChangeText={(text) => handleInputChange(text, "F_name", index)}
                style={styles.input}
              />
              <TextInput
                label="Last Name"
                value={item.L_name}
                onChangeText={(text) => handleInputChange(text, "L_name", index)}
                style={styles.input}
              />
              <TextInput
                label="Office"
                value={item.Office}
                onChangeText={(text) => handleInputChange(text, "Office", index)}
                style={styles.input}
              />
              <TextInput
                label="Subject ID"
                value={item.sbj_id}
                onChangeText={(text) => handleInputChange(text, "sbj_id", index)}
                style={styles.input}
              />
              <View style={styles.actionButtons}>
                <Button mode="contained" onPress={() => handleSave(index)} style={styles.saveButton}>Save</Button>
                <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>Cancel</Button>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={() => handleEdit(index)} style={styles.cardTouchable}>
              <Icon name="edit" type="material" color="#4b7bec" size={24} />
            </TouchableOpacity>
          )}
        </Card.Content>
      </Card>
    </Animatable.View>
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
      <SafeAreaView style={styles.safeArea}>
        <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
          <Icon name="school" type="material" color="#fff" size={40} />
          <Headline style={styles.title}>Teacher List</Headline>
        </Animatable.View>
        <Divider style={styles.divider} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search teachers..."
          placeholderTextColor="#a0a0a0"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacherItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setShowAddModal(true)}
        />
        <Modal visible={showAddModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add New Teacher</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Email"
                value={newTeacher.Email}
                onChangeText={(text) => setNewTeacher({...newTeacher, Email: text})}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="First Name"
                value={newTeacher.F_name}
                onChangeText={(text) => setNewTeacher({...newTeacher, F_name: text})}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Last Name"
                value={newTeacher.L_name}
                onChangeText={(text) => setNewTeacher({...newTeacher, L_name: text})}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Office"
                value={newTeacher.Office}
                onChangeText={(text) => setNewTeacher({...newTeacher, Office: text})}
              />
              <TextInput
                style={styles.modalInput}
                placeholder="Subject ID"
                value={newTeacher.sbj_id}
                onChangeText={(text) => setNewTeacher({...newTeacher, sbj_id: text})}
              />
              <View style={styles.modalButtons}>
                <Button mode="contained" onPress={handleAddTeacher} style={styles.addButton}>Add Teacher</Button>
                <Button mode="outlined" onPress={() => setShowAddModal(false)} style={styles.cancelButton}>Cancel</Button>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  divider: {
    backgroundColor: "#fff",
    height: 2,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    color: '#ffffff',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 80, // Add some bottom padding for FAB
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: '#4b7bec',
  },
  cardTouchable: {
    alignItems: 'flex-end',
  },
  editForm: {
    marginTop: 8,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#26de81',
  },
  cancelButton: {
    flex: 1,
    borderColor: '#4b7bec',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4b7bec',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#28a745',
  },
});

export default TeacherTable;