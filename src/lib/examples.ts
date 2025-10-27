// Example Use Cases and Test Scenarios
// This file demonstrates various ways to use the financial simulation system

import demoProfile, { 
  DemoProfile, 
  LifeEvent,
  calculateNetWorth,
  calculateMonthlyCashFlow,
  projectRetirementSavings 
} from './demoProfile';
import { 
  FinancialSimulator, 
  commonScenarios, 
  SimulationConfig,
  ScenarioAdjustment 
} from './simulator';

// ============================================
// USE CASE 1: Basic Financial Health Check
// ============================================

export function runFinancialHealthCheck(profile: DemoProfile) {
  const netWorth = calculateNetWorth(profile);
  const monthlyIncome = profile.employment.currentJob.salary / 12;
  const cashFlow = calculateMonthlyCashFlow(profile);
  const savingsRate = (cashFlow / monthlyIncome) * 100;
  const emergencyFundMonths = profile.finances.assets.emergencyFund / 
    Object.values(profile.finances.expenses).reduce((a, b) => a + b, 0);
  const totalDebt = Object.values(profile.finances.liabilities).reduce((a, b) => a + b, 0);
  const debtToIncome = (totalDebt / (monthlyIncome * 12)) * 100;

  console.log('═══════════════════════════════════');
  console.log('   FINANCIAL HEALTH CHECK REPORT');
  console.log('═══════════════════════════════════');
  console.log(`Name: ${profile.personal.name}`);
  console.log(`Age: ${profile.personal.age}`);
  console.log(`Location: ${profile.personal.location.city}, ${profile.personal.location.state}`);
  console.log('');
  console.log('CURRENT STATUS:');
  console.log(`Net Worth: $${netWorth.toLocaleString()}`);
  console.log(`Monthly Cash Flow: $${cashFlow.toLocaleString()}`);
  console.log(`Savings Rate: ${savingsRate.toFixed(1)}%`);
  console.log(`Emergency Fund: ${emergencyFundMonths.toFixed(1)} months`);
  console.log(`Debt-to-Income: ${debtToIncome.toFixed(0)}%`);
  console.log('');
  console.log('HEALTH SCORES:');
  console.log(`✓ Emergency Fund: ${emergencyFundMonths >= 6 ? '✅ GOOD' : '⚠️  NEEDS WORK'}`);
  console.log(`✓ Savings Rate: ${savingsRate >= 20 ? '✅ EXCELLENT' : savingsRate >= 10 ? '👍 GOOD' : '⚠️  LOW'}`);
  console.log(`✓ Debt Level: ${debtToIncome < 100 ? '✅ HEALTHY' : debtToIncome < 200 ? '👍 MANAGEABLE' : '⚠️  HIGH'}`);
  console.log(`✓ Cash Flow: ${cashFlow > 0 ? '✅ POSITIVE' : '❌ NEGATIVE'}`);
  console.log('═══════════════════════════════════\n');

  return {
    netWorth,
    cashFlow,
    savingsRate,
    emergencyFundMonths,
    debtToIncome,
    scores: {
      emergencyFund: emergencyFundMonths >= 6,
      savingsRate: savingsRate >= 15,
      debtLevel: debtToIncome < 150,
      cashFlow: cashFlow > 0,
    }
  };
}

// ============================================
// USE CASE 2: Compare Multiple Scenarios
// ============================================

