import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { DataTable, Text, Headline, Divider, TextInput, Button } from "react-native-paper";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4b7bec" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Headline style={styles.title}>Student List</Headline>
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

            {editableData.map((student, index) => (
              <DataTable.Row key={student.id} style={styles.tableRow}>
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
                      <Button mode="contained" onPress={() => handleSave(index)}>Save</Button>
                      <Button mode="outlined" onPress={handleCancel}>Cancel</Button>
                    </View>
                  ) : (
                    <Button mode="contained" onPress={() => handleEdit(index)}>Edit</Button>
                  )}
                </DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f4f7",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  divider: {
    marginBottom: 20,
    backgroundColor: "#4b7bec",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tableContainer: {
    minWidth: 800,  // Adjust as needed to ensure proper horizontal scrolling
  },
  table: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 2,
  },
  tableHeader: {
    backgroundColor: "#4b7bec",
    flexDirection: "row",
  },
  headerCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    backgroundColor: "#f9f9f9",
    flexDirection: "row",
  },
  dataCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 6,
    color: "#333",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#e3e3e3",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 14,
  },
  actionCell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});

export default StudentTable;
