import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Star } from 'lucide-react-native';
import Txt from './Txt';
import { colors, radius, row } from '../styles/theme';

interface RatingPillProps {
  rating: number;
  count?: number;
}

// Small amber pill: star + rating (+ optional review count).
export default function RatingPill({ rating, count }: RatingPillProps) {
  return (
    <View style={styles.pill}>
      <Star size={13} color={colors.amber} fill={colors.amber} />
      <Txt variant="labelSm" weight="700" color={colors.text} style={styles.text}>
        {rating.toFixed(1)}
      </Txt>
      {count !== undefined ? (
        <Txt variant="labelSm" weight="400" color={colors.muted}>
          {' '}({count})
        </Txt>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    ...row,
    backgroundColor: colors.amberSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: { marginRight: 4 },
});