export function compareScenarios() {
  console.log('═══════════════════════════════════');
  console.log('   SCENARIO COMPARISON ANALYSIS');
  console.log('═══════════════════════════════════\n');

  const baseConfig: SimulationConfig = {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    annualReturn: 0.08,
    inflationRate: 0.03,
    taxRate: 0.25,
    includeLifeEvents: true,
  };

  // Scenario 1: Baseline (with all life events)
  const baselineSimulator = new FinancialSimulator(demoProfile, baseConfig);
  const baselineResults = baselineSimulator.runSimulation();

  console.log('SCENARIO 1: Baseline (All Planned Events)');
  console.log(`Final Net Worth: $${baselineResults.summary.highestNetWorth.toLocaleString()}`);
  console.log(`Avg Monthly Cash Flow: $${baselineResults.summary.averageMonthlyCashFlow.toLocaleString()}`);
  console.log(`Retirement Readiness: ${baselineResults.summary.retirementReadiness.toFixed(0)}%`);
  console.log('');

  // Scenario 2: Skip home purchase
  const noHomeConfig = { ...baseConfig };
  const noHomeProfile = JSON.parse(JSON.stringify(demoProfile)) as DemoProfile;
  noHomeProfile.lifeEvents = noHomeProfile.lifeEvents.filter(e => e.type !== 'home_purchase' && e.type !== 'home_sale');
  const noHomeSimulator = new FinancialSimulator(noHomeProfile, noHomeConfig);
  const noHomeResults = noHomeSimulator.runSimulation();

  console.log('SCENARIO 2: No Home Purchase (Continue Renting)');
  console.log(`Final Net Worth: $${noHomeResults.summary.highestNetWorth.toLocaleString()}`);
  console.log(`Difference: $${(noHomeResults.summary.highestNetWorth - baselineResults.summary.highestNetWorth).toLocaleString()}`);
  console.log(`Retirement Readiness: ${noHomeResults.summary.retirementReadiness.toFixed(0)}%`);
  console.log('');

  // Scenario 3: Market downturn + job loss
  const crisisConfig = {
    ...baseConfig,
    scenarios: [commonScenarios.marketDownturn, commonScenarios.layoff],
  };
  const crisisSimulator = new FinancialSimulator(demoProfile, crisisConfig);
  const crisisResults = crisisSimulator.runSimulation();

  console.log('SCENARIO 3: Crisis (Market Crash + Layoff)');
  console.log(`Final Net Worth: $${crisisResults.summary.highestNetWorth.toLocaleString()}`);
  console.log(`Impact: $${(crisisResults.summary.highestNetWorth - baselineResults.summary.highestNetWorth).toLocaleString()}`);
  console.log(`Retirement Readiness: ${crisisResults.summary.retirementReadiness.toFixed(0)}%`);
  console.log('');

  // Scenario 4: Aggressive growth (no kids, career focus)
  const aggressiveProfile = JSON.parse(JSON.stringify(demoProfile)) as DemoProfile;
  aggressiveProfile.lifeEvents = aggressiveProfile.lifeEvents.filter(e => e.type !== 'baby');
  const aggressiveConfig = {
    ...baseConfig,
    scenarios: [commonScenarios.promotion, commonScenarios.marketBoom],
  };
  const aggressiveSimulator = new FinancialSimulator(aggressiveProfile, aggressiveConfig);
  const aggressiveResults = aggressiveSimulator.runSimulation();

  console.log('SCENARIO 4: Aggressive Growth (No Kids, Career Focus)');
  console.log(`Final Net Worth: $${aggressiveResults.summary.highestNetWorth.toLocaleString()}`);
  console.log(`Difference: $${(aggressiveResults.summary.highestNetWorth - baselineResults.summary.highestNetWorth).toLocaleString()}`);
  console.log(`Retirement Readiness: ${aggressiveResults.summary.retirementReadiness.toFixed(0)}%`);
  console.log('═══════════════════════════════════\n');

  return {
    baseline: baselineResults,
    noHome: noHomeResults,
    crisis: crisisResults,
    aggressive: aggressiveResults,
  };
}

// ============================================
// USE CASE 3: Stock Option Strategy Analysis
// ============================================

