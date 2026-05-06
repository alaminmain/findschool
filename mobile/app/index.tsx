import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, type Href } from "expo-router";
import { getDbMetadata, searchSchools, type School } from "@/db/queries";
import { useFilters } from "@/state/filters";
import { useLibrary } from "@/state/library";
import { useT } from "@/i18n";
import { SchoolRow, ROW_H } from "@/components/SchoolRow";
import { colors, radius, spacing } from "@/theme";

export default function SearchScreen() {
  const filters = useFilters();
  const lib = useLibrary();
  const t = useT();
  const { state: fState, activeCount } = filters;
  const libraryCount = lib.favorites.size + lib.recents.length;
  const [dataAsOf, setDataAsOf] = useState<string | null>(null);

  useEffect(() => {
    getDbMetadata().then((m) => setDataAsOf(m.dataAsOf));
  }, []);

  const [query, setQuery] = useState("");
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const runSearch = useCallback(
    async (q: string, offset: number) => {
      const myReq = ++reqIdRef.current;
      try {
        const rows = await searchSchools(
          q,
          offset,
          {
            division: fState.division,
            district: fState.district,
            upazila: fState.upazila,
            level: fState.level,
          },
          fState.sort
        );
        if (myReq !== reqIdRef.current) return;
        setError(null);
        setExhausted(rows.length < 50);
        setItems((prev) => (offset === 0 ? rows : [...prev, ...rows]));
      } catch (e) {
        if (myReq !== reqIdRef.current) return;
        console.warn("searchSchools failed", e);
        setError(e instanceof Error ? e.message : t("errorFallback"));
        if (offset === 0) setItems([]);
      } finally {
        if (myReq === reqIdRef.current) {
          setLoading(false);
          setLoadingMore(false);
          setRefreshing(false);
        }
      }
    },
    [
      fState.division,
      fState.district,
      fState.upazila,
      fState.level,
      fState.sort,
      t,
    ]
  );

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
    if (loadingMore || exhausted || loading || error) return;
    setLoadingMore(true);
    runSearch(query, items.length);
  }, [loadingMore, exhausted, loading, error, query, items.length, runSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    runSearch(query, 0);
  }, [query, runSearch]);

  const onRetry = useCallback(() => {
    setLoading(true);
    setError(null);
    runSearch(query, 0);
  }, [query, runSearch]);

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
    ({ item }: { item: School }) => <SchoolRow item={item} />,
    []
  );

  const listEmpty = useMemo(
    () =>
      loading ? null : error ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t("errorTitle")}</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.retryBtn,
              pressed && styles.retryBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("a11yRetry")}
          >
            <Text style={styles.retryTxt}>{t("retry")}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>{t("noMatchesTitle")}</Text>
          <Text style={styles.emptyText}>
            {query
              ? t("noMatchesQuery", { q: query })
              : t("noSchoolsAvailable")}
          </Text>
        </View>
      ),
    [loading, error, query, onRetry, t]
  );

  const showResultCount = !loading && !error && items.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <Text
              style={styles.searchIcon}
              accessibilityElementsHidden
              importantForAccessibility="no"
            >
              ⌕
            </Text>
            <TextInput
              style={styles.search}
              placeholder={t("searchPlaceholder")}
              placeholderTextColor={colors.textTertiary}
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="while-editing"
              returnKeyType="search"
              accessibilityLabel={t("a11ySearch")}
              accessibilityHint={t("a11ySearchHint")}
            />
            {query.length > 0 ? (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={12}
                style={styles.clearBtn}
                accessibilityRole="button"
                accessibilityLabel={t("a11yClearSearch")}
              >
                <Text style={styles.clearTxt}>✕</Text>
              </Pressable>
            ) : null}
          </View>
          <Pressable
            onPress={() => router.push("/filters" as Href)}
            style={({ pressed }) => [
              styles.filterBtn,
              activeCount > 0 && styles.filterBtnActive,
              pressed && styles.pressed,
            ]}
            android_ripple={{ color: colors.ripple }}
            accessibilityRole="button"
            accessibilityLabel={
              activeCount > 0
                ? t("a11yFiltersActive", { n: activeCount })
                : t("a11yOpenFilters")
            }
          >
            <Text
              style={[
                styles.filterBtnTxt,
                activeCount > 0 && styles.filterBtnTxtActive,
              ]}
            >
              ☰
            </Text>
            {activeCount > 0 ? (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeTxt}>{activeCount}</Text>
              </View>
            ) : null}
          </Pressable>
          <Pressable
            onPress={() => router.push("/map" as Href)}
            style={({ pressed }) => [
              styles.filterBtn,
              pressed && styles.pressed,
            ]}
            android_ripple={{ color: colors.ripple }}
            accessibilityRole="button"
            accessibilityLabel={t("a11yOpenMap")}
          >
            <Text style={styles.filterBtnTxt}>◉</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/library" as Href)}
            style={({ pressed }) => [
              styles.filterBtn,
              libraryCount > 0 && styles.filterBtnActive,
              pressed && styles.pressed,
            ]}
            android_ripple={{ color: colors.ripple }}
            accessibilityRole="button"
            accessibilityLabel={
              lib.favorites.size > 0
                ? t("a11yLibraryWithFavs", { n: lib.favorites.size })
                : t("a11yLibrary")
            }
          >
            <Text
              style={[
                styles.filterBtnTxt,
                libraryCount > 0 && styles.filterBtnTxtActive,
              ]}
            >
              {lib.favorites.size > 0 ? "★" : "☆"}
            </Text>
          </Pressable>
        </View>

        {activeCount > 0 ? (
          <View style={styles.activeFiltersRow}>
            {fState.division ? (
              <FilterChip
                label={fState.division}
                onClear={() => filters.setDivision(null)}
              />
            ) : null}
            {fState.district ? (
              <FilterChip
                label={fState.district}
                onClear={() => filters.setDistrict(null)}
              />
            ) : null}
            {fState.upazila ? (
              <FilterChip
                label={fState.upazila}
                onClear={() => filters.setUpazila(null)}
              />
            ) : null}
            {fState.level ? (
              <FilterChip
                label={fState.level}
                onClear={() => filters.setLevel(null)}
              />
            ) : null}
          </View>
        ) : null}

        {showResultCount ? (
          <Text style={styles.resultCount}>
            {query
              ? t("resultsForQuery", {
                  n: items.length,
                  plus: exhausted ? "" : "+",
                  label:
                    items.length === 1
                      ? t("resultLabelOne")
                      : t("resultLabelMany"),
                  q: query,
                })
              : activeCount > 0
              ? t("matchingSchools", {
                  n: items.length,
                  plus: exhausted ? "" : "+",
                  label:
                    items.length === 1
                      ? t("schoolLabelOne")
                      : t("schoolLabelMany"),
                })
              : t("browseAlpha", {
                  n: items.length,
                  plus: exhausted ? "" : "+",
                })}
          </Text>
        ) : null}
      </View>

      {loading && items.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.brand} />
          <Text style={styles.loadingText}>{t("loadingSchools")}</Text>
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
              <View>
                <Text style={styles.endTxt}>{t("endOfResults")}</Text>
                {dataAsOf ? (
                  <Pressable
                    onPress={() => router.push("/about" as Href)}
                    accessibilityRole="link"
                    accessibilityLabel={t("a11yOpenAbout")}
                    style={styles.dataFreshness}
                  >
                    <Text style={styles.dataFreshnessTxt}>
                      {t("dataAsOf", { date: dataAsOf })} ›
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ) : null
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
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

function FilterChip({
  label,
  onClear,
}: {
  label: string;
  onClear: () => void;
}) {
  const t = useT();
  return (
    <Pressable
      onPress={onClear}
      style={({ pressed }) => [styles.activeChip, pressed && { opacity: 0.7 }]}
      android_ripple={{ color: colors.ripple }}
      accessibilityRole="button"
      accessibilityLabel={t("a11yRemoveFilter", { label })}
    >
      <Text style={styles.activeChipTxt} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.activeChipX}>✕</Text>
    </Pressable>
  );
}

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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F3F5",
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#F1F3F5",
    alignItems: "center",
    justifyContent: "center",
  },
  filterBtnActive: {
    backgroundColor: colors.brandTint,
  },
  filterBtnTxt: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: "700",
  },
  filterBtnTxtActive: {
    color: colors.brandDark,
  },
  filterBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.brand,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeTxt: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  pressed: { opacity: 0.7 },
  activeFiltersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: spacing.sm,
  },
  activeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.brandTint,
    maxWidth: 200,
  },
  activeChipTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brandDark,
    marginRight: 6,
  },
  activeChipX: {
    fontSize: 11,
    color: colors.brandDark,
    fontWeight: "700",
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
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.brand,
  },
  retryBtnPressed: { backgroundColor: colors.brandDark },
  retryTxt: { color: "#fff", fontSize: 14, fontWeight: "600" },
  dataFreshness: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  dataFreshnessTxt: {
    fontSize: 11,
    color: colors.textTertiary,
  },
});
