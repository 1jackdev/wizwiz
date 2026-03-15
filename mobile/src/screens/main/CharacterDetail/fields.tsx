import { FlatList, Modal, Pressable, Text } from 'react-native';
import { useState } from 'react';

import { styles } from './styles';

export function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

export function TappableField({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.field, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldInput}>{value}</Text>
    </Pressable>
  );
}

export function NavRow({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.field, styles.navRow, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <Text style={styles.navRowLabel}>{label}</Text>
      <Text style={styles.navRowChevron}>›</Text>
    </Pressable>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Pressable
        style={({ pressed }) => [styles.field, pressed && { opacity: 0.7 }]}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.fieldLabel}>{label}</Text>
        <Text style={styles.fieldInput}>{value}</Text>
      </Pressable>
      <Modal visible={visible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <Text style={styles.modalTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.optionRow,
                    item === value && styles.optionSelected,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    onChange(item);
                    setVisible(false);
                  }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.7 }]}
              onPress={() => setVisible(false)}
            >
              <Text style={styles.cancelText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
