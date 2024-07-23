import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { auth } from '../firebase';

const db = getFirestore();

type RootStackParamList = {
  UserProfile: { userId: string };
  ThreadView: { threadId: string };
};

type UserProfileRouteProp = RouteProp<RootStackParamList, 'UserProfile'>;
type UserProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;

const UserProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute<UserProfileRouteProp>();
  const navigation = useNavigation<UserProfileNavigationProp>();
  const { userId } = route.params;

  useEffect(() => {
    fetchUserData();
    fetchUserThreads();
  }, [userId]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUser({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserThreads = async () => {
    try {
      const threadsQuery = query(
        collection(db, 'ForumThreads'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      const threadsSnapshot = await getDocs(threadsQuery);
      const threadsData = threadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching user threads:', error);
    }
  };

  const renderThreadItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.threadItem}
      onPress={() => navigation.navigate('ThreadView', { threadId: item.id })}
    >
      <Text style={styles.threadTitle}>{item.title}</Text>
      <Text style={styles.threadDate}>{item.createdAt.toDate().toLocaleDateString()}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!user) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <View style={styles.profileHeader}>
        <Text style={styles.username}>{user.firstName}</Text>
        <Text style={styles.userInfo}>{user.email}</Text>
        <Text style={styles.userInfo}>Joined: {user.createdAt?.toDate().toLocaleDateString()}</Text>
      </View>
      <View style={styles.threadSection}>
        <Text style={styles.sectionTitle}>Recent Threads</Text>
        <FlatList
          data={threads}
          renderItem={renderThreadItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.threadList}
        />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userInfo: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 3,
  },
  threadSection: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  threadList: {
    paddingBottom: 20,
  },
  threadItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  threadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  threadDate: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 5,
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default UserProfileScreen;