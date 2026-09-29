/**
 * src/lib/dose.ts
 * Core dose and spray volume calculation logic for REQ-11 (DESIGN §2.6.3)
 */

export type DoseUnit = 'ml/L' | 'g/L' | 'ml/tangki' | 'g/tangki';
export type AreaUnit = 'm2' | 'ha';

export interface DoseInput {
  dose: number;
  doseUnit: DoseUnit;
  tankVolume: number; // Volume tangki pengguna (L)
  labelTankVolume?: number; // Volume tangki acuan pada label kemasan (L) jika per tangki. Bawaan 16 L.
  area: number;
  areaUnit: AreaUnit;
  sprayVolumePerHa: number;
}

export interface DoseValidationErrors {
  dose?: string;
  labelTankVolume?: string;
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
  exactProductSmall: number;
  exactProductSmallUnit: 'ml' | 'g';
  exactProductLarge: number;
  exactProductLargeUnit: 'L' | 'kg';
  batchProductSmall: number;
  batchProductSmallUnit: 'ml' | 'g';
  batchProductLarge: number;
  batchProductLargeUnit: 'L' | 'kg';
  partialTankExplanation: string;
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

  if (input.doseUnit === 'ml/tangki' || input.doseUnit === 'g/tangki') {
    if (
      input.labelTankVolume !== undefined &&
      (isNaN(input.labelTankVolume) || input.labelTankVolume < 1 || input.labelTankVolume > 1000)
    ) {
      errors.labelTankVolume = 'Volume tangki pada label harus antara 1 sampai 1.000 Liter.';
    }
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

  const isGram = input.doseUnit ? input.doseUnit.startsWith('g') : false;
  const perTankUnit = isGram ? 'g' : 'ml';
  const largeUnit = isGram ? 'kg' : 'L';

  if (!isValid) {
    return {
      isValid: false,
      errors,
      perTank: 0,
      perTankUnit,
      totalWaterLiters: 0,
      exactTanks: 0,
      totalTanks: 0,
      exactProductSmall: 0,
      exactProductSmallUnit: perTankUnit,
      exactProductLarge: 0,
      exactProductLargeUnit: largeUnit,
      batchProductSmall: 0,
      batchProductSmallUnit: perTankUnit,
      batchProductLarge: 0,
      batchProductLargeUnit: largeUnit,
      partialTankExplanation: '',
      calculationSteps: [],
    };
  }

  const { dose, doseUnit, tankVolume, labelTankVolume, area, areaUnit, sprayVolumePerHa } = input;

  // 1. Calculate concentration per Liter and per-tank dose for user tank
  let concentrationPerLiter = 0;
  let perTank = 0;
  let perTankFormula = '';

  if (doseUnit === 'ml/L' || doseUnit === 'g/L') {
    concentrationPerLiter = dose;
    perTank = dose * tankVolume;
    perTankFormula = `${formatNumber(dose)} ${doseUnit} × ${formatNumber(tankVolume)} L (tangki Anda) = ${formatNumber(perTank)} ${perTankUnit} per tangki`;
  } else {
    // Unit is per tank (ml/tangki or g/tangki)
    const effectiveLabelTank = labelTankVolume && labelTankVolume > 0 ? labelTankVolume : 16;
    concentrationPerLiter = dose / effectiveLabelTank;
    perTank = concentrationPerLiter * tankVolume;
    perTankFormula = `${formatNumber(dose)} ${doseUnit} ÷ ${formatNumber(effectiveLabelTank)} L (tangki label) × ${formatNumber(tankVolume)} L (tangki Anda) = ${formatNumber(perTank)} ${perTankUnit} per tangki`;
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

  // 4. Tank count and partial tank breakdown
  const exactTanks = totalWaterLiters / tankVolume;
  const totalTanks = Math.ceil(exactTanks);
  const fullTanks = Math.floor(exactTanks);
  const remainingLiters = totalWaterLiters - fullTanks * tankVolume;

  let partialTankExplanation = '';
  if (Math.abs(exactTanks - totalTanks) < 0.0001) {
    partialTankExplanation = `Seluruh ${totalTanks} tangki disiapkan dengan air penuh (${formatNumber(tankVolume)} L).`;
  } else if (fullTanks === 0) {
    const partialDose = totalWaterLiters * concentrationPerLiter;
    partialTankExplanation = `Lahan hanya membutuhkan ${formatNumber(totalWaterLiters, 1)} Liter larutan (cukup 1 tangki diisi ${formatNumber(totalWaterLiters, 1)} Liter air + ${formatNumber(partialDose, 1)} ${perTankUnit} produk, tidak perlu membuat 1 tangki penuh).`;
  } else {
    const partialDose = remainingLiters * concentrationPerLiter;
    partialTankExplanation = `Siapkan ${fullTanks} tangki penuh (${formatNumber(tankVolume)} L air + ${formatNumber(perTank)} ${perTankUnit} produk) ditambah 1 tangki terakhir diisi sebagian (${formatNumber(remainingLiters, 1)} L air + ${formatNumber(partialDose, 1)} ${perTankUnit} produk).`;
  }

  const tanksFormula = `${formatNumber(totalWaterLiters, 1)} L ÷ ${formatNumber(tankVolume)} L/tangki = ${formatNumber(exactTanks, 2)} tangki (dibulatkan ke atas: ${totalTanks} tangki semprot)`;

  // 5. Total product calculations: exact vs full batches
  const exactProductSmall = totalWaterLiters * concentrationPerLiter;
  const exactProductLarge = exactProductSmall / 1000;

  const batchProductSmall = totalTanks * perTank;
  const batchProductLarge = batchProductSmall / 1000;

  const exactFormula = `${formatNumber(totalWaterLiters, 1)} L air × ${formatNumber(concentrationPerLiter, 3)} ${perTankUnit}/L = ${formatNumber(exactProductSmall, 1)} ${perTankUnit} (setara ${formatNumber(exactProductLarge, 3)} ${largeUnit})`;
  const batchFormula = `${totalTanks} tangki penuh × ${formatNumber(perTank)} ${perTankUnit} = ${formatNumber(batchProductSmall)} ${perTankUnit} (setara ${formatNumber(batchProductLarge, 2)} ${largeUnit})`;

  const calculationSteps = [
    `Luas lahan: ${areaDisplay}`,
    `Total kebutuhan air semprot: ${waterFormula}`,
    `Jumlah tangki semprot: ${tanksFormula}`,
    `Takaran per tangki: ${perTankFormula}`,
    `Kebutuhan tepat sesuai volume semprot: ${exactFormula}`,
    `Jika menyiapkan tangki penuh: ${batchFormula}`,
    `Rekomendasi pengisian: ${partialTankExplanation}`,
  ];

  return {
    isValid: true,
    errors: {},
    perTank,
    perTankUnit,
    totalWaterLiters,
    exactTanks,
    totalTanks,
    exactProductSmall,
    exactProductSmallUnit: perTankUnit,
    exactProductLarge,
    exactProductLargeUnit: largeUnit,
    batchProductSmall,
    batchProductSmallUnit: perTankUnit,
    batchProductLarge,
    batchProductLargeUnit: largeUnit,
    partialTankExplanation,
    calculationSteps,
  };
}

export function formatNumber(val: number, maxDecimals = 2): string {
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals,
  }).format(val);
}
