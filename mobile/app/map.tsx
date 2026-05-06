import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import MapView, { Marker, type Region } from "react-native-maps";
import * as Location from "expo-location";
import { schoolsInRegion, type School } from "@/db/queries";
import { useFilters } from "@/state/filters";
import { useT } from "@/i18n";
import { colors, radius, spacing } from "@/theme";

// Bangladesh bounding box (approx). Default view covers the whole country.
const BD_INITIAL: Region = {
  latitude: 23.685,
  longitude: 90.3563,
  latitudeDelta: 5.5,
  longitudeDelta: 5.0,
};

const MAX_MARKERS = 300;

export default function MapScreen() {
  const f = useFilters();
  const t = useT();
  const mapRef = useRef<MapView>(null);
  const [items, setItems] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const reqIdRef = useRef(0);

  const loadRegion = useCallback(
    async (region: Region) => {
      const myReq = ++reqIdRef.current;
      setLoading(true);
      try {
        const minLat = region.latitude - region.latitudeDelta / 2;
        const maxLat = region.latitude + region.latitudeDelta / 2;
        const minLng = region.longitude - region.longitudeDelta / 2;
        const maxLng = region.longitude + region.longitudeDelta / 2;
        const rows = await schoolsInRegion(
          minLat,
          maxLat,
          minLng,
          maxLng,
          {
            division: f.state.division,
            district: f.state.district,
            upazila: f.state.upazila,
            level: f.state.level,
          },
          MAX_MARKERS
        );
        if (myReq !== reqIdRef.current) return;
        setItems(rows);
      } catch (e) {
        console.warn("schoolsInRegion failed", e);
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    },
    [f.state.division, f.state.district, f.state.upazila, f.state.level]
  );

  // Initial load + reload when filters change.
  useEffect(() => {
    loadRegion(BD_INITIAL);
  }, [loadRegion]);

  const onRegionChangeComplete = useCallback(
    (region: Region) => {
      loadRegion(region);
    },
    [loadRegion]
  );

  const onNearMe = useCallback(async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert(t("locationDeniedTitle"), t("locationDeniedText"));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      // Intentionally do NOT store the coord — use it once to animate, then drop.
      const region: Region = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      mapRef.current?.animateToRegion(region, 600);
    } catch (e) {
      console.warn("getCurrentPositionAsync failed", e);
      Alert.alert(t("locationFailed"));
    } finally {
      setLocating(false);
    }
  }, [t]);

  const showEmptyHint = !loading && items.length === 0;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={BD_INITIAL}
        onRegionChangeComplete={onRegionChangeComplete}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {items.map((s) => (
          <Marker
            key={s.eiin}
            coordinate={{ latitude: s.latitude!, longitude: s.longitude! }}
            title={s.name || s.name_bn}
            description={s.upazila}
            onCalloutPress={() => router.push(`/school/${s.eiin}`)}
          />
        ))}
      </MapView>

      <View style={styles.topBar} pointerEvents="box-none">
        <View style={styles.statusPill} pointerEvents="none">
          {loading ? (
            <ActivityIndicator color={colors.brand} size="small" />
          ) : (
            <Text style={styles.statusTxt}>
              {t("mapMarkersShown", { n: items.length })}
            </Text>
          )}
        </View>
      </View>

      {showEmptyHint ? (
        <View style={styles.emptyHint} pointerEvents="none">
          <Text style={styles.emptyHintTxt}>{t("noMappableSchools")}</Text>
        </View>
      ) : null}

      <Pressable
        onPress={onNearMe}
        style={({ pressed }) => [
          styles.fab,
          pressed && { backgroundColor: colors.brandDark },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("a11yNearMe")}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.fabTxt}>◎ {t("nearMe")}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    position: "absolute",
    top: spacing.md,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  statusPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    minHeight: 32,
    justifyContent: "center",
  },
  statusTxt: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  emptyHint: {
    position: "absolute",
    bottom: 110,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  emptyHintTxt: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
  },
  fab: {
    position: "absolute",
    right: spacing.lg,
    bottom: spacing.xl,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    minWidth: 110,
    alignItems: "center",
  },
  fabTxt: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
