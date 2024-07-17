import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated, SafeAreaView, StatusBar, RefreshControl, Dimensions, Platform, ScrollView } from 'react-native';
import { auth, db } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import ProfileScreen from './ProfileScreen';
import Announcements from './Announcements';
import Units from './Units';
import TaskScreen from './taskscreen';
import TableOptions from './TableOptions';
import Requests from './Request';
import Analytics from './Analytics';
import ForumScreen from './ForumScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();
const { width, height } = Dimensions.get('window');

const motivationalQuotes = [
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The secret of getting ahead is getting started. - Mark Twain",
  "It always seems impossible until it's done. - Nelson Mandela",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Education is the most powerful weapon which you can use to change the world. - Nelson Mandela",
  "The best way to predict your future is to create it. - Abraham Lincoln",
  "The future of the nation lies in the hands of the young. - Mahatma Gandhi",
];

const DashboardScreen = () => {
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('');
  const navigation = useNavigation();
  const spinValue = useRef(new Animated.Value(0)).current;
  const [refreshing, setRefreshing] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [newsData, setNewsData] = useState([]);
  const translateY = useRef(new Animated.Value(0)).current;

  // Static data for weather and news
  const staticWeatherData = {
    name: 'Nairobi',
    main: { temp: 22 },
    weather: [{ icon: '01d' }]
  };

  const staticNewsData = [
    { title: "New advancements in AI technology" },
    { title: "Global efforts to combat climate change intensify" },
    { title: "Breakthrough in quantum computing achieved" },
    { title: "Space tourism becomes a reality for civilians" },
    { title: "Revolutionary cancer treatment shows promising results" }
  ];

  useEffect(() => {
    fetchUserData();
    startLogoAnimation();
    fetchWeatherData();
    fetchNewsData();
  }, []);

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

  const startLogoAnimation = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const fetchWeatherData = async () => {
    const apiKey = 'b1c0c428fa5c40398ee41317241707';
    const city = 'Nairobi'; // Replace with user's city or use geolocation
    const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      setWeatherData({
        name: data.location.name,
        main: { temp: data.current.temp_c },
        weather: [{ icon: data.current.condition.icon }]
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherData(staticWeatherData);
    }
  };

  const fetchNewsData = async () => {
    const apiKey = '8a80ead043db4f578cf551cf3e65bb0b'; // Replace with your NewsAPI.org API key
    const url = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'ok') {
        setNewsData(data.articles.slice(0, 5)); // Get the first 5 articles
      } else {
        console.error('Error fetching news data:', data.message);
        setNewsData(staticNewsData);
      }
    } catch (error) {
      console.error('Error fetching news data:', error);
      setNewsData(staticNewsData);
    }
  };

  const HomeScreen = () => {
    const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
    const [recentAnnouncements, setRecentAnnouncements] = useState([]);
    const [quickAccess, setQuickAccess] = useState([]);
    const [taskListPreview, setTaskListPreview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quote, setQuote] = useState('');

    useEffect(() => {
      fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUpcomingDeadlines(),
          fetchRecentAnnouncements(),
          fetchQuickAccess(),
          fetchTaskListPreview(),
        ]);
        setRandomQuote();
      } catch (error) {
        console.error("Error fetching dashboard data: ", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUpcomingDeadlines = async () => {
      const deadlinesQuery = query(
        collection(db, 'Tasks'),
        where('userId', '==', auth.currentUser.uid),
        where('status', '==', 'incomplete'),
        orderBy('deadline'),
        limit(5)
      );
      const deadlinesSnapshot = await getDocs(deadlinesQuery);
      const deadlines = deadlinesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUpcomingDeadlines(deadlines);
    };

    const fetchRecentAnnouncements = async () => {
      const announcementsQuery = query(
        collection(db, 'Announcements'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      const announcements = announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentAnnouncements(announcements);
    };

    const fetchQuickAccess = async () => {
      const unitsQuery = query(
        collection(db, 'Units'),
        where('userId', '==', auth.currentUser.uid),
        limit(5)
      );
      const unitsSnapshot = await getDocs(unitsQuery);
      const units = unitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuickAccess(units);
    };

    const fetchTaskListPreview = async () => {
      const tasksQuery = query(
        collection(db, 'Tasks'),
        where('userId', '==', auth.currentUser.uid),
        orderBy('priority', 'desc'),
        limit(5)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTaskListPreview(tasks);
    };

    const setRandomQuote = () => {
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
      setQuote(motivationalQuotes[randomIndex]);
    };

    const renderGhostWidget = (index) => (
      <Animatable.View key={`ghost-${index}`} animation="pulse" easing="ease-out" iterationCount="infinite" style={styles.widget}>
        <BlurView intensity={80} style={styles.widgetGradient}>
          <View style={styles.ghostIcon} />
          <View style={styles.ghostTitle} />
          <View style={styles.ghostText} />
          <View style={styles.ghostText} />
        </BlurView>
      </Animatable.View>
    );

    const renderWidget = ({ item, index }) => (
      <Animatable.View key={`widget-${index}`} animation="fadeInUp" duration={800} style={styles.widget}>
        <TouchableOpacity onPress={() => handleWidgetPress(item)}>
          <BlurView intensity={80} style={styles.widgetGradient}>
            <Icon
              name={getIconName(item.icon)}
              type="material-community"
              color="#fff"
              size={40}
            />
            <Text style={styles.widgetText}>{item.title}</Text>
            {item.data.length > 0 ? (
              item.data.map((dataItem, index) => (
                <Text key={index} style={styles.widgetDataText} numberOfLines={1} ellipsizeMode="tail">
                  {dataItem.title || dataItem.name}
                </Text>
              ))
            ) : (
              <Text style={styles.widgetDataText}>No data available</Text>
            )}
          </BlurView>
        </TouchableOpacity>
      </Animatable.View>
    );

    const getIconName = (icon) => {
      // Map icon names to Material Community Icons
      const iconMap = {
        'calendar-clock': 'calendar-clock',
        'message-alert': 'message-alert-outline',
        'rocket-launch': 'rocket-launch-outline',
        'clipboard-list': 'clipboard-text-outline',
      };
      return iconMap[icon] || 'help-circle-outline';
    };

    const handleWidgetPress = (item) => {
      switch (item.title) {
        case 'Upcoming Deadlines':
          navigation.navigate('Tasks');
          break;
        case 'Recent Announcements':
          navigation.navigate('Announcements');
          break;
        case 'Quick Access':
          navigation.navigate('Units');
          break;
        case 'Task List Preview':
          navigation.navigate('Tasks');
          break;
      }
    };

    const onRefresh = React.useCallback(() => {
      setRefreshing(true);
      fetchDashboardData().then(() => setRefreshing(false));
    }, []);

    const onGestureEvent = Animated.event(
      [{ nativeEvent: { translationY: translateY } }],
      { useNativeDriver: true }
    );

    const onHandlerStateChange = event => {
      if (event.nativeEvent.oldState === State.ACTIVE) {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    };

    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f6a']}
          style={styles.gradientBackground}
        >
          <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.ScrollView
              style={[styles.content, { transform: [{ translateY }] }]}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            >
              <View style={styles.headerContainer}>
                <Animatable.Text animation="fadeInDown" style={styles.welcomeText}>Welcome, {firstName}</Animatable.Text>
                <Animatable.Text animation="fadeInUp" style={styles.quoteText}>{quote || 'Loading...'}</Animatable.Text>
              </View>
              <Animated.Image
                source={require('../images/logo2.png')}
                style={[styles.logoWatermark, { transform: [{ rotate: spin }] }]}
              />
              {weatherData && (
                <Animatable.View animation="fadeIn" style={styles.weatherContainer}>
                  <Text style={styles.weatherText}>
                    {weatherData.name}: {Math.round(weatherData.main.temp)}°C
                  </Text>
                  <Icon 
                    name={getWeatherIcon(weatherData.weather[0].icon)} 
                    type="material-community" 
                    color="#fff" 
                    size={24} 
                  />
                </Animatable.View>
              )}
              <View style={styles.widgetsContainer}>
                {[
                  { title: 'Upcoming Deadlines', icon: 'calendar-clock', data: upcomingDeadlines },
                  { title: 'Recent Announcements', icon: 'message-alert', data: recentAnnouncements },
                  { title: 'Quick Access', icon: 'rocket-launch', data: quickAccess },
                  { title: 'Task List Preview', icon: 'clipboard-list', data: taskListPreview },
                ].map((item, index) => (
                  <React.Fragment key={item.title}>
                    {loading ? renderGhostWidget(index) : renderWidget({ item, index })}
                  </React.Fragment>
                ))}
              </View>
              <Animatable.View animation="fadeInUp" style={styles.newsContainer}>
                <Text style={styles.newsTitle}>Latest News</Text>
                {newsData.map((article, index) => (
                  <Text key={index} style={styles.newsItem} numberOfLines={2} ellipsizeMode="tail">
                    • {article.title}
                  </Text>
                ))}
              </Animatable.View>
            </Animated.ScrollView>
          </PanGestureHandler>
        </LinearGradient>
      </SafeAreaView>
    );
  };

  const getWeatherIcon = (iconCode) => {
    // Map OpenWeatherMap icon codes to Material Community Icons
    const iconMap = {
      '01d': 'weather-sunny',
      '01n': 'weather-night',
      '02d': 'weather-partly-cloudy',
      '02n': 'weather-night-partly-cloudy',
      '03d': 'weather-cloudy',
      '03n': 'weather-cloudy',
      '04d': 'weather-cloudy',
      '04n': 'weather-cloudy',
      '09d': 'weather-rainy',
      '09n': 'weather-rainy',
      '10d': 'weather-pouring',
      '10n': 'weather-pouring',
      '11d': 'weather-lightning',
      '11n': 'weather-lightning',
      '13d': 'weather-snowy',
      '13n': 'weather-snowy',
      '50d': 'weather-fog',
      '50n': 'weather-fog',
    };
    return iconMap[iconCode] || 'weather-cloudy';
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
            name="Forum" 
            component={ForumScreen} 
            options={{
              tabBarIcon: ({ color, size }) => (
                <Icon name="forum" type="material-community" color={color} size={size} />
              ),
            }}
          />
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
    </GestureHandlerRootView>
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
  content: {
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
    marginTop: -100,
  },
  widgetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  widget: {
    width: '45%', // Adjust this value to control the width of each widget
    marginBottom: 20,
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
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  weatherText: {
    color: '#fff',
    fontSize: 16,
    marginRight: 10,
  },
  newsContainer: {
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    margin: 10,
    marginTop: 20, // Add some top margin to separate from widgets
    marginBottom: 30, // Add bottom margin for better spacing
  },
  newsTitle: {
    fontSize: 20, // Increase font size
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15, // Increase bottom margin
  },
  newsItem: {
    color: '#fff',
    fontSize: 16, // Increase font size
    marginBottom: 10, // Increase bottom margin
    lineHeight: 22, // Add line height for better readability
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