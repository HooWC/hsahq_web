import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const FileDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { fileData } = route.params;
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const showAlert = (message, title) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // 处理图片路径
  const getImageUrl = useCallback((filePath) => {
    if (!filePath) return null;
    
    // 如果已经是有效的URL或相对路径格式，直接返回
    if (filePath.startsWith('http') || filePath.startsWith('chassis/')) {
      return filePath;
    }
    
    // 移除V盘路径前缀，只保留相对路径部分
    let formattedPath = filePath;
    
    // 移除V:\FILE\CHASSIS前缀，无论大小写
    if (formattedPath.toUpperCase().includes('V:\\FILE\\CHASSIS')) {
      formattedPath = formattedPath.replace(/V:\\FILE\\CHASSIS\\?/i, '');
    } else if (formattedPath.toUpperCase().includes('V:/FILE/CHASSIS')) {
      formattedPath = formattedPath.replace(/V:\/FILE\/CHASSIS\/?/i, '');
    } else if (formattedPath.toUpperCase().includes('V:\\FILE\\')) {
      formattedPath = formattedPath.replace(/V:\\FILE\\?/i, '');
    }
    
    // 将所有反斜杠替换为正斜杠
    formattedPath = formattedPath.replace(/\\/g, '/');
    
    // 去除路径开头的斜杠
    while (formattedPath.startsWith('/')) {
      formattedPath = formattedPath.substring(1);
    }
    
    // 添加chassis/前缀
    if (!formattedPath.startsWith('chassis/')) {
      formattedPath = 'chassis/' + formattedPath;
    }
    
    // 为了调试
    console.log('处理后的图片路径:', formattedPath);
    
    // 统一返回相对路径，对于web和移动端都使用相同格式
    return formattedPath;
  }, []);

  // 判断文件是否为PDF
  const isPdfFile = useCallback((filePath) => {
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('.pdf');
  }, []);

  // 获取图片URL
  const imageUrl = getImageUrl(fileData.file_path);

  // 处理图片点击放大
  const handleImagePress = () => {
    if (!imageError && imageUrl) {
      setModalVisible(true);
    }
  };

  // 处理PDF打开
  const handleOpenPdf = async () => {
    if (!imageUrl) {
      Alert.alert('Error', 'PDF URL is not available');
      return;
    }

    try {
      // For web and mobile browsers
      if (Platform.OS === 'web') {
        // Open in new tab
        window.open(imageUrl, '_blank');
      } else {
        // For React Native apps
        const supported = await Linking.canOpenURL(imageUrl);
        
        if (supported) {
          await Linking.openURL(imageUrl);
        } else {
          Alert.alert(
            'Error',
            `Don't know how to open this URL: ${imageUrl}`,
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      console.error('Failed to open PDF:', err);
      Alert.alert('Error', 'Failed to open PDF');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.dark} />

      {/* 图片查看模态框 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Ionicons name="close-circle" size={32} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: imageUrl }}
            style={styles.fullImage}
            resizeMode="contain"
            onError={() => {
              showAlert("无法加载图片", "错误");
              setModalVisible(false);
            }}
          />
        </View>
      </Modal>

      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
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
        <Text style={styles.headerTitle}>Document File Detail</Text>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {fileData.file_name || 'File Detail'}
          </Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>PK</Text>
            <Text style={styles.infoValue}>{fileData.pk || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Doctype</Text>
            <Text style={styles.infoValue}>{fileData.doctype || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cserial NO</Text>
            <Text style={styles.infoValue}>{fileData.cserial_no || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Make</Text>
            <Text style={styles.infoValue}>{fileData.make || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mgroup ID</Text>
            <Text style={styles.infoValue}>{fileData.mgroup_id || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Engine ID</Text>
            <Text style={styles.infoValue}>{fileData.engine_id || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Axle</Text>
            <Text style={styles.infoValue}>{fileData.axle || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Plan ID</Text>
            <Text style={styles.infoValue}>{fileData.plan_id || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Body Grp</Text>
            <Text style={styles.infoValue}>{fileData.body_grp || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Makei PK</Text>
            <Text style={styles.infoValue}>{fileData.makei_pk || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Body Type</Text>
            <Text style={styles.infoValue}>{fileData.body_type || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Body Desc</Text>
            <Text style={styles.infoValue}>{fileData.body_desc || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Path</Text>
            <Text 
              style={styles.infoValue}
              numberOfLines={null}
              ellipsizeMode="tail"
            >
              {fileData.file_path || '-'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Version</Text>
            <Text style={styles.infoValue}>{fileData.file_version || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Prev PK</Text>
            <Text style={styles.infoValue}>{fileData.prev_pk || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Desc</Text>
            <Text style={styles.infoValue}>{fileData.file_desc || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Create By</Text>
            <Text style={styles.infoValue}>{fileData.createby || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Create Date</Text>
            <Text style={styles.infoValue}>{formatDate(fileData.createdt)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modify By</Text>
            <Text style={styles.infoValue}>{fileData.modifyby || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Modify Date</Text>
            <Text style={styles.infoValue}>{fileData.modifydt || '-'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>{fileData.status || '-'}</Text>
          </View>
        </View>
        
        {/* 图片/PDF显示区域 */}
        {fileData.file_path && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>Document {isPdfFile(fileData.file_path) ? 'PDF' : 'Image'}</Text>
            
            {imageUrl ? (
              isPdfFile(fileData.file_path) ? (
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
                          {fileData.file_name || 'Document'}
                        </Text>
                      </View>
                      <View style={styles.buttonArrow}>
                        <Ionicons name="arrow-forward-circle" size={24} color="rgba(255,255,255,0.9)" />
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.imageContainer}
                  onPress={handleImagePress}
                  activeOpacity={0.9}
                >
                  {imageError ? (
                    <View style={styles.errorContainer}>
                      <Ionicons name="image-outline" size={60} color={COLORS.gray} />
                      <Text style={styles.errorText}>Failed to load image</Text>
                      <TouchableOpacity 
                        style={styles.retryButton}
                        onPress={() => {
                          setImageError(false);
                        }}
                      >
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <>
                      <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        resizeMode="contain"
                        onError={(error) => {
                          console.error("Image loading failed:", error.nativeEvent?.error || "Unknown error");
                          setImageError(true);
                        }}
                      />
                      <View style={styles.zoomIndicator}>
                        <Ionicons name="search" size={18} color={COLORS.white} />
                        <Text style={styles.zoomText}>Enlarge</Text>
                      </View>
                    </>
                  )}
                </TouchableOpacity>
              )
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={60} color={COLORS.gray} />
                <Text style={styles.noImageText}>No image available</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.md,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    width: width * 0.35,
    fontSize: SIZES.small,
    color: COLORS.gray,
    alignSelf: 'flex-start', 
  },
  infoValue: {
    flex: 1,
    maxWidth: '60%',
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  imageSection: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ebebeb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.primary,
    fontSize: SIZES.small,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  errorText: {
    marginTop: SPACING.sm,
    color: COLORS.gray,
    fontSize: SIZES.small,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '500',
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: '#f9f9f9',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#ebebeb',
    height: 200,
  },
  noImageText: {
    marginTop: SPACING.sm,
    color: COLORS.gray,
    fontSize: SIZES.small,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 5,
  },
  fullImage: {
    width: '100%',
    height: '80%',
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoomText: {
    color: COLORS.white,
    fontSize: 12,
    marginLeft: 5,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
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

export default FileDetailScreen; 