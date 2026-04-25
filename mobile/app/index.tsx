import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { searchSchools, type School } from "@/db/queries";

const ROW_H = 72;

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const runSearch = useCallback(async (q: string, offset: number) => {
    const myReq = ++reqIdRef.current;
    try {
      const rows = await searchSchools(q, offset);
      if (myReq !== reqIdRef.current) return; // stale
      setExhausted(rows.length < 50);
      setItems((prev) => (offset === 0 ? rows : [...prev, ...rows]));
    } catch (e) {
      console.warn("searchSchools failed", e);
    } finally {
      if (myReq === reqIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    setExhausted(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(query, 0), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const onEndReached = useCallback(() => {
    if (loadingMore || exhausted || loading) return;
    setLoadingMore(true);
    runSearch(query, items.length);
  }, [loadingMore, exhausted, loading, query, items.length, runSearch]);

  const keyExtractor = useCallback((s: School) => s.eiin, []);

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ROW_H,
      offset: ROW_H * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item }: { item: School }) => <Row item={item} />,
    []
  );

  const listEmpty = useMemo(
    () =>
      loading ? null : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No schools match "{query}"</Text>
        </View>
      ),
    [loading, query]
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Search by name, EIIN, upazila…"
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      {loading && items.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 24 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={5}
          removeClippedSubviews
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={listEmpty}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator style={{ margin: 12 }} /> : null
          }
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const Row = ({ item }: { item: School }) => (
  <Pressable
    style={styles.row}
    onPress={() => router.push(`/school/${item.eiin}`)}
    android_ripple={{ color: "#eee" }}
  >
    <Text style={styles.name} numberOfLines={1}>
      {item.name}
    </Text>
    <Text style={styles.meta} numberOfLines={1}>
      {item.eiin} · {item.upazila}, {item.district}
    </Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  search: {
    margin: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#f2f3f5",
    fontSize: 16,
  },
  row: {
    height: ROW_H,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e0e0e0",
  },
  name: { fontSize: 16, fontWeight: "600", color: "#222" },
  meta: { fontSize: 13, color: "#666", marginTop: 2 },
  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: "#888" },
});
