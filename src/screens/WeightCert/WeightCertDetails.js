import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const TabButton = ({ icon, label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, active && styles.tabButtonActive]}
    onPress={onPress}
  >
    <Ionicons
      name={icon}
      size={24}
      color={active ? '#F43F5E' : COLORS.gray}
    />
    <Text
      style={[
        styles.tabLabel,
        { color: active ? '#F43F5E' : COLORS.gray },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const WeightCertDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { cert } = route.params;
  const [activeTab, setActiveTab] = useState('main');

  const renderMainInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Main Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Model Group</Text>
          <Text style={styles.infoValue}>{cert.mgroup_id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make</Text>
          <Text style={styles.infoValue}>
          {cert.make}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID</Text>
          <Text style={styles.infoValue}>{cert.model_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>WheelBase</Text>
          <Text style={styles.infoValue}>{cert.wheelbase || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BDM/BGK(W)</Text>
          <Text style={styles.infoValue}>{cert.bdm_w || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BDM/BGK(E)</Text>
          <Text style={styles.infoValue}>{cert.bdm_e || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Axle</Text>
          <Text style={styles.infoValue}>{cert.axle || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Engine Specifications</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>C.c</Text>
          <Text style={styles.infoValue}>{cert.cc || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Engine Type</Text>
          <Text style={styles.infoValue}>{cert.engine_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Engine Desc</Text>
          <Text style={styles.infoValue}>{cert.engine_if || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Power</Text>
          <Text style={styles.infoValue}>{cert.power || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Torque</Text>
          <Text style={styles.infoValue}>{cert.torque || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Bahan Bakar</Text>
          <Text style={styles.infoValue}>{cert.fueltype || '-'}</Text>
        </View>
      </View>
    </View>
  );

  const renderChassisInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chassis Infomation</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Truck WIdth (Front)</Text>
          <Text style={styles.infoValue}>{cert.tw_front || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Truck Width (Rear)</Text>
          <Text style={styles.infoValue}>{cert.tw_rear || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overall (Length)</Text>
          <Text style={styles.infoValue}>{cert.olength || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overall (Width)</Text>
          <Text style={styles.infoValue}>{cert.owidth || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overall (Height)</Text>
          <Text style={styles.infoValue}>{cert.oheight || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overhang (Front)</Text>
          <Text style={styles.infoValue}>{cert.oh_front || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overhang (Rear)</Text>
          <Text style={styles.infoValue}>{cert.oh_rear || '-'}</Text>
        </View>
      </View>
    </View>
  );

  const renderDetailsInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Width</Text>
          <Text style={styles.infoValue}>{cert.tyre_width}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rim</Text>
          <Text style={styles.infoValue}>
          {cert.tyre_rim}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Ply</Text>
          <Text style={styles.infoValue}>{cert.tyre_ply || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Front</Text>
          <Text style={styles.infoValue}>{cert.tyre_front || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Back</Text>
          <Text style={styles.infoValue}>{cert.tyre_back || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Front</Text>
          <Text style={styles.infoValue}>{cert.wheel_front || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rear</Text>
          <Text style={styles.infoValue}>{cert.wheel_rear || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Option</Text>
          <Text style={styles.infoValue}>{cert.tyre_option || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Misc. Weight Details</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gandar Depan</Text>
          <Text style={styles.infoValue}>{cert.wheelbase ? `${cert.g_front}` : '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Gandar Belakang</Text>
          <Text style={styles.infoValue}>{cert.wheelbase ? `${cert.g_rear}` : '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>GVW/GCW</Text>
          <Text style={styles.infoValue}>{cert.wheelbase ? `${cert.gvw}` : '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BDM/BGK(W)</Text>
          <Text style={styles.infoValue}>{cert.bdm_w || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BDM/BGK(E)</Text>
          <Text style={styles.infoValue}>{cert.bdm_e || '-'}</Text>
        </View>
      </View>
    </View>
  );

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
        <Text style={styles.headerTitle}>{cert.model_id || 'Weight Certificate'}</Text>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton
          icon="document-text-outline"
          label="Main"
          active={activeTab === 'main'}
          onPress={() => setActiveTab('main')}
        />
        <TabButton
          icon="car-outline"
          label="Chassis"
          active={activeTab === 'chassis'}
          onPress={() => setActiveTab('chassis')}
        />
        <TabButton
          icon="information-circle-outline"
          label="Details"
          active={activeTab === 'details'}
          onPress={() => setActiveTab('details')}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'main' && renderMainInfo()}
        {activeTab === 'chassis' && renderChassisInfo()}
        {activeTab === 'details' && renderDetailsInfo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.sm,
    ...SHADOWS.light,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#F43F5E',
  },
  tabLabel: {
    fontSize: SIZES.small,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: SPACING.md,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.light,
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    flex: 1.4,
  },
  infoValue: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '500',
    flex: 2,
  },
});

export default WeightCertDetails; 