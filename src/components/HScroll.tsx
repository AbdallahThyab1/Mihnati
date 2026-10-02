import React, { Children, useRef } from 'react';
import { ScrollView, StyleProp, ViewStyle } from 'react-native';

interface HScrollProps {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}

// A horizontal list that starts on the RIGHT side (Arabic reading order).
// We reverse the children and scroll to the end so the first child is visible first.
export default function HScroll({ children, contentStyle }: HScrollProps) {
  const ref = useRef<ScrollView>(null);
  const items = Children.toArray(children).reverse();

  return (
    <ScrollView
      ref={ref}
      horizontal
      showsHorizontalScrollIndicator={false}
      onContentSizeChange={() => ref.current?.scrollToEnd({ animated: false })}
      contentContainerStyle={[
        { flexGrow: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 16, gap: 8 },
        contentStyle,
      ]}
    >
      {items}
    </ScrollView>
  );
}
