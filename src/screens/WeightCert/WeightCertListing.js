import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../../constants/theme';
import CONFIG from '../../constants/config';

// 提取成单独的组件，这样就可以在组件内部使用hooks
const WeightCertItem = ({ item, index, navigation }) => {
  const itemFadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // 让每个项目有一个微小的延迟，创造级联效果
    Animated.timing(itemFadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50, // 级联延迟
      useNativeDriver: true,
    }).start();
  }, []);
  
  const animatedStyle = {
    opacity: itemFadeAnim,
    transform: [{ 
      translateY: itemFadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [20, 0]
      })
    }]
  };
  
  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('WeightCertDetails', { cert: item })}
      >
        <LinearGradient
          colors={['rgba(244, 63, 94, 0.05)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text" size={22} color="#F43F5E" style={styles.cardIcon} />
              <Text style={styles.cardId}>Model Group #{' '}
                <Text style={styles.cardIdValue}>{item.mgroup_id || '-'}</Text>
              </Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{"Make: "+item.make || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardRowsContainer}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>ID</Text>
                <Text style={styles.cardValue}>{item.model_id || '-'}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Wheelbase</Text>
                <Text style={styles.cardValue}>{item.wheelbase || '-'}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>BDM/BGK(W)</Text>
                <Text style={styles.cardValue}>{item.bdm_w || '-'}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>BDM/BGK(E)</Text>
                <Text style={styles.cardValue}>{item.bdm_e || '-'}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Axle</Text>
                <Text style={styles.cardValue}>{item.axle || '-'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward-circle" size={22} color="#F43F5E" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const WeightCertListing = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [weightCerts, setWeightCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchWeightCerts = async () => {
    try {
      // 跨平台获取 token
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');
      console.log('Token:', token);

      const response = await fetch(`${CONFIG.API_BASE_URL}/weightCerts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      //console.log('WeightCerts data:', data);
      setWeightCerts(data);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWeightCerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchWeightCerts();
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredCerts = weightCerts.filter(cert => {
    if (!cert) return false;
    const searchLower = searchQuery.toLowerCase();
    
    // 检查所有字段，使用String()函数替代toString()方法
    return (
      (cert.mgroup_id && String(cert.mgroup_id).toLowerCase().includes(searchLower)) || // Model Group
      (cert.make && String(cert.make).toLowerCase().includes(searchLower)) || // Make
      (cert.model_id && String(cert.model_id).toLowerCase().includes(searchLower)) || // Id
      (cert.wheelbase && String(cert.wheelbase).toLowerCase().includes(searchLower)) || // Wheelbase
      (cert.bdm_w && String(cert.bdm_w).toLowerCase().includes(searchLower)) || // BDM/BGK(W)
      (cert.bdm_e && String(cert.bdm_e).toLowerCase().includes(searchLower)) || // BDM/BGK(G)
      (cert.axle && String(cert.axle).toLowerCase().includes(searchLower)) // Axle
    );
  });

  // 修改renderWeightCert，使用独立的组件
  const renderWeightCert = ({ item, index }) => {
    if (!item) return null;
    return <WeightCertItem item={item} index={index} navigation={navigation} />;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={styles.loadingText}>Loading certificates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F43F5E" />

      {/* Header */}
      <LinearGradient
        colors={['#F43F5E', '#FB7185']}
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
        <Text style={styles.headerTitle}>Weight Certificates</Text>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#64748B"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#64748B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filteredCerts}
        renderItem={renderWeightCert}
        keyExtractor={(item, index) => `${item.id || index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#EF4444']} 
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text" size={60} color="#94A3B8" />
              <Text style={styles.emptyText}>No weight certificates found</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={onRefresh}
              >
                <Text style={styles.emptyButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: '#64748B',
    fontWeight: '500',
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
  searchWrapper: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    height: 46,
    marginLeft: SPACING.sm,
    fontSize: SIZES.medium,
    color: '#1E293B',
    outlineStyle: 'none',
  },
  clearButton: {
    padding: SPACING.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    marginLeft: SPACING.sm,
    color: '#B91C1C',
    fontSize: SIZES.medium,
    fontWeight: '500',
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  cardGradient: {
    borderRadius: RADIUS.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    marginRight: 8,
  },
  cardId: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  cardIdValue: {
    color: '#F43F5E',
  },
  cardBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  cardBadgeText: {
    color: '#F43F5E',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: SPACING.md,
  },
  cardRowsContainer: {
    marginBottom: 4,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: SIZES.small,
    color: '#64748B',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: SIZES.small,
    color: '#1E293B',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  viewDetailsText: {
    color: '#F43F5E',
    marginRight: 4,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: '#64748B',
    marginBottom: SPACING.md,
  },
  emptyButton: {
    backgroundColor: '#F43F5E',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  }
});

export default WeightCertListing; 