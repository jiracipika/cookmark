import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { getGroceryItems, saveGroceryItems } from '../../utils/storage';
import { MOCK_GROCERY_ITEMS, AISLES } from '../../constants/mockData';
import { GroceryItem } from '../../types';

function generateId() {
  return 'gi_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

export default function GroceryScreen() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [newName, setNewName] = useState('');
  const [newAisle, setNewAisle] = useState(AISLES[0]);
  const [aislePickerVisible, setAislePickerVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const stored = await getGroceryItems();
        if (stored.length === 0) {
          setItems(MOCK_GROCERY_ITEMS);
          await saveGroceryItems(MOCK_GROCERY_ITEMS);
        } else {
          setItems(stored);
        }
      }
      load();
    }, [])
  );

  async function persist(next: GroceryItem[]) {
    setItems(next);
    await saveGroceryItems(next);
  }

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    const newItem: GroceryItem = {
      id: generateId(),
      name,
      aisle: newAisle,
      checked: false,
    };
    const next = [...items, newItem];
    setNewName('');
    await persist(next);
  }

  async function handleToggle(id: string) {
    const next = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    await persist(next);
  }

  async function handleDelete(id: string) {
    const next = items.filter((item) => item.id !== id);
    await persist(next);
  }

  async function handleClearChecked() {
    const checked = items.filter((i) => i.checked).length;
    if (checked === 0) return;
    Alert.alert(
      'Clear Checked',
      `Remove ${checked} checked item${checked === 1 ? '' : 's'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await persist(items.filter((i) => !i.checked));
          },
        },
      ]
    );
  }

  // Group by aisle
  const groups: Record<string, GroceryItem[]> = {};
  for (const item of items) {
    if (!groups[item.aisle]) groups[item.aisle] = [];
    groups[item.aisle].push(item);
  }
  const aisleOrder = AISLES.filter((a) => groups[a]);
  // Add any custom aisles not in the preset list
  for (const a of Object.keys(groups)) {
    if (!aisleOrder.includes(a)) aisleOrder.push(a);
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const total = items.length;
  const progress = total === 0 ? 0 : checkedCount / total;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Grocery List</Text>
        {checkedCount > 0 && (
          <TouchableOpacity onPress={handleClearChecked} activeOpacity={0.7}>
            <Text style={styles.clearBtn}>Clear checked</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress */}
      <View style={styles.progressWrap}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` as `${number}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {checkedCount}/{total} done
        </Text>
      </View>

      {/* Add item */}
      <View style={styles.addCard}>
        <TextInput
          style={styles.addInput}
          placeholder="Add item…"
          placeholderTextColor={Colors.label3}
          value={newName}
          onChangeText={setNewName}
          returnKeyType="done"
          onSubmitEditing={handleAdd}
        />
        <TouchableOpacity
          style={styles.aisleBtn}
          onPress={() => setAislePickerVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.aisleBtnText} numberOfLines={1}>
            {newAisle}
          </Text>
          <Ionicons name="chevron-down" size={14} color={Colors.label3} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.addBtn, !newName.trim() && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={!newName.trim()}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {total === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>🛒</Text>
            <Text style={styles.emptyTitle}>Your list is empty</Text>
            <Text style={styles.emptySubtitle}>Add items above to get started.</Text>
          </View>
        ) : (
          aisleOrder.map((aisle) => (
            <View key={aisle} style={styles.section}>
              <Text style={styles.sectionHeader}>{aisle}</Text>
              {groups[aisle].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemRow}
                  onPress={() => handleToggle(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={item.checked ? 'checkmark-circle' : 'ellipse-outline'}
                    size={24}
                    color={item.checked ? Colors.green : Colors.separator}
                  />
                  <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
                    {item.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={Colors.label3} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Aisle picker modal */}
      <Modal
        visible={aislePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAislePickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAislePickerVisible(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Select Aisle</Text>
            <FlatList
              data={AISLES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.aisleOption}
                  onPress={() => {
                    setNewAisle(item);
                    setAislePickerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.aisleOptionText}>{item}</Text>
                  {newAisle === item && (
                    <Ionicons name="checkmark" size={18} color={Colors.orange} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.optionDivider} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  clearBtn: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.red,
  },
  progressWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 10,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.separator,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: Colors.green,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.label3,
    minWidth: 52,
    textAlign: 'right',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  addInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label,
    paddingVertical: 4,
  },
  aisleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 4,
    maxWidth: 110,
  },
  aisleBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.label2,
    flex: 1,
  },
  addBtn: {
    backgroundColor: Colors.orange,
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  addBtnDisabled: { opacity: 0.4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16 },
  section: { marginBottom: 16 },
  sectionHeader: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label3,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 2,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.label,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: Colors.label3,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.label3,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.separator,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.label,
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.separator,
  },
  aisleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  aisleOptionText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.label,
  },
  optionDivider: {
    height: 1,
    backgroundColor: Colors.separator,
    marginLeft: 20,
  },
});
