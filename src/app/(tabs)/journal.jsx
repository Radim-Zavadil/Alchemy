import { useState, useEffect, useMemo } from 'react';
import {
  View, Text, Pressable, Dimensions, ScrollView, TextInput,
  KeyboardAvoidingView, Platform, Modal, TouchableWithoutFeedback,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Sparkles, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const REVIEWS_KEY = 'alchemy_reviews';
const DREAM_KEY = 'alchemy_user_dream';

const AI_TITLES = ['The Genesis of Focus','A Crucible of Routine','Somatic Realignment','Echoes of Ambition','The Architecture of Habit','Restless Restoration','Vibrations of Abundance','The Discipline Paradigm','Resonance in Relationships','The Velocity of Purpose','Unlocking Vitality','Threshold of Alignment'];
const METRIC_LABELS = { health: 'Health Future', career: 'Career Future', relationships: 'Relationships', mindset: 'Mindset' };

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

export default function JournalScreen() {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dreamModalVisible, setDreamModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [tempDream, setTempDream] = useState('');
  const [answers, setAnswers] = useState({ habits: '', health: '', financial: '', relationships: '' });

  useEffect(() => {
    const load = async () => {
      try {
        const sd = await AsyncStorage.getItem(DREAM_KEY);
        if (sd) setTempDream(sd);
        const sr = await AsyncStorage.getItem(REVIEWS_KEY);
        if (sr) setReviews(JSON.parse(sr));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const metrics = useMemo(() => {
    const base = { health: 50, career: 50, relationships: 50, mindset: 50 };
    reviews.forEach(r => {
      if (r.metricsChanged) {
        base.health = Math.max(0, Math.min(100, base.health + (r.metricsChanged.health || 0)));
        base.career = Math.max(0, Math.min(100, base.career + (r.metricsChanged.career || 0)));
        base.relationships = Math.max(0, Math.min(100, base.relationships + (r.metricsChanged.relationships || 0)));
        base.mindset = Math.max(0, Math.min(100, base.mindset + (r.metricsChanged.mindset || 0)));
      }
    });
    return base;
  }, [reviews]);

  const saveDream = async () => {
    await AsyncStorage.setItem(DREAM_KEY, tempDream);
    setDreamModalVisible(false);
  };

  const analyzeWeeklyInput = (a) => {
    const t = Object.values(a).join(' ').toLowerCase();
    const c = { health: 0, career: 0, relationships: 0, mindset: 0 };
    c.health = (t.includes('sleep')||t.includes('gym')||t.includes('run')||t.includes('workout')||t.includes('water')) ? Math.floor(Math.random()*3)+1 : (Math.random()>0.5?0:-1);
    c.career = (t.includes('work')||t.includes('study')||t.includes('code')||t.includes('save')||t.includes('budget')) ? Math.floor(Math.random()*3)+1 : (Math.random()>0.5?0:-1);
    c.relationships = (t.includes('friend')||t.includes('family')||t.includes('partner')||t.includes('date')||t.includes('talk')) ? Math.floor(Math.random()*3)+1 : (Math.random()>0.5?0:-1);
    let mi = 1;
    ['good','great','happy','focus','discipline','positive','productive','proud'].forEach(w => { if (t.includes(w)) mi++; });
    c.mindset = mi;
    return c;
  };

  const submitReview = async () => {
    if (!answers.habits||!answers.health||!answers.financial||!answers.relationships) { alert('Please fill in all review sections.'); return; }
    const entry = { id: Date.now().toString(), date: new Date().toISOString().split('T')[0], title: AI_TITLES[Math.floor(Math.random()*AI_TITLES.length)], answers:{...answers}, metricsChanged: analyzeWeeklyInput(answers) };
    const updated = [...reviews, entry];
    setReviews(updated);
    await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    setAnswers({ habits:'', health:'', financial:'', relationships:'' });
    setReviewModalVisible(false);
  };

  const FIELDS = [
    ['habits','Habits & Routine','What routines did you uphold?'],
    ['health','Health & Vigor','How was sleep, nutrition, and exercise?'],
    ['financial','Finance & Security','What were your financial decisions?'],
    ['relationships','Connections & Relations','How are relations with friends/family?'],
  ];

  return (
    <View style={{ flex:1, backgroundColor:'#020206' }}>
      <StatusBar style="light" />
      <LinearGradient colors={['#020208','#04091a','#010103']} start={{x:0,y:0}} end={{x:0,y:1}} style={StyleSheet.absoluteFillObject} />

      {loading ? (
        <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <ScrollView style={{flex:1}} contentContainerStyle={{ paddingTop: insets.top+16, paddingHorizontal:24, paddingBottom:120 }} showsVerticalScrollIndicator={false}>

          {/* HEADER */}
          <View style={{ flexDirection:'row', alignItems:'center', marginBottom:36 }}>
            <View style={{ flex:1 }}>
              <Text style={{ fontSize:28, fontWeight:'700', color:'#ffffff', letterSpacing:0.2 }}>Review</Text>
              <Text style={{ fontSize:13, color:'rgba(255,255,255,0.3)', marginTop:3 }}>Your path to the future self</Text>
            </View>
            <View style={{ flexDirection:'row', gap:10 }}>
              <Pressable onPress={() => setDreamModalVisible(true)} style={({pressed}) => ({ opacity:pressed?0.6:1, width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.14)', alignItems:'center', justifyContent:'center' })}>
                <Sparkles size={18} color="#ffffff" />
              </Pressable>
              <Pressable onPress={() => setReviewModalVisible(true)} style={({pressed}) => ({ opacity:pressed?0.6:1, width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.06)', borderWidth:1, borderColor:'rgba(255,255,255,0.14)', alignItems:'center', justifyContent:'center' })}>
                <Plus size={20} color="#ffffff" />
              </Pressable>
            </View>
          </View>

          {/* METRICS */}
          <View style={{ gap:22, marginBottom:44 }}>
            {Object.entries(metrics).map(([key, val]) => (
              <View key={key}>
                <View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'baseline', marginBottom:9 }}>
                  <Text style={{ color:'#ffffff', fontSize:18, fontWeight:'600' }}>{METRIC_LABELS[key]}</Text>
                  <Text style={{ color:'#ffffff', fontSize:24, fontWeight:'700' }}>{val}%</Text>
                </View>
                <View style={{ height:6, backgroundColor:'rgba(255,255,255,0.1)', borderRadius:3, overflow:'hidden' }}>
                  <View style={{ height:'100%', width:`${val}%`, backgroundColor:'#ffffff', borderRadius:3, opacity:0.8 }} />
                </View>
              </View>
            ))}
          </View>

          {/* TIMELINE */}
          <View style={{ gap:28 }}>
            {reviews.length === 0 ? (
              <View style={{ paddingVertical:52, alignItems:'center' }}>
                <Text style={{ color:'rgba(255,255,255,0.25)', fontSize:14, textAlign:'center', lineHeight:22 }}>{'No logs yet.\nTap + to write your first weekly review.'}</Text>
              </View>
            ) : (
              [...reviews].reverse().map((item, idx) => (
                <View key={item.id} style={{ paddingLeft:30, position:'relative' }}>
                  {idx < reviews.length-1 && <View style={{ position:'absolute', left:7, top:20, bottom:-36, width:1, backgroundColor:'rgba(255,255,255,0.07)' }} />}
                  <View style={{ position:'absolute', left:0, top:9, width:15, height:15, borderRadius:8, backgroundColor:'rgba(255,255,255,0.08)', borderWidth:1, borderColor:'rgba(255,255,255,0.22)' }} />
                  <Text style={{ color:'#ffffff', fontSize:17, fontWeight:'700', marginBottom:3 }}>{item.title}</Text>
                  <Text style={{ color:'rgba(255,255,255,0.28)', fontSize:11, marginBottom:13 }}>{formatDate(item.date)}</Text>
                  <View style={{ gap:6 }}>
                    {item.answers.habits?<Text style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:19 }}><Text style={{ color:'rgba(255,255,255,0.65)', fontWeight:'600' }}>Habits: </Text>{item.answers.habits}</Text>:null}
                    {item.answers.health?<Text style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:19 }}><Text style={{ color:'rgba(255,255,255,0.65)', fontWeight:'600' }}>Health: </Text>{item.answers.health}</Text>:null}
                    {item.answers.financial?<Text style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:19 }}><Text style={{ color:'rgba(255,255,255,0.65)', fontWeight:'600' }}>Finances: </Text>{item.answers.financial}</Text>:null}
                    {item.answers.relationships?<Text style={{ color:'rgba(255,255,255,0.45)', fontSize:13, lineHeight:19 }}><Text style={{ color:'rgba(255,255,255,0.65)', fontWeight:'600' }}>Connections: </Text>{item.answers.relationships}</Text>:null}
                  </View>
                  <View style={{ flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:13 }}>
                    {Object.entries(item.metricsChanged||{}).map(([m,ch]) => {
                      const sign = ch>0?`+${ch}%`:ch===0?'—':`${ch}%`;
                      const col = ch>0?'rgba(255,255,255,0.65)':ch===0?'rgba(255,255,255,0.2)':'rgba(255,80,60,0.75)';
                      return <Text key={m} style={{ color:col, fontSize:11.5, fontWeight:'600' }}>{m.charAt(0).toUpperCase()+m.slice(1)} {sign}</Text>;
                    })}
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}

      {/* DREAM MODAL */}
      <Modal visible={dreamModalVisible} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setDreamModalVisible(false)}>
          <View style={s.modalBg}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={s.modalWrapper}>
                <BlurView intensity={85} tint="dark" style={s.modalContent}>
                  <View style={s.modalHeader}><Sparkles size={16} color="#ffffff" /><Text style={s.modalTitle}>Dream Vision</Text></View>
                  <Text style={s.modalSub}>Describe your ideal future. The portal reads this to shape projections.</Text>
                  <TextInput style={s.textArea} multiline numberOfLines={6} value={tempDream} onChangeText={setTempDream} placeholder="Your ideal self, career, health, mindset, family..." placeholderTextColor="rgba(255,255,255,0.25)" />
                  <View style={{ flexDirection:'row', gap:12, marginTop:18 }}>
                    <Pressable onPress={() => setDreamModalVisible(false)} style={s.cancelBtn}><Text style={{ color:'#fff', fontSize:13, fontWeight:'600' }}>Cancel</Text></Pressable>
                    <Pressable onPress={saveDream} style={s.saveBtn}><Text style={{ color:'#000', fontSize:13, fontWeight:'700' }}>Save Dream</Text></Pressable>
                  </View>
                </BlurView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* WEEKLY LOG MODAL */}
      <Modal visible={reviewModalVisible} transparent animationType="fade" statusBarTranslucent>
        <TouchableWithoutFeedback onPress={() => setReviewModalVisible(false)}>
          <View style={s.modalBg}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={s.modalWrapper}>
                <BlurView intensity={85} tint="dark" style={s.modalContent}>
                  <View style={s.modalHeader}><Plus size={16} color="#ffffff" /><Text style={s.modalTitle}>Weekly Log</Text></View>
                  <Text style={s.modalSub}>Log this week to calibrate your future metrics.</Text>
                  <ScrollView style={{ maxHeight: height*0.45 }} showsVerticalScrollIndicator={false}>
                    <View style={{ gap:14, paddingBottom:10 }}>
                      {FIELDS.map(([key,label,ph]) => (
                        <View key={key}>
                          <Text style={s.fieldLabel}>{label}</Text>
                          <TextInput style={s.fieldInput} placeholder={ph} placeholderTextColor="rgba(255,255,255,0.25)" value={answers[key]} onChangeText={t => setAnswers(p => ({...p,[key]:t}))} />
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  <View style={{ flexDirection:'row', gap:12, marginTop:18 }}>
                    <Pressable onPress={() => setReviewModalVisible(false)} style={s.cancelBtn}><Text style={{ color:'#fff', fontSize:13, fontWeight:'600' }}>Cancel</Text></Pressable>
                    <Pressable onPress={submitReview} style={s.saveBtn}><Text style={{ color:'#000', fontSize:13, fontWeight:'700' }}>Save Log</Text></Pressable>
                  </View>
                </BlurView>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  modalBg: { flex:1, backgroundColor:'rgba(0,0,0,0.65)', justifyContent:'center', alignItems:'center' },
  modalWrapper: { width:'90%', maxWidth:400 },
  modalContent: { borderRadius:24, padding:22, borderWidth:1, borderColor:'rgba(255,255,255,0.08)', backgroundColor:'rgba(10,10,20,0.45)', overflow:'hidden' },
  modalHeader: { flexDirection:'row', alignItems:'center', gap:8, marginBottom:10 },
  modalTitle: { color:'#fff', fontSize:15, fontWeight:'700', textTransform:'uppercase', letterSpacing:0.5 },
  modalSub: { color:'rgba(255,255,255,0.45)', fontSize:11.5, lineHeight:16, marginBottom:16 },
  textArea: { backgroundColor:'rgba(0,0,0,0.25)', borderRadius:14, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', padding:14, color:'#fff', fontSize:13, lineHeight:18, textAlignVertical:'top', height:120 },
  fieldLabel: { color:'rgba(255,255,255,0.7)', fontSize:11, fontWeight:'600', marginBottom:4, textTransform:'uppercase', letterSpacing:0.3 },
  fieldInput: { backgroundColor:'rgba(0,0,0,0.25)', borderRadius:12, borderWidth:1, borderColor:'rgba(255,255,255,0.06)', paddingHorizontal:12, height:38, color:'#fff', fontSize:12 },
  cancelBtn: { flex:1, height:42, borderRadius:12, backgroundColor:'rgba(255,255,255,0.06)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.04)' },
  saveBtn: { flex:1.5, height:42, borderRadius:12, backgroundColor:'#ffffff', alignItems:'center', justifyContent:'center' },
});