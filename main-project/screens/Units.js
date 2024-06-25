import {React,useState} from "react";
import { ScrollView,Text,View,StyleSheet,TouchableOpacity } from "react-native";
import {Icon,SearchBar} from 'react-native-elements'
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from "@react-navigation/native";

const Units=()=>{

    const [search, setSearch] = useState('');
    const [items, setItems] = useState([
        { label: '--Select role--', value: null },
        { label: 'Student', value: 'student' },
        { label: 'Admin', value: 'admin' },
        { label: 'Teacher', value: 'teacher' },
      ]);
    const [open, setOpen] = useState(false);

      const navigation=useNavigation()

    const updateSearch = (search) => {
        setSearch(search);
    };

    const goToUnit=()=>{
        navigation.navigate('View Unit')
    }


return (
<ScrollView style={{flex:1}}>
    <View style={styles.container}>
        <Text>Select Semester:</Text>
        <DropDownPicker
        open={open}
        items={items}
        placeholder="-- Choose semester --"
        setItems={setItems}
        style={{width:300}}
        setOpen={setOpen}
        dropDownContainerStyle={{width:'80%',zIndex:100}}
        ></DropDownPicker>
    <SearchBar
        placeholder={"Search Unit..."}
        containerStyle={styles.search}
        inputContainerStyle={styles.searchInput}
        value={search}
        onChangeText={updateSearch}
      />
    <TouchableOpacity style={styles.unit} onPress={goToUnit}>
        <Text style={styles.unitTxt}>Object Oriented Programming</Text>
        <Icon name="arrow-right-circle" type="material-community" style={styles.icon}></Icon>
    </TouchableOpacity>
    <TouchableOpacity style={styles.unit} onPress={goToUnit}>
        <Text style={styles.unitTxt}>Life Skills</Text>
        <Icon name="arrow-right-circle" type="material-community" style={styles.icon}></Icon>
    </TouchableOpacity>
    <TouchableOpacity style={styles.unit} onPress={goToUnit}>
        <Text style={styles.unitTxt}>Physical Education</Text>
        <Icon name="arrow-right-circle" type="material-community" style={styles.icon}></Icon>
    </TouchableOpacity>
    <TouchableOpacity style={styles.unit} onPress={goToUnit}>
        <Text style={styles.unitTxt}>Operations Research</Text>
        <Icon name="arrow-right-circle" type="material-community" style={styles.icon}></Icon>
    </TouchableOpacity>
    <TouchableOpacity style={styles.unit} onPress={goToUnit}>
        <Text style={styles.unitTxt}>Communication Skills</Text>
        <Icon name="arrow-right-circle" type="material-community" style={styles.icon}></Icon>
    </TouchableOpacity>
    <TouchableOpacity style={styles.unit} onPress={goToUnit}>
        <Text style={styles.unitTxt}>Web Application Programming</Text>
        <Icon name="arrow-right-circle" type="material-community" style={styles.icon}></Icon>
    </TouchableOpacity>
    
    </View>
</ScrollView>
)
};
const styles=StyleSheet.create({
container:{
    paddingVertical:24,
    alignItems:'center'
},
unit:{
    padding:20,
    alignItems:'center',
    backgroundColor:'lightblue',
    width:300,
    marginVertical:20,
    flexDirection:'row',
    justifyContent:'space-between'
},
unitTxt:{
    fontSize:15,
    fontWeight:'normal',
    marginLeft:0
},
icon:{
    // position:'absolute',
    marginRight:0
},
search:{
    width:300,
    borderRadius:0,
    borderWidth:0,
    borderColor:'transparent',
    backgroundColor:'transparent'
},
searchInput:{
    borderRadius:20,
    backgroundColor:'silver',
}
})

export default Units;