import { Ionicons } from '@expo/vector-icons';
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
import { useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Modal,
  Pressable,
  TextInput as RNTextInput,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Switch, Text } from 'react-native-paper';
import {
  GlassCard,
  GlassIconButton,
  GlassSurface,
  Pill,
  PrimaryButton,
  ScreenBackground,
} from '../components/ui';
import { auth, db } from '../firebaseConfig';
import { glass, palette, radius, spacing, ThemeContext, typography } from '../theme';

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
  const [settingsVisible, setSettingsVisible] = useState(false);
  const router = useRouter();

  // Unified app-wide theme (light/dark) instead of a separate local toggle.
  const { themeMode, toggleTheme, tokens } = useContext(ThemeContext);
  const darkMode = tokens.isDark;
  const t = darkMode ? palette.dark : palette.light;

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
    const trimmed = censor(text.trim());
    if (!trimmed) return;
    await addDoc(collection(db, 'posts'), {
      text: trimmed,
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
    <View style={{ flex: 1 }}>
      <ScreenBackground isDark={darkMode} ambient={tokens.ambient} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: spacing.lg }}>
          <View style={styles.barRow}>
            <View style={styles.brandRow}>
              <View style={styles.dot} />
              <Text style={[typography.h1, { color: t.text }]}>Gumnaam Raho</Text>
            </View>
            <GlassIconButton icon="settings-outline" isDark={darkMode} onPress={() => setSettingsVisible(true)} />
          </View>
          <Text style={{ color: t.textMuted, marginTop: -4, marginBottom: spacing.md, fontSize: 12.5 }}>
            {posts.length} whisper{posts.length === 1 ? '' : 's'} shared
          </Text>
        </View>

        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View>
              {/* Search bar */}
              <GlassSurface isDark={darkMode} radiusSize={radius.md} style={{ marginBottom: spacing.md }}>
                <View style={styles.searchRow}>
                  <Ionicons name="search-outline" size={17} color={t.textFaint} />
                  <RNTextInput
                    placeholder="Search whispers..."
                    placeholderTextColor={t.textFaint}
                    value={search}
                    onChangeText={setSearch}
                    style={[styles.searchInput, { color: t.text }]}
                  />
                </View>
              </GlassSurface>

              {/* Composer */}
              <GlassCard isDark={darkMode} style={{ marginBottom: spacing.lg }}>
                <RNTextInput
                  placeholder="What's on your mind? Say it anonymously..."
                  placeholderTextColor={t.textFaint}
                  value={text}
                  onChangeText={setText}
                  multiline
                  style={[styles.composerInput, { color: t.text }]}
                />
                <View style={styles.composerFooter}>
                  <Pill label="Anonymous" tone="primary" small />
                  <PrimaryButton
                    label="Post"
                    onPress={handlePost}
                    disabled={!text.trim()}
                    style={{ minWidth: 108 }}
                  />
                </View>
              </GlassCard>

              <Text style={[typography.h2, { color: t.text, marginBottom: spacing.sm }]}>
                Recent whispers
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="chatbubble-ellipses-outline" size={38} color={t.textFaint} />
              <Text style={[typography.bodyStrong, { color: t.textMuted, marginTop: spacing.sm }]}>
                No whispers yet
              </Text>
              <Text style={{ color: t.textFaint, marginTop: 2 }}>Be the first to share one.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostCard
              post={item}
              expanded={expanded === item.id}
              onToggle={() => setExpanded(expanded === item.id ? null : item.id)}
              onLike={() => toggleLikePost(item)}
              isOwner={item.uid === auth.currentUser.uid}
              darkMode={darkMode}
              tokens={t}
            />
          )}
        />

        <SettingsSheet
          visible={settingsVisible}
          onClose={() => setSettingsVisible(false)}
          darkMode={darkMode}
          onToggleDarkMode={toggleTheme}
          onLogout={handleLogout}
          tokens={t}
        />
      </SafeAreaView>
    </View>
  );
}

