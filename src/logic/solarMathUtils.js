export const SOLAR_CONSTANTS = {
  FUSE_MULTIPLIER: 1.25,
  AC_BREAKER_MULTIPLIER: 1.25,
  COPPER_RESISTIVITY: 0.0175,
};

export function calculateStringParams(panel, numPanels, minTemp = -10, maxTemp = 70, bifacialGain = 0) {
  if (!panel) return { vocCold: 0, vmppHot: 0, isc: 0, power: 0 };
  const deltaTMin = minTemp - 25;
  const deltaTMax = maxTemp - 25;

  const vocCold = panel.Voc * (1 + (panel.tempCoefVoc / 100) * deltaTMin);
  const vmppHot = panel.Vmpp * (1 + (panel.tempCoefVoc / 100) * deltaTMax);

  const effectiveIsc = panel.Isc * (1 + bifacialGain / 100);
  const effectivePmax = panel.Pmax * (1 + bifacialGain / 100);

  return {
    vocCold: vocCold * numPanels,
    vmppHot: vmppHot * numPanels,
    isc: effectiveIsc,
    power: effectivePmax * numPanels
  };
}

export function validateMppt(stringData, stringsPerMppt, inverter) {
  if (!inverter) return { valid: false, errors: [] };
  const errors = [];
  const currentPerMppt = stringData.isc * stringsPerMppt;

  if (stringData.vocCold > inverter.maxInputVoltage) {
    errors.push(`Voc Cold (${stringData.vocCold.toFixed(1)}V) > Inverter Max (${inverter.maxInputVoltage}V). Tip: Reduce panels per string or increase Min Temp.`);
  }
  
  if (currentPerMppt > inverter.maxMpptCurrent) {
    errors.push(`Current per MPPT (${currentPerMppt.toFixed(1)}A) > Inverter Limit (${inverter.maxMpptCurrent}A). Tip: Reduce parallel strings per MPPT.`);
  }

  return { 
    valid: errors.length === 0, 
    errors,
    currentPerMppt
  };
}
