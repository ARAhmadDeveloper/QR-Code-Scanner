// Explore.js (or ExploreSection.jsx)
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Linking,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// If you use React Navigation, uncomment the next line to auto-refresh on focus
// import { useFocusEffect } from "@react-navigation/native";

const STORAGE_KEY = "scanHistory";

const isUrl = (str: string) => {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

export default function Explore() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      setHistory(parsed);
    } catch (e) {
      console.warn("Could not load history:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    Alert.alert("Clear history", "Remove all scanned items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem(STORAGE_KEY);
          setHistory([]);
        },
      },
    ]);
  }, []);

  const deleteItem = useCallback(
    async (index: number) => {
      const updated = history.filter((_, i) => i !== index);
      setHistory(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    },
    [history]
  );

  const openItem = useCallback(async (data: string) => {
    if (isUrl(data)) {
      await Linking.openURL(data);
    } else {
      Alert.alert("Scanned data", data);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // If using React Navigation, uncomment to refresh whenever screen gains focus
  // useFocusEffect(
  //   useCallback(() => {
  //     loadHistory();
  //   }, [loadHistory])
  // );

  const renderItem = ({ item, index }: { item: { data: string; type: string; timestamp: string }; index: number }) => (
    <View style={styles.card}>
      <Text style={styles.data} numberOfLines={3}>
        {item.data}
      </Text>
      <Text style={styles.meta}>
        {item.type} • {new Date(item.timestamp).toLocaleString()}
      </Text>

      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => openItem(item.data)}
          style={[styles.btn, styles.primary, styles.btnSpacer]}
        >
          <Text style={styles.btnText}>
            {isUrl(item.data) ? "Open link" : "View"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => deleteItem(index)}
          style={[styles.btn, styles.danger]}
        >
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>History</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={clearHistory} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={history.length === 0 && styles.emptyContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadHistory}
            tintColor="#E2E8F0"
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No scans yet. Scan a QR to see it here.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    padding: 16,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { color: "#E2E8F0", fontSize: 20, fontWeight: "700" },
  clearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#233047",
  },
  clearText: { color: "#E2E8F0", fontWeight: "600" },

  card: {
    backgroundColor: "#121826",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#233047",
  },
  data: { color: "#E2E8F0", fontSize: 15, marginBottom: 6 },
  meta: { color: "#8FA3BF", fontSize: 12, marginBottom: 10 },

  row: { flexDirection: "row", alignItems: "center" },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#233047",
  },
  btnSpacer: { marginRight: 10 },
  primary: { backgroundColor: "#4F46E5" },
  danger: { backgroundColor: "#B91C1C" },
  btnText: { color: "#E2E8F0", fontWeight: "600" },

  emptyContainer: { flexGrow: 1, justifyContent: "center" },
  emptyText: { color: "#8FA3BF", textAlign: "center" },
});
