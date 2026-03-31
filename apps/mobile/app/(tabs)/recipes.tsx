import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getRecipes } from '../../utils/storage';
import { MOCK_RECIPES } from '../../constants/mockData';
import { Recipe } from '../../types';

const ALL_TAGS = ['All', 'Quick', 'Healthy', 'Vegetarian', 'Breakfast', 'Italian', 'Mexican', 'Japanese', 'Indian', 'Dessert'];

export default function RecipesScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    const saved = await getRecipes();
    const merged = [
      ...MOCK_RECIPES,
      ...saved.filter((r) => !MOCK_RECIPES.find((m) => m.id === r.id)),
    ];
    setRecipes(merged);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecipes();
    }, [loadRecipes])
  );

  const filtered = recipes.filter((r) => {
    const matchSearch =
      search.trim() === '' ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchTag = activeTag === 'All' || r.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Recipes</Text>
        <Text style={styles.count}>{filtered.length} recipes</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={Colors.label3} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes…"
          placeholderTextColor={Colors.label3}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>

      {/* Tag filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagRow}
      >
        {ALL_TAGS.map((tag) => (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, activeTag === tag && styles.tagActive]}
            onPress={() => setActiveTag(tag)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tagText, activeTag === tag && styles.tagTextActive]}>
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={Colors.orange} />
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyTitle}>No recipes found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or filter, or clip a new recipe from the web.
              </Text>
            </View>
          ) : (
            filtered.map((recipe) => (
              <TouchableOpacity
                key={recipe.id}
                style={styles.card}
                onPress={() => router.push(`/recipe/${recipe.id}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.cardEmoji}>{recipe.emoji}</Text>
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {recipe.title}
                  </Text>
                  <View style={styles.cardMeta}>
                    <Ionicons name="time-outline" size={13} color={Colors.label3} />
                    <Text style={styles.cardMetaText}>{recipe.time}</Text>
                    <Ionicons name="people-outline" size={13} color={Colors.label3} style={styles.metaGap} />
                    <Text style={styles.cardMetaText}>{recipe.servings} servings</Text>
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.cardTags}
                    pointerEvents="none"
                  >
                    {recipe.tags.map((t) => (
                      <View key={t} style={styles.cardTag}>
                        <Text style={styles.cardTagText}>{t}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.separator} />
              </TouchableOpacity>
            ))
          )}
          <View style={styles.listBottom} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
  },
  title: {
    fontSize: 34,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    letterSpacing: -0.5,
  },
  count: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 42,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label,
  },
  tagRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tag: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.separator,
  },
  tagActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  tagText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
  },
  tagTextActive: {
    color: '#FFFFFF',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  listBottom: {
    height: 20,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardEmoji: {
    fontSize: 42,
    width: 56,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    lineHeight: 20,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaGap: {
    marginLeft: 8,
  },
  cardMetaText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
  },
  cardTags: {
    marginTop: 2,
  },
  cardTag: {
    backgroundColor: Colors.bg,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
  },
  cardTagText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
  },
});
