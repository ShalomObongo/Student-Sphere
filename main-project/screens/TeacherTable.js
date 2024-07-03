import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { DataTable, Text, Headline, Divider, TextInput, Button } from "react-native-paper";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const db = getFirestore();

const TeacherTable = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editableData, setEditableData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
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

    fetchTeachers();
  }, []);

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

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4b7bec" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Headline style={styles.title}>Teacher List</Headline>
      <Divider style={styles.divider} />
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

            {editableData.map((teacher, index) => (
              <DataTable.Row key={teacher.id} style={styles.tableRow}>
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
    fontSize: 26,
    fontWeight: "bold",
    color: "#4b7bec",
    marginBottom: 20,
    textAlign: "center",
  },
  divider: {
    marginBottom: 20,
    backgroundColor: "#4b7bec",
    height: 2,
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
    paddingHorizontal: 10,  // Increased padding for more space
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
    paddingHorizontal: 10,  // Increased padding for more space
    color: "#333",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#e3e3e3",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 6,  
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

export default TeacherTable;
