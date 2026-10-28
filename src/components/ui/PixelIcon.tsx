import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { IconName, icons } from '../../ui/icons';
import { PixelArt } from '../../ui/pixelArt';

interface PixelIconProps {
    name: IconName;
    size?: number;
    color?: string;
    style?: StyleProp<ViewStyle>;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, size = 24, color = colors.outline, style }) => (
    <Svg width={size} height={size} viewBox="0 0 12 12" style={style}>
        <Path d={icons[name]} fill={color} fillRule="evenodd" />
    </Svg>
);

interface SpriteProps {
    art: PixelArt;
    width: number;
    height: number;
    style?: StyleProp<ViewStyle>;
}

export const Sprite: React.FC<SpriteProps> = ({ art, width, height, style }) => (
    <Svg width={width} height={height} viewBox={`0 0 ${art.width} ${art.height}`} style={style}>
        {art.layers.map(([fill, d], index) => (
            <Path key={index} d={d} fill={fill} />
        ))}
    </Svg>
);