export function analyzeStockOptionStrategies() {
  console.log('═══════════════════════════════════');
  console.log('   STOCK OPTION STRATEGY ANALYSIS');
  console.log('═══════════════════════════════════\n');

  const options = demoProfile.employment.currentJob.stockOptions;
  
  console.log('CURRENT STOCK OPTIONS:');
  console.log(`Granted: ${options.granted.toLocaleString()} shares`);
  console.log(`Vested: ${options.vested.toLocaleString()} shares`);
  console.log(`Unvested: ${options.unvested.toLocaleString()} shares`);
  console.log(`Strike Price: $${options.exercisePrice}`);
  console.log(`Current Market: $${options.currentMarketPrice}`);
  console.log(`Intrinsic Value: $${(options.currentMarketPrice - options.exercisePrice).toFixed(2)}/share`);
  console.log('');

  const currentValue = options.vested * (options.currentMarketPrice - options.exercisePrice);
  console.log(`Current Vested Value: $${currentValue.toLocaleString()}`);
  console.log('');

  // Strategy 1: Exercise and hold all vested
  const exerciseCost = options.vested * options.exercisePrice;
  const marketValue = options.vested * options.currentMarketPrice;
  console.log('STRATEGY 1: Exercise and Hold All Vested');
  console.log(`Exercise Cost: $${exerciseCost.toLocaleString()}`);
  console.log(`Market Value: $${marketValue.toLocaleString()}`);
  console.log(`Net Gain: $${(marketValue - exerciseCost).toLocaleString()}`);
  console.log('Risk: High concentration, price volatility');
  console.log('');

  // Strategy 2: Exercise and sell to cover
  const sharesToCover = Math.ceil(exerciseCost / options.currentMarketPrice);
  const sharesRemaining = options.vested - sharesToCover;
  console.log('STRATEGY 2: Exercise and Sell to Cover');
  console.log(`Shares to Sell: ${sharesToCover.toLocaleString()}`);
  console.log(`Shares Retained: ${sharesRemaining.toLocaleString()}`);
  console.log(`Out-of-Pocket Cost: $0`);
  console.log(`Remaining Value: $${(sharesRemaining * options.currentMarketPrice).toLocaleString()}`);
  console.log('Risk: Moderate, maintains some upside');
  console.log('');

  // Strategy 3: Sell all vested
  console.log('STRATEGY 3: Sell All Vested Immediately');
  console.log(`Proceeds: $${currentValue.toLocaleString()}`);
  console.log(`Taxes (est 40%): $${(currentValue * 0.4).toLocaleString()}`);
  console.log(`Net After Tax: $${(currentValue * 0.6).toLocaleString()}`);
  console.log('Risk: Low, diversification opportunity');
  console.log('');

  // Future value projection
  const fullyVestedValue = options.granted * (options.currentMarketPrice - options.exercisePrice);
  console.log('FUTURE PROJECTIONS:');
  console.log(`If Fully Vested Today: $${fullyVestedValue.toLocaleString()}`);
  console.log(`Time to Full Vesting: ${options.vestingSchedule.vestingPeriod - 15} months`);
  console.log('');

  // Price scenarios
  const priceScenarios = [
    { label: 'Pessimistic (-30%)', price: options.currentMarketPrice * 0.7 },
    { label: 'Moderate (-10%)', price: options.currentMarketPrice * 0.9 },
    { label: 'Current', price: options.currentMarketPrice },
    { label: 'Optimistic (+50%)', price: options.currentMarketPrice * 1.5 },
    { label: 'Bull Case (+100%)', price: options.currentMarketPrice * 2 },
  ];

  console.log('FUTURE VALUE AT DIFFERENT PRICES (Fully Vested):');
  priceScenarios.forEach(scenario => {
    const value = options.granted * (scenario.price - options.exercisePrice);
    console.log(`${scenario.label}: $${value.toLocaleString()} ($${scenario.price.toFixed(2)}/share)`);
  });
  
  console.log('═══════════════════════════════════\n');

  return {
    currentValue,
    exerciseCost,
    fullyVestedValue,
    strategies: {
      exerciseAndHold: marketValue - exerciseCost,
      sellToCover: sharesRemaining * options.currentMarketPrice,
      sellAll: currentValue * 0.6, // after tax
    },
    priceScenarios,
  };
}

// ============================================
// USE CASE 4: Retirement Readiness Check
// ============================================

