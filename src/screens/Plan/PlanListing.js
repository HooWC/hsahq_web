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
              <Text style={styles.cardBadgeText}>Model ID: {item.model_id || 'N/A'}</Text>
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
  const [wheelbseQuery, setWheelbseQuery] = useState('');
  const [bodytypeQuery, setBodyTypeQuery] = useState('');
  const [plans, setPlans] = useState([]);
  const [filteredPlans, setFilteredPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [simpleSearchQuery, setSimpleSearchQuery] = useState('');
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

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update state based on whether we're appending or refreshing
      if (shouldAppend) {
        setPlans(prev => [...prev, ...data]);
      } else {
        setPlans(data);
      }
      
      // Check if we have more data to load
      setHasMore(data.length === pageSize);
      setError(null);
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to get data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // 搜索函数: 用于API搜索或者本地过滤
  const searchPlans = async (query, type = 'general', isInitialSearch = true) => {
    if (!query.trim() && type !== 'combined') {
      return;
    }

    try {
      // 如果是初始搜索，则调用API获取数据
      if (isInitialSearch) {
        setSearching(true);
        setError(null);
        
        const token = Platform.OS === 'web'
          ? window.localStorage.getItem('userToken')
          : await AsyncStorage.getItem('userToken');

        // 构建搜索URL
        let searchParam = '';
        if (advancedMode) {
          if (type === 'combined') {
            // 对于组合搜索，先使用一个最宽泛的条件获取数据，然后在本地过滤
            const mainParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : 
                             bodytypeQuery.trim() ? `&body_type=${encodeURIComponent(bodytypeQuery.trim())}` : 
                             wheelbseQuery.trim() ? `&wheelbase=${encodeURIComponent(wheelbseQuery.trim())}` : '';
            searchParam = mainParam;
          } else {
            switch(type) {
              case 'model_id':
                searchParam = `&search=${encodeURIComponent(query)}`;
                break;
              case 'body_type':
                searchParam = `&body_type=${encodeURIComponent(query)}`;
                break;
              case 'wheelbase':
                searchParam = `&wheelbase=${encodeURIComponent(query)}`;
                break;
              default:
                searchParam = `&search=${encodeURIComponent(query)}`;
            }
          }
        } else {
          // 简单模式
          searchParam = `&search=${encodeURIComponent(query)}`;
        }

        // Use pagination for better performance instead of size=1000
        const response = await fetch(`${CONFIG.API_BASE_URL}/plans?page=1&size=${pageSize}${searchParam}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        
        // 处理搜索结果
        let filteredData = data;
        
        // 如果是组合搜索，需要在本地进行多条件筛选
        if (type === 'combined') {
          filteredData = data.filter(item => {
            let matchesAll = true;
            
            // 检查 Model ID
            if (searchQuery.trim()) {
              const matchesModelId = item.model_id?.toLowerCase().includes(searchQuery.trim().toLowerCase());
              matchesAll = matchesAll && matchesModelId;
            }
            
            // 检查 Body Type
            if (bodytypeQuery.trim()) {
              const matchesBodyType = item.body_type?.toLowerCase().includes(bodytypeQuery.trim().toLowerCase());
              matchesAll = matchesAll && matchesBodyType;
            }
            
            // 检查 Wheelbase
            if (wheelbseQuery.trim()) {
              // 如果用户输入了精确数值，则精确匹配
              if (!isNaN(wheelbseQuery) && wheelbseQuery.indexOf('.') === -1) {
                const wheelbaseStr = item.wheelbase?.toString() || '';
                
                // 处理方式1：如果 wheelbase 是单一数值（如 "3800"、"3800 mm"）
                if (wheelbaseStr.match(/^\d+(\s*mm)?$/i)) {
                  const numericPart = parseInt(wheelbaseStr);
                  const matchesWheelbase = numericPart === parseInt(wheelbseQuery);
                  matchesAll = matchesAll && matchesWheelbase;
                }
                // 处理方式2：如果 wheelbase 是范围（如 "3800-4200"）
                else if (wheelbaseStr.includes('-')) {
                  const ranges = wheelbaseStr.split('-').map(part => parseInt(part.trim()));
                  if (ranges.length === 2 && !isNaN(ranges[0]) && !isNaN(ranges[1])) {
                    const userValue = parseInt(wheelbseQuery);
                    const isInRange = userValue >= ranges[0] && userValue <= ranges[1];
                    matchesAll = matchesAll && isInRange;
                  } else {
                    const matchesWheelbase = wheelbaseStr.toLowerCase().includes(wheelbseQuery.toLowerCase());
                    matchesAll = matchesAll && matchesWheelbase;
                  }
                }
                // 处理方式3：其他情况，使用字符串包含
                else {
                  const matchesWheelbase = wheelbaseStr.toLowerCase().includes(wheelbseQuery.toLowerCase());
                  matchesAll = matchesAll && matchesWheelbase;
                }
              } else {
                // 如果用户输入的不是纯数字，则使用普通的字符串包含比较
                const matchesWheelbase = item.wheelbase?.toLowerCase().includes(wheelbseQuery.toLowerCase());
                matchesAll = matchesAll && matchesWheelbase;
              }
            }
            
            return matchesAll;
          });
        }
        
        if (type === 'combined') {
          setFilteredPlans(filteredData);
        } else {
          setPlans(data);
          setFilteredPlans([]);
        }
        
        setSearchPerformed(true);
        setError(null);
        
        // Check if we have more data available
        setHasMore(data.length === pageSize && type !== 'combined');
        setPage(1);
      }
    } catch (err) {
      console.error('Search Error:', err);
      setError('Failed to search data. Please try again.');
      // Keep existing data visible when search fails
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // New function to load more search results
  const loadMoreSearchResults = async () => {
    if (!hasMore || loadingMore || !searchPerformed) return;
    
    try {
      setLoadingMore(true);
      
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');

      const nextPage = page + 1;
      
      // Determine which search is active
      let searchParam = '';
      if (!advancedMode && simpleSearchQuery) {
        searchParam = `&search=${encodeURIComponent(simpleSearchQuery)}`;
      } else if (advancedMode) {
        if (searchQuery) searchParam = `&search=${encodeURIComponent(searchQuery)}`;
        else if (bodytypeQuery) searchParam = `&body_type=${encodeURIComponent(bodytypeQuery)}`;
        else if (wheelbseQuery) searchParam = `&wheelbase=${encodeURIComponent(wheelbseQuery)}`;
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/plans?page=${nextPage}&size=${pageSize}${searchParam}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.length < pageSize) {
        setHasMore(false);
      }
      
      setPlans(prevData => [...prevData, ...data]);
      setPage(nextPage);
      
    } catch (err) {
      console.error('Load more search results error:', err);
      setError('Failed to load more results');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchPerformed(false);
    setSearchQuery('');
    setWheelbseQuery('');
    setBodyTypeQuery('');
    setSimpleSearchQuery('');
    setFilteredPlans([]);
    fetchPlans(1, false);
  };

  const loadMoreData = () => {
    if (searchPerformed) {
      loadMoreSearchResults();
    } else if (hasMore && !loadingMore) {
      fetchPlans(page + 1, true);
    }
  };

  // 切换搜索模式
  const toggleSearchMode = () => {
    const newMode = !advancedMode;
    setAdvancedMode(newMode);
    
    // 重置所有搜索状态
    setSearchQuery('');
    setWheelbseQuery('');
    setBodyTypeQuery('');
    setSimpleSearchQuery('');
    setSearchPerformed(false);
    setFilteredPlans([]);
    
    // 刷新数据
    onRefresh();
  };

  // 处理各种搜索输入的变化
  const handleSimpleSearch = (text) => {
    setSimpleSearchQuery(text);
  };

  const handleModelIdSearch = (text) => {
    setSearchQuery(text);
  };
  
  const handleWheelbseSearch = (text) => {
    setWheelbseQuery(text);
  };
  
  const handleBodyTypeSearch = (text) => {
    setBodyTypeQuery(text);
  };

  const executeSimpleSearch = () => {
    setSimpleSearchQuery(searchQuery);
    searchPlans(searchQuery, 'general');
  };

  const executeModelIdSearch = () => {
    searchPlans(searchQuery, 'model_id');
  };

  const executeBodyTypeSearch = () => {
    searchPlans(bodytypeQuery, 'body_type');
  };

  const executeWheelbseSearch = () => {
    searchPlans(wheelbseQuery, 'wheelbase');
  };

  const executeAdvancedSearch = () => {
    // 检查是否至少有一个查询条件
    const hasCondition = searchQuery.trim() || bodytypeQuery.trim() || wheelbseQuery.trim();
    if (hasCondition) {
      searchPlans('combined', 'combined');
    } else {
      setError('Please enter at least one search condition');
    }
  };

  // 重置搜索
  const resetAllSearches = () => {
    setSearchQuery('');
    setWheelbseQuery('');
    setBodyTypeQuery('');
    setSimpleSearchQuery('');
    setSearchPerformed(false);
    setFilteredPlans([]);
    onRefresh();
  };

  // 使用单独的组件
  const renderPlan = ({ item, index }) => {
    if (!item) return null;
    return <PlanItem item={item} index={index} navigation={navigation} />;
  };

  // Render footer with loading indicator when loading more data
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadMoreText}>Loading more plans...</Text>
      </View>
    );
  };

  if (loading && !refreshing && !searching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Building Plans</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={toggleSearchMode}
        >
          <Text style={styles.toggleButtonText}>
            {advancedMode ? 'Simple Search' : 'Advanced Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      {advancedMode ? (
        // Advanced search
        <View style={styles.advancedSearchContainer}>
          <View style={styles.searchRow}>
            <Text style={styles.searchLabel}>Model ID:</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by model ID"
                value={searchQuery}
                onChangeText={handleModelIdSearch}
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                onSubmitEditing={executeModelIdSearch}
                editable={!searching}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                  disabled={searching}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.searchRow}>
            <Text style={styles.searchLabel}>Body Type:</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by body type"
                value={bodytypeQuery}
                onChangeText={handleBodyTypeSearch}
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                onSubmitEditing={executeBodyTypeSearch}
                editable={!searching}
              />
              {bodytypeQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBodyTypeQuery('')}
                  style={styles.clearButton}
                  disabled={searching}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.searchRow}>
            <Text style={styles.searchLabel}>Wheelbase:</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Enter wheelbase"
                value={wheelbseQuery}
                onChangeText={handleWheelbseSearch}
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                onSubmitEditing={executeWheelbseSearch}
                editable={!searching}
                keyboardType="number-pad"
              />
              {wheelbseQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setWheelbseQuery('')}
                  style={styles.clearButton}
                  disabled={searching}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.advancedButtonsContainer}>
            <TouchableOpacity
              style={[styles.advancedButton, styles.searchButton]}
              onPress={executeAdvancedSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="search" size={16} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Search</Text>
                </>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.advancedButton, styles.resetButton]}
              onPress={resetAllSearches}
              disabled={searching}
            >
              <Ionicons name="refresh" size={16} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        // Simple search
        <View style={styles.searchContainer}>
          <View style={styles.simpleSearchInputContainer}>
            <TouchableOpacity 
              onPress={executeSimpleSearch}
              disabled={searching}
            >
              <Ionicons name="search" size={20} color="#64748B" />
            </TouchableOpacity>
            <TextInput
              style={styles.simpleSearchInput}
              placeholder="Search plans by model ID"
              value={searchQuery}
              onChangeText={handleSimpleSearch}
              placeholderTextColor="#64748B"
              returnKeyType="search"
              onSubmitEditing={executeSimpleSearch}
              editable={!searching}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  onRefresh();
                }}
                style={styles.clearButtonSimple}
                disabled={searching}
              >
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
            {searching && (
              <ActivityIndicator size="small" color="#3B82F6" style={styles.searchingIndicator} />
            )}
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={24} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={filteredPlans.length > 0 ? filteredPlans : plans}
        renderItem={renderPlan}
        keyExtractor={(item, index) => `${item?.plan_id || ''}_${index}`}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
          />
        }
        ListEmptyComponent={
          !loading && !searching && !error ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="clipboard" size={60} color="#94A3B8" />
              <Text style={styles.emptyText}>No plans found</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={onRefresh}
              >
                <Text style={styles.emptyButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : searching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.searchingText}>Searching...</Text>
            </View>
          ) : null
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
    paddingBottom: SPACING.md,
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
  },
  resetButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginLeft: 10,
    ...SHADOWS.small,
  },
  searchButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: SIZES.small,
    fontWeight: '600',
  },
  modeToggleContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modeToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.md,
    ...SHADOWS.small,
  },
  modeToggleText: {
    marginLeft: 4,
    fontSize: SIZES.small,
    color: '#1E293B',
    fontWeight: '600',
  },
  searchingContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchingText: {
    marginTop: SPACING.md,
    fontSize: SIZES.medium,
    color: '#64748B',
    fontWeight: '500',
  },
  searchingIndicator: {
    marginLeft: SPACING.sm,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  loadMoreText: {
    marginLeft: SPACING.sm,
    color: '#64748B',
    fontSize: SIZES.small,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    ...SHADOWS.medium,
  },
  toggleButton: {
    padding: SPACING.xs,
  },
  toggleButtonText: {
    fontSize: SIZES.small,
    color: '#1E293B',
    fontWeight: '600',
  },
  advancedSearchContainer: {
    padding: SPACING.md,
  },
  searchRow: {
    marginBottom: SPACING.md,
  },
  searchLabel: {
    fontSize: SIZES.small,
    color: '#64748B',
    fontWeight: '500',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  clearButton: {
    padding: SPACING.xs,
  },
  advancedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  advancedButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    marginHorizontal: 4,
    ...SHADOWS.small,
  },
  buttonIcon: {
    marginRight: 4,
  },
  simpleSearchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.small,
  },
  simpleSearchInput: {
    flex: 1,
    height: 46,
    marginLeft: SPACING.sm,
    fontSize: SIZES.medium,
    color: '#1E293B',
    outlineStyle: 'none',
  },
  clearButtonSimple: {
    padding: SPACING.xs,
  },
});

export default PlanListing; 