import React from 'react';
import styles from './GlassSlider.module.scss';

interface GlassSliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  showValue?: boolean;
}

export const GlassSlider: React.FC<GlassSliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  className,
  showValue = false
}) => {
  return (
    <div className={`${styles.sliderControl} ${className || ''}`}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>{label}</label>
          {showValue && <span className={styles.value}>{value}</span>}
        </div>
      )}
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </div>
  );
};