export function checkRetirementReadiness(profile: DemoProfile) {
  console.log('═══════════════════════════════════');
  console.log('   RETIREMENT READINESS ANALYSIS');
  console.log('═══════════════════════════════════\n');

  const yearsToRetirement = profile.retirement.targetRetirementAge - profile.personal.age;
  const currentSavings = profile.retirement.currentRetirementSavings;
  const goal = profile.retirement.retirementGoal;
  const monthlyNeed = profile.retirement.estimatedRetirementExpenses;
  const socialSecurity = profile.retirement.socialSecurityEstimate;

  console.log('RETIREMENT TIMELINE:');
  console.log(`Current Age: ${profile.personal.age}`);
  console.log(`Target Retirement Age: ${profile.retirement.targetRetirementAge}`);
  console.log(`Years Until Retirement: ${yearsToRetirement}`);
  console.log(`Target Date: ${profile.retirement.targetRetirementDate}`);
  console.log('');

  console.log('CURRENT PROGRESS:');
  console.log(`Current Savings: $${currentSavings.toLocaleString()}`);
  console.log(`Retirement Goal: $${goal.toLocaleString()}`);
  console.log(`Progress: ${((currentSavings / goal) * 100).toFixed(1)}%`);
  console.log(`Gap: $${(goal - currentSavings).toLocaleString()}`);
  console.log('');

  // Calculate required monthly savings to reach goal
  const monthsToRetirement = yearsToRetirement * 12;
  const projectedValue = projectRetirementSavings(profile, 0.07, 0.03);
  const shortfall = goal - projectedValue;
  
  console.log('PROJECTIONS (7% return):');
  console.log(`Projected at Retirement: $${projectedValue.toLocaleString()}`);
  console.log(`Expected Shortfall: $${shortfall.toLocaleString()}`);
  console.log('');

  // Annual contributions needed
  const currentAnnualContributions = profile.retirement.retirementAccounts.reduce(
    (sum, acc) => sum + acc.annualContribution + acc.employerContribution, 0
  );

  console.log('CONTRIBUTION ANALYSIS:');
  console.log(`Current Annual Savings: $${currentAnnualContributions.toLocaleString()}`);
  console.log(`As % of Salary: ${((currentAnnualContributions / profile.employment.currentJob.salary) * 100).toFixed(1)}%`);
  console.log('');

  // Income needs
  console.log('RETIREMENT INCOME NEEDS:');
  console.log(`Monthly Expenses: $${monthlyNeed.toLocaleString()}`);
  console.log(`Annual Expenses: $${(monthlyNeed * 12).toLocaleString()}`);
  console.log(`Social Security: $${socialSecurity.toLocaleString()}/month`);
  console.log(`Gap to Cover: $${(monthlyNeed - socialSecurity).toLocaleString()}/month`);
  console.log('');

  // Withdrawal rate
  const annualNeeded = (monthlyNeed - socialSecurity) * 12;
  const withdrawalRate = (annualNeeded / goal) * 100;
  console.log('WITHDRAWAL STRATEGY:');
  console.log(`Annual Withdrawal Needed: $${annualNeeded.toLocaleString()}`);
  console.log(`Withdrawal Rate: ${withdrawalRate.toFixed(2)}%`);
  console.log(`Status: ${withdrawalRate <= 4 ? '✅ Safe (4% rule)' : '⚠️  May need adjustment'}`);
  console.log('');

  // Recommendations
  console.log('RECOMMENDATIONS:');
  if (shortfall > 0) {
    const additionalMonthly = shortfall / monthsToRetirement / Math.pow(1.07, yearsToRetirement / 2);
    console.log(`⚠️  Increase monthly savings by $${additionalMonthly.toFixed(0)}`);
  } else {
    console.log('✅ On track to meet retirement goals!');
  }
  
  if (withdrawalRate > 4) {
    console.log('⚠️  Consider increasing retirement savings or reducing expected expenses');
  }

  console.log('✓ Maximize employer 401k match');
  console.log('✓ Consider backdoor Roth IRA if eligible');
  console.log('✓ Review asset allocation as retirement approaches');
  console.log('═══════════════════════════════════\n');

  return {
    yearsToRetirement,
    currentProgress: (currentSavings / goal) * 100,
    projectedValue,
    shortfall,
    withdrawalRate,
    onTrack: shortfall <= 0 && withdrawalRate <= 4,
  };
}

// ============================================
// USE CASE 5: Life Event Impact Analysis
// ============================================

export function analyzeLifeEventImpacts() {
  console.log('═══════════════════════════════════');
  console.log('   LIFE EVENT IMPACT ANALYSIS');
  console.log('═══════════════════════════════════\n');

  const simulator = new FinancialSimulator(demoProfile, {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    annualReturn: 0.08,
    inflationRate: 0.03,
    taxRate: 0.25,
    includeLifeEvents: true,
  });

  const results = simulator.runSimulation();

  results.lifeEventImpacts.forEach((impact, index) => {
    console.log(`EVENT ${index + 1}: ${impact.event.name}`);
    console.log(`Date: ${impact.executionDate.toLocaleDateString()}`);
    console.log(`Type: ${impact.event.type}`);
    console.log('');
    
    console.log('IMMEDIATE IMPACT:');
    console.log(`Net Worth Change: $${impact.immediateImpact.netWorthChange.toLocaleString()}`);
    console.log(`Cash Flow Change: $${impact.immediateImpact.cashFlowChange.toLocaleString()}/month`);
    console.log(`Debt Change: $${impact.immediateImpact.debtChange.toLocaleString()}`);
    console.log('');
    
    console.log('LONG-TERM IMPACT:');
    console.log(`5-Year Net Worth Impact: $${impact.longTermImpact.fiveYearNetWorthImpact.toLocaleString()}`);
    console.log(`Retirement Impact: $${impact.longTermImpact.retirementImpact.toLocaleString()}`);
    console.log('');
    
    if (impact.event.details) {
      console.log('EVENT DETAILS:');
      Object.entries(impact.event.details).forEach(([key, value]) => {
        if (typeof value === 'object') {
          console.log(`${key}:`);
          Object.entries(value).forEach(([k, v]) => {
            console.log(`  ${k}: ${typeof v === 'number' ? '$' + v.toLocaleString() : v}`);
          });
        } else {
          console.log(`${key}: ${typeof value === 'number' ? '$' + value.toLocaleString() : value}`);
        }
      });
    }
    
    console.log('───────────────────────────────────\n');
  });

  console.log('CUMULATIVE IMPACT:');
  const totalImmediateImpact = results.lifeEventImpacts.reduce(
    (sum, impact) => sum + impact.immediateImpact.netWorthChange, 0
  );
  const totalCashFlowImpact = results.lifeEventImpacts.reduce(
    (sum, impact) => sum + impact.immediateImpact.cashFlowChange, 0
  );
  
  console.log(`Total Net Worth Impact: $${totalImmediateImpact.toLocaleString()}`);
  console.log(`Total Monthly Cash Flow Impact: $${totalCashFlowImpact.toLocaleString()}`);
  console.log('═══════════════════════════════════\n');

  return results.lifeEventImpacts;
}

