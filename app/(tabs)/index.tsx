import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
} from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";

export default function App() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [result, setResult] = useState<{ type: string; data: string } | null>(
    null
  );

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const isUrl = (str: string) => {
    try {
      const u = new URL(str);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleBarCodeScanned = useCallback(
    ({ type, data }: { type: string; data: string }) => {
      setScanned(true);
      setResult({ type, data });
    },
    []
  );

  const openResult = useCallback(async () => {
    if (!result?.data) return;
    if (isUrl(result.data)) {
      await Linking.openURL(result.data);
    }
  }, [result]);

  const resetScan = () => {
    setResult(null);
    setScanned(false);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.info}>Requesting camera permission…</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Camera permission denied.</Text>
        <Text style={styles.info}>
          Enable camera access in Settings to scan QR codes.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!scanned && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            // Optional: restrict to QR only
            // barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay}>
            <View style={styles.frame} />
            <Text style={styles.overlayText}>
              Align the QR code within the frame
            </Text>
          </View>
        </View>
      )}

      {scanned && result && (
        <View style={styles.resultCard}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{result.type}</Text>

          <Text style={[styles.label, { marginTop: 8 }]}>Data:</Text>
          <Text selectable style={styles.data}>
            {result.data}
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.button} onPress={resetScan}>
              <Text style={styles.buttonText}>Scan again</Text>
            </TouchableOpacity>

            {isUrl(result.data) && (
              <TouchableOpacity
                style={[styles.button, styles.primary]}
                onPress={openResult}
              >
                <Text style={styles.buttonText}>Open link</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <Text style={styles.footer}>
        {Platform.select({
          ios: "iOS: Use a physical device for the camera.",
          android: "Android: Works on emulator with a virtual camera feed.",
          default: "",
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0B0F14",
  },
  info: { color: "#B5C0D0", fontSize: 16, textAlign: "center" },
  error: {
    color: "#FF6B6B",
    fontSize: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  scannerContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  frame: {
    width: 260,
    height: 260,
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  overlayText: { color: "#E2E8F0", marginTop: 12 },
  resultCard: {
    backgroundColor: "#121826",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#233047",
  },
  label: { color: "#8FA3BF", fontWeight: "600" },
  value: { color: "#E2E8F0" },
  data: { color: "#E2E8F0", marginTop: 4 },
  actions: { flexDirection: "row", gap: 12, marginTop: 16 },
  button: {
    backgroundColor: "#233047",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  primary: { backgroundColor: "#4F46E5" },
  buttonText: { color: "#E2E8F0", fontWeight: "600" },
  footer: {
    color: "#61728A",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 6,
  },
});
