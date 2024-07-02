import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { DataTable, Text, Headline, Divider } from "react-native-paper";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const db = getFirestore();

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Student_List"));
        const studentsList = querySnapshot.docs.map(doc => doc.data());
        setStudents(studentsList);
      } catch (error) {
        console.error("Error fetching student data: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

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
      <DataTable>
        <DataTable.Header>
          <DataTable.Title style={styles.tableHeader}>Class ID</DataTable.Title>
          <DataTable.Title style={styles.tableHeader}>First Name</DataTable.Title>
          <DataTable.Title style={styles.tableHeader}>Last Name</DataTable.Title>
        </DataTable.Header>

        {students.map((student, index) => (
          <DataTable.Row key={index} style={styles.tableRow}>
            <DataTable.Cell style={styles.tableCell}>{student.Class_ID}</DataTable.Cell>
            <DataTable.Cell style={styles.tableCell}>{student.F_name}</DataTable.Cell>
            <DataTable.Cell style={styles.tableCell}>{student.L_name}</DataTable.Cell>
          </DataTable.Row>
        ))}
      </DataTable>
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
  tableHeader: {
    fontWeight: "bold",
    color: "#4b7bec",
  },
  tableRow: {
    backgroundColor: "#fff",
  },
  tableCell: {
    color: "#333",
  },
});

export default StudentTable;
