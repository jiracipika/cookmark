import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getMealPlan, saveMealPlan } from '../../utils/storage';
import { MealPlan, DayKey, MealKey } from '../../types';

const DAYS: DayKey[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS: MealKey[] = ['Breakfast', 'Lunch', 'Dinner'];

const MEAL_ICONS: Record<MealKey, React.ComponentProps<typeof Ionicons>['name']> = {
  Breakfast: 'sunny-outline',
  Lunch: 'partly-sunny-outline',
  Dinner: 'moon-outline',
};

const MEAL_COLORS: Record<MealKey, string> = {
  Breakfast: Colors.orange,
  Lunch: Colors.blue,
  Dinner: Colors.purple,
};

function getTodayKey(): DayKey {
  const map: Record<number, DayKey> = {
    0: 'Sun',
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
  };
  return map[new Date().getDay()];
}

export default function PlannerScreen() {
  const [plan, setPlan] = useState<MealPlan>({});
  const [activeDay, setActiveDay] = useState<DayKey>(getTodayKey());
  const [editModal, setEditModal] = useState<{ day: DayKey; meal: MealKey } | null>(null);
  const [editText, setEditText] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const stored = await getMealPlan();
        setPlan(stored);
      }
      load();
    }, [])
  );

  function getMealValue(day: DayKey, meal: MealKey): string {
    return plan[day]?.[meal] ?? '';
  }

  function openEdit(day: DayKey, meal: MealKey) {
    setEditText(getMealValue(day, meal));
    setEditModal({ day, meal });
  }

  async function handleSaveEdit() {
    if (!editModal) return;
    const { day, meal } = editModal;
    const next: MealPlan = {
      ...plan,
      [day]: {
        ...plan[day],
        [meal]: editText.trim(),
      },
    };
    setPlan(next);
    await saveMealPlan(next);
    setEditModal(null);
  }

  async function handleClearMeal(day: DayKey, meal: MealKey) {
    const next: MealPlan = {
      ...plan,
      [day]: {
        ...plan[day],
        [meal]: '',
      },
    };
    setPlan(next);
    await saveMealPlan(next);
  }

  // Count planned meals for the week
  let totalPlanned = 0;
  for (const day of DAYS) {
    for (const meal of MEALS) {
      if (getMealValue(day, meal)) totalPlanned++;
    }
  }

  const todayKey = getTodayKey();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Meal Planner</Text>
        <Text style={styles.subtitle}>{totalPlanned}/21 meals planned</Text>
      </View>

      {/* Day strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStrip}
      >
        {DAYS.map((day) => {
          const isToday = day === todayKey;
          const isActive = day === activeDay;
          const dayMeals = MEALS.filter((m) => getMealValue(day, m)).length;
          return (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayBtn,
                isActive && styles.dayBtnActive,
                isToday && !isActive && styles.dayBtnToday,
              ]}
              onPress={() => setActiveDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayLabel, isActive && styles.dayLabelActive]}>
                {day}
              </Text>
              {dayMeals > 0 && (
                <View style={[styles.dayDot, isActive && styles.dayDotActive]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Meal cards for active day */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dayHeading}>
          {activeDay === todayKey ? `${activeDay} · Today` : activeDay}
        </Text>

        {MEALS.map((meal) => {
          const value = getMealValue(activeDay, meal);
          const color = MEAL_COLORS[meal];
          return (
            <View key={meal} style={styles.mealCard}>
              <View style={styles.mealCardLeft}>
                <View style={[styles.mealIconWrap, { backgroundColor: color + '18' }]}>
                  <Ionicons name={MEAL_ICONS[meal]} size={22} color={color} />
                </View>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealName}>{meal}</Text>
                  {value ? (
                    <Text style={styles.mealValue} numberOfLines={2}>
                      {value}
                    </Text>
                  ) : (
                    <Text style={styles.mealEmpty}>Nothing planned yet</Text>
                  )}
                </View>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity
                  style={styles.mealEditBtn}
                  onPress={() => openEdit(activeDay, meal)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="pencil-outline" size={16} color={Colors.blue} />
                </TouchableOpacity>
                {value ? (
                  <TouchableOpacity
                    style={styles.mealClearBtn}
                    onPress={() => handleClearMeal(activeDay, meal)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-outline" size={18} color={Colors.label3} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}

        {/* Weekly overview mini grid */}
        <Text style={styles.overviewTitle}>This Week</Text>
        <View style={styles.grid}>
          {DAYS.map((day) => {
            const count = MEALS.filter((m) => getMealValue(day, m)).length;
            const isToday = day === todayKey;
            const isActive = day === activeDay;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.gridCell,
                  isActive && styles.gridCellActive,
                  isToday && !isActive && styles.gridCellToday,
                ]}
                onPress={() => setActiveDay(day)}
                activeOpacity={0.7}
              >
                <Text style={[styles.gridDay, isActive && styles.gridDayActive]}>{day}</Text>
                <Text style={[styles.gridCount, isActive && styles.gridCountActive]}>
                  {count}/3
                </Text>
                <View style={styles.gridDots}>
                  {MEALS.map((meal) => (
                    <View
                      key={meal}
                      style={[
                        styles.gridDot,
                        { backgroundColor: getMealValue(day, meal) ? MEAL_COLORS[meal] : Colors.separator },
                      ]}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Edit modal */}
      <Modal
        visible={editModal !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditModal(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalOuter}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setEditModal(null)}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>
              {editModal?.meal} — {editModal?.day}
            </Text>
            <Text style={styles.modalLabel}>What are you making?</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Avocado Toast, Chicken Tikka…"
              placeholderTextColor={Colors.label3}
              value={editText}
              onChangeText={setEditText}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSaveEdit}
              multiline={false}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditModal(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveEdit}
                activeOpacity={0.85}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
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
  subtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
  },
  dayStrip: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  dayBtn: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.separator,
    minWidth: 52,
  },
  dayBtnActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  dayBtnToday: {
    borderColor: Colors.orange,
  },
  dayLabel: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label2,
  },
  dayLabelActive: { color: '#FFFFFF' },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.orange,
    marginTop: 3,
  },
  dayDotActive: { backgroundColor: 'rgba(255,255,255,0.8)' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16 },
  dayHeading: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    marginBottom: 12,
  },
  mealCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  mealCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mealInfo: { flex: 1 },
  mealName: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label3,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  mealValue: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.label,
    lineHeight: 20,
  },
  mealEmpty: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    fontStyle: 'italic',
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  mealEditBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.blue + '14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealClearBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.label,
    marginTop: 20,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridCell: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    width: '13%',
    flexGrow: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  gridCellActive: {
    borderColor: Colors.orange,
    backgroundColor: Colors.orange + '0A',
  },
  gridCellToday: {
    borderColor: Colors.orange + '60',
  },
  gridDay: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label2,
    marginBottom: 2,
  },
  gridDayActive: { color: Colors.orange },
  gridCount: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    marginBottom: 6,
  },
  gridCountActive: { color: Colors.orange },
  gridDots: {
    flexDirection: 'row',
    gap: 3,
  },
  gridDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modalOuter: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 34,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.separator,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.label3,
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.label,
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
  },
  modalSaveBtn: {
    flex: 1,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
});
