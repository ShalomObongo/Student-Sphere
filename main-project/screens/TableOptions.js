import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";

const TableOptions = () => {
  const navigation = useNavigation();

  const handleTeachersTable = () => {
    navigation.navigate("Teacher Table");
  };

  const handleStudentsTable = () => {
    navigation.navigate("Student Table");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Which table would you like to view?</Text>
      <TouchableOpacity style={styles.button} onPress={handleTeachersTable}>
        <Icon name="human-male-board" type="material-community" color="#fff" size={30} />
        <Text style={styles.buttonText}>Teachers Table</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleStudentsTable}>
        <Icon name="school" type="material-community" color="#fff" size={30} />
        <Text style={styles.buttonText}>Students Table</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f7",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  button: {
    width: "80%",
    padding: 15,
    backgroundColor: "#4b7bec",
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#fff",
    marginLeft: 10,
  },
});

export default TableOptions;
