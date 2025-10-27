// Financial Simulation Engine
// Runs multi-year projections with life events and scenario analysis

import { DemoProfile, LifeEvent, calculateNetWorth, calculateMonthlyCashFlow } from './demoProfile';

export interface SimulationConfig {
  startDate: Date;
  endDate: Date;
  annualReturn: number; // expected annual return on investments
  inflationRate: number;
  taxRate: number;
  includeLifeEvents: boolean;
  scenarios?: ScenarioAdjustment[];
}

export interface ScenarioAdjustment {
  name: string;
  type: 'salary_change' | 'market_change' | 'expense_change' | 'career_change' | 'custom';
  startDate: Date;
  endDate?: Date;
  value: number; // percentage or absolute value
  description: string;
}

export interface SimulationResult {
  monthlySnapshots: MonthlySnapshot[];
  summary: SimulationSummary;
  lifeEventImpacts: LifeEventImpact[];
  milestones: Milestone[];
  warnings: Warning[];
}

export interface MonthlySnapshot {
  date: Date;
  age: number;
  netWorth: number;
  liquidAssets: number;
  retirementSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  savingsRate: number;
  debtToIncomeRatio: number;
  investmentPortfolio: number;
  realEstateEquity: number;
  stockOptionsValue: number;
}

export interface SimulationSummary {
  totalNetWorthGrowth: number;
  averageMonthlyCashFlow: number;
  totalSavings: number;
  retirementReadiness: number; // percentage of goal
  highestNetWorth: number;
  lowestNetWorth: number;
  totalTaxesPaid: number;
  totalInterestPaid: number;
  totalInvestmentReturns: number;
}

export interface LifeEventImpact {
  event: LifeEvent;
  executionDate: Date;
  immediateImpact: {
    netWorthChange: number;
    cashFlowChange: number;
    debtChange: number;
  };
  longTermImpact: {
    fiveYearNetWorthImpact: number;
    retirementImpact: number;
  };
}

export interface Milestone {
  name: string;
  date: Date;
  value: number;
  description: string;
  achieved: boolean;
}

export interface Warning {
  type: 'debt' | 'savings' | 'cashflow' | 'retirement' | 'risk';
  severity: 'low' | 'medium' | 'high';
  message: string;
  date: Date;
  recommendation: string;
}

export class FinancialSimulator {
  private profile: DemoProfile;
  private config: SimulationConfig;

  constructor(profile: DemoProfile, config: SimulationConfig) {
    this.profile = JSON.parse(JSON.stringify(profile)); // Deep clone
    this.config = config;
  }

