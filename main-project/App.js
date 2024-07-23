import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import React from 'react';
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
import AddAnnouncement from './screens/addAnnounce';
import TableOptions from './screens/TableOptions';
import StudentTable from './screens/StudentTable';
import TeacherTable from './screens/TeacherTable';
import Requests from './screens/Request';
import ProcessRequest from './screens/ProcessRequest';
import AddUnit from './screens/AddUnit';
import Analytics from './screens/Analytics';
import ForumScreen from './screens/ForumScreen';
import ThreadListScreen from './screens/ThreadListScreen';
import ThreadViewScreen from './screens/ThreadViewScreen';
import CreateThreadScreen from './screens/CreateThreadScreen';
import UserProfileScreen from './screens/UserProfileScreen';
import { Provider as PaperProvider } from 'react-native-paper';
import AddRecommendation from './screens/addRecommendation';
import OtpScreen from './screens/OTPScreen';


const Stack = createNativeStackNavigator();

export default function App() {
    const [tasks, setTasks] = React.useState([]);

    return (
        <PaperProvider>
            <NavigationContainer>
                <Stack.Navigator
                    screenOptions={{
                        headerStyle: {
                            backgroundColor: '#4c669f',
                        },
                        headerTintColor: '#fff',
                        headerTitleStyle: {
                            fontWeight: 'bold',
                        },
                        headerTitleAlign: 'center',
                        headerBackTitleVisible: false,
                    }}
                >
                    <Stack.Screen
                        name="Welcome"
                        component={HomeScreen}
                        options={{
                            title: 'Welcome to Student-Sphere',
                            headerShown: false,
                        }}
                    />
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{
                            title: 'Login',
                            headerTransparent: true,
                            headerTitle: '',
                        }}
                    />
                    <Stack.Screen
                        name="Registration"
                        component={RegistrationScreen}
                        options={{
                            title: 'Create Account',
                            headerTransparent: true,
                            headerTitle: '',
                        }}
                    />
                    <Stack.Screen
                        name="Dashboard"
                        component={DashboardScreen}
                        options={{
                            title: 'Student-Sphere',
                            headerLeft: null,
                        }}
                    />
                    <Stack.Screen
                        name="Profile screen"
                        component={ProfileScreen}
                        options={{
                            title: 'My Profile',
                        }}
                    />
                    <Stack.Screen
                        name="Edit Profile"
                        component={EditProfile}
                        options={{
                            title: 'Edit Profile',
                        }}
                    />
                    <Stack.Screen
                        name="Reset password"
                        component={ResetPwd}
                        options={{
                            title: 'Reset Password',
                        }}
                    />
                    <Stack.Screen
                        name="Task Screen"
                        component={TaskScreen}
                        options={{
                            title: 'My Tasks',
                        }}
                    />
                    <Stack.Screen
                        name="Unit Screen"
                        component={UnitScreen}
                        options={{
                            title: 'Unit Details',
                        }}
                    />
                    <Stack.Screen
                        name="Units"
                        component={Units}
                        options={{
                            title: 'My Units',
                        }}
                    />
                    <Stack.Screen
                        name="Announcements"
                        component={Announcements}
                        options={{
                            title: 'Announcements',
                        }}
                    />
                    <Stack.Screen
                        name="View Unit"
                        component={UnitView}
                        options={{
                            title: 'Unit Overview',
                        }}
                    />
                    <Stack.Screen
                        name="View Announcement"
                        component={ViewAnnouncement}
                        options={{
                            title: 'Announcement Details',
                        }}
                    />
                    <Stack.Screen
                        name="Add course content"
                        component={AddCourseContent}
                        options={{
                            title: 'Add Course Content',
                        }}
                    />
                    <Stack.Screen
                        name="Recommendations"
                        component={Recommendations}
                        options={{
                            title: 'Recommendations',
                        }}
                    />
                    <Stack.Screen
                        name="Submit Announcement"
                        component={AddAnnouncement}
                        options={{
                            title: 'Create Announcement',
                        }}
                    />
                    <Stack.Screen
                        name="Table Options"
                        component={TableOptions}
                        options={{
                            title: 'User Tables',
                        }}
                    />
                    <Stack.Screen
                        name="Student Table"
                        component={StudentTable}
                        options={{
                            title: 'Student Directory',
                        }}
                    />
                    <Stack.Screen
                        name="Teacher Table"
                        component={TeacherTable}
                        options={{
                            title: 'Teacher Directory',
                        }}
                    />
                    <Stack.Screen
                        name="Requests"
                        component={Requests}
                        options={{
                            title: 'ID Requests',
                        }}
                    />
                    <Stack.Screen
                        name="Process ID Request"
                        component={ProcessRequest}
                        options={{
                            title: 'Process Request',
                        }}
                    />
                    <Stack.Screen
                        name="AddUnit"
                        component={AddUnit}
                        options={{
                            title: 'Add New Unit',
                        }}
                    />
                    <Stack.Screen
                        name="Analytics"
                        component={Analytics}
                        options={{
                            title: 'Analytics Dashboard',
                        }}
                    />
                    <Stack.Screen
                        name="Forum"
                        component={ForumScreen}
                        options={{
                            title: 'Forum',
                        }}
                    />
                    <Stack.Screen
                        name="ThreadList"
                        component={ThreadListScreen}
                        options={({ route }) => ({ title: route.params.categoryName })}
                    />
                    <Stack.Screen
                        name="ThreadView"
                        component={ThreadViewScreen}
                        options={{
                            title: 'Thread',
                        }}
                    />
                    <Stack.Screen
                        name="CreateThread"
                        component={CreateThreadScreen}
                        options={{
                            title: 'Create Thread',
                        }}
                    />
                    <Stack.Screen
                        name="UserProfile"
                        component={UserProfileScreen}
                        options={{
                            title: 'User Profile',
                        }}
                    />
                    <Stack.Screen
                        name="AddRecommendation"
                        component={AddRecommendation}
                        options={{ title: 'Give Recommendation' }}
                    />
                    <Stack.Screen
                        name="Login with OTP"
                        component={OtpScreen}
                        options={{ title: 'Login with OTP' }}
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