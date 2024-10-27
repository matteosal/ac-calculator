function computeTotalStats(parts) {
    let totalAP = 0;
    let totalENLoad = 0;
    let ENOutput = 0;
    let totalENCapacity = 0;
    let totalWeight = 0;
    let legWeight = 0;
    let loadLimit = 0;
    let totalArmsLoad = 0;
    let armsLoadLimit = 0;
    let totalAttitudeStability = 0;
    let totalAntiKineticDefense = 0;
    let totalAntiEnergyDefense = 0;
    let totalAntiExplosiveDefense = 0;
    let firearmSpec = 0;
    let baseSpeed = 0;
    let baseQBReloadTime = 0;
    let baseQBENConsumption = 0;
    let baseQBSpeed = 0;
    let generatorOutputAdj = 0;
    let generatorSupplyAdjustment = 0;
    let boosterEfficiencyAdj = 0;
    let boosterIdealWeight = 0;
    let ENRecharge = 0;
    let supplyRecovery = 0;
    let QBJetDuration = 0;
    let postRecoveryENSupply = 0;
    let weightPerGroup = [0, 0, 0]; // [unit, body, inner]
    let enLoadPerGroup = [0, 0, 0]; // [unit, body, inner]

    // Remove null and undefined values from array
    parts = parts.filter(part => part !== null && part !== undefined);
  
    // If cleaned array is empty, return some default values or reset stats
    if (parts.length === 0) {
      return {
        // Possible default stats, like AP: 0, EN_load: 0, etc.
      };
    }

    parts.forEach(part => {
        if (!part) return; // In case no part is selected and save is pressed

        // Check if unit (weapon)
        if (part.AttackPower) {
          weightPerGroup[0] += part.Weight;
          enLoadPerGroup[0] += part.ENLoad;
        }

        // Check if body part
        if (part.AP > 0) {
          weightPerGroup[1] += part.Weight;
          enLoadPerGroup[1] += part.ENLoad;
          // Checks if leg part
          if (part.LoadLimit > 0) {
           legWeight = part.Weight;
           loadLimit = part.LoadLimit;
          }
          // Check if arm part
          if (part.ArmLoader && part.ArmLoader === true) {
           totalArmsLoad += part.Weight;
          }          
        }

        // Check if inner part
        if (part.AttackPower == undefined && part.AP == undefined) {
          weightPerGroup[2] += part.Weight || 0;
          enLoadPerGroup[2] += part.ENLoad || 0;          
        }

        totalAP += part.AP || 0;
        totalENLoad += part.ENLoad || 0;
        totalENCapacity += part.ENCapacity || 0;
        totalWeight += part.Weight || 0;
        totalAttitudeStability += part.AttitudeStability || 0;
        totalAntiKineticDefense += part.AntiKineticDefense || 0;
        totalAntiEnergyDefense += part.AntiEnergyDefense || 0;
        totalAntiExplosiveDefense += part.AntiExplosiveDefense || 0;
        ENOutput += part.ENOutput || 0;
        armsLoadLimit += part.ArmsLoadLimit || 0;
        firearmSpec += part.FirearmSpecialization || 0;
        baseSpeed += part.Speed || 0;
        baseQBReloadTime += part.QBReloadTime || 0;
        baseQBENConsumption += part.QBENConsumption || 0;
        baseQBSpeed += part.QBSpeed || 0;
        generatorOutputAdj += part.GeneratorOutputAdj || 0;
        generatorSupplyAdjustment += part.GeneratorSupplyAdj || 0;
        boosterEfficiencyAdj += part.BoosterEfficiencyAdj || 0;
        boosterIdealWeight += part.QBReloadIdealWeight || 0;
        ENRecharge += part.ENRecharge || 0;
        supplyRecovery += part.SupplyRecovery || 0;
        QBJetDuration += part.QBJetDuration || 0;
        postRecoveryENSupply += part.PostRecoveryENSupply || 0;
      });
      
      if (generatorOutputAdj > 0) {
        ENOutput = Math.floor(ENOutput * 0.01 * generatorOutputAdj);
      }
      
    let effectiveAPKinetic = totalAP * totalAntiKineticDefense / 1000.;
    let effectiveAPEnergy = totalAP * totalAntiEnergyDefense / 1000.;
    let effectiveAPExplosive = totalAP * totalAntiExplosiveDefense / 1000.;

    let QBENConsumption = baseQBENConsumption * (2 - boosterEfficiencyAdj/100.);
    let ENRechargeDelay = 1000. / ENRecharge * (2 - generatorSupplyAdjustment/100.);
    let ENRechargeDelayRedline = 1000. / supplyRecovery * (2 - generatorSupplyAdjustment/100.);
    let ENSupplyEfficiency = computeENSupplyEfficiency(ENOutput, totalENLoad);

    let fullRechargeTime = timeToRecoverEnergy(
      totalENCapacity,
      ENRechargeDelay,
      ENSupplyEfficiency
    );
    let fullRechargeTimeRedline = timeToRecoverEnergy(
      totalENCapacity - postRecoveryENSupply,
      ENRechargeDelayRedline,
      ENSupplyEfficiency
    );

    return {
      defensive_performance: average(
        totalAntiKineticDefense,
        totalAntiEnergyDefense,
        totalAntiExplosiveDefense
      ),
      /**/
      AP: totalAP,
      anti_kinetic_defense: totalAntiKineticDefense,
      anti_energy_defense: totalAntiEnergyDefense,
      anti_explosive_defense: totalAntiExplosiveDefense,
      attitude_stability: totalAttitudeStability,
      attitude_recovery: computeAttitudeRecovery(totalWeight),
      /**/
      target_tracking: getTargetTracking(firearmSpec),
      /**/
      speed: computeBoostSpeed(totalWeight, baseSpeed),
      qb_speed: computeQuickBoostSpeed(totalWeight, baseQBSpeed),
      qb_EN_consumption: QBENConsumption,
      qb_reload_time: computeQBReloadTime(baseQBReloadTime, boosterIdealWeight, totalWeight),
      /**/
      EN_capacity: totalENCapacity,
      EN_supply_efficiency: ENSupplyEfficiency,
      EN_recharge_delay: ENRechargeDelay,
      /**/
      total_weight: totalWeight,
      /**/
      total_arms_load: totalArmsLoad,
      arms_load_limit: armsLoadLimit,
      total_load: totalWeight - legWeight,
      load_limit: loadLimit,
      EN_load: totalENLoad,
      EN_output: ENOutput,
      /* Advanced Stats */
      effective_AP_kinetic: effectiveAPKinetic,
      effective_AP_energy: effectiveAPEnergy,
      effective_AP_explosive: effectiveAPExplosive,
      effective_AP_avg: average(
        effectiveAPKinetic,
        effectiveAPEnergy,
        effectiveAPExplosive
      ),
      infinite_qb_interval: QBJetDuration + timeToRecoverEnergy(
        QBENConsumption,
        ENRechargeDelay,
        ENSupplyEfficiency
      ),
      EN_recharge_delay_redline: ENRechargeDelayRedline,
      full_recharge_time: fullRechargeTime,
      full_recharge_time_redline: fullRechargeTimeRedline,
      EN_recovery_func: energyRecoveryFunc(
        ENRechargeDelay,
        0,
        ENSupplyEfficiency,
        totalENCapacity
      ),
      EN_recovery_func_redline: energyRecoveryFunc(
        ENRechargeDelayRedline,
        postRecoveryENSupply,
        ENSupplyEfficiency,
        totalENCapacity
      ),
      group_weight_perc: weightPerGroup.map(x => 100. * x / totalWeight),
      group_EN_load_perc: enLoadPerGroup.map(x => 100. * x / totalENLoad)
    }
  }

