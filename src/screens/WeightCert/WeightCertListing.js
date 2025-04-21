import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

// Memoized Weight Certificate Item Component
const WeightCertItem = React.memo(({ item, index, navigation }) => {
  const itemFadeAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // Animate items with a staggered effect, but limited to visible items
    const delay = Math.min(index, 10) * 30; // Cap the maximum delay
    Animated.timing(itemFadeAnim, {
      toValue: 1,
      duration: 200, // Reduced duration for better performance
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const animatedStyle = {
    opacity: itemFadeAnim,
    transform: [{ 
      translateY: itemFadeAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 0] // Reduced movement for better performance
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
                <Text style={styles.cardLabel}>Model ID</Text>
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
});

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const WeightCertListing = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [wheelbaseQuery, setWheelbaseQuery] = useState('');
  const [axleQuery, setAxleQuery] = useState('');
  const [weightCerts, setWeightCerts] = useState([]);
  const [filteredCerts, setFilteredCerts] = useState([]);
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

  // Debounce the search queries to reduce input lag
  const debouncedSimpleQuery = useDebounce(searchQuery, 300);
  const debouncedModelIdQuery = useDebounce(searchQuery, 300);
  const debouncedWheelbaseQuery = useDebounce(wheelbaseQuery, 300);
  const debouncedAxleQuery = useDebounce(axleQuery, 300);

  // Create cached versions of functions
  const fetchWeightCerts = useCallback(async (pageNum = 1, shouldAppend = false) => {
    try {
      // Set loading states
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      // Get token based on platform
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');

      // Build the URL with query parameters
      const url = `${CONFIG.API_BASE_URL}/weightCerts?page=${pageNum}&size=${pageSize}`;
      
      const response = await fetch(url, {
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
      
      // Update state based on whether we're appending or refreshing
      if (shouldAppend) {
        setWeightCerts(prev => [...prev, ...data]);
      } else {
        setWeightCerts(data);
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
  }, [pageSize]);

  // Memoized search function to prevent recreating on each render
  const searchWeightCerts = useCallback(async (query, type = 'general', isInitialSearch = true) => {
    if (!query.trim() && type !== 'combined') {
      // If search is empty, reset to first page of data
      setPage(1);
      fetchWeightCerts(1, false);
      return;
    }

    try {
      // Only show loading indicator if it's a new search
      if (isInitialSearch) {
        setSearching(true);
        setError(null);
        
        const token = Platform.OS === 'web'
          ? window.localStorage.getItem('userToken')
          : await AsyncStorage.getItem('userToken');

        // Build search URL based on search type
        let searchParam = '';
        if (advancedMode) {
          if (type === 'combined') {
            const mainParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery.trim())}` : 
                            wheelbaseQuery.trim() ? `&wheelbase=${encodeURIComponent(wheelbaseQuery.trim())}` : 
                            axleQuery.trim() ? `&axle=${encodeURIComponent(axleQuery.trim())}` : '';
            searchParam = mainParam;
          } else {
            switch(type) {
              case 'model_id':
                searchParam = `&search=${encodeURIComponent(query)}`;
                break;
              case 'wheelbase':
                searchParam = `&wheelbase=${encodeURIComponent(query)}`;
                break;
              case 'axle':
                searchParam = `&axle=${encodeURIComponent(query)}`;
                break;
              default:
                searchParam = `&search=${encodeURIComponent(query)}`;
            }
          }
        } else {
          // Simple mode search
          searchParam = `&search=${encodeURIComponent(query)}`;
        }

        // API request with pagination
        const response = await fetch(`${CONFIG.API_BASE_URL}/weightCerts?page=1&size=${pageSize}${searchParam}`, {
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
        
        // Process search results
        let filteredData = data;
        
        // For combined search, filter locally with multiple conditions
        if (type === 'combined') {
          filteredData = data.filter(item => {
            let matchesAll = true;
            
            // Check Model ID
            if (searchQuery.trim()) {
              const matchesModelId = item.model_id?.toLowerCase().includes(searchQuery.trim().toLowerCase());
              matchesAll = matchesAll && matchesModelId;
            }
            
            // Check Wheelbase
            if (wheelbaseQuery.trim()) {
              const matchesWheelbase = item.wheelbase?.toLowerCase().includes(wheelbaseQuery.trim().toLowerCase());
              matchesAll = matchesAll && matchesWheelbase;
            }
            
            // Check Axle
            if (axleQuery.trim()) {
              const matchesAxle = item.axle?.toLowerCase().includes(axleQuery.trim().toLowerCase());
              matchesAll = matchesAll && matchesAxle;
            }
            
            return matchesAll;
          });
        }
        
        if (type === 'combined') {
          setFilteredCerts(filteredData);
        } else {
          setWeightCerts(data);
          setFilteredCerts([]);
        }
        
        setSearchPerformed(true);
        setError(null);
        
        // Update pagination state
        setHasMore(data.length === pageSize && type !== 'combined');
        setPage(1);
      }
    } catch (err) {
      console.error('Search Error:', err);
      setError('Failed to search data. Please try again.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  }, [advancedMode, searchQuery, wheelbaseQuery, axleQuery, pageSize, fetchWeightCerts]);

  // Load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (!hasMore || loadingMore || !searchPerformed) return;
    
    try {
      setLoadingMore(true);
      
      const token = Platform.OS === 'web'
        ? window.localStorage.getItem('userToken')
        : await AsyncStorage.getItem('userToken');

      const nextPage = page + 1;
      
      // Determine which search parameter to use
      let searchParam = '';
      if (!advancedMode && simpleSearchQuery) {
        searchParam = `&search=${encodeURIComponent(simpleSearchQuery)}`;
      } else if (advancedMode) {
        if (searchQuery) searchParam = `&search=${encodeURIComponent(searchQuery)}`;
        else if (wheelbaseQuery) searchParam = `&wheelbase=${encodeURIComponent(wheelbaseQuery)}`;
        else if (axleQuery) searchParam = `&axle=${encodeURIComponent(axleQuery)}`;
      }

      const response = await fetch(`${CONFIG.API_BASE_URL}/weightCerts?page=${nextPage}&size=${pageSize}${searchParam}`, {
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
      
      setWeightCerts(prevData => [...prevData, ...data]);
      setPage(nextPage);
      
    } catch (err) {
      console.error('Load more search results error:', err);
      setError('Failed to load more results');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, searchPerformed, advancedMode, page, simpleSearchQuery, searchQuery, wheelbaseQuery, axleQuery, pageSize]);

  // Initial data fetch
  useEffect(() => {
    fetchWeightCerts();
  }, [fetchWeightCerts]);

  // Auto-search when debounced values change (for improved performance)
  useEffect(() => {
    if (!advancedMode && debouncedSimpleQuery && debouncedSimpleQuery === searchQuery) {
      setSimpleSearchQuery(debouncedSimpleQuery);
      searchWeightCerts(debouncedSimpleQuery, 'general');
    }
  }, [debouncedSimpleQuery, advancedMode, searchWeightCerts, searchQuery]);

  // Refresh function
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchPerformed(false);
    setSearchQuery('');
    setWheelbaseQuery('');
    setAxleQuery('');
    setSimpleSearchQuery('');
    setFilteredCerts([]);
    fetchWeightCerts(1, false);
  }, [fetchWeightCerts]);

  // Load more handler for FlatList
  const loadMoreData = useCallback(() => {
    if (searchPerformed) {
      loadMoreSearchResults();
    } else if (hasMore && !loadingMore) {
      fetchWeightCerts(page + 1, true);
    }
  }, [searchPerformed, loadMoreSearchResults, hasMore, loadingMore, fetchWeightCerts, page]);

  // Toggle between search modes
  const toggleSearchMode = useCallback(() => {
    setAdvancedMode(prev => !prev);
    
    // Reset search state
    setSearchQuery('');
    setWheelbaseQuery('');
    setAxleQuery('');
    setSimpleSearchQuery('');
    
    if (searchPerformed) {
      setSearchPerformed(false);
      setFilteredCerts([]);
      fetchWeightCerts(1, false);
    }
  }, [searchPerformed, fetchWeightCerts]);

  // Input handlers - simplified to just update state
  const handleSimpleSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleModelIdSearch = useCallback((text) => {
    setSearchQuery(text);
  }, []);

  const handleWheelbaseSearch = useCallback((text) => {
    setWheelbaseQuery(text);
  }, []);

  const handleAxleSearch = useCallback((text) => {
    setAxleQuery(text);
  }, []);

  // Search execution functions
  const executeSimpleSearch = useCallback(() => {
    setSimpleSearchQuery(searchQuery);
    searchWeightCerts(searchQuery, 'general');
  }, [searchQuery, searchWeightCerts]);

  const executeModelIdSearch = useCallback(() => {
    searchWeightCerts(searchQuery, 'model_id');
  }, [searchQuery, searchWeightCerts]);

  const executeWheelbaseSearch = useCallback(() => {
    searchWeightCerts(wheelbaseQuery, 'wheelbase');
  }, [wheelbaseQuery, searchWeightCerts]);

  const executeAxleSearch = useCallback(() => {
    searchWeightCerts(axleQuery, 'axle');
  }, [axleQuery, searchWeightCerts]);

  const executeAdvancedSearch = useCallback(() => {
    // Verify at least one field has input
    const hasCondition = searchQuery.trim() || wheelbaseQuery.trim() || axleQuery.trim();
    if (hasCondition) {
      searchWeightCerts('combined', 'combined');
    } else {
      setError('Please enter at least one search condition');
    }
  }, [searchQuery, wheelbaseQuery, axleQuery, searchWeightCerts]);

  const resetAllSearches = useCallback(() => {
    setSearchQuery('');
    setWheelbaseQuery('');
    setAxleQuery('');
    setSimpleSearchQuery('');
    
    if (searchPerformed) {
      setSearchPerformed(false);
      setFilteredCerts([]);
      fetchWeightCerts(1, false); 
    }
  }, [searchPerformed, fetchWeightCerts]);

  // Memoized renderItem function for FlatList
  const renderWeightCert = useCallback(({ item, index }) => {
    return <WeightCertItem item={item} index={index} navigation={navigation} />;
  }, [navigation]);

  // Memoized list footer component
  const renderFooter = useMemo(() => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.loadMoreText}>Loading more certificates...</Text>
      </View>
    );
  }, [loadingMore]);

  // Memoize empty list component to prevent recreating on renders
  const renderEmptyComponent = useMemo(() => {
    if (loading || searching) {
      return searching ? (
        <View style={styles.searchingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      ) : null;
    }
    
    if (error) return null;
    
    return (
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
    );
  }, [loading, searching, error, onRefresh]);

  // Display loading state
  if (loading && !refreshing && !searching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading weight certificates...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
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
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitleLight}>Weight Certificates</Text>
        <TouchableOpacity
          style={styles.headerToggleButton}
          onPress={toggleSearchMode}
        >
          <Text style={styles.headerToggleText}>
            {advancedMode ? 'Simple Search' : 'Advanced Search'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

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
            <Text style={styles.searchLabel}>Wheelbase:</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by wheelbase"
                value={wheelbaseQuery}
                onChangeText={handleWheelbaseSearch}
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                editable={!searching}
              />
              {wheelbaseQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setWheelbaseQuery('')}
                  style={styles.clearButton}
                  disabled={searching}
                >
                  <Ionicons name="close-circle" size={18} color="#94A3B8" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <View style={styles.searchRow}>
            <Text style={styles.searchLabel}>Axle:</Text>
            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search by axle"
                value={axleQuery}
                onChangeText={handleAxleSearch}
                placeholderTextColor="#94A3B8"
                returnKeyType="search"
                editable={!searching}
              />
              {axleQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setAxleQuery('')}
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
        <View style={styles.searchContainerWrapper}>
          <View style={styles.simpleSearchInputContainer}>
            <TouchableOpacity 
              onPress={executeSimpleSearch}
              disabled={searching}
            >
              <Ionicons name="search" size={20} color="#64748B" />
            </TouchableOpacity>
            <TextInput
              style={styles.simpleSearchInput}
              placeholder="Search"
              value={searchQuery}
              onChangeText={handleSimpleSearch}
              placeholderTextColor="#64748B"
              returnKeyType="search"
              editable={!searching}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  if (searchPerformed) {
                    onRefresh();
                  }
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

      {/* Results - with optimized FlatList */}
      <FlatList
        data={filteredCerts.length > 0 ? filteredCerts : weightCerts}
        renderItem={renderWeightCert}
        keyExtractor={(item, index) => `${item?.id || ''}_${index}`}
        contentContainerStyle={styles.listContainer}
        ListFooterComponent={renderFooter}
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        maxToRenderPerBatch={10} // Limit batch rendering for smoother scrolling
        windowSize={10} // Reduce window size for better performance
        initialNumToRender={8} // Reduced initial render count
        removeClippedSubviews={true} // Optimize memory by removing items out of view
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#F43F5E']}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
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
  headerTitleLight: {
    fontSize: SIZES.large,
    fontWeight: 'bold',
    color: COLORS.white,
    flex: 1,
  },
  headerToggleButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  headerToggleText: {
    color: COLORS.white,
    fontSize: SIZES.small,
    fontWeight: '600',
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
  searchContainerWrapper: {
    padding: SPACING.md,
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
  buttonIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: SIZES.small,
    fontWeight: '600',
  },
});

export default WeightCertListing; 