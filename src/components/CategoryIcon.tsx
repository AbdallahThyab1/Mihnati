import React from 'react';
import { Briefcase, Car, Fan, Hammer, Paintbrush, Smartphone, SprayCan, Truck, Wrench, Zap } from 'lucide-react-native';
import { ServiceCategory } from '../data/mock';

interface CategoryIconProps {
  icon: ServiceCategory['icon'];
  size?: number;
  color: string;
}

export default function CategoryIcon({ icon, size = 24, color }: CategoryIconProps) {
  switch (icon) {
    case 'zap':
      return <Zap size={size} color={color} />;
    case 'briefcase':
      return <Briefcase size={size} color={color} />;
    case 'car':
      return <Car size={size} color={color} />;
    case 'smartphone':
      return <Smartphone size={size} color={color} />;
    case 'wrench':
      return <Wrench size={size} color={color} />;
    case 'paint':
      return <Paintbrush size={size} color={color} />;
    case 'fan':
      return <Fan size={size} color={color} />;
    case 'hammer':
      return <Hammer size={size} color={color} />;
    case 'brush':
      return <SprayCan size={size} color={color} />;
    default:
      return <Truck size={size} color={color} />;
  }
}
