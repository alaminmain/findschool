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
import { colors, radius, spacing, levelStyle, initialOf } from "@/theme";

const ROW_H = 88;

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
      if (myReq !== reqIdRef.current) return;
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
          <Text style={styles.emptyTitle}>No matches</Text>
          <Text style={styles.emptyText}>
            {query
              ? `Nothing found for "${query}". Try a different name, EIIN, or upazila.`
              : "Type to start searching across 65,000+ schools."}
          </Text>
        </View>
      ),
    [loading, query]
  );

  const showResultCount = !loading && items.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.search}
            placeholder="Search by name, EIIN, upazila…"
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoCapitalize="none"
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable
              onPress={() => setQuery("")}
              hitSlop={12}
              style={styles.clearBtn}
            >
              <Text style={styles.clearTxt}>✕</Text>
            </Pressable>
          ) : null}
        </View>
        {showResultCount ? (
          <Text style={styles.resultCount}>
            {items.length}
            {!exhausted ? "+" : ""} {items.length === 1 ? "result" : "results"}
            {query ? ` for "${query}"` : ""}
          </Text>
        ) : null}
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>Loading schools…</Text>
        </View>
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
            loadingMore ? (
              <ActivityIndicator
                color={colors.brand}
                style={{ marginVertical: 16 }}
              />
            ) : exhausted && items.length > 0 ? (
              <Text style={styles.endTxt}>End of results</Text>
            ) : null
          }
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={
            items.length === 0 ? styles.emptyContainer : undefined
          }
        />
      )}
    </View>
  );
}

const Row = ({ item }: { item: School }) => {
  const lvl = levelStyle(item.level);
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => router.push(`/school/${item.eiin}`)}
      android_ripple={{ color: colors.ripple }}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarTxt}>{initialOf(item.name || item.name_bn)}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name || item.name_bn}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {item.upazila}
          {item.district ? `, ${item.district}` : ""}
        </Text>
        <View style={styles.rowFoot}>
          {item.level ? (
            <View style={[styles.badge, { backgroundColor: lvl.bg }]}>
              <Text style={[styles.badgeTxt, { color: lvl.fg }]} numberOfLines={1}>
                {item.level}
              </Text>
            </View>
          ) : null}
          <Text style={styles.eiin}>EIIN {item.eiin}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  searchWrap: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    color: colors.textTertiary,
    marginRight: spacing.sm,
  },
  search: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
  },
  clearTxt: { color: "#fff", fontSize: 11, fontWeight: "700", lineHeight: 13 },
  resultCount: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    paddingHorizontal: 2,
  },
  loadingWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
  },
  row: {
    height: ROW_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.brandTint },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarTxt: {
    color: colors.brandDark,
    fontSize: 18,
    fontWeight: "700",
  },
  rowBody: { flex: 1, justifyContent: "center" },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  rowFoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    maxWidth: 160,
  },
  badgeTxt: {
    fontSize: 11,
    fontWeight: "600",
  },
  eiin: {
    fontSize: 11,
    color: colors.textTertiary,
    fontVariant: ["tabular-nums"],
  },
  chevron: {
    fontSize: 24,
    color: colors.textTertiary,
    marginLeft: spacing.sm,
  },
  empty: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl * 2,
    alignItems: "center",
  },
  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: 6,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  endTxt: {
    textAlign: "center",
    color: colors.textTertiary,
    fontSize: 12,
    paddingVertical: spacing.lg,
  },
});
