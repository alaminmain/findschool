import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  getDistinctDistricts,
  getDistinctDivisions,
  getDistinctLevels,
  getDistinctUpazilas,
} from "@/db/queries";
import type { SortKey } from "@/db/queries";
import { useFilters } from "@/state/filters";
import { useT } from "@/i18n";
import { colors, radius, spacing } from "@/theme";

type Section = "division" | "district" | "upazila" | "level";

export default function FiltersScreen() {
  const f = useFilters();
  const t = useT();
  const [open, setOpen] = useState<Section | null>(null);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "name", label: t("sortName") },
    { key: "district", label: t("sortDistrict") },
    { key: "level", label: t("sortLevel") },
  ];

  const [divisions, setDivisions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [upazilas, setUpazilas] = useState<string[]>([]);
  const [levels, setLevels] = useState<string[]>([]);

  const [loadingDivisions, setLoadingDivisions] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [div, lvl] = await Promise.all([
        getDistinctDivisions(),
        getDistinctLevels(),
      ]);
      if (cancelled) return;
      setDivisions(div);
      setLevels(lvl);
      setLoadingDivisions(false);
      setLoadingLevels(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadingDistricts(true);
    (async () => {
      const list = await getDistinctDistricts(f.state.division ?? null);
      if (cancelled) return;
      setDistricts(list);
      setLoadingDistricts(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [f.state.division]);

  useEffect(() => {
    let cancelled = false;
    setLoadingUpazilas(true);
    (async () => {
      const list = await getDistinctUpazilas(f.state.district ?? null);
      if (cancelled) return;
      setUpazilas(list);
      setLoadingUpazilas(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [f.state.district]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionLabel}>{t("sortBy")}</Text>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((o) => {
            const active = f.state.sort === o.key;
            return (
              <Pressable
                key={o.key}
                onPress={() => f.setSort(o.key)}
                style={[styles.sortChip, active && styles.sortChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={t("a11ySortBy", { label: o.label })}
              >
                <Text
                  style={[
                    styles.sortChipTxt,
                    active && styles.sortChipTxtActive,
                  ]}
                >
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FilterSection
          title={t("filterDivision")}
          value={f.state.division}
          loading={loadingDivisions}
          options={divisions}
          isOpen={open === "division"}
          onToggle={() => setOpen(open === "division" ? null : "division")}
          onSelect={(v) => {
            f.setDivision(v);
            setOpen(null);
          }}
        />
        <FilterSection
          title={t("filterDistrict")}
          value={f.state.district}
          loading={loadingDistricts}
          options={districts}
          isOpen={open === "district"}
          onToggle={() => setOpen(open === "district" ? null : "district")}
          onSelect={(v) => {
            f.setDistrict(v);
            setOpen(null);
          }}
          hint={
            f.state.division
              ? t("withinX", { x: f.state.division })
              : t("hintDivisionFirst")
          }
          searchable
        />
        <FilterSection
          title={t("filterUpazila")}
          value={f.state.upazila}
          loading={loadingUpazilas}
          options={upazilas}
          isOpen={open === "upazila"}
          onToggle={() => setOpen(open === "upazila" ? null : "upazila")}
          onSelect={(v) => {
            f.setUpazila(v);
            setOpen(null);
          }}
          hint={
            f.state.district
              ? t("withinX", { x: f.state.district })
              : t("hintDistrictFirst")
          }
          searchable
        />
        <FilterSection
          title={t("filterLevel")}
          value={f.state.level}
          loading={loadingLevels}
          options={levels}
          isOpen={open === "level"}
          onToggle={() => setOpen(open === "level" ? null : "level")}
          onSelect={(v) => {
            f.setLevel(v);
            setOpen(null);
          }}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => f.reset()}
          style={({ pressed }) => [
            styles.btn,
            styles.btnSecondary,
            pressed && { opacity: 0.7 },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("a11yClearAllFilters")}
        >
          <Text style={styles.btnSecondaryTxt}>{t("clearAll")}</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            pressed && { backgroundColor: colors.brandDark },
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("a11yApplyFilters")}
        >
          <Text style={styles.btnPrimaryTxt}>{t("done")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FilterSection({
  title,
  value,
  options,
  loading,
  isOpen,
  onToggle,
  onSelect,
  hint,
  searchable,
}: {
  title: string;
  value: string | null | undefined;
  options: string[];
  loading?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (v: string | null) => void;
  hint?: string;
  searchable?: boolean;
}) {
  const t = useT();
  const [q, setQ] = useState("");
  useEffect(() => {
    if (!isOpen) setQ("");
  }, [isOpen]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((o) => o.toLowerCase().includes(needle));
  }, [q, options]);

  return (
    <View style={styles.section}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.sectionHead, pressed && styles.pressed]}
        android_ripple={{ color: colors.ripple }}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel={t("a11ySectionState", {
          title,
          value: value ?? t("all"),
        })}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionValue} numberOfLines={1}>
            {value ?? t("all")}
          </Text>
        </View>
        <Text style={styles.chev}>{isOpen ? "▾" : "▸"}</Text>
      </Pressable>

      {isOpen ? (
        <View style={styles.sectionBody}>
          {hint ? <Text style={styles.hint}>{hint}</Text> : null}

          {searchable && options.length > 12 ? (
            <TextInput
              style={styles.searchInput}
              value={q}
              onChangeText={setQ}
              placeholder={t("searchInList", { label: title })}
              placeholderTextColor={colors.textTertiary}
              autoCorrect={false}
              autoCapitalize="none"
              accessibilityLabel={t("a11ySearchInList", { label: title })}
            />
          ) : null}

          <Pressable
            onPress={() => onSelect(null)}
            style={({ pressed }) => [
              styles.optionRow,
              pressed && styles.pressed,
              !value && styles.optionRowActive,
            ]}
            android_ripple={{ color: colors.ripple }}
            accessibilityRole="button"
            accessibilityState={{ selected: !value }}
          >
            <Text style={[styles.optionTxt, !value && styles.optionTxtActive]}>
              {t("allOf", { label: title })}
            </Text>
            {!value ? <Text style={styles.check}>✓</Text> : null}
          </Pressable>

          {loading ? (
            <ActivityIndicator
              color={colors.brand}
              style={{ marginVertical: spacing.lg }}
            />
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyOption}>
              {q ? t("noListMatches") : t("noOptions")}
            </Text>
          ) : (
            filtered.map((o) => {
              const active = value === o;
              return (
                <Pressable
                  key={o}
                  onPress={() => onSelect(o)}
                  style={({ pressed }) => [
                    styles.optionRow,
                    pressed && styles.pressed,
                    active && styles.optionRowActive,
                  ]}
                  android_ripple={{ color: colors.ripple }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                >
                  <Text
                    style={[styles.optionTxt, active && styles.optionTxtActive]}
                    numberOfLines={1}
                  >
                    {o}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            })
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sortRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sortChipActive: {
    backgroundColor: colors.brandTint,
    borderColor: colors.brand,
  },
  sortChipTxt: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  sortChipTxtActive: {
    color: colors.brandDark,
    fontWeight: "700",
  },
  section: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: "hidden",
  },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  sectionValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  chev: {
    fontSize: 18,
    color: colors.textTertiary,
    marginLeft: spacing.md,
  },
  sectionBody: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  searchInput: {
    backgroundColor: "#F1F3F5",
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionRowActive: {
    backgroundColor: colors.brandTint,
  },
  optionTxt: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionTxtActive: {
    color: colors.brandDark,
    fontWeight: "600",
  },
  check: {
    fontSize: 16,
    color: colors.brand,
    marginLeft: spacing.md,
    fontWeight: "700",
  },
  emptyOption: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    fontSize: 13,
    color: colors.textTertiary,
    textAlign: "center",
  },
  pressed: {
    backgroundColor: colors.brandTint,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: colors.brand,
  },
  btnPrimaryTxt: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  btnSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  btnSecondaryTxt: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
  },
});
