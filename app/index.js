import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Pressable,
  TextInput as RNTextInput,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Button, Switch, Text } from 'react-native-paper';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { auth, db } from '../firebaseConfig';
import styles from '../styles';

const SENSITIVE = ['kill', 'suicide', 'bomb', 'blast', 'murdered', 'rape'];
function censor(s) {
  return s.split(/\b/).map(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    return SENSITIVE.includes(clean)
      ? w[0] + '*'.repeat(w.length - 1)
      : w;
  }).join('');
}

async function registerPush() {
  if (!Device.isDevice) return;
  const { status } = await Notifications.getPermissionsAsync();
  const final = status === 'granted'
    ? status
    : (await Notifications.requestPermissionsAsync()).status;
  if (final !== 'granted') {
    Alert.alert('Push notifications not granted');
    return;
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export default function Home() {
  const [text, setText] = useState('');
  const [posts, setPosts] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const router = useRouter();

  // Load dark mode preference
  useEffect(() => {
    const loadDarkMode = async () => {
      try {
        const value = await AsyncStorage.getItem('darkMode');
        if (value !== null) {
          setDarkMode(JSON.parse(value));
        }
      } catch (e) {
        console.error('Failed to load dark mode preference', e);
      }
    };
    loadDarkMode();
  }, []);

  // Save dark mode preference
  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
    } catch (e) {
      console.error('Failed to save dark mode preference', e);
    }
  };

  useEffect(() => {
    registerPush().then(token => {
      if (auth.currentUser?.uid && token) {
        setDoc(doc(db, 'users', auth.currentUser.uid), { expoPushToken: token }, { merge: true });
      }
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handlePost = async () => {
    const t = censor(text.trim());
    if (!t) return;
    await addDoc(collection(db, 'posts'), {
      text: t,
      timestamp: serverTimestamp(),
      uid: auth.currentUser.uid,
      likes: [],
    });
    setText('');
  };

  const toggleLikePost = async (p) => {
    const uid = auth.currentUser.uid;
    const ref = doc(db, 'posts', p.id);
    const likes = p.likes || [];
    const updated = likes.includes(uid)
      ? likes.filter(u => u !== uid)
      : [...likes, uid];
    await updateDoc(ref, { likes: updated });
  };

  const filtered = posts.filter(p => p.text.toLowerCase().includes(search.toLowerCase()));

  const handleLogout = async () => {
    await auth.signOut();
    router.replace('/SignIn');
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ 
        flex: 1, 
        backgroundColor: darkMode ? '#121212' : '#fff'
      }}>
        {/* Header with Logo and Settings Icon */}
        <View style={[
          localStyles.headerContainer,
          { backgroundColor: '#0F4F4F' } // Your main color
        ]}>
          <Text style={localStyles.logoText}>
            Gumnaam
          </Text>
          <Pressable 
            onPress={() => setSettingsVisible(!settingsVisible)}
            style={localStyles.settingsButton}
          >
            <MaterialIcons 
              name="settings" 
              size={24} 
              color="#fff" // White icon on colored background
            />
          </Pressable>
        </View>

        {/* Settings Panel */}
        {settingsVisible && (
          <View style={[
            localStyles.settingsPanel,
            { backgroundColor: darkMode ? '#2a2a2a' : '#f5f5f5' }
          ]}>
            <View style={localStyles.settingsHeader}>
              <MaterialIcons 
                name="account-circle" 
                size={24} 
                color={darkMode ? '#fff' : '#0F4F4F'} 
              />
              <Text style={[
                localStyles.settingsText,
                { color: darkMode ? '#fff' : '#000' }
              ]}>
                {auth.currentUser?.email}
              </Text>
            </View>
            
            <View style={localStyles.switchContainer}>
              <MaterialIcons 
                name={darkMode ? 'dark-mode' : 'light-mode'} 
                size={24} 
                color={darkMode ? '#fff' : '#0F4F4F'} 
              />
              <Text style={[
                localStyles.settingsText,
                { color: darkMode ? '#fff' : '#000' ,padding:hp(1)}
              ]}>
                Dark Mode   
              </Text>
              <Switch 
                value={darkMode} 
                onValueChange={toggleDarkMode}
                color="#0F4F4F"
              />
            </View>
            
            <Button 
              mode="text" 
              onPress={handleLogout}
              textColor="#ff4444"
              style={localStyles.logoutButton}
              icon="logout"
            >
              Logout
            </Button>
          </View>
        )}


   <ScrollView
          contentContainerStyle={{ paddingBottom: hp(2) }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={localStyles.contentContainer}>
            <RNTextInput
              placeholder="Search whispers..."
              placeholderTextColor={darkMode ? '#aaa' : '#666'}
              value={search}
              onChangeText={setSearch}
              style={[
                localStyles.searchInput,
                { 
                  backgroundColor: darkMode ? '#1E1E1E' : '#fff',
                  borderColor: darkMode ? '#333' : '#ccc',
                  color: darkMode ? '#fff' : '#000'
                }
              ]}
            />

            <View style={localStyles.postInputContainer}>
              <RNTextInput
                placeholder="What's on your mind?"
                placeholderTextColor={darkMode ? '#aaa' : '#666'}
                value={text}
                onChangeText={setText}
                multiline
                style={[
                  localStyles.postInput,
                  { 
                    backgroundColor: darkMode ? '#1E1E1E' : '#fff',
                    borderColor: darkMode ? '#333' : '#ccc',
                    color: darkMode ? '#fff' : '#000'
                  }
                ]}
              />
              <Button
                mode="contained"
                onPress={handlePost}
                style={[styles.Main_BG, localStyles.postButton]}
                labelStyle={{ color: 'white' }}
                disabled={!text.trim()}
              >
                Post
              </Button>
            </View>

            {filtered.length === 0 ? (
              <View style={localStyles.emptyContainer}>
                <Text style={[
                  localStyles.emptyText,
                  { color: darkMode ? '#aaa' : '#666' }
                ]}>
                  No whispers yet. Be the first to post!
                </Text>
              </View>
            ) : (
              <FlatList
                scrollEnabled={false}
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <PostCard
                    post={item}
                    expanded={expanded === item.id}
                    onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
                    onLike={() => toggleLikePost(item)}
                    isOwner={item.uid === auth.currentUser.uid}
                    darkMode={darkMode}
                  />
                )}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function PostCard({ post, expanded, onToggle, onLike, isOwner, darkMode }) {
  const [fullH, setFullH] = useState(52);
  const anim = useRef(new Animated.Value(52)).current;
  const uid = auth.currentUser.uid;
  const [cm, setCm] = useState('');
  const [comments, setComments] = useState([]);
  const liked = post.likes?.includes(uid);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? fullH : 52,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [expanded, fullH]);

  useEffect(() => {
    if (!expanded) return;
    const q = query(collection(db, 'posts', post.id, 'comments'), orderBy('timestamp', 'asc'));
    return onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, [expanded]);

  const handleDelete = () => {
    Alert.alert('Delete post?', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          await deleteDoc(doc(db, 'posts', post.id));
        }
      }
    ]);
  };

  const handleNewComment = async () => {
    const c = censor(cm.trim());
    if (!c) return;
    await addDoc(collection(db, 'posts', post.id, 'comments'), {
      text: c,
      timestamp: serverTimestamp(),
      uid,
      likes: []
    });
    setCm('');
  };

  return (
    <Swipeable
      renderRightActions={() =>
        isOwner ? (
          <View style={[localStyles.rightAction, { backgroundColor: darkMode ? '#2a2a2a' : '#f8d7da' }]}>
            <Text style={[localStyles.deleteText, { color: '#dc3545' }]}>Delete</Text>
          </View>
        ) : null
      }
      onSwipeableRightOpen={isOwner ? handleDelete : undefined}
    >
      <Pressable onPress={onToggle} onLongPress={onLike}>
        <View style={[
          localStyles.card,
          { backgroundColor: darkMode ? '#1E1E1E' : '#fff' },
          isOwner && { borderLeftWidth: 4, borderLeftColor: '#0F4F4F' }
        ]}>
          <Animated.View style={{ height: anim, overflow: 'hidden' }}>
            <Text 
              onLayout={e => setFullH(e.nativeEvent.layout.height)} 
              style={[localStyles.postText, { color: darkMode ? '#fff' : '#333' }]}
            >
              {post.text}
            </Text>
          </Animated.View>

          <View style={localStyles.postFooter}>
            <Text style={[localStyles.timestamp, { color: darkMode ? '#aaa' : '#666' }]}>
              {post.timestamp?.toDate().toLocaleString() || '...'}
            </Text>
            
            <View style={localStyles.actionRow}>
              <Pressable onPress={onLike} style={localStyles.actionButton}>
                <Text style={[
                  localStyles.actionText, 
                  { color: darkMode ? '#fff' : '#0F4F4F' },
                  liked && { color: '#dc3545' }
                ]}>
                  {liked ? '❤ Liked' : '♡ Like'} ({post.likes?.length || 0})
                </Text>
              </Pressable>
              
              <Pressable onPress={onToggle} style={localStyles.actionButton}>
                <Text style={[
                  localStyles.actionText,
                  { color: darkMode ? '#fff' : '#0F4F4F' }
                ]}>
                  💬 Comment ({comments.length})
                </Text>
              </Pressable>
            </View>
          </View>

          {expanded && (
            <View style={[localStyles.commentsContainer, { borderTopColor: darkMode ? '#333' : '#f0f0f0' }]}>
              <View style={localStyles.commentInputContainer}>
                <RNTextInput
                  placeholder="Add a comment..."
                  placeholderTextColor={darkMode ? '#aaa' : '#666'}
                  value={cm}
                  onChangeText={setCm}
                  style={[
                    localStyles.commentInput,
                    { 
                      backgroundColor: darkMode ? '#2a2a2a' : '#fff',
                      borderColor: darkMode ? '#333' : '#ddd',
                      color: darkMode ? '#fff' : '#000'
                    }
                  ]}
                  multiline
                />
                <Button
                  mode="contained"
                  onPress={handleNewComment}
                  style={[styles.Main_BG, localStyles.commentButton]}
                  labelStyle={{ color: 'white', fontSize: 12 }}
                  disabled={!cm.trim()}
                >
                  Post
                </Button>
              </View>
              
              {comments.map(c => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  onDelete={async () => {
                    await deleteDoc(doc(db, 'posts', post.id, 'comments', c.id));
                  }}
                  isOwner={c.uid === uid}
                  darkMode={darkMode}
                />
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Swipeable>
  );
}

function CommentCard({ comment, isOwner, onDelete, darkMode }) {
  return (
    <View style={[
      localStyles.commentCard,
      { backgroundColor: darkMode ? '#2a2a2a' : '#f9f9f9' }
    ]}>
      <Text style={[localStyles.commentText, { color: darkMode ? '#fff' : '#333' }]}>
        {comment.text}
      </Text>
      <View style={localStyles.commentFooter}>
        <Text style={[localStyles.commentTime, { color: darkMode ? '#aaa' : '#666' }]}>
          {comment.timestamp?.toDate().toLocaleTimeString() || '...'}
        </Text>
        {isOwner && (
          <Pressable onPress={onDelete}>
            <Text style={localStyles.deleteCommentText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the logo
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingVertical: hp(2),
    backgroundColor: '#0F4F4F', // Your main color
    position: 'relative', // For absolute positioning of settings icon
  },
  logoText: {
    fontSize: hp(2.8),
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  settingsButton: {
    position: 'absolute',
    right: wp(5),
    padding: wp(3),
  },
   settingsPanel: {
    padding: wp(5),
    marginHorizontal: wp(5),
    borderRadius: 8,
    marginBottom: hp(2),
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  settingsText: {
    fontSize: hp(1.8),
    marginLeft: wp(2),
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  logoutButton: {
    alignSelf: 'flex-start',
    marginTop: hp(1),
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(0),
  },
  searchInput: {
    borderWidth: 1,
    padding: wp(3),
    borderRadius: 8,
    marginBottom: hp(2),
    marginTop: hp(2),
    fontSize: hp(1.8),
  },
  postInputContainer: {
    marginBottom: hp(2),
  },
  postInput: {
    borderWidth: 1,
    padding: wp(3),
    borderRadius: 8,
    minHeight: hp(10),
    fontSize: hp(1.8),
    marginBottom: hp(1),
    textAlignVertical: 'top',
  },
  postButton: {
    borderRadius: 8,
    paddingVertical: hp(0.8),
  },
  emptyContainer: {
    paddingVertical: hp(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: hp(2),
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: wp(5),
    flex: 1,
    borderRadius: 8,
    marginVertical: hp(0.5),
  },
  deleteText: {
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 8,
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postText: {
    fontSize: hp(1.9),
    lineHeight: hp(2.5),
  },
  postFooter: {
    marginTop: hp(1),
  },
  timestamp: {
    fontSize: hp(1.5),
    marginBottom: hp(1),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: hp(1),
  },
  actionButton: {
    paddingVertical: hp(0.5),
  },
  actionText: {
    fontSize: hp(1.7),
  },
  commentsContainer: {
    marginTop: hp(1.5),
    paddingTop: hp(1),
    borderTopWidth: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginBottom: hp(1),
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: wp(3),
    fontSize: hp(1.7),
    marginRight: wp(2),
    minHeight: hp(5),
    textAlignVertical: 'top',
  },
  commentButton: {
    borderRadius: 8,
    paddingVertical: hp(0.5),
  },
  commentCard: {
    borderRadius: 8,
    padding: wp(3),
    marginBottom: hp(1),
  },
  commentText: {
    fontSize: hp(1.7),
    marginBottom: hp(0.5),
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentTime: {
    fontSize: hp(1.4),
  },
  deleteCommentText: {
    fontSize: hp(1.4),
    color: '#dc3545',
    fontWeight: 'bold',
  },
});