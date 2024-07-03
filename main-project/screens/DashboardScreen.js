import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, StatusBar } from 'react-native';
import { auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import ProfileScreen from './ProfileScreen';
import Announcements from './Announcements';
import Units from './Units';
import TaskScreen from './taskscreen';
import TableOptions from './TableOptions';
import Requests from './Request';
import Analytics from './Analytics';


const db = getFirestore();
const Tab = createBottomTabNavigator();

// Add this array of motivational quotes
const motivationalQuotes = [
  "Believe you can and you're halfway there.",
  "The secret of getting ahead is getting started.",
  "It always seems impossible until it's done.",
  "Don't watch the clock; do what it does. Keep going.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Your time is limited, don't waste it living someone else's life.",
  "The only way to do great work is to love what you do.",
  "Education is the most powerful weapon which you can use to change the world.",
  "The best way to predict your future is to create it.",
];

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
        duration: 10000,
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
    const [quote, setQuote] = useState('');

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

          // Set a random quote
          const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
          setQuote(motivationalQuotes[randomIndex]);
        } catch (error) {
          console.error("Error fetching data: ", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, []);

    const renderGhostWidget = () => (
      <TouchableOpacity style={styles.widget}>
        <LinearGradient
          colors={['#4b7bec', '#3867d6']}
          style={styles.widgetGradient}
        >
          <View style={styles.ghostIcon} />
          <View style={styles.ghostTitle} />
          <View style={styles.ghostText} />
          <View style={styles.ghostText} />
        </LinearGradient>
      </TouchableOpacity>
    );

    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.gradientBackground}
        >
          <View style={styles.headerContainer}>
            <Text style={styles.welcomeText}>Welcome, {firstName}</Text>
            <Text style={styles.quoteText}>{quote || 'Loading...'}</Text>
          </View>
          <Animated.Image
            source={require('../images/logo2.png')}
            style={[styles.logoWatermark, { transform: [{ rotate: spin }] }]}
          />
          <FlatList
            data={[
              { key: 'Upcoming Deadlines', icon: 'calendar-clock', data: upcomingDeadlines },
              { key: 'Recent Announcements', icon: 'message-alert', data: recentAnnouncements },
              { key: 'Quick Access', icon: 'rocket-launch', data: quickAccess },
              { key: 'Task List Preview', icon: 'clipboard-list', data: taskListPreview },
            ]}
            renderItem={({ item }) => (
              loading ? renderGhostWidget() : (
                <TouchableOpacity style={styles.widget}>
                  <LinearGradient
                    colors={['#4b7bec', '#3867d6']}
                    style={styles.widgetGradient}
                  >
                    <Icon name={item.icon} type='material-community' size={40} color='#fff' />
                    <Text style={styles.widgetText}>{item.key}</Text>
                    {item.data.length > 0 ? (
                      item.data.map((dataItem, index) => (
                        <Text key={index} style={styles.widgetDataText}>{dataItem.title || dataItem.name}</Text>
                      ))
                    ) : (
                      <Text style={styles.widgetDataText}>No data available</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )
            )}
            numColumns={2}
            keyExtractor={(item) => item.key}
            contentContainerStyle={styles.flatListContainer}
          />
        </LinearGradient>
      </SafeAreaView>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#4b7bec',
          tabBarInactiveTintColor: '#95a5a6',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name='home' type='material-community' color={color} size={size} />
            ),
          }}
        />
        <Tab.Screen 
          name="Announcements" 
          component={Announcements} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name='message-alert-outline' type='material-community' color={color} size={size} />
            ),
          }}
        />
        {role === 'admin' ? (
          <>
          <Tab.Screen 
            name="Tables" 
            component={TableOptions} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='table-multiple' type='material-community' color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Requests" 
            component={Requests} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='account-lock-open' type='material-community' color={color} size={size} />
              ),
              title: 'Requests',
            }}
          />
          <Tab.Screen 
            name="Analytics" 
            component={Analytics} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name='google-analytics' type='material-community' color={color} size={size} />
              ),
              title: 'Analytics',
            }}
          />
          </>
        ) : (
          <>
            <Tab.Screen 
              name="Units" 
              component={Units} 
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name='book-open-page-variant-outline' type='material-community' color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen 
              name="Tasks" 
              component={TaskScreen} 
              options={{
                tabBarIcon: ({ color, size }) => (
                  <Icon name='clock-time-eight' type='material-community' color={color} size={size} />
                ),
              }}
            />
          </>
        )}
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon name='account' type='material-community' color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  safeArea: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  headerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 10,
    marginTop: 20,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
    opacity: 0.8,
  },
  logoWatermark: {
    position: 'absolute',
    width: 200,
    height: 200,
    opacity: 0.1,
    alignSelf: 'center',
    top: '50%',
    marginTop: -100, // Half of the height to center it vertically
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingTop: 20, // Add some top padding to separate from the welcome message
  },
  widget: {
    flex: 1,
    margin: 8,
    borderRadius: 15,
    overflow: 'hidden',
  },
  widgetGradient: {
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  widgetText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  widgetDataText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  ghostIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    marginBottom: 10,
  },
  ghostTitle: {
    width: '70%',
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 10,
  },
  ghostText: {
    width: '90%',
    height: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    marginBottom: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    elevation: 10,
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
});

export default DashboardScreen;

