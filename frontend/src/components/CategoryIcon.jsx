import React from 'react';
import {
  Leaf,
  Recycle,
  Package,
  Cpu,
  Sparkles,
  Armchair,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

const iconMap = {
  Leaf,
  Recycle,
  Package,
  Cpu,
  Sparkles,
  Armchair,
  AlertTriangle,
};

export default function CategoryIcon({ name, className = 'w-6 h-6', style = {} }) {
  const IconComponent = iconMap[name] || Trash2;
  return <IconComponent className={className} style={style} />;
}
