import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SPACING } from '../constants/theme';

/**
 * 专业的输入框组件，支持浮动标签和密码显示切换
 */
const Input = ({ 
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  placeholder,
  error,
  style = {},
  iconLeft,
  iconRight,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const animatedIsFocused = useRef(new Animated.Value(value ? 1 : 0)).current;

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prevState => !prevState);
  };

  useEffect(() => {
    Animated.timing(animatedIsFocused, {
      toValue: (isFocused || value) ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  // 处理焦点变化
  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const labelStyle = {
    position: 'absolute',
    left: iconLeft ? 36 : 0,
    top: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [18, 0],
    }),
    fontSize: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [SIZES.medium, SIZES.small],
    }),
    color: animatedIsFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [COLORS.text.secondary, COLORS.primary],
    }),
    zIndex: 1,
  };

  return (
    <View style={[styles.container, style]}>
      <Animated.Text style={labelStyle}>
        {label}
      </Animated.Text>
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        {iconLeft && (
          <View style={styles.iconLeft}>
            {iconLeft}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            iconLeft && { paddingLeft: 36 }
          ]}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          placeholder={placeholder}
          placeholderTextColor={COLORS.text.secondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCorrect={false}
          {...props}
        />
        
        {iconRight && (
          <View style={styles.iconRight}>
            {iconRight}
          </View>
        )}
        
        {secureTextEntry && (
          <TouchableOpacity 
            onPress={togglePasswordVisibility}
            style={styles.toggleButton}
          >
            <Ionicons 
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
              size={22} 
              color={COLORS.text.secondary} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    height: 70,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.lightGray,
    paddingTop: 22, // 为浮动标签腾出空间
  },
  inputContainerFocused: {
    borderBottomColor: COLORS.primary,
  },
  inputContainerError: {
    borderBottomColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: SIZES.medium,
    color: COLORS.text.primary,
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  iconLeft: {
    position: 'absolute',
    left: 0,
    top: 22, // 与输入框顶部对齐
  },
  iconRight: {
    marginLeft: SPACING.sm,
  },
  toggleButton: {
    padding: SPACING.xs,
  },
  errorText: {
    color: COLORS.error,
    fontSize: SIZES.small,
    marginTop: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  }
});

export default Input; 