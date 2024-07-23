import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, SearchBar } from 'react-native-elements';
import { getFirestore, collection, query, getDocs, orderBy, where, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { BlurView } from 'expo-blur';
import { auth } from '../firebase';
import { Alert } from 'react-native';
import { getDoc, deleteDoc } from 'firebase/firestore';

const db = getFirestore();

type RootStackParamList = {
  ThreadView: { threadId: string };
  ThreadList: { categoryId: string; categoryName: string };
  CreateThread: { categoryId: string };
  ForumScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ForumScreen'>;

const ForumScreen = () => {
  const [threads, setThreads] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigation = useNavigation<NavigationProp>();
  const fadeAnim = new Animated.Value(0);
  const spinValue = new Animated.Value(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchThreads();
    animateNewThreadButton();
    const checkAdminStatus = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === 'admin');
        }
      }
    };
    checkAdminStatus();
  }, []);

  const fetchThreads = async () => {
    setRefreshing(true);
    try {
      const threadsQuery = query(collection(db, 'ForumThreads'), orderBy('createdAt', 'desc'), limit(20));
      const threadsSnapshot = await getDocs(threadsQuery);
      const threadsData = threadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> }));
      setThreads(threadsData);
    } catch (error) {
      console.error('Error fetching threads:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async (searchText: string = '') => {
    setSearchQuery(searchText);
    if (searchText.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const threadsQuery = query(
        collection(db, 'ForumThreads'),
        where('title', '>=', searchText),
        where('title', '<=', searchText + '\uf8ff'),
        orderBy('title'),
        limit(10)
      );
      const threadsSnapshot = await getDocs(threadsQuery);
      const threadsData = threadsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Record<string, any> }));
      setSearchResults(threadsData);
    } catch (error) {
      console.error('Error searching threads:', error);
    }
  };

  const renderThreadItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      duration={500}
      delay={index * 100}
      useNativeDriver
    >
      <TouchableOpacity
        style={styles.threadItem}
        onPress={() => navigation.navigate('ThreadView', { threadId: item.id })}
      >
        <BlurView intensity={80} tint="dark" style={styles.threadItemContent}>
          <Text style={styles.threadTitle}>{item.title}</Text>
          <Text style={styles.threadAuthor}>by {item.authorName}</Text>
          <View style={styles.threadMeta}>
            <Icon name="message-text" type="material-community" color="#ddd" size={16} />
            <Text style={styles.threadMetaText}>{item.replyCount || 0}</Text>
            <Icon name="eye" type="material-community" color="#ddd" size={16} style={styles.metaIcon} />
            <Text style={styles.threadMetaText}>{item.viewCount || 0}</Text>
          </View>
          {isAdmin && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteThread(item.id)}
            >
              <Icon name="delete" type="material-community" color="#ff6b6b" size={20} />
            </TouchableOpacity>
          )}
        </BlurView>
      </TouchableOpacity>
    </Animatable.View>
  );

  const handleDeleteThread = async (threadId: string) => {
    try {
      await deleteDoc(doc(db, 'ForumThreads', threadId));
      Alert.alert('Success', 'Thread deleted successfully');
      fetchThreads();
    } catch (error) {
      console.error('Error deleting thread:', error);
      Alert.alert('Error', 'Failed to delete thread. Please try again.');
    }
  };

  const animateNewThreadButton = () => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <View style={styles.header}>
        
        <SearchBar
          platform="default"
          placeholder="Search threads..."
          onChangeText={handleSearch}
          value={searchQuery}
          containerStyle={styles.searchBarContainer}
          inputContainerStyle={styles.searchBarInputContainer}
          inputStyle={styles.searchBarInput}
          searchIcon={{ name: 'search', type: 'material', color: '#fff' }}
          clearIcon={{ name: 'clear', type: 'material', color: '#fff' }}
          placeholderTextColor="#ccc"
          showLoading={false}
          lightTheme={false}
          round={true}
          onClear={() => setSearchQuery('')}
          onFocus={() => {}}
          onBlur={() => {}}
          onCancel={() => setSearchQuery('')}
          loadingProps={{}}
          cancelButtonTitle="Cancel"
          cancelButtonProps={{}}
          showCancel={true}
        />
      </View>
      <FlatList
        data={searchQuery.trim() !== '' ? searchResults : threads}
        renderItem={renderThreadItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.threadList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchThreads}
            tintColor="#fff"
            colors={['#fff']}
          />
        }
      />
      <Animated.View style={[styles.newThreadButtonContainer, { transform: [{ rotate: spin }] }]}>
        <TouchableOpacity
          style={styles.newThreadButton}
          onPress={() => navigation.navigate('CreateThread', { categoryId: 'general' })}
        >
          <Icon name="plus" type="material-community" color="#fff" size={24} />
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  searchBarContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 0,
  },
  searchBarInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
  },
  searchBarInput: {
    color: '#fff',
  },
  threadList: {
    padding: 16,
  },
  threadItem: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  threadItemContent: {
    padding: 16,
  },
  threadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  threadAuthor: {
    fontSize: 14,
    color: '#ddd',
    marginBottom: 8,
  },
  threadMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  threadMetaText: {
    fontSize: 14,
    color: '#ddd',
    marginLeft: 4,
    marginRight: 12,
  },
  metaIcon: {
    marginLeft: 8,
  },
  newThreadButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  newThreadButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default ForumScreen;