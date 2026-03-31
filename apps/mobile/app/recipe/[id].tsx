import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getRecipes, deleteRecipe } from '../../utils/storage';
import { MOCK_RECIPES } from '../../constants/mockData';
import { Recipe } from '../../types';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Check mock data first
      const mock = MOCK_RECIPES.find((r) => r.id === id);
      if (mock) {
        setRecipe(mock);
        setLoading(false);
        return;
      }
      // Check saved recipes
      const saved = await getRecipes();
      const found = saved.find((r) => r.id === id);
      setRecipe(found ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleDelete() {
    if (!recipe) return;
    const isMock = MOCK_RECIPES.some((r) => r.id === recipe.id);
    if (isMock) {
      Alert.alert('Cannot Delete', 'Built-in recipes cannot be deleted.');
      return;
    }
    Alert.alert(
      'Delete Recipe',
      `Remove "${recipe.title}" from your recipes?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRecipe(recipe.id);
            router.back();
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      </SafeAreaView>
    );
  }

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.notFoundWrap}>
          <Text style={styles.notFoundEmoji}>🤔</Text>
          <Text style={styles.notFoundTitle}>Recipe not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isMock = MOCK_RECIPES.some((r) => r.id === recipe.id);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={['#FF9500', '#FF6B00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <SafeAreaView edges={['top']} style={styles.heroSafe}>
            <TouchableOpacity
              style={styles.heroBack}
              onPress={() => router.back()}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
              <Text style={styles.heroBackText}>Recipes</Text>
            </TouchableOpacity>
          </SafeAreaView>
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
        </LinearGradient>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.recipeTitle}>{recipe.title}</Text>

          {/* Badges */}
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Ionicons name="time-outline" size={14} color={Colors.orange} />
              <Text style={styles.badgeText}>{recipe.time}</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="people-outline" size={14} color={Colors.blue} />
              <Text style={styles.badgeText}>{recipe.servings} servings</Text>
            </View>
          </View>

          {/* Tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsRow}
          >
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.divider} />

          {/* Ingredients */}
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <View style={styles.ingredientsList}>
            {recipe.ingredients.map((ing, i) => (
              <View key={i} style={styles.ingredientRow}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{ing}</Text>
              </View>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Steps */}
          <Text style={styles.sectionTitle}>Method</Text>
          <View style={styles.stepsList}>
            {recipe.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Delete button — only for clipped recipes */}
          {!isMock && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={18} color={Colors.red} />
                <Text style={styles.deleteBtnText}>Delete Recipe</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  safe: { flex: 1, backgroundColor: Colors.bg },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  notFoundEmoji: { fontSize: 48, marginBottom: 12 },
  notFoundTitle: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 0 },
  hero: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  heroSafe: {
    paddingTop: 4,
  },
  heroBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  heroBackText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: '#FFFFFF',
  },
  heroEmoji: {
    fontSize: 80,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  content: {
    backgroundColor: Colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  recipeTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    marginBottom: 12,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  badges: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
  },
  tagsRow: {
    paddingBottom: 4,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    marginBottom: 14,
  },
  ingredientsList: { gap: 8 },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.orange,
    marginTop: 7,
    flexShrink: 0,
  },
  ingredientText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label2,
    lineHeight: 22,
  },
  stepsList: { gap: 14 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label2,
    lineHeight: 22,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.red + '14',
    borderRadius: 14,
    paddingVertical: 14,
  },
  deleteBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.red,
  },
});
