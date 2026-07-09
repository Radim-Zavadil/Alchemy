import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable, Dimensions, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback,
  StyleSheet, ActivityIndicator, Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sparkles, Plus, ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const REVIEWS_KEY = 'alchemy_reviews';
const DREAM_KEY = 'alchemy_user_dream';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

// ==========================================
// SUB-SCREEN: DREAM VIEW (INLINE IN OBJECT)
// ==========================================
function DreamView({ metrics, dreamText, onSaveDream, onBack }) {
  const insets = useSafeAreaInsets();
  const [localDream, setLocalDream] = useState(dreamText);

  const overallScore = useMemo(() => {
    const total = (metrics.health + metrics.mindset + metrics.career + metrics.relationships) / 4;
    return Math.round((total / 10) * 10) / 10; 
  }, [metrics]);

  const fuelPercentage = Math.round((overallScore / 10) * 100);

  const totalTicks = 50;
  const activeTicksThreshold = Math.round((fuelPercentage / 100) * totalTicks);

  const contributors = [
    { label: 'Health', value: metrics.health, color: 'rgba(255, 255, 255, 0.08)' },
    { label: 'Mindset', value: metrics.mindset, color: 'rgba(255, 255, 255, 0.08)' },
    { label: 'Career', value: metrics.career, color: 'rgba(255, 255, 255, 0.08)' },
    { label: 'Relationships', value: metrics.relationships, color: 'rgba(255, 255, 255, 0.08)' },
  ];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={{ flex: 1, backgroundColor: '#000000' }}
    >
      {/* Top Navbar Actions */}
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', zIndex: 10 }}>
        <Pressable onPress={() => { onSaveDream(localDream); onBack(); }} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, paddingVertical: 4 })}>
          <ArrowLeft size={22} color="#ffffff" />
        </Pressable>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 80 }} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        
        {/* Widened, Structured Half-Circle Gauge layout */}
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
                      transform: [{ rotate: `${rotation}deg` }, { translateY: -115 }],
                      backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.12)'
                    }
                  ]} 
                />
              );
            })}
          </View>

          {/* Core Central Metrics nested safely within the arch path */}
          <View style={ds.scoreOverlay}>
            <Text style={ds.hugeScore}>{Math.round(overallScore)}</Text>
            <Text style={ds.scoreLabel}>Fueling Score</Text>
            <Text style={ds.statusText}>Optimally Fueled</Text>
          </View>
        </View>

        {/* Dynamic Descriptive Section */}
        <Text style={ds.descriptionParagraph}>
          You were optimally fueled for <Text style={{ color: '#0ac378', fontWeight: '600' }}>{fuelPercentage}%</Text> of the time during your workout. This helps <Text style={{ color: '#0ac378', fontWeight: '600' }}>improve exercise performance</Text>.
        </Text>

        {/* Shorter Fueling Contributors List Section */}
        <Text style={ds.sectionHeader}>Fueling Contributors</Text>
        <View style={{ gap: 8, marginBottom: 36 }}>
          {contributors.map((item) => (
            <View key={item.label} style={ds.contributorRow}>
              <View style={[ds.behindFillTrack, { width: `${item.value}%`, backgroundColor: item.color }]} />
              <Text style={ds.contributorLabel}>{item.label}</Text>
              <Text style={ds.contributorValue}>{item.value}%</Text>
            </View>
          ))}
        </View>

        {/* Pure minimalist dream text view region */}
        <Text style={[ds.sectionHeader, { marginBottom: 10 }]}>Dream Vision</Text>
        <TextInput
          style={ds.pureTextArea}
          multiline
          scrollEnabled={false}
          value={localDream}
          onChangeText={(text) => {
            setLocalDream(text);
            onSaveDream(text);
          }}
          placeholder="Type your ideal future target layout metrics here..."
          placeholderTextColor="rgba(255,255,255,0.25)"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ==========================================
