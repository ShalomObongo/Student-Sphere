import {React,useState} from "react";
import { FlatList,ScrollView,Text,View,StyleSheet,TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';

const Announcements=()=>{

    const [items, setItems] = useState([
        { label: 'General', value: 'general' },
        { label: 'Class', value: 'class' },
      ]);
    const [open, setOpen] = useState(false);

return (

    <ScrollView>
        <View style={styles.container}>
            <DropDownPicker
            open={open}
            items={items}
            placeholder="-- General --"
            setItems={setItems}
            style={{width:300}}
            setOpen={setOpen}
            dropDownContainerStyle={{width:'80%',zIndex:100}}
            >

            </DropDownPicker>
            <TouchableOpacity style={styles.announceBox}>
                <Text style={styles.anounceTitle}>Title of the Announcement</Text>
                <Icon name='arrow-right-circle' type="material-community"></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={styles.announceBox}>
                <Text style={styles.anounceTitle}>Title of the Announcement</Text>
                <Icon name='arrow-right-circle' type="material-community"></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={styles.announceBox}>
                <Text style={styles.anounceTitle}>Title of the Announcement</Text>
                <Icon name='arrow-right-circle' type="material-community"></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={styles.announceBox}>
                <Text style={styles.anounceTitle}>Title of the Announcement</Text>
                <Icon name='arrow-right-circle' type="material-community"></Icon>
            </TouchableOpacity>
            <TouchableOpacity style={styles.announceBox}>
                <Text style={styles.anounceTitle}>Title of the Announcement</Text>
                <Icon name='arrow-right-circle' type="material-community"></Icon>
            </TouchableOpacity>
        </View>
    </ScrollView>
)
}

const styles=StyleSheet.create({
    container:{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        paddingTop:24
    },
    announceBox:{
        padding:20,
        width:300,
        backgroundColor:'#2EE49B',
        flexDirection:'row',
        justifyContent:'space-between',
        marginVertical:20
    },
    
})

export default Announcements;