function SettingsSheet({ visible, onClose, darkMode, onToggleDarkMode, onLogout, tokens: t }) {
  const g = darkMode ? glass.dark : glass.light;
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.modalBackdrop} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%' }}>
          <GlassSurface
            isDark={darkMode}
            intensity={60}
            strong
            radiusSize={radius.xl}
            style={styles.sheet}
          >
            <View style={{ padding: spacing.lg }}>
              <View style={[styles.sheetHandle, { backgroundColor: g.border }]} />

              <View style={styles.sheetRow}>
                <View style={styles.sheetAvatar}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
                <View style={{ marginLeft: spacing.sm, flex: 1 }}>
                  <Text style={[typography.caption, { color: t.textFaint }]}>SIGNED IN AS</Text>
                  <Text style={[typography.bodyStrong, { color: t.text }]} numberOfLines={1}>
                    {auth.currentUser?.email}
                  </Text>
                </View>
              </View>

              <View style={[styles.sheetDivider, { backgroundColor: g.border }]} />

              <View style={[styles.sheetRow, { justifyContent: 'space-between' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name={darkMode ? 'moon' : 'sunny-outline'}
                    size={19}
                    color={t.textMuted}
                  />
                  <Text style={[typography.body, { color: t.text, marginLeft: spacing.sm }]}>
                    Dark mode
                  </Text>
                </View>
                <Switch value={darkMode} onValueChange={onToggleDarkMode} color={palette.primary} />
              </View>

              <View style={[styles.sheetDivider, { backgroundColor: g.border }]} />

              <Pressable style={styles.sheetRow} onPress={onLogout}>
                <Ionicons name="log-out-outline" size={19} color={palette.danger} />
                <Text style={[typography.body, { color: palette.danger, marginLeft: spacing.sm }]}>
                  Log out
                </Text>
              </Pressable>
            </View>
          </GlassSurface>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PostCard({ post, expanded, onToggle, onLike, isOwner, darkMode, tokens: t }) {
  const [fullH, setFullH] = useState(52);
  const anim = useRef(new Animated.Value(52)).current;
  const uid = auth.currentUser.uid;
  const [cm, setCm] = useState('');
  const [comments, setComments] = useState([]);
  const liked = post.likes?.includes(uid);
  const g = darkMode ? glass.dark : glass.light;

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
    Alert.alert('Delete post?', 'This cannot be undone.', [
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
          <View style={[styles.rightAction, { backgroundColor: darkMode ? 'rgba(251,113,133,0.16)' : '#FFE3E9' }]}>
            <Ionicons name="trash-outline" size={17} color={palette.danger} />
            <Text style={[styles.deleteText, { color: palette.danger }]}>Delete</Text>
          </View>
        ) : null
      }
      onSwipeableRightOpen={isOwner ? handleDelete : undefined}
    >
      <Pressable onPress={onToggle} onLongPress={onLike}>
        <GlassCard
          isDark={darkMode}
          style={[
            { marginBottom: spacing.md },
            isOwner && { borderColor: 'rgba(124,111,240,0.55)' },
          ]}
        >
          {isOwner && <Pill label="Yours" tone="primary" small />}

          <Animated.View style={{ height: anim, overflow: 'hidden', marginTop: isOwner ? 6 : 0 }}>
            <Text
              onLayout={e => setFullH(e.nativeEvent.layout.height)}
              style={[styles.postText, { color: t.text }]}
            >
              {post.text}
            </Text>
          </Animated.View>

          <View style={styles.postFooter}>
            <Text style={[styles.timestamp, { color: t.textFaint }]}>
              {post.timestamp?.toDate().toLocaleString() || 'Just now'}
            </Text>

            <View style={[styles.actionRow, { borderTopColor: g.border }]}>
              <Pressable onPress={onLike} style={styles.actionButton}>
                <Ionicons
                  name={liked ? 'heart' : 'heart-outline'}
                  size={16}
                  color={liked ? palette.danger : t.textMuted}
                />
                <Text style={[styles.actionText, { color: liked ? palette.danger : t.textMuted }]}>
                  {post.likes?.length || 0}
                </Text>
              </Pressable>

              <Pressable onPress={onToggle} style={styles.actionButton}>
                <Ionicons name="chatbubble-outline" size={15} color={t.textMuted} />
                <Text style={[styles.actionText, { color: t.textMuted }]}>
                  {comments.length || 0}
                </Text>
              </Pressable>
            </View>
          </View>

          {expanded && (
            <View style={[styles.commentsContainer, { borderTopColor: g.border }]}>
              <View style={styles.commentInputContainer}>
                <RNTextInput
                  placeholder="Add a comment..."
                  placeholderTextColor={t.textFaint}
                  value={cm}
                  onChangeText={setCm}
                  style={[
                    styles.commentInput,
                    { backgroundColor: t.surfaceAlt, borderColor: g.border, color: t.text },
                  ]}
                  multiline
                />
                <Pressable
                  onPress={handleNewComment}
                  disabled={!cm.trim()}
                  style={[styles.commentSend, { opacity: cm.trim() ? 1 : 0.4 }]}
                >
                  <Ionicons name="send" size={15} color={palette.primary} />
                </Pressable>
              </View>

              {comments.map(c => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  onDelete={async () => {
                    await deleteDoc(doc(db, 'posts', post.id, 'comments', c.id));
                  }}
                  isOwner={c.uid === uid}
                  tokens={t}
                />
              ))}
            </View>
          )}
        </GlassCard>
      </Pressable>
    </Swipeable>
  );
}

function CommentCard({ comment, isOwner, onDelete, tokens: t }) {
  return (
    <View style={[styles.commentCard, { backgroundColor: t.surfaceAlt }]}>
      <Text style={[styles.commentText, { color: t.text }]}>{comment.text}</Text>
      <View style={styles.commentFooter}>
        <Text style={[styles.commentTime, { color: t.textFaint }]}>
          {comment.timestamp?.toDate().toLocaleTimeString() || '...'}
        </Text>
        {isOwner && (
          <Pressable onPress={onDelete}>
            <Text style={styles.deleteCommentText}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.secondary,
    marginRight: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 46,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: 14.5,
    height: '100%',
  },
  composerInput: {
    fontSize: 15,
    minHeight: 66,
    textAlignVertical: 'top',
  },
  composerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  postText: {
    fontSize: 15.5,
    lineHeight: 22,
  },
  postFooter: {
    marginTop: spacing.sm,
  },
  timestamp: {
    fontSize: 11.5,
    marginBottom: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  commentsContainer: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 13.5,
    marginRight: spacing.sm,
    minHeight: 38,
    textAlignVertical: 'top',
  },
  commentSend: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,111,240,0.14)',
  },
  commentCard: {
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  commentText: {
    fontSize: 13.5,
    marginBottom: 4,
  },
  commentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  commentTime: {
    fontSize: 11,
  },
  deleteCommentText: {
    fontSize: 11,
    color: palette.danger,
    fontWeight: '700',
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    flex: 1,
    borderRadius: radius.lg,
    marginVertical: 3,
    marginLeft: spacing.sm,
    gap: 2,
  },
  deleteText: {
    fontWeight: '700',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(6,5,12,0.5)',
    justifyContent: 'flex-end',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sheetAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetDivider: {
    height: 1,
    marginVertical: 4,
  },
});