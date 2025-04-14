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
  Alert,
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
const CMHListItem = ({ item, index, navigation }) => {
  // 根据状态决定卡片显示样式
  const getStatusColor = (status) => {
    if (!status) return '#94A3B8'; // 默认颜色
    
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed')) return '#10B981'; // 绿色
    if (statusLower.includes('progress') || statusLower.includes('active')) return '#6366F1'; // 蓝紫色
    if (statusLower.includes('pending')) return '#F59E0B'; // 琥珀色
    if (statusLower.includes('cancel') || statusLower.includes('error')) return '#EF4444'; // 红色
    
    return '#8B5CF6'; // 紫色，默认
  };
  
  const statusColor = getStatusColor(item.status);
  const itemFadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // 为每个项目单独设置动画
    Animated.timing(itemFadeAnim, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
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
    <Animated.View style={[animatedStyle, { marginBottom: SPACING.md }]}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('CMHDetails', { cmh: item })}
      >
        <LinearGradient
          colors={['rgba(37, 99, 235, 0.05)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="car" size={22} color="#2563EB" style={styles.cardIcon} />
              <Text style={styles.cardId}>Stock ID #{' '}
                <Text style={styles.cardIdValue}>{(item.stock_id || '-').trim()}</Text>
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {("Status: "+item.status || 'Unknown').trim()}
              </Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardRowsContainer}>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Item ID</Text>
                <Text style={styles.cardValue}>{(item.item_id || '-').trim()}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Model Group</Text>
                <Text style={styles.cardValue}>{(item.mgroup_id || '-').trim()}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Customer</Text>
                <Text style={styles.cardValue} numberOfLines={1} ellipsizeMode="tail">
                  {(item.bc_if || '-').trim()}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Location</Text>
                <Text style={styles.cardValue}>{(item.location || '-').trim()}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Create Date</Text>
                <Text style={styles.cardValue}>
                  {item.createdt
                    ? new Intl.DateTimeFormat('zh-CN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      }).format(new Date(item.createdt))
                    : '-'}
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward-circle" size={22} color="#2563EB" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const CMHListing = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [cmhData, setCmhData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const pageSize = 30;

  const fetchCMHData = async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        setCmhData([]);
        pageNum = 1;
      }
      
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');
      //console.log('Token:', token);
      setLoadingMore(pageNum > 1);

      const response = await fetch(`${CONFIG.API_BASE_URL}/cmh?page=${pageNum}&size=${pageSize}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      //console.log('CMH data:', data);
      
      if (data.length < pageSize) {
        setHasMoreData(false);
      } else {
        setHasMoreData(true);
      }

      if (pageNum === 1) {
        setCmhData(data);
      } else {
        setCmhData(prevData => [...prevData, ...data]);
      }
      
      setPage(pageNum);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCMHData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCMHData(1, true);
  };

  const loadMoreData = () => {
    if (!loadingMore && hasMoreData) {
      fetchCMHData(page + 1);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const filteredCMH = cmhData.filter(item => {
    if (!item) return false;
    const searchLower = searchQuery.toLowerCase();
    
    // 检查所有字段
    return (
      (item.stock_id && String(item.stock_id).toLowerCase().includes(searchLower)) ||
      (item.item_id && String(item.item_id).toLowerCase().includes(searchLower)) ||
      (item.mgroup_id && String(item.mgroup_id).toLowerCase().includes(searchLower)) ||
      (item.customer && String(item.customer).toLowerCase().includes(searchLower)) ||
      (item.status && String(item.status).toLowerCase().includes(searchLower)) ||
      (item.location && String(item.location).toLowerCase().includes(searchLower)) ||
      (item.createdt && String(new Date(item.createdt).toLocaleDateString()).toLowerCase().includes(searchLower))
    );
  });

  // 修改renderCMHItem，现在它使用分离的组件
  const renderCMHItem = ({ item, index }) => {
    if (!item) return null;
    return <CMHListItem item={item} index={index} navigation={navigation} />;
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#6366F1" />
        <Text style={styles.footerText}>Loading More...</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Loading chassis movement data...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Chassis Movement History</Text>
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
        data={filteredCMH}
        renderItem={renderCMHItem}
        keyExtractor={(item, index) => `${item?.stock_id ? item.stock_id.trim() : ''}_${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#3B82F6']} 
          />
        }
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !error && (
            <View style={styles.emptyContainer}>
              <Ionicons name="car" size={60} color="#94A3B8" />
              <Text style={styles.emptyText}>No chassis movement records found</Text>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: '#2563EB' }]}
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
    color: '#2563EB',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
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
    color: '#2563EB',
    marginRight: 4,
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  footerText: {
    marginLeft: SPACING.sm,
    fontSize: SIZES.small,
    color: '#64748B',
    fontWeight: '500',
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
    backgroundColor: '#2563EB',
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

export default CMHListing; 