import React, { useState, useEffect } from 'react';
import computeTotalStats from '../../Utilities/ComputeTotalStats';
import MainStatsRow from './MainStatsRow';

function MainStatsDisplay({ selectedParts }) {
  const [totalStats, setTotalStats] = useState({});
  const [activeConfig, setActiveConfig] = useState('default');
  useEffect(() => {
    const computedStats = computeTotalStats(selectedParts);
    setTotalStats(computedStats);
  }, [selectedParts]);

  // Commented out stats are not yet implemented
  const statsConfigurations = {
    default: [
      { name: "AP", value: totalStats.AP },
      { name: "Defensive Performance", value: totalStats.defensive_performance },
      { name: "Attitude Stability", value: totalStats.attitude_stability },
      { name: "Boost Speed", value: totalStats.speed },
      { name: "EN Load", value: totalStats.EN_load },
      { name: "Current Load", value: totalStats.total_load, isBar: true, maxValue: totalStats.load_limit },
      { name: "Current EN Load", value: totalStats.EN_load, isBar: true, maxValue: totalStats.EN_output },
    ],
    alternate: [
      { name: "AP", value: totalStats.AP },
      { name: "Anti-Kinetic Defense", value: totalStats.anti_kinetic_defense },
      { name: "Anti-Energy Defense", value: totalStats.anti_energy_defense },
      { name: "Anti-Explosive Defense", value: totalStats.anti_explosive_defense },
      { name: "Attitude Stability", value: totalStats.attitude_stability},
      { name: "Attitude Recovery", value: totalStats.attitude_recovery},

      { name: "Target Tracking", value: totalStats.target_tracking},

      { name: "Boost Speed", value: totalStats.speed },
      { name: "QB Speed", value: totalStats.qb_speed },
      { name: "QB EN Consumption", value: totalStats.qb_EN_consumption },
      { name: "QB Reload Time", value: totalStats.qb_reload_time, roundTo: 0.01 },

      { name: "EN Capacity", value: totalStats.EN_capacity },
      { name: "EN Supply Efficiency", value: totalStats.EN_supply_efficiency },
      { name: "EN Recharge Delay", value: totalStats.EN_recharge_delay, roundTo: 0.01 },

      { name: "Total Weight", value: totalStats.total_weight },

      { name: "Total Arms Load", value: totalStats.total_arms_load },
      { name: "Arms Load Limit", value: totalStats.arms_load_limit },
      { name: "Total Load", value: totalStats.total_load },
      { name: "Load Limit", value: totalStats.load_limit },
      { name: "Total EN Load", value: totalStats.EN_load },
      { name: "EN Output", value: totalStats.EN_output },

      { name: "Current Load", value: totalStats.total_load, isBar: true, maxValue: totalStats.load_limit },
      { name: "Current Arms Load", value: (totalStats.total_arms_load), isBar: true, maxValue: totalStats.arms_load_limit },
      { name: "Current EN Load", value: totalStats.EN_load, isBar: true, maxValue: totalStats.EN_output },
      /* Temporary display of advanced stats */

      /* Amount of raw damage that can be sustained */
      { name: "Effective AP (vs kinetic)", value: totalStats.effective_AP_kinetic },
      { name: "Effective AP (vs energy)", value: totalStats.effective_AP_energy },
      { name: "Effective AP (vs explosive)", value: totalStats.effective_AP_explosive },
      { name: "Effective AP (average)", value: totalStats.effective_AP_avg },
      /* Time it takes for the generator to recover an energy amount equal to one quick boost.
         The AC can quick boost indefinitely if the interval between boosts is at least equal
         to this value */
      { name: "Infinite QB interval", value: totalStats.infinite_qb_interval, roundTo: 0.01 },
      /* Time for EN recovery to start when the energy is fully depleted */
      { name: "EN Recharge Delay (redline)", value: totalStats.EN_recharge_delay_redline, roundTo: 0.01 },
      /* Time to fully recharge energy when not redlining. This value is theoretical because
         obviously if energy needs to be recovered fully it means the generator is redlining */
      { name: "Full recharge time", value: totalStats.full_recharge_time, roundTo: 0.01 },
      /* Time to fully recover energy when redlining */
      { name: "Full recharge time (redline)", value: totalStats.full_recharge_time_redline, roundTo: 0.01 },
      /* % of weight allocated to units (weapons) */
      { name: "Units weight %", value: totalStats.group_weight_perc[0]},
      /* % of weight allocated to body parts */
      { name: "Body weight %", value: totalStats.group_weight_perc[1]},
      /* % of weight allocated to inner parts */
      { name: "Inner parts weight %", value: totalStats.group_weight_perc[2]},
      /* % of EN load allocated to units (weapons) */
      { name: "Units EN load %", value: totalStats.group_EN_load_perc[0]},
      /* % of EN load allocated to body parts */
      { name: "Body EN load %", value: totalStats.group_EN_load_perc[1]},
      /* % of EN load allocated to inner parts */
      { name: "Inner parts EN load %", value: totalStats.group_EN_load_perc[2]}
    ]
    // other configurations
  };

  const toggleConfiguration = () => {
    setActiveConfig(config => config === 'default' ? 'alternate' : 'default');
  };

  const buttonText = activeConfig === 'default' ? "Switch to detailed view" : "Switch to simple view";

  return (
    <div className="main-stats-display space-y-2">
      <button 
        onClick={toggleConfiguration}
        className="bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-600 transition duration-150 ease-in-out">
        {buttonText}
      </button>

      {/* Render stats based on the active configuration */}
      {statsConfigurations[activeConfig].map((stat, index) => (
        <MainStatsRow 
          key={index}
          name={stat.name}
          value={stat.value}
          isBar={stat.isBar || false}
          maxValue={stat.maxValue}
          roundTo={stat.roundTo}
        />
      ))}
    </div>
  );
}

export default MainStatsDisplay;
