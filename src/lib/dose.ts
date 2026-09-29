/**
 * src/lib/dose.ts
 * Core dose and spray volume calculation logic for REQ-11 (DESIGN §2.6.3)
 */

export type DoseUnit = 'ml/L' | 'g/L' | 'ml/tangki' | 'g/tangki';
export type AreaUnit = 'm2' | 'ha';

export interface DoseInput {
  dose: number;
  doseUnit: DoseUnit;
  tankVolume: number;
  area: number;
  areaUnit: AreaUnit;
  sprayVolumePerHa: number;
}

export interface DoseValidationErrors {
  dose?: string;
  tankVolume?: string;
  area?: string;
  sprayVolumePerHa?: string;
}

export interface DoseResult {
  isValid: boolean;
  errors: DoseValidationErrors;
  perTank: number;
  perTankUnit: 'ml' | 'g';
  totalWaterLiters: number;
  exactTanks: number;
  totalTanks: number;
  totalProductSmall: number;
  totalProductSmallUnit: 'ml' | 'g';
  totalProductLarge: number;
  totalProductLargeUnit: 'L' | 'kg';
  calculationSteps: string[];
}

export function validateDoseInput(input: Partial<DoseInput>): DoseValidationErrors {
  const errors: DoseValidationErrors = {};

  if (input.dose === undefined || isNaN(input.dose) || input.dose <= 0) {
    errors.dose = 'Dosis harus berupa angka lebih besar dari 0.';
  }

  if (input.tankVolume === undefined || isNaN(input.tankVolume) || input.tankVolume < 1 || input.tankVolume > 1000) {
    errors.tankVolume = 'Volume tangki harus antara 1 sampai 1.000 Liter.';
  }

  if (input.area === undefined || isNaN(input.area) || input.area <= 0) {
    errors.area = 'Luas lahan harus berupa angka lebih besar dari 0.';
  }

  if (
    input.sprayVolumePerHa === undefined ||
    isNaN(input.sprayVolumePerHa) ||
    input.sprayVolumePerHa < 50 ||
    input.sprayVolumePerHa > 1000
  ) {
    errors.sprayVolumePerHa = 'Volume semprot anjuran harus antara 50 sampai 1.000 L/ha.';
  }

  return errors;
}

export function calculateDose(input: DoseInput): DoseResult {
  const errors = validateDoseInput(input);
  const isValid = Object.keys(errors).length === 0;

  if (!isValid) {
    return {
      isValid: false,
      errors,
      perTank: 0,
      perTankUnit: input.doseUnit?.startsWith('g') ? 'g' : 'ml',
      totalWaterLiters: 0,
      exactTanks: 0,
      totalTanks: 0,
      totalProductSmall: 0,
      totalProductSmallUnit: input.doseUnit?.startsWith('g') ? 'g' : 'ml',
      totalProductLarge: 0,
      totalProductLargeUnit: input.doseUnit?.startsWith('g') ? 'kg' : 'L',
      calculationSteps: [],
    };
  }

  const { dose, doseUnit, tankVolume, area, areaUnit, sprayVolumePerHa } = input;
  const isGram = doseUnit.startsWith('g');
  const perTankUnit = isGram ? 'g' : 'ml';
  const largeUnit = isGram ? 'kg' : 'L';

  // 1. Calculate per-tank concentration
  let perTank = 0;
  let perTankFormula = '';
  if (doseUnit === 'ml/L' || doseUnit === 'g/L') {
    perTank = dose * tankVolume;
    perTankFormula = `${formatNumber(dose)} ${doseUnit} × ${formatNumber(tankVolume)} Liter = ${formatNumber(perTank)} ${perTankUnit} per tangki`;
  } else {
    // Already per tank
    perTank = dose;
    perTankFormula = `${formatNumber(dose)} ${doseUnit} (langsung per tangki)`;
  }

  // 2. Convert area to Hectares
  const areaInHa = areaUnit === 'ha' ? area : area / 10000;
  const areaDisplay =
    areaUnit === 'm2'
      ? `${formatNumber(area)} m² (${formatNumber(areaInHa, 4)} ha)`
      : `${formatNumber(area)} ha`;

  // 3. Total water required (Liters)
  const totalWaterLiters = areaInHa * sprayVolumePerHa;
  const waterFormula = `${areaUnit === 'ha' ? formatNumber(area) : formatNumber(areaInHa, 4)} ha × ${formatNumber(sprayVolumePerHa)} L/ha = ${formatNumber(totalWaterLiters, 1)} Liter larutan semprot`;

  // 4. Tank count (with Math.ceil for full batch preparation)
  const exactTanks = totalWaterLiters / tankVolume;
  const totalTanks = Math.ceil(exactTanks);
  const tanksFormula = `${formatNumber(totalWaterLiters, 1)} L ÷ ${formatNumber(tankVolume)} L/tangki = ${formatNumber(exactTanks, 1)} tangki (dibulatkan ke atas: ${totalTanks} tangki semprot)`;

  // 5. Total product needed based on prepared tanks
  const totalProductSmall = totalTanks * perTank;
  const totalProductLarge = totalProductSmall / 1000;
  const totalFormula = `${totalTanks} tangki × ${formatNumber(perTank)} ${perTankUnit} = ${formatNumber(totalProductSmall)} ${perTankUnit} (setara ${formatNumber(totalProductLarge, 2)} ${largeUnit})`;

  const calculationSteps = [
    `Luas lahan: ${areaDisplay}`,
    `Total kebutuhan air semprot: ${waterFormula}`,
    `Jumlah tangki semprot: ${tanksFormula}`,
    `Takaran per tangki: ${perTankFormula}`,
    `Total kebutuhan produk: ${totalFormula}`,
  ];

  return {
    isValid: true,
    errors: {},
    perTank,
    perTankUnit,
    totalWaterLiters,
    exactTanks,
    totalTanks,
    totalProductSmall,
    totalProductSmallUnit: perTankUnit,
    totalProductLarge,
    totalProductLargeUnit: largeUnit,
    calculationSteps,
  };
}

export function formatNumber(val: number, maxDecimals = 2): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals,
  }).format(val);
}
