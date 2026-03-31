import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { saveRecipe } from '../../utils/storage';
import { Recipe } from '../../types';

// Mock extracted recipes to cycle through
const MOCK_EXTRACTIONS: Omit<Recipe, 'id' | 'savedAt'>[] = [
  {
    title: 'Classic French Omelette',
    emoji: '🥚',
    time: '10 min',
    servings: 1,
    tags: ['French', 'Breakfast', 'Quick'],
    ingredients: [
      '3 large eggs',
      '1 tbsp unsalted butter',
      '2 tbsp fresh chives, chopped',
      'Salt and white pepper',
      '2 tbsp crème fraîche (optional)',
    ],
    steps: [
      'Crack eggs into a bowl, season with salt and pepper, and whisk until combined.',
      'Heat butter in a non-stick pan over medium-high heat until foaming.',
      'Pour in eggs. Immediately stir with a spatula while shaking the pan.',
      'When eggs are almost set but still slightly runny, stop stirring.',
      'Tilt the pan and fold the omelette onto itself.',
      'Slide onto a plate, top with chives and crème fraîche.',
    ],
  },
  {
    title: 'Thai Green Curry',
    emoji: '🍲',
    time: '35 min',
    servings: 4,
    tags: ['Thai', 'Curry', 'Spicy'],
    ingredients: [
      '400ml coconut milk',
      '3 tbsp green curry paste',
      '500g chicken thighs, sliced',
      '200g Thai eggplant',
      '100g bamboo shoots',
      'Fish sauce and palm sugar to taste',
      'Thai basil and lime to serve',
    ],
    steps: [
      'Fry curry paste in a dry wok until fragrant, about 2 minutes.',
      'Add half the coconut milk, bring to a simmer.',
      'Add chicken and cook through, about 8 minutes.',
      'Add remaining coconut milk, eggplant, and bamboo shoots.',
      'Season with fish sauce and palm sugar. Simmer 10 minutes.',
      'Serve over jasmine rice with Thai basil and lime wedges.',
    ],
  },
  {
    title: 'Homemade Granola',
    emoji: '🥣',
    time: '30 min',
    servings: 8,
    tags: ['Breakfast', 'Healthy', 'Baking'],
    ingredients: [
      '3 cups rolled oats',
      '1 cup mixed nuts (almonds, pecans, walnuts)',
      '1/4 cup honey or maple syrup',
      '3 tbsp coconut oil, melted',
      '1 tsp vanilla extract',
      '1 tsp cinnamon',
      '1/2 tsp salt',
      '1 cup dried cranberries or raisins',
    ],
    steps: [
      'Preheat oven to 165°C (325°F). Line a baking sheet with parchment.',
      'Combine oats, nuts, cinnamon, and salt in a large bowl.',
      'Whisk together honey, coconut oil, and vanilla. Pour over oat mixture.',
      'Spread evenly on prepared baking sheet.',
      'Bake 20-25 minutes, stirring halfway, until golden brown.',
      'Remove from oven, add dried fruit. Cool completely before storing.',
    ],
  },
];

function generateId() {
  return 'clipped_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function pickExtraction(url: string): Omit<Recipe, 'id' | 'savedAt'> {
  const idx = url.length % MOCK_EXTRACTIONS.length;
  return MOCK_EXTRACTIONS[idx];
}

