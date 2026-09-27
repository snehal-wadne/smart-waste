import React from 'react';
import CategoryIcon from './CategoryIcon';
import { ArrowRight, Info } from 'lucide-react';

export default function CategoryCard({ category, onRequestPickup }) {
  const { name, description, icon, disposalInstructions, color } = category;

  return (
    <div className="group relative bg-white rounded-2xl border border-eco-border/80 p-6 flex flex-col justify-between hover:shadow-eco-lg hover:border-eco-primary/40 transition-all duration-300">
      {/* Top Banner accent */}
      <div
        className="absolute top-0 left-6 right-6 h-1 rounded-b-md opacity-80"
        style={{ backgroundColor: color || '#16A34A' }}
      />

      <div>
        {/* Header Icon + Badge */}
        <div className="flex items-center justify-between mb-4 pt-1">
          <div
            className="w-13 h-13 p-3 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm"
            style={{
              backgroundColor: `${color}18`,
              color: color || '#16A34A',
            }}
          >
            <CategoryIcon name={icon} className="w-7 h-7" />
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
            style={{
              backgroundColor: `${color}15`,
              color: color || '#16A34A',
            }}
          >
            Segregation Ready
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-eco-dark mb-2 group-hover:text-eco-primary transition-colors">
          {name}
        </h3>

        {/* Description */}
        <p className="text-sm text-eco-charcoal/70 mb-4 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Disposal Guidance Box */}
        <div className="bg-eco-bg rounded-xl p-3.5 border border-eco-border/60 mb-6">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-eco-primary shrink-0 mt-0.5" />
            <div className="text-xs text-eco-charcoal/80 leading-relaxed">
              <span className="font-semibold text-eco-dark block mb-0.5">Disposal Guidance:</span>
              {disposalInstructions}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => onRequestPickup(category)}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border border-eco-primary text-eco-primary hover:bg-eco-primary hover:text-white group-hover:shadow-md"
      >
        <span>Request Pickup</span>
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>
  );
}
