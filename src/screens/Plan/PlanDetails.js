import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS, RADIUS } from '../../constants/theme';

const PlanDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { plan } = route.params;

  const renderDetailRow = (label, value) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || '-'}</Text>
    </View>
  );

  const renderPlanInfo = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Model #</Text>
          <Text style={styles.infoValue}>{plan.model_id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Body Type</Text>
          <Text style={styles.infoValue}>
          {plan.body_type}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>BDM</Text>
          <Text style={styles.infoValue}>{plan.bdm || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>WheelBase</Text>
          <Text style={styles.infoValue}>{plan.wheelbase || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Plan Infomation</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Plan #</Text>
          <Text style={styles.infoValue}>{plan.plan_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cabin Type</Text>
          <Text style={styles.infoValue}>{plan.cabin_type || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Length</Text>
          <Text style={styles.infoValue}>{plan.length || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Model Group</Text>
          <Text style={styles.infoValue}>{plan.model_id || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Make</Text>
          <Text style={styles.infoValue}>{plan.make || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overall (Length)</Text>
          <Text style={styles.infoValue}>{plan.olength || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overall (Width)</Text>
          <Text style={styles.infoValue}>{plan.owidth || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Overall (Height)</Text>
          <Text style={styles.infoValue}>{plan.oheight || '-'}</Text>
        </View>
      </View>
    </View>
  );


  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

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
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{plan.plan_id}</Text>
        <TouchableOpacity
          style={styles.planButton}
          onPress={() => navigation.navigate('PlanDocument', { plan })}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.white} />
          <Text style={styles.planButtonText}>Plan</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {renderPlanInfo()}
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
  planButton: {
    backgroundColor: '#334155',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.light,
  },
  planButtonText: {
    color: COLORS.white,
    fontSize: SIZES.medium,
    fontWeight: '500',
    marginLeft: SPACING.xs,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: COLORS.white,
    margin: SPACING.md,
    borderRadius: RADIUS.md,
    ...SHADOWS.light,
  },
  section: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: SIZES.medium,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: SPACING.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
  },
  detailLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    flex: 1,
  },
  detailValue: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    fontWeight: '500',
    flex: 2,
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
    color: '#1E293B',
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

export default PlanDetails; 