function getTargetTracking(firearmSpec) {
  if (firearmSpec === 0 || firearmSpec == null) return null;

  const mapping = [
    { firearmSpec: 26,  targetTracking: 41 },
    { firearmSpec: 45,  targetTracking: 72 },
    { firearmSpec: 53,  targetTracking: 80 },
    { firearmSpec: 80,  targetTracking: 86 },
    { firearmSpec: 88,  targetTracking: 87 },
    { firearmSpec: 92,  targetTracking: 88 },
    { firearmSpec: 95,  targetTracking: 89 },
    { firearmSpec: 96,  targetTracking: 89 },
    { firearmSpec: 100, targetTracking: 90 },
    { firearmSpec: 102, targetTracking: 90 },
    { firearmSpec: 103, targetTracking: 90 },
    { firearmSpec: 104, targetTracking: 90 },
    { firearmSpec: 122, targetTracking: 94 },
    { firearmSpec: 123, targetTracking: 94 },
    { firearmSpec: 128, targetTracking: 95 },
    { firearmSpec: 133, targetTracking: 96 },
    { firearmSpec: 136, targetTracking: 97 },
    { firearmSpec: 160, targetTracking: 104 }
  ];

  const matchedValue = mapping.find(item => firearmSpec <= item.firearmSpec);
  return matchedValue ? matchedValue.targetTracking : null;
}
  
