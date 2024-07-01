import {React,useState,useEffect} from "react";
import { FlatList,ScrollView,Text,View,StyleSheet,TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from "@react-navigation/native";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { auth } from '../firebase';
const db = getFirestore();


const Announcements=()=>{
    
    const [items, setItems] = useState([
        { label: 'General', value: 'general' },
        { label: 'Class', value: 'class' },
      ]);
    const [open, setOpen] = useState(false);
    const [announcements, setAnnouncements] = useState([]);
    const [userClassID, setUserClassID] = useState(null);
    const [selectedType, setSelectedType] = useState('general'); // State for selected type

    const navigation=useNavigation();

    useEffect(() => {
        const fetchUserClassID = async () => {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserClassID(userDoc.data().Class_ID);
            }
        };

        fetchUserClassID();
    }, []);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            if (userClassID) {
                let q;
                if (selectedType === 'general') {
                    q = query(collection(db, "Announcements"), where("Type", "==", "General"));
                } else {
                    q = query(collection(db, "Announcements"), where("Class_ID", "==", userClassID), where("Type", "==", "Class"));
                }
                const querySnapshot = await getDocs(q);
                const fetchedAnnouncements = [];
                querySnapshot.forEach((doc) => {
                    fetchedAnnouncements.push({ id: doc.id, ...doc.data() });
                });
                setAnnouncements(fetchedAnnouncements);
            }
        };

        fetchAnnouncements();
    }, [userClassID,selectedType]);

    const ViewAnnouncement=()=>{
        navigation.navigate('View Announcement')
    }
    const renderAnnouncement = ({ item }) => (
        <TouchableOpacity key={item.Class_ID} style={styles.announceBox} onPress={ViewAnnouncement}>
            <Text style={styles.announceTitle}>{item.Title}</Text>
            <Icon name='arrow-right-circle' type="material-community" />
        </TouchableOpacity>
    );

return (

    <View>
        <View style={styles.container}>
            <DropDownPicker
            open={open}
            items={items}
            placeholder="-- General --"
            setItems={setItems}
            style={{width:300}}
            value={selectedType}
            onChangeValue={setSelectedType}
            setOpen={setOpen}
            dropDownContainerStyle={{width:'80%',zIndex:100}}
            />

            <FlatList
                data={announcements}
                renderItem={renderAnnouncement}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.flatListContainer}
            />
        </View>
    </View>
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
    flatListContainer: {
        alignItems: 'center',
        paddingBottom: 20,
    },
    announceTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    
})

export default Announcements;
