import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadow } from '@/theme';
import { format, addDays, setHours, setMinutes, isBefore, startOfDay } from 'date-fns';

interface BookingDateTimePickerProps {
  selectedDate: Date;
  selectedTime: string; // "HH:MM"
  duration: number; // hours
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  onDurationChange: (hours: number) => void;
}

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const h = String(i).padStart(2, '0');
  return [`${h}:00`, `${h}:30`];
}).flat();

export function BookingDateTimePicker({
  selectedDate,
  selectedTime,
  duration,
  onDateChange,
  onTimeChange,
  onDurationChange,
}: BookingDateTimePickerProps) {
  const { colors, isDark } = useTheme();
  const [showTimePicker, setShowTimePicker] = useState(false);
  const today = startOfDay(new Date());

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => addDays(today, i));

  const formatTimeDisplay = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const checkOutTime = () => {
    const [h, m] = selectedTime.split(':').map(Number);
    const endH = (h + duration) % 24;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Date Selector */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={16} color={colors.primary} />
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Date</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {dates.map((date) => {
            const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
            const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => onDateChange(date)}
                style={[
                  styles.dateChip,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.dateDay, { color: isSelected ? '#fff' : colors.textTertiary }]}>
                  {isToday ? 'Today' : format(date, 'EEE')}
                </Text>
                <Text style={[styles.dateNum, { color: isSelected ? '#fff' : colors.text }]}>
                  {format(date, 'd')}
                </Text>
                <Text style={[styles.dateMonth, { color: isSelected ? 'rgba(255,255,255,0.7)' : colors.textTertiary }]}>
                  {format(date, 'MMM')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Time + Duration Row */}
      <View style={styles.timeRow}>
        {/* Check-in Time */}
        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={[styles.timeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <View>
            <Text style={[styles.timeBoxLabel, { color: colors.textTertiary }]}>Check-in</Text>
            <Text style={[styles.timeBoxValue, { color: colors.text }]}>
              {formatTimeDisplay(selectedTime)}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Duration */}
        <View style={[styles.durationBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.timeBoxLabel, { color: colors.textTertiary }]}>Duration</Text>
          <View style={styles.durationControls}>
            <TouchableOpacity
              onPress={() => onDurationChange(Math.max(1, duration - 1))}
              style={[styles.durationBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="remove" size={14} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.durationVal, { color: colors.primary }]}>
              {duration}h
            </Text>
            <TouchableOpacity
              onPress={() => onDurationChange(Math.min(12, duration + 1))}
              style={[styles.durationBtn, { borderColor: colors.border }]}
            >
              <Ionicons name="add" size={14} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Check-out */}
        <View style={[styles.timeBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="log-out-outline" size={16} color={colors.textTertiary} />
          <View>
            <Text style={[styles.timeBoxLabel, { color: colors.textTertiary }]}>Check-out</Text>
            <Text style={[styles.timeBoxValue, { color: colors.text }]}>
              {formatTimeDisplay(checkOutTime())}
            </Text>
          </View>
        </View>
      </View>

      {/* Time Picker Modal */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHandle}>
              <View style={[styles.handle, { backgroundColor: colors.border }]} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Check-in Time</Text>
            <ScrollView style={styles.timeGrid} showsVerticalScrollIndicator={false}>
              <View style={styles.timeGridInner}>
                {TIME_SLOTS.map((time) => {
                  const isSelected = time === selectedTime;
                  return (
                    <TouchableOpacity
                      key={time}
                      onPress={() => { onTimeChange(time); setShowTimePicker(false); }}
                      style={[
                        styles.timeSlot,
                        {
                          backgroundColor: isSelected ? colors.primary : colors.surface,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.timeSlotText, { color: isSelected ? '#fff' : colors.text }]}>
                        {formatTimeDisplay(time)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  section: { gap: Spacing.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },

  dateScroll: { gap: Spacing.sm },
  dateChip: {
    width: 60,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    gap: 2,
  },
  dateDay: { fontSize: FontSize.xs },
  dateNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  dateMonth: { fontSize: FontSize.xs },

  timeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  timeBoxLabel: { fontSize: 9, fontWeight: FontWeight.medium },
  timeBoxValue: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  durationBox: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: 2,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  durationBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationVal: { fontSize: FontSize.md, fontWeight: FontWeight.bold, minWidth: 24, textAlign: 'center' },

  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
    maxHeight: '60%',
  },
  modalHandle: { alignItems: 'center', paddingVertical: Spacing.md },
  handle: { width: 40, height: 4, borderRadius: 2 },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  timeGrid: { flex: 1 },
  timeGridInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
  timeSlot: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 90,
    alignItems: 'center',
  },
  timeSlotText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
});
