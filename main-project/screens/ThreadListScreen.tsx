import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import { getFirestore, collection, query, getDocs, orderBy, where, DocumentData } from 'firebase/firestore';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';

const db = getFirestore();

interface Thread extends DocumentData {
  id: string;
  title: string;
  authorName: string;
  replyCount: number;
}

type RootStackParamList = {
  ThreadView: { threadId: string };
  CreateThread: { categoryId: string };
  // Add other screen names and their params here
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ThreadView'>;

const ThreadListScreen: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { categoryId, categoryName } = route.params as { categoryId: string; categoryName: string };

  useEffect(() => {
    fetchThreads();
  }, [categoryId]);

  const fetchThreads = async () => {
    setRefreshing(true);
    try {
      const threadsQuery = query(
        collection(db, 'ForumThreads'),
        where('categoryId', '==', categoryId),
        orderBy('createdAt', 'desc')
      );
      const threadsSnapshot = await getDocs(threadsQuery);
      const threadsData = threadsSnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title ?? '',
        authorName: doc.data().authorName ?? '',
        replyCount: doc.data().replyCount ?? 0,
        ...doc.data()
      } as Thread));
      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const renderThreadItem = ({ item }: { item: Thread }) => (
    <Animatable.View animation="fadeIn" duration={500}>
      <TouchableOpacity 
        style={styles.threadItem}
        onPress={() => navigation.navigate('ThreadView', { threadId: item.id })}
      >
        <View style={styles.threadInfo}>
          <Text style={styles.threadTitle}>{item.title}</Text>
          <Text style={styles.threadAuthor}>by {item.authorName}</Text>
        </View>
        <View style={styles.threadStats}>
          <Text style={styles.threadReplies}>{item.replyCount} replies</Text>
          <Icon name="chevron-right" type="material-community" color="#fff" size={24} />
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <Text style={styles.categoryTitle}>{categoryName}</Text>
      <FlatList
        data={threads}
        renderItem={renderThreadItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchThreads} />
        }
      />
      <TouchableOpacity 
        style={styles.newThreadButton}
        onPress={() => navigation.navigate('CreateThread', { categoryId })}
      >
        <Icon name="plus" type="material-community" color="#fff" size={24} />
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    padding: 16,
  },
  listContainer: {
    padding: 16,
  },
  threadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  threadInfo: {
    flex: 1,
  },
  threadTitle: {
    fontSize: 18,
  },
  threadAuthor: {
    fontSize: 16,
    color: '#ccc',
  },
  threadStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  threadReplies: {
    fontSize: 16,
    marginRight: 8,
  },
  newThreadButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
});

export default ThreadListScreen;