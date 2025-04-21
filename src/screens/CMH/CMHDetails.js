import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CONFIG from '../../constants/config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

const TabButton = ({ icon, label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={24}
      color={active ? '#2563EB' : COLORS.gray}
    />
    <Text
      style={[
        styles.tabLabel,
        { color: active ? '#2563EB' : COLORS.gray },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const CMHDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cmh } = route.params;
  const [activeTab, setActiveTab] = useState('main');
  const [chassismhData, setChassismhData] = useState([]);
  const [dsoiData, setDsoiData] = useState([]);
  const [quoteData, setQuoteData] = useState([]);
  const [chassisfileData, setChassisfileData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  // 处理图片路径
  const getImageUrl = (filePath) => {
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
    
    // 统一返回相对路径，对于web和移动端都使用相同格式
    return formattedPath;
  };

  // 判断文件是否为PDF
  const isPdfFile = (filePath) => {
    if (!filePath) return false;
    return filePath.toLowerCase().endsWith('.pdf');
  };
  
  // 处理PDF打开
  const handleOpenPdf = async (pdfUrl) => {
    if (!pdfUrl) {
      if (Platform.OS === 'web') {
        window.alert('PDF URL not available');
      } else {
        Alert.alert('Error', 'PDF URL not available');
      }
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
            'Mistake',
            `Unable to open this URL: ${pdfUrl}`,
            [{ text: 'Sure' }]
          );
        }
      }
    } catch (err) {
      console.error('Failed to open PDF:', err);
      if (Platform.OS === 'web') {
        window.alert('Failed to open PDF');
      } else {
        Alert.alert('Error', 'Failed to open PDF');
      }
    }
  };
  
  // 处理图片点击放大
  const handleImagePress = (imageUrl) => {
    setSelectedImage(imageUrl);
    setModalVisible(true);
  };

  // Add new function to handle SO PDF generation and opening
  const handleSOPdfGeneration = async (so_id) => {
    try {
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');
      
      // Call generate-so API
      const response = await fetch(`${CONFIG.API_BASE_URL}/generate-so`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ so_id })
      });
      
      const data = await response.json();
      
      if (data.pdf_path) {
        // Construct PDF URL and open it
        const pdfUrl = `rpt/pdf/${data.pdf_path}`;
        handleOpenPdf(pdfUrl);
      } else {
        if (Platform.OS === 'web') {
          window.alert('PDF not available');
        } else {
          Alert.alert('Error', 'PDF not available');
        }
      }
    } catch (err) {
      console.error('Failed to generate SO PDF:', err);
      if (Platform.OS === 'web') {
        window.alert('Failed to generate PDF');
      } else {
        Alert.alert('Error', 'Failed to generate PDF');
      }
    }
  };
  
  // Add new function to handle SQ PDF generation and opening
  const handleSQPdfGeneration = async (quot_id) => {
    try {
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');
      
      // Call generate-sq API
      const response = await fetch(`${CONFIG.API_BASE_URL}/generate-sq`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sq_id: quot_id })
      });
      
      const data = await response.json();
      
      if (data.pdf_path) {
        // Construct PDF URL and open it
        const pdfUrl = `rpt/pdf/${data.pdf_path}`;
        handleOpenPdf(pdfUrl);
      } else {
        if (Platform.OS === 'web') {
          window.alert('PDF not available');
        } else {
          Alert.alert('Error', 'PDF not available');
        }
      }
    } catch (err) {
      console.error('Failed to generate SQ PDF:', err);
      if (Platform.OS === 'web') {
        window.alert('Failed to generate PDF');
      } else {
        Alert.alert('Error', 'Failed to generate PDF');
      }
    }
  };

  useEffect(() => {
    const fetchAdditionalData = async () => {
      try {
        const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');
        
        // 获取 chassismh 数据 - 对应第一个界面Chassis
        const chassismhResponse = await fetch(`${CONFIG.API_BASE_URL}/chassismh/${cmh.stock_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const chassismhData = await chassismhResponse.json();
        setChassismhData(chassismhData);
        
        // 获取 dsoi 和 quote 数据 - 对应第二个界面History
        const dsoiResponse = await fetch(`${CONFIG.API_BASE_URL}/dsoi/${cmh.stock_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const dsoiData = await dsoiResponse.json();
        setDsoiData(dsoiData);
        
        const quoteResponse = await fetch(`${CONFIG.API_BASE_URL}/quote/${cmh.stock_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const quoteData = await quoteResponse.json();
        setQuoteData(quoteData);
        
        // 获取 chassisfile 数据 - 对应第三个界面Picture
        const chassisfileResponse = await fetch(`${CONFIG.API_BASE_URL}/chassisfile/${cmh.stock_id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const chassisfileData = await chassisfileResponse.json();
        setChassisfileData(chassisfileData);
        
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to get data');
      } finally {
        setLoading(false);
      }
    };

    fetchAdditionalData();
  }, [cmh.stock_id]);

  const renderMainInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chassis Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Chassis #</Text>
          <Text style={styles.infoValue}>{cmh.stock_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Internal #</Text>
          <Text style={styles.infoValue}>{cmh.internal_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{cmh.status || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Item ID</Text>
          <Text style={styles.infoValue}>{cmh.item_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sales Code</Text>
          <Text style={styles.infoValue}>{cmh.allc_id || '-'}</Text>
        </View>      
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Location</Text>
          <Text style={styles.infoValue}>{cmh.location || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ESN #</Text>
          <Text style={styles.infoValue}>{cmh.eserial_no || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Customer</Text>
          <Text style={styles.infoValue}>{cmh.bc_if || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make</Text>
          <Text style={styles.infoValue}>{cmh.make || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Model Group</Text>
          <Text style={styles.infoValue}>{cmh.mgroup_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Eng. Model</Text>
          <Text style={styles.infoValue}>{cmh.engine_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AP Status</Text>
          <Text style={styles.infoValue}>{cmh.ap_status || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>AP #</Text>
          <Text style={styles.infoValue}>{(cmh.ap_id || '-').trim()}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Pending</Text>
          <Text style={styles.infoValue}>{cmh.p_status || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Reg No</Text>
          <Text style={styles.infoValue}>{cmh.reg_no || '-'}</Text>
        </View>
      </View>

    
      {/* Chassis Movement Entries */}
      {loading ? (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={COLORS.primary} />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
) : (
  chassismhData && chassismhData.length > 0 ? (
    chassismhData.filter(item => item.chassismh_id).length > 0 ? ( // 确保至少有一个 item.chassismh_id
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Movement Records</Text>
        
        <View style={styles.tableContainer}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>Date</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>Location</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>Info1</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.4 }]}>Info2</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.9 }]}>CreateBy</Text>
          </View>
          
          {/* Table Rows */}
          {chassismhData
            .filter(item => item.chassismh_id)
            .map((item, index) => (
              <View key={`movement-${index}`} style={[
                styles.tableRow,
                index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd
              ]}>
                <View style={[styles.tableCell, { flex: 0.9 }]}>
                  <Text style={styles.tableCellText} numberOfLines={2} adjustsFontSizeToFit>
                    {item.ddate ? (() => {
                      const date = new Date(item.ddate);
                      return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
                    })() : '-'}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, { flex: 0.9 }]}>
                  <Text style={styles.tableCellText} numberOfLines={2} adjustsFontSizeToFit>
                    {item.location || '-'}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, { flex: 1.4 }]}>
                  <Text style={styles.tableCellText} numberOfLines={4}>
                    {item.info1 || '-'}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, { flex: 1.4 }]}>
                  <Text style={styles.tableCellText} numberOfLines={4}>
                    {item.info2 || '-'}
                  </Text>
                </View>
                
                <View style={[styles.tableCell, { flex: 0.9, borderRightWidth: 0 }]}>
                  <Text style={styles.tableCellText} numberOfLines={2} adjustsFontSizeToFit>
                    {item.createby || '-'}
                  </Text>
                </View>
              </View>
            ))
          }
        </View>
      </View>
    ) : (
      <View style={styles.section}>
        <Text style={styles.noDataText}>No Movement Records</Text>
      </View>
    )
  ) : (
    <View style={styles.section}>
      <Text style={styles.noDataText}>No Movement Records</Text>
    </View>
  )
)}
    </View>
  );

  const renderHistoryInfo = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {/* Quot Section */}
          <View style={styles.section}>
  <Text style={styles.sectionTitle}>Quot</Text>

  {quoteData && quoteData.length > 0 ? (
    quoteData.filter(item => item.quot_id).length > 0 ? ( // 确保至少有一个 item.quot_id
      quoteData
        .filter(item => item.quot_id) // 过滤掉没有 quot_id 的数据
        .map((item, index) => (
          <TouchableOpacity
            key={`quot-${index}`}
            style={styles.historyItem}
            onPress={() => handleSQPdfGeneration(item.quot_id)}
          >
            <View style={styles.chassisEntryHeader}>
              <View>
                <Text style={styles.chassisEntryTitle}>
                  {item.quot_id}
                </Text>
                <Text style={styles.chassisEntryDate}>
                  {item.valid_fr ? (() => {
    const date = new Date(item.ddate); // 解析 ISO 日期
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ` +
           `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
})() : 'N/A'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        ))
    ) : (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data</Text>
      </View>
    )
  ) : (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>No data</Text>
    </View>
  )}
</View>


          {/* SO Section */}
          <View style={styles.section}>
  <Text style={styles.sectionTitle}>SO</Text>

  {dsoiData && dsoiData.length > 0 ? (
    dsoiData.filter(item => item.so_id).length > 0 ? ( 
      dsoiData
        .filter(item => item.so_id) 
        .map((item, index) => (
          <TouchableOpacity
            key={`dsoi-${index}`}
            style={styles.historyItem}
            onPress={() => handleSOPdfGeneration(item.so_id)}
          >
            <View style={styles.chassisEntryHeader}>
              <View>
                <Text style={styles.chassisEntryTitle}>
                  {item.so_id}
                </Text>
                <Text style={styles.chassisEntryDate}>
                {item.ddate ? (() => {
    const date = new Date(item.ddate);
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')} ` +
           `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
})() : 'N/A'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        ))
    ) : (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataText}>No data</Text>
      </View>
    )
  ) : (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>No data</Text>
    </View>
  )}
</View>

        </>
      )}
    </View>
  );

  const renderPictureInfo = () => (
    <View style={styles.tabContent}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : (
        <>
          {/* Image viewing modal box */}
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
                source={{ uri: selectedImage }}
                style={styles.fullImage}
                resizeMode="contain"
                onError={() => {
                  if (Platform.OS === 'web') {
                    window.alert('Failed to load image');
                  } else {
                    Alert.alert("Error", "Failed to load image");
                  }
                  setModalVisible(false);
                }}
              />
            </View>
          </Modal>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documentation file</Text>
            {chassisfileData && chassisfileData.length > 0 && chassisfileData.some(item => 
              item.file_path && item.file_path !== ''
            ) ? (
              <View style={styles.imageGallery}>
                {chassisfileData
                  .filter(item => item.file_path && item.file_path !== '')
                  .map((item, index) => {
                    const fileUrl = getImageUrl(item.file_path);
                    const isPdf = isPdfFile(item.file_path);
                    
                    return isPdf ? (
                      <TouchableOpacity
                        key={`file-${index}`}
                        style={styles.pdfButton}
                        onPress={() => handleOpenPdf(fileUrl)}
                      >
                        <Ionicons name="document-text" size={32} color="#2563EB" />
                        <Text style={styles.pdfText} numberOfLines={1} ellipsizeMode="tail">
                          {item.file_name || item.doctype || `PDF ${index + 1}`}
                        </Text>
                        <Text style={styles.filePathText}>
                          {item.file_path}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                    <View style={{ alignItems: 'center' }}>
                      <View style={styles.imageOverlay}>
                        <Text style={styles.filePathText}>{item.file_path}</Text>
                      </View>
                      <TouchableOpacity
                        key={`file-${index}`}
                        style={[
                          styles.imageContainer, 
                          Platform.OS !== 'web' && styles.imageContainerMobile
                        ]}
                        onPress={() => handleImagePress(fileUrl)}
                      >
                        <Image 
                          source={{ uri: fileUrl }}
                          style={styles.imagePreview}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    </View>
                    
                    );
                  })
                }
              </View>
            ) : (
              <Text style={styles.noDataText}>No documentation files available</Text>
            )}
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2563EB" />

      {/* Header */}
      <LinearGradient
        colors={['#2563EB', '#3B82F6']}
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
        <Text style={styles.headerTitle}>
          {cmh.stock_id || 'Chassis Detail'}
        </Text>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton
          icon="car-outline"
          label="Chassis"
          active={activeTab === 'main'}
          onPress={() => setActiveTab('main')}
        />
        <TabButton
          icon="reader-outline"
          label="History"
          active={activeTab === 'history'}
          onPress={() => setActiveTab('history')}
        />
        <TabButton
          icon="image-outline"
          label="Picture"
          active={activeTab === 'picture'}
          onPress={() => setActiveTab('picture')}
        />
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color={COLORS.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'main' && renderMainInfo()}
        {activeTab === 'history' && renderHistoryInfo()}
        {activeTab === 'picture' && renderPictureInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: COLORS.gray,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    ...SHADOWS.medium,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563EB',
  },
  tabLabel: {
    marginTop: SPACING.xs,
    fontSize: SIZES.small,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  tabContent: {
    paddingBottom: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: '#2563EB',
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
    width: width * 0.4,
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  infoValue: {
    flex: 1,
    fontSize: SIZES.small,
    color: COLORS.text,
    fontWeight: '500',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  errorText: {
    marginLeft: SPACING.sm,
    fontSize: SIZES.medium,
    color: COLORS.error,
    flex: 1,
  },
  historyItem: {
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.small,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '30',
  },
  historyDate: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  noDataText: {
    fontSize: SIZES.md,
    color: COLORS.gray,
    textAlign: 'center',
  },
  chassisEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chassisEntryTitle: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  chassisEntryDate: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: 4,
  },
  noDataContainer: {
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  fullImage: {
    width: width * 0.9,
    height: height * 0.8,
  },
  imageGallery: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: Platform.OS === 'web' ? 'space-between' : 'center',
  },
  imageContainer: {
    width: width * 0.44,
    height: width * 0.44,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
    position: 'relative',
  },
  imageContainerMobile: {
    marginHorizontal: SPACING.xs,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    borderRadius: '3px',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 3,
    maxHeight: width * 0.2,
    marginBottom: '5px',
  },
  filePathText: {
    fontSize: 8,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  pdfButton: {
    width: width * 0.44,
    height: width * 0.4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    marginHorizontal: Platform.OS === 'web' ? 0 : SPACING.xs,
  },
  pdfText: {
    marginTop: SPACING.xs,
    fontSize: SIZES.small,
    textAlign: 'center',
    color: '#1E3A8A',
  },
  tableContainer: {
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    ...SHADOWS.small,
    marginHorizontal: 2,
    marginBottom: SPACING.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: 0,
  },
  tableHeaderCell: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    color: '#1E40AF',
    padding: SPACING.xs,
    textAlign: 'center',
    paddingVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#D1D5DB',
    minHeight: 40,
  },
  tableRowEven: {
    backgroundColor: '#FFFFFF',
  },
  tableRowOdd: {
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#D1D5DB',
  },
  tableCellText: {
    fontSize: SIZES.ssmall,
    color: '#374151',
    flexWrap: 'wrap',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default CMHDetails; 