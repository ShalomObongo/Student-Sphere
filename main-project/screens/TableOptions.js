import React from "react";
import { Platform, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "react-native-elements";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const TableOptions = () => {
  const navigation = useNavigation();

  const handleTeachersTable = () => {
    navigation.navigate("Teacher Table");
  };

  const handleStudentsTable = () => {
    navigation.navigate("Student Table");
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#3b5998', '#192f6a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <Animatable.View 
          animation="fadeIn" 
          duration={1000} 
          style={styles.content}
        >
          <Text style={styles.title}>Table Options</Text>
          <Text style={styles.subtitle}>Which table would you like to view?</Text>
          
          <Animatable.View animation="fadeInUp" delay={300}>
            <TouchableOpacity style={styles.button} onPress={handleTeachersTable}>
              <LinearGradient
                colors={['#4b7bec', '#3867d6']}
                style={styles.buttonGradient}
              >
                <Icon name="human-male-board" type="material-community" color="#fff" size={40} />
                <Text style={styles.buttonText}>Teachers Table</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>

          <Animatable.View animation="fadeInUp" delay={600}>
            <TouchableOpacity style={styles.button} onPress={handleStudentsTable}>
              <LinearGradient
                colors={['#4b7bec', '#3867d6']}
                style={styles.buttonGradient}
              >
                <Icon name="school" type="material-community" color="#fff" size={40} />
                <Text style={styles.buttonText}>Students Table</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#e0e0e0",
    marginBottom: 30,
    textAlign: "center",
  },
  button: {
    width: 250,
    marginVertical: 15,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  buttonText: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default TableOptions;
