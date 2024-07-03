import React, { useEffect, useState } from "react";
import { Platform, View, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";
import { DataTable, Text, Headline, Divider, TextInput, Button } from "react-native-paper";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

const db = getFirestore();

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editableData, setEditableData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Student_List"));
        const studentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsList);
        setEditableData(studentsList.map(student => ({ ...student })));
      } catch (error) {
        console.error("Error fetching student data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const handleEdit = (index) => {
    setEditingIndex(index);
  };

  const handleSave = async (index) => {
    try {
      const student = editableData[index];
      await updateDoc(doc(db, "Student_List", student.id), {
        Class_ID: student.Class_ID,
        F_name: student.F_name,
        L_name: student.L_name
      });
      setEditingIndex(null);
    } catch (error) {
      console.error("Error updating student data: ", error);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditableData(students.map(student => ({ ...student })));
  };

  const handleInputChange = (text, field, index) => {
    const newData = [...editableData];
    newData[index][field] = text;
    setEditableData(newData);
  };

  const renderGhostRow = () => (
    <DataTable.Row style={styles.ghostRow}>
      <DataTable.Cell><View style={styles.ghostCell} /></DataTable.Cell>
      <DataTable.Cell><View style={styles.ghostCell} /></DataTable.Cell>
      <DataTable.Cell><View style={styles.ghostCell} /></DataTable.Cell>
      <DataTable.Cell><View style={styles.ghostCell} /></DataTable.Cell>
    </DataTable.Row>
  );

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
          <Icon name="school" type="material" color="#fff" size={40} />
          <Headline style={styles.title}>Student List</Headline>
        </Animatable.View>
        <Divider style={styles.divider} />
        <ScrollView horizontal={true}>
          <View style={styles.tableContainer}>
            <DataTable style={styles.table}>
              <DataTable.Header style={styles.tableHeader}>
                <DataTable.Title style={styles.headerCell}>Class ID</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>First Name</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>Last Name</DataTable.Title>
                <DataTable.Title style={styles.headerCell}>Actions</DataTable.Title>
              </DataTable.Header>

              {loading ? (
                Array(5).fill().map((_, index) => (
                  <Animatable.View key={index} animation="fadeIn" delay={index * 100}>
                    {renderGhostRow()}
                  </Animatable.View>
                ))
              ) : (
                editableData.map((student, index) => (
                  <Animatable.View key={student.id} animation="fadeIn" delay={index * 100}>
                    <DataTable.Row style={styles.tableRow}>
                      <DataTable.Cell style={styles.dataCell}>
                        {editingIndex === index ? (
                          <TextInput
                            value={student.Class_ID}
                            onChangeText={(text) => handleInputChange(text, "Class_ID", index)}
                            style={styles.input}
                          />
                        ) : (
                          student.Class_ID
                        )}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.dataCell}>
                        {editingIndex === index ? (
                          <TextInput
                            value={student.F_name}
                            onChangeText={(text) => handleInputChange(text, "F_name", index)}
                            style={styles.input}
                          />
                        ) : (
                          student.F_name
                        )}
                      </DataTable.Cell>
                      <DataTable.Cell style={styles.dataCell}>
                        {editingIndex === index ? (
                          <TextInput
                            value={student.L_name}
                            onChangeText={(text) => handleInputChange(text, "L_name", index)}
                            style={styles.input}
                          />
                        ) : (
                          student.L_name
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
                ))
              )}
            </DataTable>
          </View>
        </ScrollView>
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
  tableContainer: {
    minWidth: 800,
    paddingHorizontal: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: '#fff',
  },
  actionCell: {
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  editButton: {
    backgroundColor: '#4b7bec',
  },
  saveButton: {
    backgroundColor: '#26de81',
    marginRight: 10,
  },
  cancelButton: {
    borderColor: '#fff',
  },
  ghostRow: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  ghostCell: {
    height: 20,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
});

export default StudentTable;
