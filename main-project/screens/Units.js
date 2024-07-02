import {React,useState,useEffect} from "react";
import { ScrollView,Text,View,StyleSheet,TouchableOpacity } from "react-native";
import {Icon,SearchBar} from 'react-native-elements'
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, query, where, getDocs,doc,getDoc } from "firebase/firestore";
import { auth } from '../firebase';

const db = getFirestore();

const Units=()=>{

    const [search, setSearch] = useState('');
    const [filteredUnits, setFilteredUnits] = useState([]);
    const [units, setUnits] = useState([]);

      const navigation=useNavigation()


      useEffect(() => {
        const fetchUnits = async () => {
          const user = auth.currentUser;
          if (user) {
            try {
              const userDocRef = doc(db, "users", user.uid);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const userClassId = userData.Class_ID;
                const q = query(collection(db, "Subject"), where("sbj_class", "==", userClassId));
                const querySnapshot = await getDocs(q);
                const unitsData = querySnapshot.docs.map(doc => doc.data());
                setUnits(unitsData);
                setFilteredUnits(unitsData);
              } else {
                console.warn("User document does not exist");
              }
            } catch (error) {
              console.error("Error fetching units:", error);
            }
          } else {
            console.warn("No user authenticated");
          }
        };
      
        fetchUnits();
      }, []);

      const updateSearch = (search) => {
        setSearch(search);
        if (search) {
          setFilteredUnits(units.filter(unit => unit.sbj_name.toLowerCase().startsWith(search.toLowerCase())));
        } else {
          setFilteredUnits(units); // Reset to all units when search is cleared
        }
      };

    const goToUnit=(sbj_id)=>{
        navigation.navigate('View Unit',{sbj_id})
    }


return (
<ScrollView style={{flex:1}}>
    <View style={styles.container}>
        {/* <Text>Select Semester:</Text> */}
        {/* <DropDownPicker
        open={open}
        items={items}
        placeholder="-- Choose semester --"
        setItems={setItems}
        style={{width:300}}
        setOpen={setOpen}
        dropDownContainerStyle={{width:'80%',zIndex:100}}
        ></DropDownPicker> */}
    <SearchBar
        placeholder={"Search Unit..."}
        containerStyle={styles.search}
        inputContainerStyle={styles.searchInput}
        value={search}
        onChangeText={updateSearch}
      />
    {/* Display units that match user's Class_ID */}
    {filteredUnits.map((unit, index) => (
          <TouchableOpacity key={index} style={styles.unit} onPress={()=>goToUnit(unit.sbj_id)}>
            <Text style={styles.unitTxt}>{unit.sbj_name}</Text>
            <Icon name="arrow-right-circle" type="material-community" style={styles.icon} />
          </TouchableOpacity>
        ))}

    
    </View>
</ScrollView>
)
};
const styles=StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f7',
      },
      innerContainer: {
        alignItems: 'center',
        paddingVertical: 24,
      },
      unit: {
        padding: 20,
        alignItems: 'center',
        backgroundColor: '#ffffff',
        width: '90%',
        marginVertical: 10,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 5,
        borderLeftColor: '#1a73e8',
      },
      unitTxt: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
      },
      icon: {
        color: '#1a73e8',
      },
      search: {
        width: '90%',
        backgroundColor: 'transparent',
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent',
      },
      searchInput: {
        backgroundColor: '#e0e0e0',
        borderRadius: 20,
      }
})

export default Units;