import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateDose, validateDoseInput, type DoseInput } from './dose.ts';

describe('Dose & Spray Volume Calculation Logic (REQ-11, DESIGN §2.6.3)', () => {
  describe('validateDoseInput', () => {
    it('validates correct inputs without errors', () => {
      const errors = validateDoseInput({
        dose: 2,
        tankVolume: 16,
        area: 1,
        sprayVolumePerHa: 200,
      });
      assert.deepEqual(errors, {});
    });

    it('rejects non-positive dose values', () => {
      const errZero = validateDoseInput({ dose: 0, tankVolume: 16, area: 1, sprayVolumePerHa: 200 });
      assert.ok(errZero.dose);

      const errNegative = validateDoseInput({ dose: -5, tankVolume: 16, area: 1, sprayVolumePerHa: 200 });
      assert.ok(errNegative.dose);
    });

    it('rejects tank volume out of realistic range (1 - 1000 L)', () => {
      const errZero = validateDoseInput({ dose: 2, tankVolume: 0, area: 1, sprayVolumePerHa: 200 });
      assert.ok(errZero.tankVolume);

      const errTooLarge = validateDoseInput({ dose: 2, tankVolume: 1500, area: 1, sprayVolumePerHa: 200 });
      assert.ok(errTooLarge.tankVolume);
    });

    it('validates label tank volume bounds when doseUnit is per-tank', () => {
      const errInvalid = validateDoseInput({
        dose: 30,
        doseUnit: 'ml/tangki',
        labelTankVolume: 0,
        tankVolume: 16,
        area: 1,
        sprayVolumePerHa: 200,
      });
      assert.ok(errInvalid.labelTankVolume);

      const errValid = validateDoseInput({
        dose: 30,
        doseUnit: 'ml/tangki',
        labelTankVolume: 16,
        tankVolume: 20,
        area: 1,
        sprayVolumePerHa: 200,
      });
      assert.deepEqual(errValid, {});
    });

    it('rejects non-positive area', () => {
      const errArea = validateDoseInput({ dose: 2, tankVolume: 16, area: 0, sprayVolumePerHa: 200 });
      assert.ok(errArea.area);
    });

    it('rejects spray volume outside recommended bounds (50 - 1000 L/ha)', () => {
      const errLow = validateDoseInput({ dose: 2, tankVolume: 16, area: 1, sprayVolumePerHa: 30 });
      assert.ok(errLow.sprayVolumePerHa);

      const errHigh = validateDoseInput({ dose: 2, tankVolume: 16, area: 1, sprayVolumePerHa: 1200 });
      assert.ok(errHigh.sprayVolumePerHa);
    });
  });

  describe('calculateDose - calculation and unit conversions', () => {
    it('calculates correctly for ml/L with Hectares (separates exact vs batch product amounts)', () => {
      // Dose: 2 ml/L, Tank: 16 L, Area: 1 ha, SprayVolume: 200 L/ha
      // Total water: 1 ha * 200 = 200 L
      // Tanks: 200 / 16 = 12.5 -> ceil = 13 tanks (12 full + 1 half)
      // Per tank: 2 * 16 = 32 ml
      // Exact product: 200 L * 2 ml/L = 400 ml (0.40 L)
      // Batch product: 13 * 32 = 416 ml (0.416 L)
      const input: DoseInput = {
        dose: 2,
        doseUnit: 'ml/L',
        tankVolume: 16,
        area: 1,
        areaUnit: 'ha',
        sprayVolumePerHa: 200,
      };

      const result = calculateDose(input);
      assert.equal(result.isValid, true);
      assert.equal(result.perTank, 32);
      assert.equal(result.perTankUnit, 'ml');
      assert.equal(result.totalWaterLiters, 200);
      assert.equal(result.exactTanks, 12.5);
      assert.equal(result.totalTanks, 13);
      assert.equal(result.exactProductSmall, 400);
      assert.equal(result.exactProductSmallUnit, 'ml');
      assert.equal(result.exactProductLarge, 0.4);
      assert.equal(result.exactProductLargeUnit, 'L');
      assert.equal(result.batchProductSmall, 416);
      assert.equal(result.batchProductSmallUnit, 'ml');
      assert.equal(result.batchProductLarge, 0.416);
      assert.equal(result.batchProductLargeUnit, 'L');
      assert.ok(result.partialTankExplanation.includes('12 tangki penuh'));
      assert.ok(result.partialTankExplanation.includes('8 L air'));
      assert.equal(result.calculationSteps.length, 7);
      assert.ok(result.calculationSteps[0].includes('1 ha'));
    });

    it('calculates correctly for small garden plot (100 m²) without inflated batch figures', () => {
      // Dose: 2 ml/L, Tank: 16 L, Area: 100 m² (0.01 ha), SprayVolume: 300 L/ha
      // Total water: 0.01 ha * 300 = 3 L
      // Exact tanks: 3 / 16 = 0.1875 -> ceil = 1 tank
      // Per tank (full): 32 ml
      // Exact product needed: 3 L * 2 ml/L = 6 ml (0.006 L)
      // Batch product (full 16 L tank): 32 ml
      const input: DoseInput = {
        dose: 2,
        doseUnit: 'ml/L',
        tankVolume: 16,
        area: 100,
        areaUnit: 'm2',
        sprayVolumePerHa: 300,
      };

      const result = calculateDose(input);
      assert.equal(result.isValid, true);
      assert.equal(result.perTank, 32);
      assert.equal(result.totalWaterLiters, 3);
      assert.equal(result.exactProductSmall, 6);
      assert.equal(result.batchProductSmall, 32);
      assert.ok(result.partialTankExplanation.includes('hanya membutuhkan 3 Liter'));
      assert.ok(result.partialTankExplanation.includes('tidak perlu membuat 1 tangki penuh'));
    });

    it('calculates correctly for g/L with m² area conversion', () => {
      // Dose: 1.5 g/L, Tank: 16 L, Area: 2500 m² (0.25 ha), SprayVolume: 400 L/ha
      // Total water: 0.25 * 400 = 100 L
      // Tanks: 100 / 16 = 6.25 -> ceil = 7 tanks
      // Per tank: 1.5 * 16 = 24 g
      // Exact product: 100 L * 1.5 g/L = 150 g (0.15 kg)
      // Batch product: 7 * 24 = 168 g (0.168 kg)
      const input: DoseInput = {
        dose: 1.5,
        doseUnit: 'g/L',
        tankVolume: 16,
        area: 2500,
        areaUnit: 'm2',
        sprayVolumePerHa: 400,
      };

      const result = calculateDose(input);
      assert.equal(result.isValid, true);
      assert.equal(result.perTank, 24);
      assert.equal(result.perTankUnit, 'g');
      assert.equal(result.totalWaterLiters, 100);
      assert.equal(result.exactTanks, 6.25);
      assert.equal(result.totalTanks, 7);
      assert.equal(result.exactProductSmall, 150);
      assert.equal(result.exactProductSmallUnit, 'g');
      assert.equal(result.exactProductLarge, 0.15);
      assert.equal(result.exactProductLargeUnit, 'kg');
      assert.equal(result.batchProductSmall, 168);
      assert.equal(result.batchProductLarge, 0.168);
      assert.ok(result.calculationSteps[0].includes('2.500 m²'));
    });

    it('scales per-tank dose when user tank volume differs from label tank volume (table-driven)', () => {
      // Case A: Label specifies 32 ml/tank (assuming 16 L). User tank is 20 L.
      // Concentration = 32 / 16 = 2.0 ml/L.
      // Scaled per user tank = 2.0 * 20 = 40 ml/tank!
      const inputA: DoseInput = {
        dose: 32,
        doseUnit: 'ml/tangki',
        labelTankVolume: 16,
        tankVolume: 20,
        area: 1,
        areaUnit: 'ha',
        sprayVolumePerHa: 200,
      };

      const resultA = calculateDose(inputA);
      assert.equal(resultA.isValid, true);
      assert.equal(resultA.perTank, 40); // 40 ml per 20 L tank
      assert.equal(resultA.totalWaterLiters, 200);
      assert.equal(resultA.exactTanks, 10);
      assert.equal(resultA.totalTanks, 10);
      assert.equal(resultA.exactProductSmall, 400); // 200 L * 2 ml/L = 400 ml
      assert.equal(resultA.batchProductSmall, 400); // 10 * 40 ml = 400 ml

      // Case B: Label specifies 50 g/tank (assuming 16 L). User tank is 14 L.
      // Concentration = 50 / 16 = 3.125 g/L.
      // Scaled per user tank = 3.125 * 14 = 43.75 g/tank.
      const inputB: DoseInput = {
        dose: 50,
        doseUnit: 'g/tangki',
        labelTankVolume: 16,
        tankVolume: 14,
        area: 0.5,
        areaUnit: 'ha',
        sprayVolumePerHa: 200,
      };

      const resultB = calculateDose(inputB);
      assert.equal(resultB.isValid, true);
      assert.equal(resultB.perTank, 43.75);
      assert.equal(resultB.totalWaterLiters, 100);
      assert.equal(resultB.exactProductSmall, 312.5); // 100 * 3.125 = 312.5 g
    });

    it('returns invalid result structure with errors on invalid input', () => {
      const input: DoseInput = {
        dose: -1,
        doseUnit: 'ml/L',
        tankVolume: 16,
        area: 1,
        areaUnit: 'ha',
        sprayVolumePerHa: 200,
      };

      const result = calculateDose(input);
      assert.equal(result.isValid, false);
      assert.ok(result.errors.dose);
      assert.equal(result.perTank, 0);
      assert.equal(result.totalTanks, 0);
      assert.equal(result.calculationSteps.length, 0);
    });
  });
});
