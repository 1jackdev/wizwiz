import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../../context/ThemeContext';
import { createStyles } from './styles';

interface InputModalProps {
  label: string;
  value: string;
  keyboardType?: 'default' | 'numeric';
  onConfirm: (v: string) => void;
  onClose: () => void;
}

export function InputModal({
  label,
  value,
  keyboardType = 'default',
  onConfirm,
  onClose,
}: InputModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [draft, setDraft] = useState(value);
  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <Text style={styles.modalTitle}>{label}</Text>
          <TextInput
            style={styles.modalTextInput}
            value={draft}
            onChangeText={setDraft}
            keyboardType={keyboardType}
            autoFocus
            selectTextOnFocus
          />
          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.modalActionButton, pressed && { opacity: 0.7 }]}
              onPress={onClose}
            >
              <Text style={styles.modalActionCancel}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalActionButton, pressed && { opacity: 0.7 }]}
              onPress={() => {
                onConfirm(draft);
                onClose();
              }}
            >
              <Text style={styles.modalActionConfirm}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function StepperModal({
  value,
  onConfirm,
  onClose,
}: {
  value: string;
  onConfirm: (v: string) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [draft, setDraft] = useState(Number(value) || 1);
  return (
    <Modal visible transparent animationType="fade">
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <Text style={styles.modalTitle}>Level</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={({ pressed }) => [styles.stepperButton, pressed && { opacity: 0.7 }]}
              onPress={() => setDraft((d) => Math.max(1, d - 1))}
            >
              <Text style={styles.stepperButtonText}>−</Text>
            </Pressable>
            <Text style={styles.stepperValue}>{draft}</Text>
            <Pressable
              style={({ pressed }) => [styles.stepperButton, pressed && { opacity: 0.7 }]}
              onPress={() => setDraft((d) => Math.min(20, d + 1))}
            >
              <Text style={styles.stepperButtonText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.modalActions}>
            <Pressable
              style={({ pressed }) => [styles.modalActionButton, pressed && { opacity: 0.7 }]}
              onPress={onClose}
            >
              <Text style={styles.modalActionCancel}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalActionButton, pressed && { opacity: 0.7 }]}
              onPress={() => {
                onConfirm(String(draft));
                onClose();
              }}
            >
              <Text style={styles.modalActionConfirm}>Done</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