// CORE COMPONENT ROOT EXPORT ENTRYPOINT
// ==========================================
export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [dreamText, setDreamText] = useState('');
  const [viewingDream, setViewingDream] = useState(false);
  const [answers, setAnswers] = useState({ habits: '', health: '', financial: '', relationships: '' });
  const [activeTab, setActiveTab] = useState('health');

  useEffect(() => {
    const load = async () => {
      try {
        const sd = await AsyncStorage.getItem(DREAM_KEY);
        if (sd) setDreamText(sd);
        const sr = await AsyncStorage.getItem(REVIEWS_KEY);
        if (sr) setReviews(JSON.parse(sr));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const { metrics, trends, changes } = useMemo(() => {
    const base = { health: 65, mindset: 48, career: 72, relationships: 85 };
    const calculatedTrends = { health: 'up', mindset: 'down', career: 'up', relationships: 'stable' };
    const lastChanges = { health: 4, mindset: -2, career: 5, relationships: 0 };
    
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
    return { metrics: base, trends: calculatedTrends, changes: lastChanges };
  }, [reviews]);

  const handleSaveDream = async (newText) => {
    setDreamText(newText);
    await AsyncStorage.setItem(DREAM_KEY, newText);
  };

  const analyzeWeeklyInput = (a) => {
    const t = Object.values(a).join(' ').toLowerCase();
    const c = { health: 0, mindset: 0, career: 0, relationships: 0 };
    c.health = (t.includes('sleep') || t.includes('water') || t.includes('gym')) ? Math.floor(Math.random() * 3) + 1 : (Math.random() > 0.5 ? 0 : -1);
    c.career = (t.includes('work') || t.includes('study') || t.includes('code')) ? Math.floor(Math.random() * 3) + 1 : (Math.random() > 0.5 ? 0 : -1);
    c.relationships = (t.includes('friend') || t.includes('family') || t.includes('partner')) ? Math.floor(Math.random() * 3) + 1 : (Math.random() > 0.5 ? 0 : -1);
    
    let mi = 1;
    ['good', 'great', 'happy', 'focus', 'discipline'].forEach(w => { if (t.includes(w)) mi++; });
    c.mindset = mi;
    return c;
  };

  const submitReview = async () => {
    if (!answers.habits || !answers.health || !answers.financial || !answers.relationships) { alert('Please fill in all review sections.'); return; }
    let calculatedTitle = 'Weekly Review';
    if (answers.health && !answers.habits && !answers.financial) calculatedTitle = 'Health & Wellbeing';
    else if (answers.financial && !answers.health) calculatedTitle = 'Career Expansion';

    const entry = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], title: calculatedTitle, answers: { ...answers }, metricsChanged: analyzeWeeklyInput(answers) };
    const updated = [...reviews, entry];
    setReviews(updated);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    setAnswers({ habits: '', health: '', financial: '', relationships: '' });
    setReviewModalVisible(false);
  };

  if (viewingDream) {
    return (
      <DreamView 
        metrics={metrics} 
        dreamText={dreamText} 
        onSaveDream={handleSaveDream} 
        onBack={() => setViewingDream(false)} 
      />
    );
  }

  const FIELDS = [
    ['habits', 'Habits & Routine', 'What routines did you uphold?'],
    ['health', 'Health & Vigor', 'How was sleep, nutrition, and exercise?'],
    ['financial', 'Finance & Security', 'What were your financial decisions?'],
    ['relationships', 'Connections & Relations', 'How are relations with friends/family?'],
  ];

  const MAIN_TABS = [
    { id: 'health', label: 'Health', icon: require('../../../assets/images/icons/health.png') },
    { id: 'career', label: 'Career', icon: require('../../../assets/images/icons/career.png') },
    { id: 'relationships', label: 'Relationships', icon: require('../../../assets/images/icons/relationships.png') },
  ];

  const renderProgressBar = (labelName, valueKey) => {
    const value = metrics[valueKey];
    const change = changes[valueKey];
    const trend = trends[valueKey];
    const arrow = trend === 'up' ? ' ↑' : trend === 'down' ? ' ↓' : '';
    const changeText = change !== 0 ? ` (${change > 0 ? '+' : ''}${change}%)` : '';
    const trendColor = change > 0 ? '#0ac378' : change < 0 ? '#ff503c' : 'rgba(255,255,255,0.3)';

    return (
      <View key={valueKey} style={{ marginBottom: 20, width: '100%' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: '500' }}>{labelName}</Text>
          <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '400' }}>
            {value}%<Text style={{ fontSize: 13, color: trendColor }}>{arrow}{changeText}</Text>
          </Text>
        </View>
        <View style={{ height: 4, backgroundColor: '#333339', borderRadius: 2, width: '100%', overflow: 'hidden' }}>
          <View style={{ height: '100%', width: `${value}%`, backgroundColor: '#ffffff', borderRadius: 2 }} />
        </View>
      </View>
    );
  };

  // Helper inside loop to extract the first significant metric change tag
  const renderTrendTag = (metricsChanged) => {
    if (!metricsChanged) return null;
    const items = Object.entries(metricsChanged);
    const primary = items.find(([_, val]) => val !== 0) || items[0];
    if (!primary || primary[1] === 0) return null;

    const [key, val] = primary;
    const isUp = val > 0;
    const displayLabel = key.charAt(0).toUpperCase() + key.slice(1);
    
    return (
      <View style={[tl.tagContainer, { backgroundColor: isUp ? 'rgba(10,195,120,0.08)' : 'rgba(255,80,60,0.08)' }]}>
        <Text style={[tl.tagText, { color: isUp ? '#0ac378' : '#ff503c' }]}>
          {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{val}% {displayLabel}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#020206' }}>
      <StatusBar style="light" />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 24, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: 'center', marginBottom: 36, position: 'relative', width: '100%' }}>
            <View style={{ position: 'absolute', left: 0, top: 0, zIndex: 10 }}>
              <Pressable onPress={() => setViewingDream(true)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' })}>
                <Sparkles size={15} color="#ffffff" />
              </Pressable>
            </View>
            <Text style={{ fontSize: 18, fontWeight: '400', color: '#ffffff', letterSpacing: 0.5, paddingTop: 6 }}>Review</Text>
            <View style={{ position: 'absolute', right: 0, top: 0, zIndex: 10 }}>
              <Pressable onPress={() => setReviewModalVisible(true)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' })}>
                <Plus size={16} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              {MAIN_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)} style={{ alignItems: 'center', flex: 1, paddingVertical: 12, position: 'relative', opacity: isActive ? 1 : 0.4 }}>
                    <Image 
                      source={tab.icon} 
                      style={{ width: 80, height: 80, marginBottom: 8, resizeMode: 'contain' }} 
                    />
                    <Text style={{ fontSize: 27, fontWeight: '500', color: '#ffffff' }}>{metrics[tab.id]}%</Text>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffffff', marginTop: 4, letterSpacing: 1.3 }}>{tab.label.toUpperCase()}</Text>
                    {isActive && <View style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, backgroundColor: '#ffffff' }} />}
                  </Pressable>
                );
              })}
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', width: '100%', marginBottom: 28 }} />
            <View style={{ paddingHorizontal: 4 }}>
              {activeTab === 'health' && [renderProgressBar('Health', 'health'), renderProgressBar('Mindset', 'mindset')]}
              {activeTab === 'career' && renderProgressBar('Career', 'career')}
              {activeTab === 'relationships' && renderProgressBar('Relationships', 'relationships')}
            </View>
          </View>

          {/* GENERATED CONTENT MARGIN SEPARATOR BUFFER */}
          <View style={{ marginTop: 32, gap: 0 }}>
            {reviews.length === 0 ? (
              <View style={{ paddingVertical: 52, alignItems: 'center' }}>
                <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, textAlign: 'center' }}>{'No logs yet.\nTap + to write your first weekly review.'}</Text>
              </View>
            ) : (
              [...reviews].reverse().map((item, idx, reversedArr) => {
                const isFirst = idx === 0;
                const isLast = idx === reversedArr.length - 1;

                return (
                  <View key={item.id} style={tl.rowItem}>
                    {/* ACCURATE INDEPENDENT TIMELINE CONNECTOR LINE AXIS COMPONENTS */}
                    <View style={tl.axisColumn}>
                      <View style={[tl.lineSegment, { backgroundColor: isFirst ? 'transparent' : 'rgba(255,255,255,0.1)' }]} />
                      <View style={tl.cleanDotNode} />
                      <View style={[tl.lineSegment, { backgroundColor: isLast ? 'transparent' : 'rgba(255,255,255,0.1)' }]} />
                    </View>

                    {/* MAIN EXPANDED CONTENT DATA AREA WITH CORNER PROGRESS CHIP TAGS */}
                    <View style={tl.bodyCard}>
                      <View style={tl.cardHeaderGroup}>
                        <View style={{ flex: 1, paddingRight: 8 }}>
                          <Text style={{ color: '#ffffff', fontSize: 17, fontWeight: '700', marginBottom: 3 }} numberOfLines={1}>{item.title}</Text>
                          <Text style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11 }}>{formatDate(item.date)}</Text>
                        </View>
                        {renderTrendTag(item.metricsChanged)}
                      </View>
                      
                      <View style={{ gap: 6, marginTop: 12 }}>
                        {Object.entries(item.answers).map(([k, v]) => v ? (
                          <Text key={k} style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.65)', fontWeight: '600' }}>{k}: </Text>
                            {v}
                          </Text>
                        ) : null)}
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* WEEKLY LOG MODAL */}
      <Modal visible={reviewModalVisible} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setReviewModalVisible(false)}>
          <View style={s.modalBg}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.modalWrapper}>
                <View style={s.modalContent}>
                  <View style={s.modalHeader}><Plus size={16} color="#ffffff" /><Text style={s.modalTitle}>Weekly Log</Text></View>
                  <ScrollView style={{ maxHeight: height * 0.45 }} showsVerticalScrollIndicator={false}>
                    <View style={{ gap: 14, paddingBottom: 10 }}>
                      {FIELDS.map(([key, label, ph]) => (
                        <View key={key}>
                          <Text style={s.fieldLabel}>{label}</Text>
                          <TextInput style={s.fieldInput} placeholder={ph} placeholderTextColor="rgba(255,255,255,0.25)" value={answers[key]} onChangeText={t => setAnswers(p => ({ ...p, [key]: t }))} />
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 18 }}>
                    <Pressable onPress={() => setReviewModalVisible(false)} style={s.cancelBtn}><Text style={{ color: '#fff', fontSize: 13 }}>Cancel</Text></Pressable>
                    <Pressable onPress={submitReview} style={s.saveBtn}><Text style={{ color: '#000', fontSize: 13, fontWeight: '700' }}>Save Log</Text></Pressable>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

// ==========================================
// CORE STYLESHEETS
// ==========================================
const s = StyleSheet.create({
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalWrapper: { width: '90%', maxWidth: 400 },
  modalContent: { borderRadius: 24, padding: 22, backgroundColor: '#0d0d16' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  modalTitle: { color: '#fff', fontSize: 15, fontWeight: '700', textTransform: 'uppercase' },
  fieldLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  fieldInput: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 12, paddingHorizontal: 12, height: 38, color: '#fff', fontSize: 12 },
  cancelBtn: { flex: 1, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  saveBtn: { flex: 1.5, height: 42, borderRadius: 12, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
});

const tl = StyleSheet.create({
  rowItem: { flexDirection: 'row', width: '100%', minHeight: 90 },
  axisColumn: { width: 16, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  lineSegment: { flex: 1, width: 1 },
  cleanDotNode: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: 'rgba(255,255,255,0.45)', marginVertical: 4 },
  bodyCard: { flex: 1, paddingLeft: 16, paddingBottom: 24, paddingTop: 2 },
  cardHeaderGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' },
  tagContainer: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tagText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 }
});

const ds = StyleSheet.create({
  gaugeContainer: { height: 160, alignItems: 'center', justifyContent: 'center', marginTop: 24, position: 'relative', width: '100%' },
  ticksWrapper: { position: 'absolute', width: 260, height: 260, alignItems: 'center', justifyContent: 'center', top: -35 },
  tickLine: { position: 'absolute', width: 2.5, height: 10, borderRadius: 1 },
  scoreOverlay: { alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 35 },
  hugeScore: { color: '#ffffff', fontSize: 52, fontWeight: '800', letterSpacing: -0.5 },
  scoreLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '500', textTransform: 'capitalize', marginTop: -4 },
  statusText: { color: '#ffffff', fontSize: 16, fontWeight: '600', marginTop: 12 },
  descriptionParagraph: { color: 'rgba(255,255,255,0.65)', fontSize: 14, textAlign: 'center', lineHeight: 22, paddingHorizontal: 12, marginBottom: 36, marginTop: 24 },
  sectionHeader: { color: '#ffffff', fontSize: 15, fontWeight: '600', marginBottom: 12, paddingHorizontal: 4 },
  contributorRow: { height: 28, justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, position: 'relative', overflow: 'hidden', borderRadius: 6 },
  behindFillTrack: { position: 'absolute', top: 0, bottom: 0, left: 0 },
  contributorLabel: { color: '#ffffff', fontSize: 13, fontWeight: '400' },
  contributorValue: { color: '#ffffff', fontSize: 13, fontWeight: '500' },
  pureTextArea: { color: '#ffffff', fontSize: 14, lineHeight: 22, paddingHorizontal: 4, paddingTop: 4, minHeight: 100, textAlignVertical: 'top', backgroundColor: 'transparent' }
});