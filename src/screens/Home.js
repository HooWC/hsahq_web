import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar,
  SafeAreaView,
  Image,
  Alert,
  Dimensions,
  ScrollView,
  Animated,
  FlatList,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// 卡片项组件
const DashboardCard = ({ title, icon, description, onPress, colors, delay = 0 }) => {
  const animValue = new Animated.Value(0);
  
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 600,
      delay: delay,
      useNativeDriver: true,
    }).start();
  }, []);
  
  return (
    <Animated.View 
      style={[
        styles.cardContainer,
        {
          opacity: animValue,
          transform: [
            { 
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0]
              })
            }
          ]
        }
      ]}
    >
      <TouchableOpacity 
        activeOpacity={0.88}
        onPress={onPress}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardIconContainer}>
            {icon}
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{title}</Text>
            {description && (
              <Text style={styles.cardDescription}>{description}</Text>
            )}
          </View>
          <View style={styles.cardArrow}>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

// 通知卡片组件
const NotificationCard = ({ message, time, isNew }) => (
  <View style={styles.notificationCard}>
    {isNew && <View style={styles.notificationDot} />}
    <View style={styles.notificationContent}>
      <Text style={styles.notificationText}>{message}</Text>
      <Text style={styles.notificationTime}>{time}</Text>
    </View>
  </View>
);

const Home = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { username, userId, token } = route.params || { username: 'User', userId: null, token: null };
  const [isLoading, setIsLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // 示例通知
  const notifications = [
    { id: '1', message: 'New weight certificate available', time: '2 hours ago', isNew: true },
    { id: '2', message: 'System maintenance scheduled', time: 'Yesterday', isNew: false },
  ];
  
  const headerAnim = new Animated.Value(0);
  const welcomeAnim = new Animated.Value(0);
  
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(welcomeAnim, {
      toValue: 1,
      duration: 800,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Redirect to login if no token is available
    if (!token) {
      navigation.replace('Login');
    }
  }, []);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // Web 版本使用浏览器原生 confirm
      const isConfirmed = window.confirm('Are you sure you want to log out?');
      if (isConfirmed) {
        window.localStorage.removeItem('userToken');
        // Web 导航到登录页，假设使用 React Router
        /* window.location.href = '/login'; */ // 或你的前端路由逻辑
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login', params: { clearData: true } }],
        });
      }
    } else {
      // Mobile 版本使用 React Native Alert
      Alert.alert(
        'Confirm',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sure',
            onPress: async () => {
              await (Platform.OS === 'web' 
                ? (window.localStorage.removeItem('userToken'), undefined)
                : AsyncStorage.removeItem('userToken')
              );
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login', params: { clearData: true } }],
              });
            },
          },
        ]
      );
    }
  };

  const handleWeightCert = () => {
    navigation.navigate('WeightCertListing');
  };

  const handlePlan = () => {
    navigation.navigate('PlanListing');
  };
  
  const handleCMH = () => {
    navigation.navigate('CMHListing');
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
     <StatusBar
        barStyle="light-content"
        backgroundColor="#475569"
        translucent={false}
      />
      
      {/* Header */}
      <LinearGradient
        colors={['#475569', '#64748B']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View style={styles.headerTextContainer}>
              <Text style={styles.greeting}>Welcome back,</Text>
              <Text style={styles.username}>{username || 'User'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
      
      {/* 欢迎栏 - 美化版本 */}
      <Animated.View
        style={[
          styles.welcomeContainer,
          {
            opacity: welcomeAnim,
            transform: [
              { 
                translateY: welcomeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0]
                })
              }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.05)', 'rgba(59, 130, 246, 0.01)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.welcomeBar}
        >
          <View>
            <Text style={styles.welcomeText}>Welcome, {username}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
          </View>
          <View style={styles.welcomeIconContainer}>
            <Ionicons name="sunny-outline" size={24} color={COLORS.primary} />
          </View>
        </LinearGradient>
      </Animated.View>
      
      {/* 通知面板 */}
      {showNotifications && (
        <View style={styles.notificationsPanel}>
          <View style={styles.notificationsHeader}>
            <Text style={styles.notificationsTitle}>Notifications</Text>
            <TouchableOpacity 
              onPress={toggleNotifications}
              style={styles.closeButton}
            >
              <Ionicons name="close-circle" size={24} color={COLORS.gray} />
            </TouchableOpacity>
          </View>
          
          {notifications.length > 0 ? (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <NotificationCard
                  message={item.message}
                  time={item.time}
                  isNew={item.isNew}
                />
              )}
            />
          ) : (
            <Text style={styles.noNotificationsText}>No new notifications</Text>
          )}
        </View>
      )}
      
      {/* 主内容区 */}
      <ScrollView 
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
        </View>
        
        <View style={styles.cardsContainer}>
          <DashboardCard
            title="Weight Certificates"
            description="Manage weight certificates"
            icon={<Ionicons name="document-text" size={32} color="#fff" />}
            onPress={handleWeightCert}
            colors={['#F43F5E', '#FB7185']}
            delay={200}
          />

          <DashboardCard
            title="Plans"
            description="View and manage plans"
            icon={<Ionicons name="clipboard" size={32} color="#fff" />}
            onPress={handlePlan}
            colors={['#0F172A', '#334155']}
            delay={400}
          />

          <DashboardCard
            title="Chassis Movement"
            description="Track chassis movement history"
            icon={<Ionicons name="car" size={32} color="#fff" />}
            onPress={handleCMH}
            colors={['#2563EB', '#3B82F6']}
            delay={600}
          />  
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    height: 70,
    ...SHADOWS.medium,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 5,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: SIZES.small,
    color: '#E2E8F0',
    marginBottom: 2,
  },
  username: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  welcomeContainer: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  welcomeBar: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  welcomeText: {
    color: COLORS.darkGray,
    fontSize: SIZES.large,
    fontWeight: 'bold',
  },
  dateText: {
    color: COLORS.gray,
    fontSize: SIZES.small,
    marginTop: 4,
  },
  welcomeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationsPanel: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.medium,
    maxHeight: 250,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  notificationsTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: 4,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    position: 'relative',
  },
  notificationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    position: 'absolute',
    left: 0,
    top: SPACING.sm + 6,
  },
  notificationContent: {
    flex: 1,
    paddingLeft: SPACING.md,
  },
  notificationText: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  notificationTime: {
    fontSize: SIZES.small * 0.9,
    color: COLORS.gray,
    marginTop: 2,
  },
  noNotificationsText: {
    textAlign: 'center',
    padding: SPACING.md,
    color: COLORS.gray,
  },
  contentContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl * 2,
  },
  sectionHeader: {
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    letterSpacing: 0.5,
  },
  cardsContainer: {
    marginBottom: SPACING.xl,
  },
  cardContainer: {
    marginBottom: SPACING.md,
    borderRadius: RADIUS.lg,
    ...SHADOWS.medium,
  },
  cardTouchable: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    padding: SPACING.lg,
    alignItems: 'center',
    height: 100,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    color: COLORS.white,
    fontSize: SIZES.large,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: SIZES.small,
    marginTop: 4,
  },
  cardArrow: {
    padding: SPACING.xs,
  },
});

export default Home; 