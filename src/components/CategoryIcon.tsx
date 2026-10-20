import React from 'react';
import { CategoryId } from '../catalog/types';
import { colors } from '../theme';
import { Icon } from './ui';

const icons: Record<CategoryId, React.ComponentProps<typeof Icon>['name']> = {
  'hand-dryers': 'hand-left-outline',
  'paper-towel-dispensers': 'layers-outline',
  'soap-dispensers': 'water-outline',
  'sanitary-bins': 'trash-bin-outline',
  'baby-change-stations': 'happy-outline',
  'grab-rails': 'accessibility-outline',
};

// Navigation symbols, deliberately distinct from product photographs.
export function CategoryIcon({ category, size = 30 }: { category: CategoryId; size?: number }) {
  return <Icon name={icons[category]} size={size} color={colors.primary} />;
}
