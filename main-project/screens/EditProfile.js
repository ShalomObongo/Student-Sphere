import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet,Text,TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { Picker } from '@react-native-picker/picker';
const EditProfile=()=>{

    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => { 
        setShowPassword(!showPassword); 
      };

    return (
        <KeyboardAvoidingView style={styles.container} behavior='padding'>
           <View style={styles.container}>
           <Text style={styles.title}>Edit profile</Text>
          
           <View style={styles.inputBox}>
                <TextInput
                style={styles.input}
                placeholder="Enter your first name"
                />
            </View>
            <View style={styles.inputBox}>
                <TextInput
                style={styles.input}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                />
            </View>
            <View 
                style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 10,
                width: '80%',
                }}
        >
          <Text style={styles.text}>Role:</Text>
          <Picker
            
            style={styles.picker}
            
          >
            <Picker.Item label="Student" value="student" />
            <Picker.Item label="Admin" value="admin" />
            <Picker.Item label="Teacher" value="teacher" />
          </Picker>
        </View>
        <TouchableOpacity style={styles.editBtn} >
          <Text style={styles.editbtnText}>Edit</Text>
        </TouchableOpacity>
           </View>
        </KeyboardAvoidingView>
    )
};

const styles=StyleSheet.create({
    container:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    },
    title:{
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
    },
    input: {
        flex: 1,
        width: '100%',
        height: 60,
        fontSize: 18,
        borderWidth: 0,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
        padding: 10,
        backgroundColor:'lightgray',
        color:'black'
      },
      inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        width: '80%',
        backgroundColor:'lightgray',
        borderRadius:10
      },
      picker: {
        height: 40,
        flex: 1,
        borderRadius:20,
        borderColor:'lightgray'
      },
      editBtn: {
        width: 300,
        padding: 10,
        backgroundColor: 'black',
        borderRadius: 15,
        alignItems: 'center',
        marginTop: 10,
      },
      editbtnText: {
        color: 'white',
        fontSize: 20,
      },
});
export default EditProfile;