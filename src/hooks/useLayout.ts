import { useEffect, useState } from 'react';
import { AccessibilityInfo, useWindowDimensions } from 'react-native';
import { WIDE_BREAKPOINT } from '../theme/tokens';

// ≥ 1024 px switches to the two-pane exhibit layout (DESIGN-002 §4.6).
export const useIsWide = () => useWindowDimensions().width >= WIDE_BREAKPOINT;

export const useReducedMotion = () => {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => setReduced(false));
        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
        return () => subscription.remove();
    }, []);

    return reduced;
};
