import React, { useEffect,useRef, useState } from 'react';
import {
  View,
  Animated,
  Easing,
  Platform,
  TouchableWithoutFeedback,
  I18nManager,
} from 'react-native';
import { styles,radius } from './styles';
import type { ViewStyle } from 'react-native';
import type { ViewProps } from 'react-native';

type RippleEffectViewPropsType = {
  onLayout: (event: unknown) => void;
  onPressIn: (event: unknown) => void;
  onPressOut: (event: unknown) => void;
  style?: ViewStyle;
  rippleColor: string,
  rippleOpacity: number,
  rippleDuration: number,
  rippleSize: number,
  rippleContainerBorderRadius: number,
  rippleCentered: boolean,
  rippleSequential: boolean,
  rippleFades: boolean,
  disabled: boolean,
  onRippleAnimation: (event: unknown)=> void,
  onPress: (event: unknown)=> void,
  onLongPress: (event: unknown) => void,
  children: ViewProps,
};

const RippleEffect: React.FC<Partial<RippleEffectViewPropsType>> = (props) => {
  const {
    rippleColor,
    rippleOpacity,
    rippleDuration,
    rippleSize,
    rippleContainerBorderRadius,
    rippleCentered,
    rippleSequential,
    rippleFades,
    onRippleAnimation,
    onPress,
    onLongPress,
    children,
    ...restProps
  } = props;

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [ripples, setRipples] = useState([]);
  const uniqueRef = useRef(0);

  const startRipple = (event) => {
    const w2 = 0.5 * width;
    const h2 = 0.5 * height;

    const { locationX, locationY } = rippleCentered
      ? { locationX: w2, locationY: h2 }
      : event.nativeEvent;

    const offsetX = Math.abs(w2 - locationX);
    const offsetY = Math.abs(h2 - locationY);

    const R = rippleSize > 0
      ? 0.5 * rippleSize
      : Math.sqrt(Math.pow(w2 + offsetX, 2) + Math.pow(h2 + offsetY, 2));

    const ripple = {
      unique: uniqueRef.current++,
      progress: new Animated.Value(0),
      locationX,
      locationY,
      R,
    };

    const animation = Animated.timing(ripple.progress, {
      toValue: 1,
      easing: Easing.out(Easing.ease),
      duration: rippleDuration,
      useNativeDriver: true,
    });

    onRippleAnimation(animation, onAnimationEnd);

    setRipples((prevRipples) => [...prevRipples, ripple]);
  };

  const onAnimationEnd = () => {
    setRipples((prevRipples) => prevRipples.slice(1));
  };

  const renderRipple = ({ unique, progress, locationX, locationY, R }) => {
    const rippleStyle = {
      top: locationY - radius,
      [I18nManager.isRTL ? 'right' : 'left']: locationX - radius,
      backgroundColor: rippleColor,
      transform: [{
        scale: progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5 / radius, R / radius],
        }),
      }],
      opacity: rippleFades
        ? progress.interpolate({
          inputRange: [0, 1],
          outputRange: [rippleOpacity, 0],
        })
        : rippleOpacity,
    };

    return (
      <Animated.View style={[styles.ripple, rippleStyle]} key={unique} />
    );
  };

  const onLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    setWidth(width);
    setHeight(height);
  };

  const handlePress = (event) => {
    const { ripples } = props;

    if (!rippleSequential || !ripples.length) {
      if (onPress) {
        requestAnimationFrame(() => onPress(event));
      }

      startRipple(event);
    }
  };

  const handleLongPress = (event) => {
    if (onLongPress) {
      requestAnimationFrame(() => onLongPress(event));
    }

    startRipple(event);
  };

  return (
    <TouchableWithoutFeedback
      onLayout={onLayout}
      onPress={handlePress}
      onLongPress={handleLongPress}
      {...restProps}
    >
      <Animated.View pointerEvents='box-only'>
        {children}
        <View style={[styles.container, { borderRadius: rippleContainerBorderRadius }]}>
          {ripples.map(renderRipple)}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

RippleEffect.defaultProps = {
  rippleColor: 'rgb(0, 0, 0)',
  rippleOpacity: 0.30,
  rippleDuration: 400,
  rippleSize: 0,
  rippleContainerBorderRadius: 0,
  rippleCentered: false,
  rippleSequential: false,
  rippleFades: true,
  disabled: false,
  onRippleAnimation: (animation, callback) => animation.start(callback),
};

export default RippleEffect;





