import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, TextInput, Animated, Image, Keyboard } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from 'react-native-elements';
import { getFirestore, collection, query, getDocs, orderBy, where, addDoc, doc, getDoc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { auth } from '../firebase';
import { BlurView } from 'expo-blur';

const db = getFirestore();

type RootStackParamList = {
  ThreadView: { threadId: string };
  UserProfile: { userId: string };
  // other routes...
};

interface Reply {
  id: string;
  authorId: string;
  // Add other properties as needed
}

const ThreadViewScreen = () => {
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [authorEmails, setAuthorEmails] = useState({});
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'ThreadView'>>();
  const { threadId } = route.params;
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const currentUserId = auth.currentUser?.uid;
  const [replyInputHeight, setReplyInputHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    fetchThreadAndReplies();
    const unsubscribe = onSnapshot(
      query(collection(db, 'ForumReplies'), where('threadId', '==', threadId), orderBy('createdAt', 'asc')),
      (snapshot) => {
        const repliesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reply[];
        setReplies(repliesData);
        scrollToBottom();
      }
    );

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    return () => unsubscribe();
  }, [threadId]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const incrementViewCount = async () => {
      if (thread) {
        const threadRef = doc(db, 'ForumThreads', threadId);
        await updateDoc(threadRef, {
          viewCount: increment(1)
        });
      }
    };
    incrementViewCount();
  }, [threadId, thread]);

  const fetchThreadAndReplies = async () => {
    setRefreshing(true);
    try {
      const threadDoc = await getDoc(doc(db, 'ForumThreads', threadId));
      if (threadDoc.exists()) {
        setThread({ id: threadDoc.id, ...threadDoc.data() });
      }

      const repliesQuery = query(
        collection(db, 'ForumReplies'),
        where('threadId', '==', threadId),
        orderBy('createdAt', 'asc')
      );
      const repliesSnapshot = await getDocs(repliesQuery);
      const repliesData = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Reply[];
      setReplies(repliesData);
      scrollToBottom();

      // Fetch author emails
      const authorIds = new Set(repliesData.map(reply => reply.authorId));
      const emailPromises = Array.from(authorIds).map(async (authorId) => {
        const userDoc = await getDoc(doc(db, 'users', authorId));
        return userDoc.exists() ? { [authorId]: userDoc.data().email } : {};
      });
      const emailResults = await Promise.all(emailPromises);
      const emailMap = Object.assign({}, ...emailResults);
      setAuthorEmails(emailMap);
    } catch (error) {
      console.error('Error fetching thread and replies:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddReply = async () => {
    if (newReply.trim() === '') return;

    try {
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userEmail = userDoc.exists() ? userDoc.data().email : user.email;
      const replyData = {
        threadId,
        content: newReply,
        authorId: user.uid,
        authorName: userEmail,
        createdAt: new Date(),
      };
      await addDoc(collection(db, 'ForumReplies'), replyData);

      // Update the reply count in the thread document
      const threadRef = doc(db, 'ForumThreads', threadId);
      await updateDoc(threadRef, {
        replyCount: increment(1)
      });

      setNewReply('');
      fetchThreadAndReplies();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const renderReplyItem = useCallback(({ item }) => {
    const isCurrentUser = item.authorId === currentUserId;

    return (
      <Animatable.View 
        animation={isCurrentUser ? "fadeInRight" : "fadeInLeft"} 
        duration={500} 
        style={[
          styles.replyItem,
          isCurrentUser ? styles.replyItemRight : styles.replyItemLeft
        ]}
      >
        <BlurView intensity={80} tint={isCurrentUser ? "light" : "dark"} style={styles.replyBlur}>
          {!isCurrentUser && (
            <View style={styles.replyHeader}>
              {/* <Image 
                source={require('../images/logo2.png')} 
                style={styles.avatar}
              /> */}
              <Text style={styles.replyAuthor}>{authorEmails[item.authorId] || item.authorName}</Text>
            </View>
          )}
          <Text style={[
            styles.replyContent,
            isCurrentUser ? styles.replyContentRight : styles.replyContentLeft
          ]}>{item.content}</Text>
          <Text style={[
            styles.replyDate,
            isCurrentUser ? styles.replyDateRight : styles.replyDateLeft
          ]}>{item.createdAt.toDate().toLocaleString()}</Text>
        </BlurView>
      </Animatable.View>
    );
  }, [authorEmails, currentUserId]);

  if (!thread) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.threadHeader}>
          <Text style={styles.threadTitle}>{thread.title}</Text>
          <Text style={styles.threadAuthor}>by {thread.authorName}</Text>
          <View style={styles.threadStats}>
            <Icon name="eye" type="material-community" color="#ddd" size={16} />
            <Text style={styles.threadStatText}>{thread.viewCount || 0}</Text>
            <Icon name="message-text" type="material-community" color="#ddd" size={16} style={styles.statIcon} />
            <Text style={styles.threadStatText}>{replies.length}</Text>
          </View>
        </View>
        <FlatList
          ref={scrollViewRef}
          data={replies}
          renderItem={renderReplyItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContainer,
            { paddingBottom: replyInputHeight + 20 }
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchThreadAndReplies} />
          }
        />
        <BlurView
          intensity={80}
          tint="dark"
          style={styles.replyInputContainer}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout;
            setReplyInputHeight(height);
          }}
        >
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor="#999"
            value={newReply}
            onChangeText={setNewReply}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleAddReply}>
            <Icon name="send" type="material-community" color="#fff" size={24} />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
  threadHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  threadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  threadAuthor: {
    fontSize: 14,
    color: '#ddd',
    marginTop: 4,
  },
  threadStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  threadStatText: {
    fontSize: 14,
    color: '#ddd',
    marginLeft: 4,
    marginRight: 12,
  },
  statIcon: {
    marginLeft: 8,
  },
  listContainer: {
    padding: 16,
  },
  replyItem: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  replyItemLeft: {
    alignSelf: 'flex-start',
  },
  replyItemRight: {
    alignSelf: 'flex-end',
  },
  replyBlur: {
    borderRadius: 16,
    overflow: 'hidden',
    padding: 12,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
  },
  replyAuthor: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  replyContent: {
    fontSize: 16,
    marginBottom: 4,
  },
  replyContentLeft: {
    color: '#fff',
  },
  replyContentRight: {
    color: 'black', // Darker text color for better readability
  },
  replyDate: {
    fontSize: 12,
  },
  replyDateLeft: {
    color: '#ccc',
    alignSelf: 'flex-start',
  },
  replyDateRight: {
    color: '#333',
    alignSelf: 'flex-end',
  },
  replyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  replyInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#fff',
    marginRight: 8,
    maxHeight: 100,
    marginBottom: 25,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
});

export default ThreadViewScreen;