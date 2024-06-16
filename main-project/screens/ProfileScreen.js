import React from 'react';
import { SafeAreaView, ScrollView,StyleSheet,View,Text,TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const Sections=[];

const ProfileScreen=()=>{
    const navigation=useNavigation();

    const gotoEdit=()=>{
        navigation.navigate('Edit Profile')
    }
    const GoToResetPwd=()=>{
        navigation.navigate('Reset password')
    }
   

return (
<SafeAreaView style={{flex:1}}>
    <ScrollView style={styles.container}>
        <View style={styles.profile}>
            <Text style={styles.profileName}>Jane</Text>
            <Text style={styles.profileRole}>Email: jane@gmail.com</Text>
            {/* <Text style={styles.profileRole}></Text> */}
            <Text style={styles.profileRole}>Role: Student</Text>
        </View>
        <View style={styles.profileNaviagtion}>
        <TouchableOpacity style={styles.taskBtn}><Text style={styles.taskTxt}>View tasks</Text></TouchableOpacity>
        <TouchableOpacity style={styles.unitBtn}><Text style={styles.unitTxt}>View units</Text></TouchableOpacity>
        <TouchableOpacity style={styles.editBtn} onPress={gotoEdit}><Text style={styles.editTxt}>Edit Profile</Text></TouchableOpacity>
        <TouchableOpacity style={styles.resetBtn} onPress={GoToResetPwd} ><Text style={styles.resetTxt}>Reset Password</Text></TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn}><Text style={styles.logoutTxt} >Logout</Text></TouchableOpacity>
        </View>
    </ScrollView>
</SafeAreaView>
);
};
const styles=StyleSheet.create({
    container:{
        paddingVertical:24,
    },
    profile:{
        padding:24,
        alignItems:'center',
        justifyContent:'center'
    },
    profileName:{
        marginTop:20,
        fontSize:19,
        fontWeight:'600',
        color:'#414d63',
        textAlign:'center'
    },
    profileRole:{
        marginTop:5,
        fontSize:16,
        color:'#989898',
        textAlign:'center'

    },
    profileNaviagtion:{
        padding:24,
        alignItems:'center',
        justifyContent:'center'
    },
    taskBtn:{
        backgroundColor:'grey',
        width:'100%',
        borderRadius:2,
        marginTop:20,
        height:50,
        alignItems:'center',
        justifyContent:'center'
    },
    unitBtn:{
        backgroundColor:'grey',
        width:'100%',
        borderRadius:2,
        marginTop:20,
        height:50,
        alignItems:'center',
        justifyContent:'center'
    },
    editBtn:{
        backgroundColor:'grey',
        width:'100%',
        borderRadius:2,
        marginTop:20,
        height:50,
        alignItems:'center',
        justifyContent:'center'
    },
    resetBtn:{
        backgroundColor:'grey',
        width:'100%',
        borderRadius:2,
        marginTop:20,
        height:50,
        alignItems:'center',
        justifyContent:'center'
    },
    logoutBtn:{
        backgroundColor:'grey',
        width:'100%',
        borderRadius:2,
        marginTop:20,
        height:50,
        alignItems:'center',
        justifyContent:'center'
    },
    taskTxt:{
        fontSize:20,
    },
    unitTxt:{
        fontSize:20,
    },
    editTxt:{
        fontSize:20,
    },
    logoutTxt:{
        fontSize:20,
    },
    resetTxt:{
        fontSize:20
    }
});
export default ProfileScreen;