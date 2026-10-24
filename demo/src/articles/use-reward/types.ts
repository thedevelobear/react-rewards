import type { AnyControl } from '@/data/effects';

/** One setting of an effect, with its default. */
export interface SettingDefault {
  readonly key: string;
  readonly control: AnyControl;
  readonly defaultValue: unknown;
}

/** One setting, with its default in each effect that has it. */
export interface Setting {
  readonly key: string;
  readonly control: AnyControl;
  /** The default in each effect that has the setting, by the effect's name. */
  readonly defaults: Map<string, unknown>;
}

/** A row of the burst options' table. Code is in backticks. */
export interface BurstOption {
  readonly name: string;
  readonly defaultValue: string;
  readonly description: string;
}
