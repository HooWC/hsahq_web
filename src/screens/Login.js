import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  Text,
  Animated,
  TouchableOpacity,
  Alert,
  TextInput,          
  ActivityIndicator,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CONFIG from '../constants/config';

// 如果是 Web 环境，使用 localStorage 替代 AsyncStorage
const storage = Platform.OS === 'web' ? window.localStorage : AsyncStorage;
const { width, height } = Dimensions.get('window');

const LoginBackground = () => (
  <LinearGradient
    colors={['#0F172A', '#334155', '#475569']}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={StyleSheet.absoluteFill}
  />
);

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const navigation = useNavigation();
  const route = useRoute();
  const scrollViewRef = useRef(null);
  
  // 动画值
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(-width)).current;
  
  useEffect(() => {
    // 启动进入动画
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
    
    // 添加闪光效果动画
    Animated.loop(
      Animated.timing(shineAnim, {
        toValue: width,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // 如果是从登出操作过来的，清除输入框内容
    if (route.params?.clearData) {
      setUsername('');
      setPassword('');
      setErrors({});
    }
    
  }, [route.params?.clearData]);

  // 处理用户名变更
  const handleUsernameChange = (text) => {
    setUsername(text);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: null }));
    }
  };

  // 处理密码变更
  const handlePasswordChange = (text) => {
    setPassword(text);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };
  
  // 切换密码可见性
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  // 表单验证
  const validate = (loginUsername, loginPassword) => {
    const newErrors = {};
    
    if (!loginUsername?.trim()) {
      newErrors.username = 'Please enter username';
    }
    
    if (!loginPassword?.trim()) {
      newErrors.password = 'Please enter password';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 登录处理
  const handleLogin = async () => {
    if (!validate(username, password)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${CONFIG.API_URL}${CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          username: username, 
          password: password 
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        if (Platform.OS === 'web') {
          window.localStorage.setItem('userToken', data.token); // 修改这里
        } else {
          await AsyncStorage.setItem('userToken', data.token);
        }
        
        // 登录成功，直接进入主页
        if (Platform.OS === 'web') {
          // Web 版本的导航逻辑
          //window.location.href = '/home'; // 或者使用你的前端路由
          navigation.navigate('Home', { 
            username: data.user.username,
            userId: data.user.id,
            token: data.token
          });
          // 或者存储用户数据到全局状态
        } else {
          navigation.navigate('Home', { 
            username: data.user.username,
            userId: data.user.id,
            token: data.token
          });
        }
      } else {
        // 登录失败，显示错误信息
        const errorMessage = data.message || 'Wrong username or password';
        if (Platform.OS === 'web') {
          window.alert(`Login failed: ${errorMessage}`);
        } else {
          Alert.alert('Login failed', errorMessage);
        }
      }
    } catch (error) {
      const errorMessage = 'Unable to connect to the server';
      if (Platform.OS === 'web') {
        window.alert(`Connection error: ${errorMessage}`);
      } else {
        Alert.alert('Connection error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
        
        <LoginBackground />
        
        {/* 闪光效果 */}
        <Animated.View 
          style={[
            styles.shine,
            {
              transform: [{ translateX: shineAnim }]
            }
          ]}
        />

        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo区域 */}
          <Animated.View 
            style={[
              styles.logoContainer,
              styles.logoContainerSmall,
              {
                opacity: logoAnim,
                transform: [
                  { 
                    translateY: logoAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={[
              styles.logoWrapper,
              styles.logoWrapperSmall
            ]}>
              <Image 
                source={require('../../assets/logo.png')} 
                style={[
                  styles.logo,
                  styles.logoSmall
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={[
              styles.welcomeText,
              styles.welcomeTextSmall
            ]}>HONG SENG</Text>
            <Text style={[
              styles.subtitleText,
              styles.subtitleTextSmall
            ]}>Sign in to your account</Text>
          </Animated.View>

          {/* 表单区域 */}
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formContainer}
          >
            <Animated.View 
              style={[
                styles.formCard,
                {
                  opacity: formAnim,
                  transform: [
                    { 
                      translateY: formAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0]
                      })
                    }
                  ]
                }
              ]}
            >
            {/* Username Input */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <View style={[styles.inputWrapper, errors.username && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    onChangeText={handleUsernameChange}
                    value={username}
                    placeholder="Enter your username"
                    placeholderTextColor="#94A3B8"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect={false}
                    autoCapitalize="none" 
                  />
                </View>
                {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}
              </View>
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#64748B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    onChangeText={handlePasswordChange}
                    value={password}
                    secureTextEntry={secureTextEntry}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect={false}
                    autoCapitalize="none"
                    accessible={true}
                  />
                  <TouchableOpacity onPress={toggleSecureEntry} style={styles.visibilityIcon}>
                    <Ionicons 
                      name={secureTextEntry ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#64748B" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
              </View>
              
              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>LOG IN</Text>
                    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Don't have an account?</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.footerTextContainer}>
                <Text style={styles.footerText}>© {new Date().getFullYear()} Hong Seng Group</Text>
                <Text style={styles.footerVersion}>{CONFIG.VERSION}</Text>
              </View>
              </Animated.View>
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    height:'100vh',
    overflowX: 'hidden', 
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  shine: {
    position: 'absolute',
    width: 50,
    height: height,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ skewX: '-25deg' }],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.1,
    paddingHorizontal: 20,
  },
  logoContainerSmall: {
    marginTop: Platform.OS === 'ios' ? 15 : 5,
    paddingTop: 5,
    paddingBottom: 5,
  },
  logoWrapper: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24,
  },
  logoWrapperSmall: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.1,
    marginBottom: 12,
  },
  logo: {
    width: width * 0.22,
    height: width * 0.22,
  },
  logoSmall: {
    width: width * 0.15,
    height: width * 0.15,
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  welcomeTextSmall: {
    fontSize: 20,
    marginBottom: 4,
  },
  subtitleText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 16,
  },
  subtitleTextSmall: {
    fontSize: 14,
    marginBottom: 5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#1E293B',
    fontWeight: '600',
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    height: 52,
    position: 'relative', 
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#1E293B',
    fontSize: 15,
    paddingVertical: 12,
    paddingRight: 40,
    outlineStyle: 'none',
    backgroundColor: 'transparent',
  },
  visibilityIcon: {
    position: 'absolute',
    right: 12,
    padding: 8,
    zIndex: 1, // 保证在上层
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
  },
  loginButton: {
    height: 56,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8,
    letterSpacing: 1,
  },
  registerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#64748B',
    fontSize: 14,
  },
  registerButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  footerTextContainer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  footerVersion: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 4,
  },
});

export default Login; 