import { ReactNode } from 'react';

export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface CardProps {
  children?: ReactNode;
  className?: string;
}

export interface CardHeaderProps {
  children?: ReactNode;
  className?: string;
}

export interface CardTitleProps {
  children?: ReactNode;
  className?: string;
}

export interface CardDescriptionProps {
  children?: ReactNode;
  className?: string;
}

export interface CardContentProps {
  children?: ReactNode;
  className?: string;
}

export interface TabsProps {
  defaultValue?: string;
  children?: ReactNode;
  className?: string;
}

export interface TabsListProps {
  children?: ReactNode;
  className?: string;
}

export interface TabsTriggerProps {
  value: string;
  children?: ReactNode;
  className?: string;
}

export interface TabsContentProps {
  value: string;
  children?: ReactNode;
  className?: string;
}

export interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

export interface VerificationBadgeProps {
  status: 'pending' | 'approved' | 'rejected' | 'none';
  className?: string;
}

export interface Loader2IconProps {
  className?: string;
  size?: number;
} 