export default function ClipScreen() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<Recipe | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleExtract() {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert('No URL', 'Please enter a recipe URL to extract.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setExtracted(null);
    setSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const data = pickExtraction(trimmed);
    setExtracted({ ...data, id: generateId(), savedAt: Date.now() });
    setLoading(false);
  }

  async function handleSave() {
    if (!extracted) return;
    await saveRecipe(extracted);
    setSaved(true);
    Alert.alert('Saved!', `"${extracted.title}" has been added to your recipes.`);
  }

  function handleClear() {
    setUrl('');
    setExtracted(null);
    setSaved(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Clip Recipe</Text>
          <Text style={styles.subtitle}>Save any recipe from the web</Text>
        </View>

        {/* URL Input Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Recipe URL</Text>
          <View style={styles.inputRow}>
            <Ionicons name="link-outline" size={18} color={Colors.label3} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="https://www.example.com/recipe"
              placeholderTextColor={Colors.label3}
              value={url}
              onChangeText={(v) => {
                setUrl(v);
                if (extracted) {
                  setExtracted(null);
                  setSaved(false);
                }
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              returnKeyType="go"
              onSubmitEditing={handleExtract}
            />
            {url.length > 0 && (
              <TouchableOpacity onPress={handleClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="close-circle" size={18} color={Colors.label3} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.extractBtn, loading && styles.extractBtnDisabled]}
            onPress={handleExtract}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.extractBtnText}>Extract Recipe</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Loading state explanation */}
        {loading && (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingTitle}>Fetching recipe…</Text>
            <Text style={styles.loadingSubtitle}>
              Analysing the page and extracting ingredients and steps.
            </Text>
          </View>
        )}

        {/* Extracted result */}
        {extracted && !loading && (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultEmoji}>{extracted.emoji}</Text>
              <View style={styles.resultHeaderText}>
                <Text style={styles.resultTitle}>{extracted.title}</Text>
                <View style={styles.resultMeta}>
                  <Ionicons name="time-outline" size={13} color={Colors.label3} />
                  <Text style={styles.resultMetaText}>{extracted.time}</Text>
                  <Ionicons name="people-outline" size={13} color={Colors.label3} style={{ marginLeft: 8 }} />
                  <Text style={styles.resultMetaText}>{extracted.servings} servings</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsRow} pointerEvents="none">
                  {extracted.tags.map((t) => (
                    <View key={t} style={styles.tag}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHead}>Ingredients</Text>
            {extracted.ingredients.map((ing, i) => (
              <View key={i} style={styles.listRow}>
                <View style={styles.bullet} />
                <Text style={styles.listText}>{ing}</Text>
              </View>
            ))}

            <View style={styles.divider} />

            <Text style={styles.sectionHead}>Steps</Text>
            {extracted.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.listText}>{step}</Text>
              </View>
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnSaved]}
              onPress={handleSave}
              disabled={saved}
              activeOpacity={0.85}
            >
              <Ionicons
                name={saved ? 'checkmark-circle' : 'bookmark-outline'}
                size={18}
                color="#FFFFFF"
              />
              <Text style={styles.saveBtnText}>
                {saved ? 'Saved to Recipes' : 'Save to My Recipes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty state */}
        {!loading && !extracted && (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🌐</Text>
            <Text style={styles.emptyTitle}>Clip from anywhere</Text>
            <Text style={styles.emptySubtitle}>
              Paste a URL from any recipe website and we'll extract all the ingredients and steps automatically.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { paddingTop: 12, paddingBottom: 20 },
  title: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label2,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 8,
  },
  inputIcon: { flexShrink: 0 },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.label,
  },
  extractBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  extractBtnDisabled: { opacity: 0.6 },
  extractBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  loadingCard: {
    backgroundColor: Colors.orange + '14',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    marginBottom: 4,
  },
  loadingSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  resultEmoji: { fontSize: 48 },
  resultHeaderText: { flex: 1, justifyContent: 'center' },
  resultTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    marginBottom: 4,
    lineHeight: 22,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  resultMetaText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
  },
  tagsRow: { marginTop: 2 },
  tag: {
    backgroundColor: Colors.bg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: 14,
  },
  sectionHead: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.orange,
    marginTop: 6,
    flexShrink: 0,
  },
  listText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.label2,
    lineHeight: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: Colors.blue,
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  saveBtnSaved: { backgroundColor: Colors.green },
  saveBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 14 },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    textAlign: 'center',
    lineHeight: 20,
  },
});
