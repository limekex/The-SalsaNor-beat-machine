import React from 'react';
import classNames from 'classnames';
import styles from './GlassButton.module.scss';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'icon';
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  variant = 'primary',
  children,
  leftIcon,
  rightIcon,
  className,
  ...props 
}) => {
  return (
    <button 
      className={classNames(
        styles.btn,
        styles[`btn--${variant}`],
        className
      )}
      {...props}
    >
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
};
