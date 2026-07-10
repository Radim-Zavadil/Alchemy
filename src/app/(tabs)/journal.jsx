import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View, Text, Pressable, Dimensions, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator, Image,
  Modal, Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Plus, ArrowLeft, Image as ImageIcon, ArrowUp, X, List, MessageSquare } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const REVIEWS_KEY = 'alchemy_reviews';
const DREAM_KEY = 'alchemy_user_dream_v3'; 

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// ============================================================
// SUB-COMPONENT: DREAM VIEW (THE MAIN UPDATE SCREEN MODE)
// ============================================================
function DreamView({ metrics, dreamData, onSaveDream, onBack }) {
  const insets = useSafeAreaInsets();
  const [localDream, setLocalDream] = useState(dreamData || {});
  const [images, setImages] = useState(dreamData?.uploadedImages || {});
  const [viewingAiChat, setViewingAiChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const HEADER_HEIGHT = insets.top + 50;

  // Question handlers
  const updateQuestion = (key, text) => {
    setIsEditing(true);
    const updated = { ...localDream, [key]: text, uploadedImages: images };
    setLocalDream(updated);
  };

  const handleSaveButtonPress = () => {
    onSaveDream(localDream);
    setIsEditing(false);
  };

  const handleSimulateGallery = (key) => {
    setIsEditing(true);
    const newImages = { ...images };
    if (newImages[key]) {
      delete newImages[key];
    } else {
      newImages[key] = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80';
    }
    setImages(newImages);
    const updated = { ...localDream, uploadedImages: newImages };
    setLocalDream(updated);
  };

  // Performance calculations
  const overallScore = useMemo(() => {
    const total = (metrics.health + metrics.mindset + metrics.career + metrics.relationships) / 4;
    return Math.round(total);
  }, [metrics]);

  const totalTicks = 85; 
  const activeTicksThreshold = Math.round((overallScore / 100) * totalTicks);

  const contributors = [
    { label: 'Health', value: metrics.health, color: 'rgba(255, 255, 255, 0.08)' },
    { label: 'Mindset', value: metrics.mindset, color: 'rgba(255, 255, 255, 0.08)' },
    { label: 'Career', value: metrics.career, color: 'rgba(255, 255, 255, 0.08)' },
    { label: 'Relationships', value: metrics.relationships, color: 'rgba(255, 255, 255, 0.08)' },
  ];

  const DREAM_QUESTIONS = [
    { key: 'q1', label: 'What are your the most important goals and when do you want to achieve them?', hasImage: false },
    { key: 'q2', label: 'How should look like your dream home?', hasImage: true },
    { key: 'q3', label: 'Do you have dream car?', hasImage: true },
    { key: 'q4', label: 'Do you have dream fashion style?', hasImage: true },
    { key: 'q5', label: 'What is your dream fitness level?', hasImage: true },
    { key: 'q6', label: 'Paint a picture of your dream business life.', hasImage: true },
    { key: 'q7', label: 'Who are people you deeply admire, respect, or aspire to be like?', hasImage: true },
    { key: 'q8', label: 'What does financial freedom look like to you?', hasImage: false },
    { key: 'q9', label: 'What does your dream family and relationship look like?', hasImage: true },
    { key: 'q10', label: 'What does your perfect day look like from morning to night?', hasImage: false },
    { key: 'q11', label: 'Add photos of activities and hobbies you want to enjoy.', hasImage: true },
    { key: 'q12', label: 'What would you regret most if you looked back 1 year from now and hadn\'t accomplished it?', hasImage: false },
    { key: 'q13', label: 'What specific traits, behaviours, qualities, or achievements make you admire these people?', hasImage: false },
    { key: 'q14', label: 'What specific traits, behaviors, or qualities do you dislike about these people?', hasImage: false },
    { key: 'q15', label: 'What specific skills, knowledge, and qualities does this future self have that you currently lack or need to develop?', hasImage: false },
    { key: 'q16', label: 'What daily habits and routines does this future self maintain consistently?', hasImage: false },
    { key: 'q17', label: 'What bad habits, patterns, or behaviours has this future self eliminated that you currently struggle with?', hasImage: false },
    { key: 'q18', label: 'How does this future self present themselves?', hasImage: false },
    { key: 'q19', label: 'If people were talking about this future you at a coffee shop, what would they say?', hasImage: false },
    { key: 'q20', label: 'What specific fears, doubts, and limiting beliefs are holding you back from becoming the person you admire and dream of being?', hasImage: false },
    { key: 'q21', label: 'What current commitments, responsibilities, or comfort zones keep you stuck in your current identity instead of transforming into your future self?', hasImage: false },
    { key: 'q22', label: 'What\'s the single biggest thing that must change for you to bridge the gap between who you are now and your future self?', hasImage: false },
  ];

  if (viewingAiChat) {
    return <AiChatView onBack={() => setViewingAiChat(false)} />;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Image 
          source={require('../../../assets/images/blurs/top.png')} 
          style={ds.topBlurBackground} 
        />
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 12, paddingTop: insets.top + 10, paddingBottom: 140 }} 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
      >
        {/* Scrollable, Non-Sticky Custom Header */}
        <View style={{ height: HEADER_HEIGHT, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 10 }}>
          <Pressable onPress={onBack} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, width: 30 })}>
            <ArrowLeft size={22} color="#ffffff" />
          </Pressable>
          <Text style={ds.headerTitle}>Dream Vision Blueprint</Text>
          <Pressable onPress={() => setViewingAiChat(true)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, width: 30, alignItems: 'flex-end' })}>
            <MessageSquare size={20} color="#ffffff" />
          </Pressable>
        </View>
        
        {/* Main Performance Metric Gauge Box */}
        <View style={ds.metricsCardContainer}>
          <View style={ds.gaugeContainer}>
            <View style={ds.ticksWrapper}>
              {[...Array(totalTicks)].map((_, i) => {
                const rotation = -90 + (i * (180 / (totalTicks - 1)));
                const isActive = i <= activeTicksThreshold;
                return (
                  <View 
                    key={i} 
                    style={[
                      ds.tickLine, 
                      { 
                        transform: [{ rotate: `${rotation}deg` }, { translateY: -125 }], 
                        backgroundColor: isActive ? '#dcdcdc' : 'rgba(240, 240, 240, 0.18)',
                        height: 12
                      }
                    ]} 
                  />
                );
              })}
            </View>
            <View style={ds.scoreOverlay}>
              <Text style={ds.hugeScore}>{overallScore}</Text>
              <Text style={ds.inRangeTag}>In range <Text style={{ color: '#0ac378' }}>●</Text></Text>
              <Text style={ds.scoreLabel}>DREAM VISION ALIGNMENT SCORE</Text>
              <Text style={ds.dateSubText}>Today</Text>
            </View>
          </View>

          <View style={ds.horizontalDivider} />

          {/* Sub-metrics Row Under Gauge */}
          <View style={ds.subMetricsRow}>
            <View style={ds.subMetricItem}>
              <Text style={ds.subMetricLabel}>Consistency</Text>
              <Text style={ds.subMetricValue}>78% <Text style={{ color: '#e91e63', fontSize: 10 }}>●</Text></Text>
            </View>
            <View style={ds.subMetricItem}>
              <Text style={ds.subMetricLabel}>Trajectory</Text>
              <Text style={ds.subMetricValue}>85% <Text style={{ color: '#0ac378', fontSize: 10 }}>●</Text></Text>
            </View>
          </View>
        </View>

        {/* Update Recap Message Container */}
        <Pressable onPress={() => setViewingAiChat(true)} style={({ pressed }) => [ds.recapCardContainer, { opacity: pressed ? 0.85 : 1 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={ds.recapHeader}>DREAM VISION UPDATE</Text>
            <Sparkles size={12} color="rgba(255,255,255,0.4)" />
          </View>
          <Text style={ds.recapBodyText}>
            You are consistent with your highest leverage actions! Your Trajectory has improved by <Text style={{ color: '#0ac378', fontWeight: '600' }}>12%</Text>. Maintain this momentum to reach your 1-year goals.
          </Text>
        </Pressable>

        {/* Contributors */}
        <Text style={[ds.sectionHeader, { paddingHorizontal: 12 }]}>Fueling Contributors</Text>
        <View style={{ gap: 4, marginBottom: 36, paddingHorizontal: 12 }}>
          {contributors.map((item) => (
            <View key={item.label} style={ds.contributorRow}>
              <View style={[ds.behindFillTrack, { width: `${item.value}%`, backgroundColor: item.color }]} />
              <Text style={ds.contributorLabel}>{item.label}</Text>
              <Text style={ds.contributorValue}>{item.value}%</Text>
            </View>
          ))}
        </View>

        <Text style={[ds.sectionHeader, { marginBottom: 24, fontSize: 18, paddingHorizontal: 12 }]}>Dream Vision Blueprint</Text>
        
        <View style={{ paddingHorizontal: 12 }}>
          {DREAM_QUESTIONS.map((q) => (
            <View key={q.key} style={{ marginBottom: 36 }}>
              <View style={ds.questionHeaderRow}>
                <Text style={ds.questionLabel}>{q.label}</Text>
                {q.hasImage && (
                  <Pressable onPress={() => handleSimulateGallery(q.key)} style={({ pressed }) => [ds.inlineImagePicker, { opacity: pressed ? 0.5 : 1 }]}>
                    <ImageIcon size={18} color={images[q.key] ? '#0ac378' : 'rgba(255,255,255,0.4)'} />
                  </Pressable>
                )}
              </View>

              {images[q.key] && (
                <View style={ds.squareImagePreviewContainer}>
                  <Pressable style={{ flex: 1 }} onPress={() => setSelectedImage(images[q.key])}>
                    <Image source={{ uri: images[q.key] }} style={ds.previewImageFrame} />
                  </Pressable>
                  <Pressable onPress={() => handleSimulateGallery(q.key)} style={ds.removeImageBadge}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>Remove</Text>
                  </Pressable>
                </View>
              )}

              <TextInput
                style={ds.minimalTextArea}
                multiline
                scrollEnabled={false}
                value={localDream[q.key] || ''}
                onChangeText={(text) => updateQuestion(q.key, text)}
                placeholder="Tap to express your vision..."
                placeholderTextColor="rgba(255,255,255,0.2)"
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Save Button Floating Above Navigation Layout (Less Wide Capsule Style) */}
      {isEditing && (
        <View style={[ds.floatingSaveButtonContainer, { bottom: Math.max(insets.bottom + 65, 80) }]}>
          <Pressable 
            style={({ pressed }) => [ds.floatingWhiteSaveButton, { opacity: pressed ? 0.9 : 1 }]}
            onPress={handleSaveButtonPress}
          >
            <Text style={ds.floatingSaveButtonText}>Save</Text>
          </Pressable>
        </View>
      )}

      {/* Image Gallery Modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <View style={ds.modalLightBox}>
          <Pressable style={ds.modalCloseBtn} onPress={() => setSelectedImage(null)}><X size={26} color="#ffffff" /></Pressable>
          {selectedImage && <Image source={{ uri: selectedImage }} style={ds.modalFullImage} />}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// SUB-COMPONENT: AI CHAT SCREEN
// ==========================================
function AiChatView({ onBack }) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Hello! I am your AI assistant. Ask me anything about your alignment and goals.', sender: 'ai' }
  ]);
  const [inputText, setInputText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  
  const mockAiResponses = [
    "That sounds amazing! How does that connect back to your core mindset metrics?",
    "Fascinating perspective. Let's make sure this aligns heavily with your 1-year goals.",
    "Consistency is key. What is the single highest leverage action you can perform tomorrow?",
    "I've updated your focus trajectory. Remember to track your body care alongside this.",
    "Understood. Let's optimize this strategy to save you mental energy."
  ];

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const userMsg = { id: Date.now().toString(), text: inputText, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setTimeout(() => {
      const randomResponse = mockAiResponses[Math.floor(Math.random() * mockAiResponses.length)];
      const aiMsg = { id: (Date.now() + 1).toString(), text: randomResponse, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    }, 800);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      <StatusBar style="light" />
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Image 
          source={require('../../../assets/images/blurs/top.png')} 
          style={{ width: width * 1.1, height: height * 0.3, position: 'absolute', top: -20, left: -width * 0.05, resizeMode: 'stretch', opacity: 0.8 }} 
        />
        <Image 
          source={require('../../../assets/images/blurs/bubble.png')} 
          style={{ width: width * 1.1, height: height * 0.4, position: 'absolute', bottom: -30, left: -width * 0.05, resizeMode: 'stretch', opacity: 0.8 }} 
        />
      </View>
      <View style={{ paddingTop: insets.top + 10, paddingHorizontal: 24, height: insets.top + 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
        <Pressable onPress={onBack} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
          <ArrowLeft size={24} color="#ffffff" />
        </Pressable>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>AI Assistant</Text>
        <Pressable onPress={() => setModalVisible(true)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 4 })}>
          <List size={24} color="#ffffff" />
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: insets.bottom + 90 }} showsVerticalScrollIndicator={false}>
        {messages.map(m => (
          <View key={m.id} style={[chatStyles.messageBubble, m.sender === 'user' ? chatStyles.userBubble : chatStyles.aiBubble]}>
            <Text style={{ color: '#fff', fontSize: 15, lineHeight: 20 }}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[chatStyles.stickyInputWrapper, { bottom: Math.max(insets.bottom, 16) }]}>
        <View style={chatStyles.inputContainer}>
          <TextInput style={chatStyles.textInput} value={inputText} onChangeText={setInputText} placeholder="Continue conversation..." placeholderTextColor="rgba(255,255,255,0.4)" />
          <Pressable onPress={handleSendMessage} style={chatStyles.sendBtn}><ArrowUp size={20} color="#000" strokeWidth={2.5} /></Pressable>
        </View>
      </View>
      <Modal visible={modalVisible} transparent={false} animationType="slide">
        <View style={chatStyles.modalContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 60, marginBottom: 20 }}>
            <View style={{ width: 24 }} /> <Text style={{ color: '#fff', fontSize: 18, fontWeight: '500' }}>Conversations</Text>
            <Pressable onPress={() => setModalVisible(false)}><X size={24} color="#ffffff" /></Pressable>
          </View>
          <ScrollView><View style={chatStyles.historyCard}><Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Current Alignment Coaching</Text><Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>Active Session</Text></View></ScrollView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// SUB-COMPONENT: ADD REVIEW VIEW
// ==========================================
function AddReviewView({ onSave, onBack }) {
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState({ alignment: '', bodyCare: '', mindset: '', goalsProgress: '', nextWeekPriority: '' });
  const HEADER_HEIGHT = insets.top + 60;
  const holdAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const fields = [
    { key: 'alignment', label: 'How aligned were your actions with your future self this week?' },
    { key: 'bodyCare', label: 'How did you take care of your body this week?' },
    { key: 'mindset', label: 'How was your mindset this week?' },
    { key: 'goalsProgress', label: 'How much did your work or studies move you closer to your goals?' },
    { key: 'nextWeekPriority', label: 'What\'s the single most important thing you\'ll do next week?' }
  ];
  const handlePressIn = () => {
    Animated.timing(holdAnim, { toValue: 1, duration: 5000, useNativeDriver: false }).start();
    timerRef.current = setTimeout(() => { onSave(answers); }, 5000);
  };
  const handlePressOut = () => {
    clearTimeout(timerRef.current);
    Animated.timing(holdAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
  };
  const progressBgColor = holdAnim.interpolate({ inputRange: [0, 1], outputRange: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'] });
  const progressIconColor = holdAnim.interpolate({ inputRange: [0, 1], outputRange: ['#ffffff', '#000000'] });

  return (
    <View style={{ flex: 1, backgroundColor: '#020206' }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <View style={{ height: HEADER_HEIGHT, backgroundColor: '#020206', justifyContent: 'flex-end', paddingBottom: 14, paddingHorizontal: 24 }}><Pressable onPress={onBack}><ArrowLeft size={24} color="#ffffff" /></Pressable></View>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: HEADER_HEIGHT + 20, paddingBottom: insets.bottom + 170 }} showsVerticalScrollIndicator={false}>
        {fields.map((f) => (
          <View key={f.key} style={{ marginBottom: 36 }}><Text style={s.pageFieldTitle}>{f.label}</Text><TextInput style={s.pageFieldBottomLineInput} multiline scrollEnabled={false} placeholder="Type your reflection here..." placeholderTextColor="rgba(255,255,255,0.25)" value={answers[f.key]} onChangeText={t => setAnswers(p => ({ ...p, [f.key]: t }))} /></View>
        ))}
      </ScrollView>
      <View style={{ position: 'absolute', bottom: insets.bottom + 90, left: 16, right: 16, zIndex: 10, alignItems: 'center' }}>
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={s.roundSaveArrowBtn}><Animated.View style={[StyleSheet.absoluteFillObject, { backgroundColor: progressBgColor }]} /><ArrowUp size={24} strokeWidth={2.5} color={progressIconColor} /></Pressable>
      </View>
    </View>
  );
}

// ==========================================
// CORE ROOT COMPONENT: JOURNALSCREEN
// ==========================================
export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingAddReview, setViewingAddReview] = useState(false);
  const [dreamData, setDreamData] = useState({});
  const [viewingDream, setViewingDream] = useState(true); 
  const [activeTab, setActiveTab] = useState('health');

  useEffect(() => {
    const load = async () => {
      try {
        const sd = await AsyncStorage.getItem(DREAM_KEY);
        if (sd) setDreamData(JSON.parse(sd));
        const sr = await AsyncStorage.getItem(REVIEWS_KEY);
        if (sr) setReviews(JSON.parse(sr));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const { metrics } = useMemo(() => {
    const base = { health: 65, mindset: 48, career: 72, relationships: 85 };
    if (reviews.length > 0) {
      reviews.forEach(r => {
        if (r.metricsChanged) {
          base.health = Math.max(0, Math.min(100, base.health + (r.metricsChanged.health || 0)));
          base.mindset = Math.max(0, Math.min(100, base.mindset + (r.metricsChanged.mindset || 0)));
          base.career = Math.max(0, Math.min(100, base.career + (r.metricsChanged.career || 0)));
          base.relationships = Math.max(0, Math.min(100, base.relationships + (r.metricsChanged.relationships || 0)));
        }
      });
    }
    return { metrics: base };
  }, [reviews]);

  const handleSaveDream = async (newData) => {
    setDreamData(newData);
    await AsyncStorage.setItem(DREAM_KEY, JSON.stringify(newData));
  };

  const handleCreateReview = async (submittedAnswers) => {
    if (!submittedAnswers.alignment || !submittedAnswers.bodyCare || !submittedAnswers.mindset) { 
      alert('Please fill out the primary review questions.'); 
      return; 
    }
    const entry = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], title: 'Weekly Alignment Log', answers: { ...submittedAnswers }, metricsChanged: { health: 1 } };
    const updated = [...reviews, entry];
    setReviews(updated);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    setViewingAddReview(false);
  };

  if (viewingDream) return <DreamView metrics={metrics} dreamData={dreamData} onSaveDream={handleSaveDream} onBack={() => setViewingDream(false)} />;
  if (viewingAddReview) return <AddReviewView onSave={handleCreateReview} onBack={() => setViewingAddReview(false)} />;

  const MAIN_TABS = [
    { id: 'health', label: 'Health', icon: require('../../../assets/images/icons/health.png') },
    { id: 'career', label: 'Career', icon: require('../../../assets/images/icons/career.png') },
    { id: 'relationships', label: 'Relationships', icon: require('../../../assets/images/icons/relationships.png') },
  ];
  const renderProgressBar = (labelName, valueKey) => {
    const value = metrics[valueKey];
    return (
      <View key={valueKey} style={{ marginBottom: 20 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}><Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{labelName}</Text><Text style={{ color: '#ffffff', fontSize: 16 }}>{value}%</Text></View><View style={{ height: 4, backgroundColor: '#333339', borderRadius: 2 }}><View style={{ height: '100%', width: `${value}%`, backgroundColor: '#ffffff', borderRadius: 2 }} /></View></View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020206' }}>
      <StatusBar style="light" />
      {loading ? (<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#FFFFFF" /></View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 120 }}>
          <View style={{ alignItems: 'center', marginBottom: 36 }}><Pressable onPress={() => setViewingDream(true)} style={{ position: 'absolute', left: 0, top: 0, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}><Sparkles size={15} color="#ffffff" /></Pressable><Text style={{ fontSize: 18, color: '#ffffff', paddingTop: 6 }}>Review</Text><Pressable onPress={() => setViewingAddReview(true)} style={{ position: 'absolute', right: 0, top: 0, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}><Plus size={16} color="#ffffff" /></Pressable></View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>{MAIN_TABS.map((tab) => (<Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={{ alignItems: 'center', flex: 1, opacity: activeTab === tab.id ? 1 : 0.4 }}><Image source={tab.icon} style={{ width: 68, height: 68, marginBottom: 10, resizeMode: 'contain' }} /><Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>{tab.label}</Text><Text style={{ fontSize: 24, color: '#ffffff', fontWeight: '600' }}>{metrics[tab.id]}%</Text></Pressable>))}</View>
          <View style={{ marginBottom: 40 }}>{activeTab === 'health' ? [renderProgressBar('Health', 'health'), renderProgressBar('Mindset', 'mindset')] : renderProgressBar(activeTab.charAt(0).toUpperCase() + activeTab.slice(1), activeTab)}</View>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 20 }}>Weekly Review Timeline</Text>
          {reviews.map((rev) => (<View key={rev.id} style={tl.rowItem}><View style={tl.axisColumn}><View style={[tl.lineSegment, { backgroundColor: 'rgba(255,255,255,0.1)' }]} /><View style={tl.cleanDotNode} /></View><View style={tl.bodyCard}><Text style={{ color: '#ffffff', fontSize: 16 }}>{rev.title}</Text><Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{formatDate(rev.date)}</Text></View></View>))}
        </ScrollView>
      )}
    </View>
  );
}

// ==========================================
// CONSOLIDATED STYLESHEETS
// ==========================================
const ds = StyleSheet.create({
  topBlurBackground: { width: width * 1.1, height: height * 0.35, position: 'absolute', top: -20, left: -width * 0.05, resizeMode: 'stretch', opacity: 0.6 },
  headerTitle: { color: '#ffffff', fontSize: 16, fontWeight: '600', flex: 1, textAlign: 'center' },
  metricsCardContainer: {
    backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16,
    paddingVertical: 50, paddingHorizontal: 16, marginBottom: 16, alignItems: 'center', width: '100%'
  },
  gaugeContainer: { height: 165, alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%', marginTop: 15 },
  ticksWrapper: { position: 'absolute', width: 270, height: 270, alignItems: 'center', justifyContent: 'center', top: -35 },
  tickLine: { position: 'absolute', width: 1.5, borderRadius: 1 }, 
  scoreOverlay: { alignItems: 'center', justifyContent: 'center', top: 5 },
  hugeScore: { color: '#ffffff', fontSize: 79, fontWeight: '500', letterSpacing: -1, lineHeight: 74, marginBottom: 0 }, 
  inRangeTag: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 12, marginTop: -2, marginBottom: 2 },
  scoreLabel: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, textAlign: 'center', marginTop: 4 },
  dateSubText: { color: 'rgba(255, 255, 255, 0.3)', fontSize: 11, marginTop: 2 },
  horizontalDivider: { width: '100%', height: 1, backgroundColor: 'rgba(255, 255, 255, 0.06)', marginVertical: 20 },
  subMetricsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingHorizontal: 10 },
  subMetricItem: { alignItems: 'center' },
  subMetricLabel: { color: 'rgba(255, 255, 255, 0.5)', fontSize: 13, marginBottom: 6 },
  subMetricValue: { color: '#ffffff', fontSize: 20, fontWeight: '500' },
  recapCardContainer: {
    backgroundColor: '#0a0a0c', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)', borderRadius: 16,
    padding: 20, marginBottom: 36, width: '100%'
  },
  recapHeader: { color: 'rgba(255, 255, 255, 0.4)', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8 },
  recapBodyText: { color: 'rgba(255,255,255,0.85)', fontSize: 14, lineHeight: 22 },
  sectionHeader: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginBottom: 16 },
  contributorRow: {
    height: 38, width: '100%', backgroundColor: 'transparent', borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4,
    overflow: 'hidden'
  },
  behindFillTrack: { position: 'absolute', top: 0, left: 0, bottom: 0, opacity: 0.7, borderRadius: 4 },
  contributorLabel: { color: '#ffffff', fontSize: 14, fontWeight: '500', zIndex: 1 },
  contributorValue: { color: 'rgba(255,255,255,0.6)', fontSize: 14, zIndex: 1 },
  questionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  questionLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '500', lineHeight: 20, flex: 1, paddingRight: 16 },
  inlineImagePicker: { padding: 4 },
  squareImagePreviewContainer: { width: '100%', height: 180, borderRadius: 12, overflow: 'hidden', marginBottom: 12, position: 'relative' },
  previewImageFrame: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, borderRadius: 12 },
  minimalTextArea: { color: '#ffffff', fontSize: 15, lineHeight: 22, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingVertical: 8, minHeight: 36, textAlignVertical: 'top' },
  floatingSaveButtonContainer: { position: 'absolute', left: 0, right: 0, zIndex: 9999, alignItems: 'center' },
  floatingWhiteSaveButton: { backgroundColor: '#ffffff', width: 140, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 6 },
  floatingSaveButtonText: { color: '#000000', fontSize: 14, fontWeight: '600', letterSpacing: 0.3 },
  modalLightBox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalCloseBtn: { position: 'absolute', top: 40, right: 24, zIndex: 10 },
  modalFullImage: { width: width, height: height * 0.7, resizeMode: 'contain' }
});

const chatStyles = StyleSheet.create({
  messageBubble: { maxWidth: '80%', padding: 14, borderRadius: 20, marginBottom: 14 },
  userBubble: { backgroundColor: 'rgba(255, 255, 255, 0.15)', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'rgba(255, 255, 255, 0.06)', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  stickyInputWrapper: { position: 'absolute', left: 0, right: 0, paddingHorizontal: 20, backgroundColor: 'transparent', zIndex: 9999 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgb(30, 30, 32)', borderRadius: 28, paddingHorizontal: 16, height: 54, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.15)' },
  textInput: { flex: 1, color: '#ffffff', fontSize: 15, paddingVertical: 10, height: '100%' },
  sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  modalContainer: { flex: 1, backgroundColor: '#000000', paddingTop: 40, paddingHorizontal: 24 },
  historyCard: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 14, marginBottom: 12 }
});

const s = StyleSheet.create({
  roundSaveArrowBtn: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  pageFieldTitle: { color: '#ffffff', fontSize: 20, fontWeight: '600', marginBottom: 14 },
  pageFieldBottomLineInput: { backgroundColor: 'transparent', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', paddingVertical: 8, color: '#fff', fontSize: 16 },
});

const tl = StyleSheet.create({
  rowItem: { flexDirection: 'row', minHeight: 60, marginBottom: 10 },
  axisColumn: { width: 16, alignItems: 'center', justifyContent: 'center' },
  lineSegment: { flex: 1, width: 1 },
  cleanDotNode: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.6)' },
  bodyCard: { flex: 1, paddingLeft: 20, paddingBottom: 10 },
});