// ============================================
// USE CASE 6: What-If Calculator
// ============================================

export function whatIfCalculator(modifications: Partial<DemoProfile>) {
  console.log('═══════════════════════════════════');
  console.log('   WHAT-IF CALCULATOR');
  console.log('═══════════════════════════════════\n');

  const baseProfile = demoProfile;
  const modifiedProfile = { ...baseProfile, ...modifications };

  const baseSimulator = new FinancialSimulator(baseProfile, {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    annualReturn: 0.08,
    inflationRate: 0.03,
    taxRate: 0.25,
    includeLifeEvents: true,
  });

  const modifiedSimulator = new FinancialSimulator(modifiedProfile, {
    startDate: new Date(),
    endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
    annualReturn: 0.08,
    inflationRate: 0.03,
    taxRate: 0.25,
    includeLifeEvents: true,
  });

  const baseResults = baseSimulator.runSimulation();
  const modifiedResults = modifiedSimulator.runSimulation();

  console.log('COMPARISON RESULTS:');
  console.log('');
  console.log('                        BASE         MODIFIED      DIFFERENCE');
  console.log('─────────────────────────────────────────────────────────────');
  
  const metrics = [
    {
      label: 'Final Net Worth',
      base: baseResults.summary.highestNetWorth,
      modified: modifiedResults.summary.highestNetWorth,
    },
    {
      label: 'Avg Cash Flow',
      base: baseResults.summary.averageMonthlyCashFlow,
      modified: modifiedResults.summary.averageMonthlyCashFlow,
    },
    {
      label: 'Total Savings',
      base: baseResults.summary.totalSavings,
      modified: modifiedResults.summary.totalSavings,
    },
    {
      label: 'Retirement %',
      base: baseResults.summary.retirementReadiness,
      modified: modifiedResults.summary.retirementReadiness,
    },
  ];

  metrics.forEach(metric => {
    const diff = metric.modified - metric.base;
    const diffStr = diff >= 0 ? `+${diff.toLocaleString()}` : diff.toLocaleString();
    console.log(
      `${metric.label.padEnd(20)} ${metric.base.toLocaleString().padStart(12)} ${metric.modified.toLocaleString().padStart(12)} ${diffStr.padStart(15)}`
    );
  });

  console.log('═══════════════════════════════════\n');

  return {
    base: baseResults,
    modified: modifiedResults,
    improvements: {
      netWorth: modifiedResults.summary.highestNetWorth - baseResults.summary.highestNetWorth,
      cashFlow: modifiedResults.summary.averageMonthlyCashFlow - baseResults.summary.averageMonthlyCashFlow,
      retirementReadiness: modifiedResults.summary.retirementReadiness - baseResults.summary.retirementReadiness,
    },
  };
}

// ============================================
// RUN ALL EXAMPLES
// ============================================

export function runAllExamples() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   FINANCIAL SIMULATION - COMPREHENSIVE DEMO SUITE   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
  console.log('\n');

  // 1. Health Check
  runFinancialHealthCheck(demoProfile);
  
  // 2. Scenarios
  compareScenarios();
  
  // 3. Stock Options
  analyzeStockOptionStrategies();
  
  // 4. Retirement
  checkRetirementReadiness(demoProfile);
  
  // 5. Life Events
  analyzeLifeEventImpacts();
  
  console.log('✅ All examples completed!\n');
}

// Export for use in other files
export default {
  runFinancialHealthCheck,
  compareScenarios,
  analyzeStockOptionStrategies,
  checkRetirementReadiness,
  analyzeLifeEventImpacts,
  whatIfCalculator,
  runAllExamples,
};
