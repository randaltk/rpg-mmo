import { CharacterClass } from "@/types/game";

export type WeaponType = 'sword' | 'lance' | 'dagger' | 'bow' | 'katar' | 'staff' | 'mace' | 'fists';
export type ArmorWeight = 'heavy' | 'medium' | 'light' | 'cloth';
export type HeadgearType = 'helmet' | 'hood' | 'wizard_hat' | 'mask' | 'headband' | 'none';
export type CapeStyle = 'short' | 'long' | 'light' | 'none';
export type OffhandType = 'shield' | 'book' | 'none';

export interface ClassColorPalette {
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  pantsColor: string;
  bootColor: string;
  bootTrim: string;
  capeColor: string;
  capeBorder: string;
  armorMetalness: number;
  armorRoughness: number;
}

export interface ClassConfig {
  id: CharacterClass;
  label: string;
  weaponType: WeaponType;
  offhand: OffhandType;
  armorWeight: ArmorWeight;
  headgear: HeadgearType;
  capeStyle: CapeStyle;
  colors: ClassColorPalette;
}
