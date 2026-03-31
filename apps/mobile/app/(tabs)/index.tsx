import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { getRecipes, getGroceryItems, getMealPlan } from '../../utils/storage';
import { MOCK_RECIPES } from '../../constants/mockData';

interface FeatureCard {
  title: string;
  subtitle: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  route: string;
}

const FEATURE_CARDS: FeatureCard[] = [
  {
    title: 'Recipes',
    subtitle: 'Browse & search your collection',
    icon: 'book-outline',
    color: Colors.blue,
    route: '/(tabs)/recipes',
  },
  {
    title: 'Clip',
    subtitle: 'Save recipes from any URL',
    icon: 'link-outline',
    color: Colors.purple,
    route: '/(tabs)/clip',
  },
  {
    title: 'Grocery',
    subtitle: 'Smart shopping lists by aisle',
    icon: 'cart-outline',
    color: Colors.green,
    route: '/(tabs)/grocery',
  },
  {
    title: 'Planner',
    subtitle: 'Plan meals for the week',
    icon: 'calendar-outline',
    color: Colors.orange,
    route: '/(tabs)/planner',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [recipeCount, setRecipeCount] = useState(0);
  const [groceryCount, setGroceryCount] = useState(0);
  const [mealCount, setMealCount] = useState(0);

  useEffect(() => {
    async function loadStats() {
      const [recipes, grocery, plan] = await Promise.all([
        getRecipes(),
        getGroceryItems(),
        getMealPlan(),
      ]);

      const allRecipes = [
        ...MOCK_RECIPES,
        ...recipes.filter((r) => !MOCK_RECIPES.find((m) => m.id === r.id)),
      ];
      setRecipeCount(allRecipes.length);
      setGroceryCount(grocery.length || 10);

      let count = 0;
      for (const day of Object.values(plan)) {
        count += Object.values(day).filter(Boolean).length;
      }
      setMealCount(count);
    }
    loadStats();
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>CookMark</Text>
          <Text style={styles.appSubtitle}>Your personal recipe companion</Text>
        </View>

        {/* Hero Card */}
        <LinearGradient
          colors={['#FF9500', '#FF6B00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <Text style={styles.heroEmoji}>🍳</Text>
          <Text style={styles.heroTitle}>Cook something amazing today</Text>
          <Text style={styles.heroSubtitle}>
            Discover, save and plan your favourite recipes in one place.
          </Text>
          <TouchableOpacity
            style={styles.heroCta}
            onPress={() => router.push('/(tabs)/recipes')}
            activeOpacity={0.85}
          >
            <Text style={styles.heroCtaText}>Browse Recipes</Text>
            <Ionicons name="arrow-forward" size={16} color={Colors.orange} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recipeCount}</Text>
            <Text style={styles.statLabel}>Recipes</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statNumber}>{groceryCount}</Text>
            <Text style={styles.statLabel}>Groceries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mealCount}</Text>
            <Text style={styles.statLabel}>Meals Planned</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.featureGrid}>
          {FEATURE_CARDS.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={styles.featureCard}
              onPress={() => router.push(card.route as Parameters<typeof router.push>[0])}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconWrap, { backgroundColor: card.color + '18' }]}>
                <Ionicons name={card.icon} size={26} color={card.color} />
              </View>
              <Text style={styles.featureTitle}>{card.title}</Text>
              <Text style={styles.featureSubtitle}>{card.subtitle}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={Colors.label3}
                style={styles.featureChevron}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent tip */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={20} color={Colors.orange} />
          <Text style={styles.tipText}>
            Tip: Tap <Text style={styles.tipBold}>Clip</Text> to save a recipe from any website
            instantly.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  appTitle: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
  },
  heroEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
    marginBottom: 18,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  heroCtaText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.orange,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardMiddle: {
    borderLeftWidth: 0,
    borderRightWidth: 0,
  },
  statNumber: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    marginBottom: 12,
  },
  featureGrid: {
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    flex: 1,
  },
  featureSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    position: 'absolute',
    left: 78,
    bottom: 14,
    right: 30,
  },
  featureChevron: {
    marginLeft: 'auto',
  },
  tipCard: {
    backgroundColor: Colors.orange + '14',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.label2,
    lineHeight: 18,
  },
  tipBold: {
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
  },
});