  public runSimulation(): SimulationResult {
    const monthlySnapshots: MonthlySnapshot[] = [];
    const lifeEventImpacts: LifeEventImpact[] = [];
    const milestones: Milestone[] = [];
    const warnings: Warning[] = [];

    let currentProfile = JSON.parse(JSON.stringify(this.profile)) as DemoProfile;
    let currentDate = new Date(this.config.startDate);
    const endDate = new Date(this.config.endDate);

    // Sort life events by date
    const sortedEvents = [...currentProfile.lifeEvents].sort(
      (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
    );

    let eventIndex = 0;

    while (currentDate <= endDate) {
      // Check for life events this month
      if (this.config.includeLifeEvents) {
        while (
          eventIndex < sortedEvents.length &&
          new Date(sortedEvents[eventIndex].targetDate) <= currentDate
        ) {
          const event = sortedEvents[eventIndex];
          const beforeNetWorth = calculateNetWorth(currentProfile);
          const beforeCashFlow = calculateMonthlyCashFlow(currentProfile);

          currentProfile = this.applyLifeEvent(currentProfile, event, currentDate);

          const afterNetWorth = calculateNetWorth(currentProfile);
          const afterCashFlow = calculateMonthlyCashFlow(currentProfile);

          lifeEventImpacts.push({
            event,
            executionDate: new Date(currentDate),
            immediateImpact: {
              netWorthChange: afterNetWorth - beforeNetWorth,
              cashFlowChange: afterCashFlow - beforeCashFlow,
              debtChange: event.financialImpact.liabilities,
            },
            longTermImpact: this.calculateLongTermImpact(event, currentProfile),
          });

          eventIndex++;
        }
      }

      // Apply monthly growth and changes
      currentProfile = this.applyMonthlyChanges(currentProfile, currentDate);

      // Apply scenario adjustments
      if (this.config.scenarios) {
        currentProfile = this.applyScenarioAdjustments(currentProfile, currentDate);
      }

      // Take snapshot
      const snapshot = this.createSnapshot(currentProfile, currentDate);
      monthlySnapshots.push(snapshot);

      // Check for milestones
      this.checkMilestones(snapshot, milestones);

      // Check for warnings
      this.checkWarnings(snapshot, warnings);

      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const summary = this.calculateSummary(monthlySnapshots, lifeEventImpacts);

    return {
      monthlySnapshots,
      summary,
      lifeEventImpacts,
      milestones,
      warnings,
    };
  }

  private applyLifeEvent(
    profile: DemoProfile,
    event: LifeEvent,
    currentDate: Date
  ): DemoProfile {
    const updated = JSON.parse(JSON.stringify(profile)) as DemoProfile;

    // Apply one-time financial impact
    updated.finances.assets.checkingAccount += event.financialImpact.oneTime;

    // Apply income changes
    if (event.type === 'job_change') {
      updated.employment.currentJob.salary += event.financialImpact.monthlyIncome * 12;
      
      if (event.details.signingBonus) {
        updated.finances.assets.checkingAccount += event.details.signingBonus;
      }
      
      if (event.details.stockOptions) {
        updated.employment.currentJob.stockOptions = event.details.stockOptions;
      }
    }

    // Apply expense changes
    if (event.type === 'baby') {
      updated.finances.expenses.childcare += event.details.estimatedChildcareCost || 0;
      updated.finances.expenses.healthcare += 100;
      updated.finances.expenses.food += 200;
      updated.finances.expenses.other += 300;
      updated.personal.dependents += 1;
    }

    // Apply real estate changes
    if (event.type === 'home_purchase') {
      updated.finances.assets.checkingAccount -= event.details.downPayment + event.details.closingCosts;
      updated.finances.assets.realEstate += event.details.purchasePrice;
      updated.finances.liabilities.mortgage += event.details.mortgage.amount;
      updated.finances.expenses.housing = event.details.mortgage.monthlyPayment;
      
      updated.realEstate.primaryResidence = {
        address: event.details.location,
        purchaseDate: currentDate.toISOString(),
        purchasePrice: event.details.purchasePrice,
        currentValue: event.details.purchasePrice,
        mortgageBalance: event.details.mortgage.amount,
        monthlyPayment: event.details.mortgage.monthlyPayment,
        interestRate: event.details.mortgage.interestRate,
        propertyTax: event.details.propertyTax,
        insurance: event.details.insurance,
        hoa: 0,
      };
    }

    if (event.type === 'home_sale') {
      updated.finances.assets.checkingAccount += event.details.netProceeds;
      updated.finances.assets.realEstate -= updated.realEstate.primaryResidence!.currentValue;
      updated.finances.liabilities.mortgage -= updated.realEstate.primaryResidence!.mortgageBalance;
      
      // If buying new home immediately
      if (event.details.newHome) {
        updated.finances.assets.checkingAccount -= event.details.newHome.downPayment;
        updated.finances.assets.realEstate += event.details.newHome.purchasePrice;
        updated.finances.liabilities.mortgage += event.details.newHome.mortgage;
        updated.finances.expenses.housing = event.details.newHome.monthlyPayment;
      }
    }

    return updated;
  }

  private applyMonthlyChanges(profile: DemoProfile, currentDate: Date): DemoProfile {
    const updated = JSON.parse(JSON.stringify(profile)) as DemoProfile;
    const monthlyReturn = Math.pow(1 + this.config.annualReturn, 1 / 12) - 1;
    const monthlyInflation = Math.pow(1 + this.config.inflationRate, 1 / 12) - 1;

    // Calculate monthly income
    const monthlySalary = profile.employment.currentJob.salary / 12;
    const monthlyBonus = profile.employment.currentJob.bonus / 12;
    const monthlyInvestmentIncome = profile.finances.income.investments / 12;

    // Calculate monthly expenses
    const totalMonthlyExpenses = Object.values(profile.finances.expenses).reduce(
      (sum, val) => sum + val,
      0
    );

    // Cash flow
    const monthlyCashFlow = monthlySalary + monthlyBonus + monthlyInvestmentIncome - totalMonthlyExpenses;

    // Apply investment returns
    updated.finances.assets.brokerage *= 1 + monthlyReturn;
    updated.finances.assets.retirement401k *= 1 + monthlyReturn;
    updated.finances.assets.rothIRA *= 1 + monthlyReturn;

    // 401k contributions
    const monthly401kContribution = (profile.employment.currentJob.salary * 0.1) / 12;
    const employerMatch = Math.min(
      monthly401kContribution * (profile.employment.currentJob.benefits.retirement401k.employerMatch / 100),
      (profile.employment.currentJob.salary * profile.employment.currentJob.benefits.retirement401k.employerMatchLimit) / 100 / 12
    );
    
    updated.finances.assets.retirement401k += monthly401kContribution + employerMatch;
    updated.finances.assets.checkingAccount -= monthly401kContribution;

    // Roth IRA contribution
    const monthlyRothContribution = 7000 / 12;
    updated.finances.assets.rothIRA += monthlyRothContribution;
    updated.finances.assets.checkingAccount -= monthlyRothContribution;

    // Add remaining cash flow to savings/checking
    if (monthlyCashFlow > monthly401kContribution + monthlyRothContribution) {
      const remainingCashFlow = monthlyCashFlow - monthly401kContribution - monthlyRothContribution;
      
      if (updated.finances.assets.emergencyFund < monthlySalary * 6) {
        // Build emergency fund first
        const emergencyFundGap = monthlySalary * 6 - updated.finances.assets.emergencyFund;
        const toEmergencyFund = Math.min(remainingCashFlow * 0.3, emergencyFundGap);
        updated.finances.assets.emergencyFund += toEmergencyFund;
        updated.finances.assets.brokerage += remainingCashFlow - toEmergencyFund;
      } else {
        // Split between taxable investments and savings
        updated.finances.assets.brokerage += remainingCashFlow * 0.7;
        updated.finances.assets.savingsAccount += remainingCashFlow * 0.3;
      }
    }

    // Mortgage payment (if applicable)
    if (updated.realEstate.primaryResidence) {
      const monthlyInterest = (updated.realEstate.primaryResidence.mortgageBalance * updated.realEstate.primaryResidence.interestRate) / 100 / 12;
      const principal = updated.realEstate.primaryResidence.monthlyPayment - monthlyInterest;
      updated.realEstate.primaryResidence.mortgageBalance -= principal;
      updated.finances.liabilities.mortgage -= principal;
      
      // Home appreciation (3% annual)
      const monthlyAppreciation = Math.pow(1.03, 1 / 12) - 1;
      updated.realEstate.primaryResidence.currentValue *= 1 + monthlyAppreciation;
      updated.finances.assets.realEstate = updated.realEstate.primaryResidence.currentValue - updated.realEstate.primaryResidence.mortgageBalance;
    }

    // Stock option vesting
    const vestingSchedule = updated.employment.currentJob.stockOptions.vestingSchedule;
    const monthsSinceGrant = this.monthsDifference(
      new Date(updated.employment.currentJob.startDate),
      currentDate
    );

    if (monthsSinceGrant >= vestingSchedule.cliff) {
      const totalVestingMonths = vestingSchedule.vestingPeriod;
      const vestedPercentage = Math.min(monthsSinceGrant / totalVestingMonths, 1);
      const totalVested = Math.floor(updated.employment.currentJob.stockOptions.granted * vestedPercentage);
      
      updated.employment.currentJob.stockOptions.vested = totalVested;
      updated.employment.currentJob.stockOptions.unvested = updated.employment.currentJob.stockOptions.granted - totalVested;
      
      const stockValue = totalVested * (updated.employment.currentJob.stockOptions.currentMarketPrice - updated.employment.currentJob.stockOptions.exercisePrice);
      updated.finances.assets.stockOptions = Math.max(0, stockValue);
    }

    // Apply inflation to expenses
    Object.keys(updated.finances.expenses).forEach((key) => {
      updated.finances.expenses[key as keyof typeof updated.finances.expenses] *= 1 + monthlyInflation;
    });

    // Student loan payment
    if (updated.finances.liabilities.studentLoans > 0) {
      const monthlyPayment = 200;
      updated.finances.liabilities.studentLoans = Math.max(0, updated.finances.liabilities.studentLoans - monthlyPayment);
      updated.finances.assets.checkingAccount -= monthlyPayment;
    }

    // Credit card payment (pay off fully each month)
    if (updated.finances.liabilities.creditCards > 0) {
      updated.finances.assets.checkingAccount -= updated.finances.liabilities.creditCards;
      updated.finances.liabilities.creditCards = 0;
    }

    return updated;
  }

  private applyScenarioAdjustments(profile: DemoProfile, currentDate: Date): DemoProfile {
    if (!this.config.scenarios) return profile;

    const updated = JSON.parse(JSON.stringify(profile)) as DemoProfile;

    for (const scenario of this.config.scenarios) {
      if (currentDate >= scenario.startDate && (!scenario.endDate || currentDate <= scenario.endDate)) {
        switch (scenario.type) {
          case 'salary_change':
            updated.employment.currentJob.salary *= 1 + scenario.value / 100;
            break;
          case 'market_change':
            const marketMultiplier = 1 + scenario.value / 100;
            updated.finances.assets.brokerage *= marketMultiplier;
            updated.finances.assets.retirement401k *= marketMultiplier;
            break;
          case 'expense_change':
            Object.keys(updated.finances.expenses).forEach((key) => {
              updated.finances.expenses[key as keyof typeof updated.finances.expenses] *= 1 + scenario.value / 100;
            });
            break;
        }
      }
    }

    return updated;
  }

  private createSnapshot(profile: DemoProfile, date: Date): MonthlySnapshot {
    const netWorth = calculateNetWorth(profile);
    const monthlyCashFlow = calculateMonthlyCashFlow(profile);
    const monthlyIncome = monthlyCashFlow + Object.values(profile.finances.expenses).reduce((sum, val) => sum + val, 0);
    const monthlyExpenses = Object.values(profile.finances.expenses).reduce((sum, val) => sum + val, 0);

    const liquidAssets =
      profile.finances.assets.checkingAccount +
      profile.finances.assets.savingsAccount +
      profile.finances.assets.emergencyFund +
      profile.finances.assets.brokerage;

    const retirementSavings =
      profile.finances.assets.retirement401k + profile.finances.assets.rothIRA;

    const totalDebt = Object.values(profile.finances.liabilities).reduce((sum, val) => sum + val, 0);

    return {
      date: new Date(date),
      age: profile.personal.age + this.monthsDifference(new Date(profile.personal.dateOfBirth), date) / 12,
      netWorth,
      liquidAssets,
      retirementSavings,
      monthlyIncome,
      monthlyExpenses,
      monthlyCashFlow,
      savingsRate: (monthlyCashFlow / monthlyIncome) * 100,
      debtToIncomeRatio: (totalDebt / (monthlyIncome * 12)) * 100,
      investmentPortfolio: profile.finances.assets.brokerage,
      realEstateEquity: profile.finances.assets.realEstate,
      stockOptionsValue: profile.finances.assets.stockOptions,
    };
  }

  private calculateLongTermImpact(event: LifeEvent, profile: DemoProfile) {
    // Simplified calculation - in reality would run another simulation
    const fiveYearMultiplier = Math.pow(1 + this.config.annualReturn, 5);
    
    return {
      fiveYearNetWorthImpact: event.financialImpact.oneTime * fiveYearMultiplier,
      retirementImpact: (event.financialImpact.monthlyIncome - event.financialImpact.monthlyExpenses) * 12 * 
                        (profile.retirement.targetRetirementAge - profile.personal.age) * 
                        fiveYearMultiplier,
    };
  }

  private checkMilestones(snapshot: MonthlySnapshot, milestones: Milestone[]) {
    const milestoneChecks = [
      {
        name: 'First $100K Net Worth',
        threshold: 100000,
        value: snapshot.netWorth,
        description: 'Reached $100,000 in net worth',
      },
      {
        name: 'First $250K Net Worth',
        threshold: 250000,
        value: snapshot.netWorth,
        description: 'Reached $250,000 in net worth',
      },
      {
        name: 'First $500K Net Worth',
        threshold: 500000,
        value: snapshot.netWorth,
        description: 'Reached $500,000 in net worth',
      },
      {
        name: 'First $1M Net Worth',
        threshold: 1000000,
        value: snapshot.netWorth,
        description: 'Reached millionaire status',
      },
      {
        name: '$500K Retirement Savings',
        threshold: 500000,
        value: snapshot.retirementSavings,
        description: 'Reached $500,000 in retirement accounts',
      },
      {
        name: '$1M Retirement Savings',
        threshold: 1000000,
        value: snapshot.retirementSavings,
        description: 'Reached $1,000,000 in retirement accounts',
      },
    ];

    for (const check of milestoneChecks) {
      const existing = milestones.find((m) => m.name === check.name);
      if (!existing && check.value >= check.threshold) {
        milestones.push({
          name: check.name,
          date: new Date(snapshot.date),
          value: check.value,
          description: check.description,
          achieved: true,
        });
      }
    }
  }

  private checkWarnings(snapshot: MonthlySnapshot, warnings: Warning[]) {
    // Low emergency fund
    if (snapshot.liquidAssets < snapshot.monthlyExpenses * 3) {
      warnings.push({
        type: 'savings',
        severity: 'high',
        message: 'Emergency fund below 3 months of expenses',
        date: new Date(snapshot.date),
        recommendation: 'Build emergency fund to 6 months of expenses before investing more aggressively',
      });
    }

    // Negative cash flow
    if (snapshot.monthlyCashFlow < 0) {
      warnings.push({
        type: 'cashflow',
        severity: 'high',
        message: 'Negative monthly cash flow',
        date: new Date(snapshot.date),
        recommendation: 'Review expenses and look for areas to cut back or increase income',
      });
    }

    // High debt to income ratio
    if (snapshot.debtToIncomeRatio > 200) {
      warnings.push({
        type: 'debt',
        severity: 'medium',
        message: 'Debt to income ratio above 200%',
        date: new Date(snapshot.date),
        recommendation: 'Focus on paying down high-interest debt before taking on new obligations',
      });
    }

    // Low savings rate
    if (snapshot.savingsRate < 10) {
      warnings.push({
        type: 'savings',
        severity: 'medium',
        message: 'Savings rate below 10%',
        date: new Date(snapshot.date),
        recommendation: 'Aim to save at least 15-20% of income for long-term financial health',
      });
    }
  }

  private calculateSummary(
    snapshots: MonthlySnapshot[],
    lifeEventImpacts: LifeEventImpact[]
  ): SimulationSummary {
    const firstSnapshot = snapshots[0];
    const lastSnapshot = snapshots[snapshots.length - 1];

    const averageCashFlow =
      snapshots.reduce((sum, s) => sum + s.monthlyCashFlow, 0) / snapshots.length;

    const totalSavings = lastSnapshot.retirementSavings + lastSnapshot.investmentPortfolio;

    return {
      totalNetWorthGrowth: lastSnapshot.netWorth - firstSnapshot.netWorth,
      averageMonthlyCashFlow: averageCashFlow,
      totalSavings,
      retirementReadiness: (totalSavings / this.profile.retirement.retirementGoal) * 100,
      highestNetWorth: Math.max(...snapshots.map((s) => s.netWorth)),
      lowestNetWorth: Math.min(...snapshots.map((s) => s.netWorth)),
      totalTaxesPaid: 0, // Would need more detailed tax calculation
      totalInterestPaid: 0, // Would need to track mortgage interest
      totalInvestmentReturns: lastSnapshot.investmentPortfolio - firstSnapshot.investmentPortfolio,
    };
  }

  private monthsDifference(date1: Date, date2: Date): number {
    return (
      (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth())
    );
  }
}

// Pre-configured scenarios
export const commonScenarios = {
  marketDownturn: {
    name: 'Market Downturn',
    type: 'market_change' as const,
    startDate: new Date('2026-03-01'),
    endDate: new Date('2026-08-01'),
    value: -20,
    description: '20% market correction over 6 months',
  },
  marketBoom: {
    name: 'Market Boom',
    type: 'market_change' as const,
    startDate: new Date('2027-01-01'),
    endDate: new Date('2028-12-31'),
    value: 25,
    description: '25% market growth over 2 years',
  },
  layoff: {
    name: 'Layoff Scenario',
    type: 'salary_change' as const,
    startDate: new Date('2026-06-01'),
    endDate: new Date('2026-12-01'),
    value: -100,
    description: '6 months unemployment',
  },
  promotion: {
    name: 'Promotion',
    type: 'salary_change' as const,
    startDate: new Date('2027-01-01'),
    value: 20,
    description: '20% salary increase from promotion',
  },
  inflation: {
    name: 'High Inflation',
    type: 'expense_change' as const,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2027-12-31'),
    value: 15,
    description: '15% increase in living expenses',
  },
};
