import React, { useEffect, useState } from "react";
import { Modal, View, StyleSheet, ActivityIndicator, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { DataTable, Text, Headline, Divider, Button } from "react-native-paper";
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

  if (loading) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <Animatable.View animation="fadeIn" style={styles.content}>
        <Headline style={styles.title}>Teacher List</Headline>
        <Divider style={styles.divider} />
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search teachers..."
          placeholderTextColor="#a0a0a0"
          value={searchQuery}
          onChangeText={handleSearch}
        />

        <ScrollView horizontal={true}>
          <View style={styles.tableContainer}>
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.headerCell}>Email</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>First Name</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>Last Name</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>Office</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>Subject ID</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>Actions</DataTable.Title>
              </DataTable.Header>

              {filteredTeachers.map((teacher, index) => (
                <Animatable.View key={teacher.id} animation="fadeInUp" delay={index * 100}>
                  <DataTable.Row style={styles.tableRow}>
                    <DataTable.Cell style={styles.dataCell}>
                      {editingIndex === index ? (
                        <TextInput
                          value={teacher.Email}
                          onChangeText={(text) => handleInputChange(text, "Email", index)}
                          style={styles.input}
                        />
                      ) : (
                        teacher.Email
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.dataCell}>
                      {editingIndex === index ? (
                        <TextInput
                          value={teacher.F_name}
                          onChangeText={(text) => handleInputChange(text, "F_name", index)}
                          style={styles.input}
                        />
                      ) : (
                        teacher.F_name
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.dataCell}>
                      {editingIndex === index ? (
                        <TextInput
                          value={teacher.L_name}
                          onChangeText={(text) => handleInputChange(text, "L_name", index)}
                          style={styles.input}
                        />
                      ) : (
                        teacher.L_name
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.dataCell}>
                      {editingIndex === index ? (
                        <TextInput
                          value={teacher.Office}
                          onChangeText={(text) => handleInputChange(text, "Office", index)}
                          style={styles.input}
                        />
                      ) : (
                        teacher.Office
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.dataCell}>
                      {editingIndex === index ? (
                        <TextInput
                          value={teacher.sbj_id}
                          onChangeText={(text) => handleInputChange(text, "sbj_id", index)}
                          style={styles.input}
                        />
                      ) : (
                        teacher.sbj_id
                      )}
                    </DataTable.Cell>
                    <DataTable.Cell style={styles.actionCell}>
                      {editingIndex === index ? (
                        <View style={styles.actionButtons}>
                          <Button mode="contained" onPress={() => handleSave(index)} style={styles.saveButton}>Save</Button>
                          <Button mode="outlined" onPress={handleCancel} style={styles.cancelButton}>Cancel</Button>
                        </View>
                      ) : (
                        <Button mode="contained" onPress={() => handleEdit(index)} style={styles.editButton}>Edit</Button>
                      )}
                    </DataTable.Cell>
                  </DataTable.Row>
                </Animatable.View>
              ))}
            </DataTable>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => setShowAddModal(true)}>
          <Icon name="add" type="material" color="#ffffff" size={24} />
        </TouchableOpacity>

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
      </Animatable.View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 20,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  divider: {
    backgroundColor: "#ffffff",
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
  tableContainer: {
    minWidth: 800,
  },
  table: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    overflow: "hidden",
  },
  tableHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerCell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  tableRow: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dataCell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 5,
    padding: 8,
    color: '#ffffff',
  },
  actionCell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
  },
  editButton: {
    backgroundColor: '#4c669f',
  },
  saveButton: {
    backgroundColor: '#28a745',
    marginRight: 10,
  },
  cancelButton: {
    borderColor: '#ffffff',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#4c669f',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
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
