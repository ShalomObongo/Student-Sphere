import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import ProfileScreen from './ProfileScreen';
import Announcements from './Announcements';
import Units from './Units';
import TaskScreen from './taskscreen';
import TableOptions from './TableOptions';

const db = getFirestore();
const Tab = createBottomTabNavigator();

const DashboardScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  const navigation = useNavigation();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const docSnap = await getDoc(userDocRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        setFirstName(userData.firstName);
        setRole(userData.role); 
      } else {
        console.log('No such document!');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000, // 10 seconds for a full rotation
        useNativeDriver: true,
      })
    ).start();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const HomeScreen = () => {
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [quickAccess, setQuickAccess] = useState([]);
    const [taskListPreview, setTaskListPreview] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch upcoming deadlines
          const deadlinesQuery = query(collection(db, 'Tasks'), where('userId', '==', auth.currentUser.uid));
          const deadlinesSnapshot = await getDocs(deadlinesQuery);
          const deadlines = deadlinesSnapshot.docs.map(doc => doc.data());
          setUpcomingDeadlines(deadlines);

          // Fetch recent announcements
          const announcementsQuery = query(collection(db, 'Announcements'), where('Type', '==', 'General'));
          const announcementsSnapshot = await getDocs(announcementsQuery);
          const announcements = announcementsSnapshot.docs.map(doc => doc.data());
          setRecentAnnouncements(announcements);

          // Fetch quick access resources (example: most used units)
          const unitsQuery = query(collection(db, 'Units'), where('userId', '==', auth.currentUser.uid));
          const unitsSnapshot = await getDocs(unitsQuery);
          const units = unitsSnapshot.docs.map(doc => doc.data());
          setQuickAccess(units);

          // Fetch task list preview
          const tasksQuery = query(collection(db, 'Tasks'), where('userId', '==', auth.currentUser.uid));
          const tasksSnapshot = await getDocs(tasksQuery);
          const tasks = tasksSnapshot.docs.map(doc => doc.data());
          setTaskListPreview(tasks);
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    }

    return (
      <View style={styles.screenContainer}>
        <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
        <Animated.Image
          source={require('../images/logo2.png')}
          style={[styles.logo, { transform: [{ rotate: spin }] }]}
        />
        <FlatList
          data={[
            { key: 'Upcoming Deadlines', icon: 'calendar-clock', data: upcomingDeadlines },
            { key: 'Recent Announcements', icon: 'message-alert', data: recentAnnouncements },
            { key: 'Quick Access', icon: 'rocket-launch', data: quickAccess },
            { key: 'Task List Preview', icon: 'clipboard-list', data: taskListPreview },
          ]}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.widget}>
              <Icon name={item.icon} type='material-community' size={40} color='#4b7bec' />
              <Text style={styles.widgetText}>{item.key}</Text>
              {item.data.length > 0 ? (
                item.data.map((dataItem, index) => (
                  <Text key={index} style={styles.widgetDataText}>{dataItem.title || dataItem.name}</Text>
                ))
              ) : (
                <Text style={styles.widgetDataText}>No data available</Text>
              )}
            </TouchableOpacity>
          )}
          numColumns={2}
          keyExtractor={(item) => item.key}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerTitle: 'Student-Sphere',
          headerShown: false, // Hide the header for each screen
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name='home' type='material-community' color={color} size={size} />
            ),
            title: 'Home',
          }}
        />
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name='account' type='material-community' color={color} size={size} />
            ),
            title: 'Profile',
          }}
        />
        <Tab.Screen 
          name="Announcements" 
          component={Announcements} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name='message-alert-outline' type='material-community' color={color} size={size} />
            ),
            title: 'Announcements',
          }}
        />
        {role === 'admin' ? (
          <Tab.Screen 
            name="Tables" 
            component={TableOptions} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='table-multiple' type='material-community' color={color} size={size} />
              ),
              title: 'Tables',
            }}
          />
        ) : (
          <>
            <Tab.Screen 
              name="Units" 
              component={Units} 
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name='book-open-page-variant-outline' type='material-community' color={color} size={size} />
                ),
                title: 'Units',
              }}
            />
            <Tab.Screen 
              name="Tasks" 
              component={TaskScreen} 
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name='clock-time-eight' type='material-community' color={color} size={size} />
                ),
                title: 'Tasks',
              }}
            />
          </>
        )}
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    color: '#2E86C1',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  widget: {
    width: 160,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 10, // Adjusted margin to center the widgets
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  widgetText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  widgetDataText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default DashboardScreen;
