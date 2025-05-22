export interface RouletteWheelSection {//forcer le type et verifier que le type est correct
  number: number;
  color: 'red' | 'black' | 'green';
  angle: number;
  backgroundColor: string;
} 