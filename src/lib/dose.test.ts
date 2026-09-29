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
    it('calculates correctly for ml/L with Hectares', () => {
      // Dose: 2 ml/L, Tank: 16 L, Area: 1 ha, SprayVolume: 200 L/ha
      // Total water: 1 ha * 200 = 200 L
      // Tanks: 200 / 16 = 12.5 -> ceil = 13 tanks
      // Per tank: 2 * 16 = 32 ml
      // Total product: 13 * 32 = 416 ml (0.416 L -> 0.42 L)
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
      assert.equal(result.totalProductSmall, 416);
      assert.equal(result.totalProductSmallUnit, 'ml');
      assert.equal(result.totalProductLarge, 0.416);
      assert.equal(result.totalProductLargeUnit, 'L');
      assert.equal(result.calculationSteps.length, 5);
      assert.ok(result.calculationSteps[0].includes('1 ha'));
    });

    it('calculates correctly for g/L with m² area conversion', () => {
      // Dose: 1.5 g/L, Tank: 16 L, Area: 2500 m² (0.25 ha), SprayVolume: 400 L/ha
      // Total water: 0.25 * 400 = 100 L
      // Tanks: 100 / 16 = 6.25 -> ceil = 7 tanks
      // Per tank: 1.5 * 16 = 24 g
      // Total product: 7 * 24 = 168 g (0.168 kg)
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
      assert.equal(result.totalProductSmall, 168);
      assert.equal(result.totalProductSmallUnit, 'g');
      assert.equal(result.totalProductLarge, 0.168);
      assert.equal(result.totalProductLargeUnit, 'kg');
      assert.ok(result.calculationSteps[0].includes('2.500 m²'));
    });

    it('handles direct per-tank dose units (ml/tangki and g/tangki)', () => {
      // Dose: 40 ml/tangki, Tank: 20 L, Area: 0.5 ha, SprayVolume: 200 L/ha
      // Total water: 0.5 * 200 = 100 L
      // Tanks: 100 / 20 = 5 tanks exactly
      // Per tank: 40 ml
      // Total product: 5 * 40 = 200 ml
      const input: DoseInput = {
        dose: 40,
        doseUnit: 'ml/tangki',
        tankVolume: 20,
        area: 0.5,
        areaUnit: 'ha',
        sprayVolumePerHa: 200,
      };

      const result = calculateDose(input);
      assert.equal(result.isValid, true);
      assert.equal(result.perTank, 40);
      assert.equal(result.totalTanks, 5);
      assert.equal(result.totalProductSmall, 200);
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
