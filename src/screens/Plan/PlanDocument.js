import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../../constants/theme';

const PlanDocument = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (plan && plan.picloc) {
        let newPath = plan.picloc.replace('Y:\\', 'plan/').replace(/\\/g, '/');
        
        if (Platform.OS === 'web') {
          newPath = `${newPath}`;
        }
        
        const finalUrl = encodeURI(newPath);
        console.log('PDF URL:', finalUrl);
        setPdfUrl(finalUrl);
      }
    } catch (err) {
      console.error('Error setting PDF URL:', err);
      setError(`Failed to process PDF file: ${err.message}`);
    }
  }, [plan]);

  const handleOpenPdf = async () => {
    if (!pdfUrl) {
      Alert.alert('Error', 'PDF URL is not available');
      return;
    }

    try {
      // For web and mobile browsers
      if (Platform.OS === 'web') {
        // Open in new tab
        window.open(pdfUrl, '_blank');
      } else {
        // For React Native apps
        const supported = await Linking.canOpenURL(pdfUrl);
        
        if (supported) {
          await Linking.openURL(pdfUrl);
        } else {
          Alert.alert(
            'Error',
            `Don't know how to open this URL: ${pdfUrl}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.error('Failed to open PDF:', err);
      Alert.alert('Error', 'Failed to open PDF');
    }
  };

  const downloadPDF = async () => {
    if (!pdfUrl) return;
    
    if (Platform.OS === 'web') {
      // For web, create a download link
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `${plan?.plan_id || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // For mobile apps, you might need additional implementation
    Alert.alert('Info', 'Download functionality would be implemented here for mobile apps');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <LinearGradient
        colors={['#0F172A', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plan && plan.plan_id ? plan.plan_id : 'Document Viewer'}</Text>
        {/* <TouchableOpacity onPress={downloadPDF}>
          <Ionicons name="download" size={24} color={COLORS.white} />
        </TouchableOpacity> */}
      </LinearGradient>

      {/* PDF Viewer Replacement */}
      <View style={styles.pdfContainer}>
        {error ? (
          <View style={styles.noDocumentContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : !pdfUrl ? (
          <View style={styles.noDocumentContainer}>
            <Text style={styles.noDocumentText}>No document available</Text>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.openButton} 
              onPress={handleOpenPdf}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#2D5DA1', '#1D3E7C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name="document-text" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.openButtonText}>Open PDF Document</Text>
                  <Text style={styles.fileInfoText} numberOfLines={1} ellipsizeMode="tail">
                    {plan?.plan_id || 'Document'}.pdf
                  </Text>
                </View>
                <View style={styles.buttonArrow}>
                  <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.9)" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    ...SHADOWS.medium,
  },
  backButton: {
    marginRight: SPACING.sm,
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: SPACING.lg,
  },
  noDocumentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDocumentText: {
    fontSize: SIZES.medium,
    color: COLORS.gray,
  },
  errorText: {
    fontSize: SIZES.medium,
    color: 'red',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  openButton: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.medium,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: SPACING.md,
  },
  buttonTextContainer: {
    flex: 1,
  },
  openButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fileInfoText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: SIZES.small,
    marginTop: 4,
  },
  buttonArrow: {
    padding: 2,
  },
});

export default PlanDocument;