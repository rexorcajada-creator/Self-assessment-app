import type { ComponentType } from 'react';

/** What each journey screen shows in its normal, empty, loading and error states. */
export interface ScreenDefinition {
  readonly Content: ComponentType;
  readonly empty: {
    readonly title: string;
    readonly body: string;
    readonly action?: { readonly label: string; readonly href: string };
  };
  readonly loading: string;
  readonly error: { readonly title: string; readonly body: string };
}

export type ScreenView = 'normal' | 'empty' | 'loading' | 'error';
