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
import CONFIG from '../../constants/config';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../../constants/theme';

// 提取成单独的组件，这样就可以在组件内部使用hooks
const PlanItem = ({ item, index, navigation }) => {
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
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('PlanDetails', { plan: item })}
      >
        <LinearGradient
          colors={['rgba(15, 23, 42, 0.05)', 'rgba(255, 255, 255, 0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="clipboard" size={22} color="#1E293B" style={styles.cardIcon} />
              <Text style={styles.cardId}>Plan #{' '}
                <Text style={styles.cardIdValue}>{item.plan_id || '-'}</Text>
              </Text>
            </View>
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>ModelID: {item.model_id || 'N/A'}</Text>
            </View>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.cardRowsContainer}>
              <View style={[styles.cardRow, styles.bodyTypeRow]}>
                <Text style={styles.cardLabel}>Body Type</Text>
                <Text style={[styles.cardValue, styles.bodyTypeValue]} numberOfLines={2}>
                  {item.body_type?.length > 50 
                    ? item.body_type.substring(0, 50) + '...' 
                    : item.body_type || '-'}
                </Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>BDM</Text>
                <Text style={styles.cardValue}>{item.bdm || '-'}</Text>
              </View>
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Wheelbase</Text>
                <Text style={styles.cardValue}>{item.wheelbase || '-'}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.viewDetailsText}>View Details</Text>
            <Ionicons name="chevron-forward-circle" size={22} color="#1E293B" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const PlanListing = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageSize = 100;

  const fetchPlans = async (pageNum = 1, shouldAppend = false) => {
    try {
      // Set loading states
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');

      // Build the URL with query parameters
      const url = `${CONFIG.API_BASE_URL}/plans?page=${pageNum}&size=${pageSize}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      // Update state based on whether we're appending or refreshing
      if (shouldAppend) {
        setPlans(prev => [...prev, ...data]);
      } else {
        setPlans(data);
      }
      
      // Check if we have more data to load
      setHasMore(data.length === pageSize);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Search function that uses the API endpoint
  const searchPlans = async (query) => {
    if (!query.trim()) {
      // If search is empty, reset to first page of data
      setPage(1);
      fetchPlans(1, false);
      return;
    }

    try {
      setLoading(true);
      
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');

      const response = await fetch(`${CONFIG.API_BASE_URL}/plans?search=${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();
      setPlans(data);
      setHasMore(false); // When searching, we don't implement pagination
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to search data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(1, false);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPlans(1, false);
  };

  const loadMoreData = () => {
    if (!hasMore || loadingMore || refreshing || loading || searchQuery) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPlans(nextPage, true);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };
  
  const executeSearch = () => {
    searchPlans(searchQuery);
  };

  // Original local filtering code (commented out as requested)
  // const filteredPlans = plans.filter(plan => {
  //   if (!plan) return false;
  //   const searchLower = searchQuery.toLowerCase();
  //   
  //   return (
  //     (plan.plan_id && String(plan.plan_id).toLowerCase().includes(searchLower)) ||
  //     (plan.model_id && String(plan.model_id).toLowerCase().includes(searchLower)) ||
  //     (plan.body_type && String(plan.body_type).toLowerCase().includes(searchLower)) ||
  //     (plan.bdm && String(plan.bdm).toLowerCase().includes(searchLower)) ||
  //     (plan.wheelbase && String(plan.wheelbase).toLowerCase().includes(searchLower))
  //   );
  // });

  // 使用单独的组件
  const renderPlan = ({ item, index }) => {
    if (!item) return null;
    return <PlanItem item={item} index={index} navigation={navigation} />;
  };

  // Render footer with loading indicator when loading more data
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#1E293B" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E293B" />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#0F172A" barStyle="light-content" />

      <LinearGradient
        colors={['#0F172A', '#334155']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Plan List</Text>
          <View style={styles.headerRight}></View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <TouchableOpacity onPress={executeSearch}>
            <Ionicons name="search" size={20} color="#64748B" />
          </TouchableOpacity>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#64748B"
            onSubmitEditing={executeSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                onRefresh();
              }}
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
        data={plans}
        renderItem={renderPlan}
        keyExtractor={(item, index) => `${item.id || index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#1E293B']} 
            progressBackgroundColor="#f1f5f9"
          />
        }
        showsVerticalScrollIndicator={false}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !error && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={60} color="#94a3b8" />
              <Text style={styles.emptyText}>No plans found</Text>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: '#1E293B' }]} 
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  headerRight: {
    width: 24,
    height: 24,
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
    fontWeight: '600',
    color: '#64748B',
  },
  cardIdValue: {
    fontWeight: '700',
    color: '#1E293B',
  },
  cardBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E293B',
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
  bodyTypeRow: {
    alignItems: 'flex-start',
  },
  bodyTypeValue: {
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1E293B',
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
    backgroundColor: '#1E293B',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    ...SHADOWS.medium,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  footerText: {
    marginLeft: SPACING.sm,
    color: '#64748B',
    fontSize: SIZES.small,
  }
});

export default PlanListing; 