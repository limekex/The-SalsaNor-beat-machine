import React from 'react';
import classNames from 'classnames';
import styles from './GlassContainer.module.scss';

interface GlassContainerProps {
  children: React.ReactNode;
  variant?: 'light' | 'medium' | 'dark';
  className?: string;
  hover?: boolean;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ 
  children, 
  variant = 'light',
  className,
  hover = true 
}) => {
  return (
    <div className={classNames(
      styles.glass,
      styles[`glass--${variant}`],
      hover && styles['glass--hover'],
      className
    )}>
      {children}
    </div>
  );
};
