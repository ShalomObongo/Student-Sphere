import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import DashboardScreen from './screens/DashboardScreen';
import EditProfile from './screens/EditProfile';
import ProfileScreen from './screens/ProfileScreen';
import ResetPwd from './screens/resetPwd';
import TaskScreen from './screens/taskscreen';
import UnitScreen from './screens/unitscreen';
import Units from './screens/Units';
import Announcements from './screens/Announcements';
import UnitView from './screens/UnitView';
import ViewAnnouncement from './screens/ViewAnnouncement';
import AddCourseContent from './screens/AddCourseContent';
import Recommendations from './screens/Recommendations';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AddAnnouncement from './screens/addAnnounce';
import TableOptions from './screens/TableOptions';
import StudentTable from './screens/StudentTable';
import TeacherTable from './screens/TeacherTable';
import Requests from './screens/Request';
import ProcessRequest from './screens/ProcessRequest';
import AddUnit from './screens/AddUnit';
import Analytics from './screens/Analytics';
import { Provider as PaperProvider } from 'react-native-paper';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

async function registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
    } else {
        alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return token;
}

const Stack = createNativeStackNavigator();

export default function App() {
    const [tasks, setTasks] = React.useState([]);

    useEffect(() => {
        registerForPushNotificationsAsync();
    }, []);

    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home">
                    <Stack.Screen
                        name="Welcome"
                        component={HomeScreen}
                        options={{ title: 'Welcome' }}
                    />
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ title: 'Login' }}
                    />
                    <Stack.Screen
                        name="Registration"
                        component={RegistrationScreen}
                        options={{ title: 'Register' }}
                    />
                    <Stack.Screen
                        name="Dashboard"
                        component={DashboardScreen}
                        options={{ title: 'Student-Sphere' }}
                    />
                    <Stack.Screen
                        name="Profile screen"
                        component={ProfileScreen}
                        options={{ title: 'Profile screen' }}
                    />
                    <Stack.Screen
                        name="Edit Profile"
                        component={EditProfile}
                        options={{ title: 'Edit profile' }}
                    />
                    <Stack.Screen
                        name="Reset password"
                        component={ResetPwd}
                        options={{ title: 'Reset password' }}
                    />
                    <Stack.Screen
                        name="Task Screen"
                        component={TaskScreen}
                        options={{ title: 'Task Screen' }}
                    />
                    <Stack.Screen
                        name="Unit Screen"
                        component={UnitScreen}
                        options={{ title: 'Unit Screen' }}
                    />
                    <Stack.Screen
                        name="Units"
                        component={Units}
                        options={{ title: 'Units' }}
                    />
                    <Stack.Screen
                        name="Announcements"
                        component={Announcements}
                        options={{ title: 'Announcements' }}
                    />
                    <Stack.Screen
                        name="View Unit"
                        component={UnitView}
                        options={{ title: 'View Unit' }}
                    />
                    <Stack.Screen
                        name="View Announcement"
                        component={ViewAnnouncement}
                        options={{ title: 'View Announcement' }}
                    />
                    <Stack.Screen
                        name="Add course content"
                        component={AddCourseContent}
                        options={{ title: 'Add course content' }}
                    />
                    <Stack.Screen
                        name="Recommendations"
                        component={Recommendations}
                        options={{ title: 'Recommendations' }}
                    />
                    <Stack.Screen
                        name="Submit Announcement"
                        component={AddAnnouncement}
                        options={{ title: 'Submit Announcement' }}
                    />
                    <Stack.Screen
                        name="Table Options"
                        component={TableOptions}
                        options={{ title: 'Table Options' }}
                    />
                    <Stack.Screen
                        name="Student Table"
                        component={StudentTable}
                        options={{ title: 'Student Table' }}
                    />
                    <Stack.Screen
                        name="Teacher Table"
                        component={TeacherTable}
                        options={{ title: 'Teacher Table' }}
                    />
                    <Stack.Screen
                        name="Requests"
                        component={Requests}
                        options={{ title: 'Requests' }}
                    />
                    <Stack.Screen
                        name="Process ID Request"
                        component={ProcessRequest}
                        options={{ title: 'Process ID Request' }}
                    />
                    <Stack.Screen
                        name="AddUnit"
                        component={AddUnit}
                        options={{ title: 'Add Unit' }}
                    />
                    <Stack.Screen
                        name="Analytics"
                        component={Analytics}
                        options={{ title: 'Analytics' }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
            <StatusBar style="auto" />
        </PaperProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
