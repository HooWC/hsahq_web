import React from 'react';
import { LinearGradient } from 'react-native-linear-gradient';
import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/Colors';

const WeightCertDetailsHeader = ({ title, children }) => {
  const navigation = useNavigation();

  return (
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
      <Text style={styles.headerTitle}>{title}</Text>
      {children}
    </LinearGradient>
  );
};

const styles = {
  header: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
  },
};

export default WeightCertDetailsHeader; 