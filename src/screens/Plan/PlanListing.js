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

  // 搜索函数: 用于API搜索或者本地过滤
  const searchPlans = async (query, type = 'general', isInitialSearch = true) => {
    if (!query.trim()) {
      return;
    }

    try {
      // 如果是初始搜索，则调用API获取数据
      if (isInitialSearch) {
        setLoading(true);
        
        const token = Platform.OS === 'web'
          ? window.localStorage.getItem('userToken')
          : await AsyncStorage.getItem('userToken');

        // 构建搜索URL
        let searchParam = '';
        if (advancedMode) {
          switch(type) {
            case 'model_id':
              searchParam = `&search=${query}`;
              break;
            case 'body_type':
              searchParam = `&body_type=${query}`;
              break;
            case 'wheelbase':
              searchParam = `&wheelbase=${query}`;
              break;
            default:
              searchParam = `&search=${query}`;
          }
        } else {
          // 简单模式
          searchParam = `&search=${query}`;
        }

        const response = await fetch(`${CONFIG.API_BASE_URL}/plans?size=1000${searchParam}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const data = await response.json();
        setFilteredPlans(data);
        setSearchPerformed(true);
        setHasMore(false); // 搜索时不使用分页
      } 
      // 如果不是初始搜索，就在已有的filteredPlans中过滤
      else {
        // 根据搜索类型过滤现有结果
        let newFilteredResults = [...filteredPlans];
        
        switch(type) {
          case 'model_id':
            newFilteredResults = newFilteredResults.filter(item => 
              item.model_id?.toLowerCase().includes(query.toLowerCase())
            );
            break;
          case 'body_type':
            newFilteredResults = newFilteredResults.filter(item => 
              item.body_type?.toLowerCase().includes(query.toLowerCase())
            );
            break;
          case 'wheelbase':
            newFilteredResults = newFilteredResults.filter(item => 
              item.wheelbase?.toLowerCase().includes(query.toLowerCase())
            );
            break;
          default:
            break;
        }
        
        setFilteredPlans(newFilteredResults);
      }
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
    setSearchPerformed(false);
    setSearchQuery('');
    setWheelbseQuery('');
    setBodyTypeQuery('');
    setSimpleSearchQuery('');
    fetchPlans(1, false);
  };

  const loadMoreData = () => {
    if (!hasMore || loadingMore || refreshing || loading || searchQuery) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPlans(nextPage, true);
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

  // 执行搜索操作
  const executeSimpleSearch = () => {
    if (simpleSearchQuery.trim()) {
      searchPlans(simpleSearchQuery, 'general', true);
    } else {
      onRefresh();
    }
  };

  const executeModelIdSearch = () => {
    if (searchQuery.trim()) {
      // 如果已经执行过搜索，就过滤结果
      searchPlans(searchQuery, 'model_id', !searchPerformed);
    }
  };

  const executeBodyTypeSearch = () => {
    if (bodytypeQuery.trim()) {
      searchPlans(bodytypeQuery, 'body_type', !searchPerformed);
    }
  };

  const executeWheelbseSearch = () => {
    if (wheelbseQuery.trim()) {
      searchPlans(wheelbseQuery, 'wheelbase', !searchPerformed);
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

      {/* Search Mode Toggle */}
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity 
          style={styles.modeToggleButton} 
          onPress={toggleSearchMode}
        >
          <Ionicons name={advancedMode ? "options" : "options-outline"} size={20} color="#1E293B" />
          <Text style={styles.modeToggleText}>
            {advancedMode ? "简单搜索" : "高级搜索"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bars */}
      <View style={styles.searchWrapper}>
        {!advancedMode ? (
          // Simple Search Mode
          <View style={styles.searchContainer}>
            <TouchableOpacity onPress={executeSimpleSearch}>
              <Ionicons name="search" size={20} color="#64748B" />
            </TouchableOpacity>
            <TextInput
              style={styles.searchInput}
              placeholder="搜索计划"
              value={simpleSearchQuery}
              onChangeText={handleSimpleSearch}
              placeholderTextColor="#64748B"
              returnKeyType="search"
            />
            {simpleSearchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSimpleSearchQuery('');
                  resetAllSearches();
                }}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color="#64748B" />
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // Advanced Search Mode
          <>
            {/* Model ID Search */}
            <View style={[styles.searchContainer, { marginBottom: 8 }]}>
              <TouchableOpacity onPress={executeModelIdSearch}>
                <Ionicons name="search" size={20} color="#64748B" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="搜索 Model ID"
                value={searchQuery}
                onChangeText={handleModelIdSearch}
                placeholderTextColor="#64748B"
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchQuery('');
                    if (searchPerformed && (bodytypeQuery.trim() || wheelbseQuery.trim())) {
                      // 如果有其他搜索条件，重新执行搜索
                      if (bodytypeQuery.trim()) {
                        searchPlans(bodytypeQuery, 'body_type', true);
                      } else if (wheelbseQuery.trim()) {
                        searchPlans(wheelbseQuery, 'wheelbase', true);
                      }
                    } else {
                      resetAllSearches();
                    }
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Body Type Search */}
            <View style={[styles.searchContainer, { marginBottom: 8 }]}>
              <TouchableOpacity onPress={executeBodyTypeSearch}>
                <Ionicons name="search" size={20} color="#64748B" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="搜索 Body Type"
                value={bodytypeQuery}
                onChangeText={handleBodyTypeSearch}
                placeholderTextColor="#64748B"
                returnKeyType="search"
              />
              {bodytypeQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setBodyTypeQuery('');
                    if (searchPerformed && (searchQuery.trim() || wheelbseQuery.trim())) {
                      // 如果有其他搜索条件，重新执行搜索
                      if (searchQuery.trim()) {
                        searchPlans(searchQuery, 'model_id', true);
                      } else if (wheelbseQuery.trim()) {
                        searchPlans(wheelbseQuery, 'wheelbase', true);
                      }
                    } else {
                      resetAllSearches();
                    }
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>

            {/* Wheelbase Search */}
            <View style={styles.searchContainer}>
              <TouchableOpacity onPress={executeWheelbseSearch}>
                <Ionicons name="search" size={20} color="#64748B" />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="搜索 Wheelbase"
                value={wheelbseQuery}
                onChangeText={handleWheelbseSearch}
                placeholderTextColor="#64748B"
                returnKeyType="search"
              />
              {wheelbseQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setWheelbseQuery('');
                    if (searchPerformed && (searchQuery.trim() || bodytypeQuery.trim())) {
                      // 如果有其他搜索条件，重新执行搜索
                      if (searchQuery.trim()) {
                        searchPlans(searchQuery, 'model_id', true);
                      } else if (bodytypeQuery.trim()) {
                        searchPlans(bodytypeQuery, 'body_type', true);
                      }
                    } else {
                      resetAllSearches();
                    }
                  }}
                  style={styles.clearButton}
                >
                  <Ionicons name="close-circle" size={20} color="#64748B" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
        
        {/* Reset Button */}
        {(searchQuery.length > 0 || wheelbseQuery.length > 0 || bodytypeQuery.length > 0 || simpleSearchQuery.length > 0) && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetAllSearches}
          >
            <Text style={styles.resetButtonText}>重置搜索</Text>
          </TouchableOpacity>
        )}
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
        data={searchPerformed ? filteredPlans : plans}
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
              <Text style={styles.emptyText}>
                {searchPerformed
                  ? "未找到匹配的计划" 
                  : "没有找到计划"}
              </Text>
              <TouchableOpacity 
                style={[styles.emptyButton, { backgroundColor: '#1E293B' }]} 
                onPress={onRefresh}
              >
                <Text style={styles.emptyButtonText}>刷新</Text>
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
    alignSelf: 'center',
    marginTop: 8,
    ...SHADOWS.small,
  },
  resetButtonText: {
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
});

export default PlanListing; 