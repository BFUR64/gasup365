import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors, palette } from '../../theme/colors';
import { pixel } from '../../theme/pixel';
import { type } from '../../theme/tokens';
import { IconName } from '../../ui/icons';
import { PixelButton } from './PixelButton';
import { PixelIcon } from './PixelIcon';

export interface DialogAction {
    label: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

interface DialogProps {
    visible: boolean;
    title: string;
    body?: string;
    actions: DialogAction[];
    onRequestClose: () => void;
    children?: React.ReactNode;
}

// In-app modal used instead of native alerts, which don't show on web (§9).
export const Dialog: React.FC<DialogProps> = ({ visible, title, body, actions, onRequestClose, children }) => (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
        <View style={styles.scrim}>
            <View accessibilityViewIsModal accessibilityRole="alert" style={[pixel.panel, styles.panel]}>
                <Text accessibilityRole="header" style={[type.displayMd, styles.title]}>
                    {title}
                </Text>
                {body ? <Text style={[type.bodyMd, styles.body]}>{body}</Text> : null}
                {children}
                <View style={styles.actions}>
                    {actions.map((action) => (
                        <PixelButton
                            key={action.label}
                            label={action.label}
                            variant={action.variant ?? 'secondary'}
                            onPress={action.onPress}
                            style={styles.action}
                        />
                    ))}
                </View>
            </View>
        </View>
    </Modal>
);

type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
    tone: ToastTone;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
}

const toastIcon: Record<ToastTone, { bg: string; icon: IconName }> = {
    success: { bg: colors.success, icon: 'check' },
    error: { bg: colors.danger, icon: 'alert' },
    info: { bg: colors.outline, icon: 'info' },
};

// Small panel under the safe area; success and info hide after 3 s.
export const Toast: React.FC<{ toast: ToastMessage | null; top: number; onDismiss: () => void }> = ({ toast, top, onDismiss }) => {
    useEffect(() => {
        if (!toast || toast.tone === 'error') return;
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [toast, onDismiss]);

    if (!toast) return null;
    const look = toastIcon[toast.tone];

    return (
        <View accessibilityRole="alert" accessibilityLiveRegion="polite" style={[pixel.panel, styles.toast, { top }, toast.tone === 'error' && styles.toastError]}>
            <View style={[styles.toastIcon, { backgroundColor: look.bg }]}>
                <PixelIcon name={look.icon} size={16} color={palette.white} />
            </View>
            <Text style={[type.bodyMd, styles.toastText]}>{toast.message}</Text>
            <PixelButton
                label={toast.actionLabel ?? 'Dismiss'}
                variant="ghost"
                size="sm"
                onPress={() => {
                    toast.onAction?.();
                    onDismiss();
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    scrim: { flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: 24 },
    panel: { width: '100%', maxWidth: 420, padding: 20, gap: 12 },
    title: { color: colors.text },
    body: { color: colors.textMuted },
    actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
    action: { flex: 1 },
    toast: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingLeft: 12,
        paddingVertical: 4,
    },
    toastError: { borderColor: colors.danger },
    toastIcon: { width: 28, height: 28, borderWidth: 2, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
    toastText: { flex: 1, color: colors.text, fontFamily: type.caption.fontFamily },
});