function computeBoostSpeed(totalWeight, hiddenBoostValue) {
  let multiplier;

  if (totalWeight <= 40000) {
      multiplier = 1;
  } else if (totalWeight <= 62500) {
      // Linear interpolation between 1 and 0.925
      multiplier = 1 - 0.075 * ((totalWeight - 40000) / 22500);
  } else if (totalWeight <= 75000) {
      // Linear interpolation between 0.925 and 0.85
      multiplier = 0.925 - 0.075 * ((totalWeight - 62500) / 12500);
  } else if (totalWeight <= 80000) {
      // Linear interpolation between 0.85 and 0.775
      multiplier = 0.85 - 0.075 * ((totalWeight - 75000) / 5000);
  } else if (totalWeight <= 120000) {
      // Linear interpolation between 0.775 and 0.65
      multiplier = 0.775 - 0.125 * ((totalWeight - 80000) / 40000);
  } else {
      multiplier = 0.65;
  }

  return hiddenBoostValue * multiplier;
}

function computeQuickBoostSpeed(totalWeight, hiddenBoostValue) {
  let multiplier;

  if (totalWeight <= 40000) {
      multiplier = 1;
  } else if (totalWeight <= 62500) {
      // Linear interpolation between 1 and 0.9
      multiplier = 1.1778 - 0.0444 * totalWeight / 10000;
  } else if (totalWeight <= 75000) {
      // Linear interpolation between 0.9 and 0.85
      multiplier = 1.15 - 0.04 * totalWeight / 10000;
  } else if (totalWeight <= 80000) {
      // Linear interpolation between 0.85 and 0.8
      multiplier = 1.6 - 0.1 * totalWeight / 10000;
  } else if (totalWeight <= 120000) {
      // Linear interpolation between 0.8 and 0.7
      multiplier = 1 - 0.025 * totalWeight / 10000;
  } else {
      multiplier = 0.7;
  }

  return hiddenBoostValue * multiplier;
}

function computeAttitudeRecovery(weight) {
  const baseValue = 100;
  let multiplier = 0;

  if (!weight) {
    multiplier = 0;
  }
  else if (weight <= 40000) {
    multiplier = 1.5;
  } else if (weight <= 60000) {
    // Linear interpolation between 1.5 and 1.2
    multiplier = 1.5 - 0.3 * ((weight - 40000) / 20000);
  } else if (weight <= 80000) {
    // Linear interpolation between 1.2 and 0.9
    multiplier = 1.2 - 0.3 * ((weight - 60000) / 20000);
  } else if (weight <= 110000) {
    // Linear interpolation between 0.9 and 0.6
    multiplier = 0.9 - 0.3 * ((weight - 80000) / 30000);
  } else if (weight <= 140000) {
    // Linear interpolation between 0.6 and 0.57
    multiplier = 0.6 - 0.03 * ((weight - 110000) / 30000);
  } else {
    multiplier = 0.57;
  }

  return baseValue * multiplier;
}

function computeQBReloadTime(baseReloadTime, idealWeight, weight) {
  let weightDiff = (weight - idealWeight) / 10000.;
  let multiplier = 0;
  const [m1, q1, m2, q2, m3, q3, m4, q4] = [0.2, 1, 0.4, 0.9, 0.85, 0.45, 0.25, 2.25];

  if (weightDiff <= 0) {
    multiplier = 1;
  }
  else if (weightDiff <= 0.5) {
    multiplier = m1 * weightDiff + q1;
  } else if (weightDiff <= 1) {
    multiplier = m2 * weightDiff + q2;
  } else if (weightDiff <= 3) {
    multiplier = m3 * weightDiff + q3;
  } else if (weightDiff <= 5) {
    multiplier = m4 * weightDiff + q4;
  } else {
    multiplier = 3.5;
  }

  return multiplier * baseReloadTime;
}

function computeENSupplyEfficiency(enOutput, enLoad) {
  let enDiff = enOutput - enLoad;
  let result = 0;
  const [m1, q1, m2, q2] = [4.1667, 1500., 4.4118, 1058.8235];

  if (enDiff < 0) {
    result = 100;
  }
  else if (enDiff <= 1800) {
    result = m1 * enDiff + q1;
  } else if (enDiff <= 3500) {
    result = m2 * enDiff + q2;
  } else {
    result = 16500;
  }

  return result;
}

function timeToRecoverEnergy(energy, delay, supplyEff) {
  return energy / supplyEff + delay;
}

function energyRecoveryFunc(delay, postRecoveryEn, supplyEff, enCapacity) {
  return time => {
    if (time < delay) {
      return 0;
    } else {
      return Math.min(supplyEff * (time - delay) + postRecoveryEn, enCapacity);
    }
  }
}

const average = (...numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

export default computeTotalStats;