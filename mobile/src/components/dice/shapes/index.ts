import type { DieType } from '../DiceContext';
import D4 from './D4';
import D6 from './D6';
import D8 from './D8';
import D10 from './D10';
import D12 from './D12';
import D20 from './D20';

export type { DieShapeProps } from './D4';
export { D4, D6, D8, D10, D12, D20 };

type DieComponent = typeof D4;

const DIE_COMPONENTS: Record<DieType, DieComponent> = {
  d4: D4,
  d6: D6,
  d8: D8,
  d10: D10,
  d12: D12,
  d20: D20,
};

export function getDieComponent(type: DieType): DieComponent {
  return DIE_COMPONENTS[type];
}
