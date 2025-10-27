// Demo Profile for Financial Life Scenario Planning
// This profile represents a realistic user with various life events to simulate

export interface DemoProfile {
  personal: PersonalInfo;
  employment: EmploymentInfo;
  finances: FinancialInfo;
  realEstate: RealEstateInfo;
  retirement: RetirementInfo;
  lifeEvents: LifeEvent[];
}

export interface PersonalInfo {
  name: string;
  age: number;
  dateOfBirth: string;
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  dependents: number;
  location: {
    city: string;
    state: string;
    costOfLivingIndex: number; // 100 = national average
  };
}

export interface EmploymentInfo {
  currentJob: {
    title: string;
    company: string;
    startDate: string;
    salary: number;
    bonus: number; // annual
    stockOptions: StockOptions;
    benefits: {
      healthInsurance: number; // monthly employer contribution
      retirement401k: {
        employerMatch: number; // percentage
        employerMatchLimit: number; // percentage of salary
        currentContribution: number; // percentage of salary
      };
    };
  };
  employmentHistory: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    salary: number;
  }>;
}

export interface StockOptions {
  granted: number; // total shares granted
  vested: number; // shares that have vested
  unvested: number; // shares still vesting
  exercisePrice: number; // strike price per share
  currentMarketPrice: number; // current stock price
  vestingSchedule: {
    cliff: number; // months until first vesting
    vestingPeriod: number; // total vesting period in months
    vestingFrequency: 'monthly' | 'quarterly' | 'annually';
  };
  expirationDate: string;
}

export interface FinancialInfo {
  income: {
    salary: number;
    bonus: number;
    investments: number; // annual
    rental: number; // annual
    other: number; // annual
  };
  expenses: {
    housing: number; // monthly
    utilities: number; // monthly
    food: number; // monthly
    transportation: number; // monthly
    insurance: number; // monthly
    healthcare: number; // monthly
    childcare: number; // monthly
    entertainment: number; // monthly
    other: number; // monthly
  };
  assets: {
    checkingAccount: number;
    savingsAccount: number;
    emergencyFund: number;
    brokerage: number;
    retirement401k: number;
    rothIRA: number;
    hsa: number;
    realEstate: number; // equity in properties
    stockOptions: number; // current value
    other: number;
  };
  liabilities: {
    mortgage: number;
    studentLoans: number;
    carLoans: number;
    creditCards: number;
    other: number;
  };
  creditScore: number;
}

export interface RealEstateInfo {
  primaryResidence: {
    address: string;
    purchaseDate: string;
    purchasePrice: number;
    currentValue: number;
    mortgageBalance: number;
    monthlyPayment: number;
    interestRate: number;
    propertyTax: number; // annual
    insurance: number; // annual
    hoa: number; // monthly
  } | null;
  propertyHistory: Array<{
    address: string;
    purchaseDate: string;
    saleDate: string | null;
    purchasePrice: number;
    salePrice: number | null;
    type: 'primary' | 'rental' | 'investment';
  }>;
  futurePropertyPlans: Array<{
    type: 'purchase' | 'sale';
    targetDate: string;
    estimatedPrice: number;
    downPayment?: number;
    notes: string;
  }>;
}

export interface RetirementInfo {
  targetRetirementAge: number;
  targetRetirementDate: string;
  estimatedRetirementExpenses: number; // monthly
  socialSecurityEstimate: number; // monthly at full retirement age
  pensionEstimate: number; // monthly
  retirementGoal: number; // total amount needed
  currentRetirementSavings: number;
  projectedRetirementSavings: number;
  retirementAccounts: Array<{
    type: '401k' | 'IRA' | 'Roth IRA' | 'Pension' | 'Other';
    balance: number;
    annualContribution: number;
    employerContribution: number;
  }>;
}

export interface LifeEvent {
  id: string;
  type: 'job_change' | 'home_purchase' | 'home_sale' | 'baby' | 'marriage' | 'education' | 'major_purchase' | 'other';
  name: string;
  targetDate: string;
  status: 'planned' | 'in_progress' | 'completed';
  financialImpact: {
    oneTime: number; // one-time cost/income
    monthlyIncome: number; // change in monthly income
    monthlyExpenses: number; // change in monthly expenses
    assets: number; // change in assets
    liabilities: number; // change in liabilities
  };
  details: any; // event-specific details
}

// Demo Profile Instance
export const demoProfile: DemoProfile = {
  personal: {
    name: "Alex Chen",
    age: 32,
    dateOfBirth: "1993-03-15",
    maritalStatus: "married",
    dependents: 0,
    location: {
      city: "Austin",
      state: "TX",
      costOfLivingIndex: 119, // Austin is 19% above national average
    },
  },

  employment: {
    currentJob: {
      title: "Senior Software Engineer",
      company: "TechStart Inc.",
      startDate: "2022-01-15",
      salary: 145000,
      bonus: 20000,
      stockOptions: {
        granted: 50000,
        vested: 15625, // 31.25% vested (15 months into 4-year vest)
        unvested: 34375,
        exercisePrice: 2.50,
        currentMarketPrice: 8.75,
        vestingSchedule: {
          cliff: 12, // 1 year cliff
          vestingPeriod: 48, // 4 years total
          vestingFrequency: "monthly",
        },
        expirationDate: "2032-01-15",
      },
      benefits: {
        healthInsurance: 450, // monthly
        retirement401k: {
          employerMatch: 50, // 50% match
          employerMatchLimit: 6, // up to 6% of salary
          currentContribution: 10, // contributing 10%
        },
      },
    },
    employmentHistory: [
      {
        title: "Software Engineer",
        company: "MegaCorp",
        startDate: "2018-06-01",
        endDate: "2022-01-14",
        salary: 95000,
      },
      {
        title: "Junior Developer",
        company: "StartupXYZ",
        startDate: "2016-08-15",
        endDate: "2018-05-31",
        salary: 68000,
      },
    ],
  },

  finances: {
    income: {
      salary: 145000,
      bonus: 20000,
      investments: 4500,
      rental: 0,
      other: 0,
    },
    expenses: {
      housing: 2400, // rent
      utilities: 180,
      food: 850,
      transportation: 420,
      insurance: 320,
      healthcare: 150,
      childcare: 0,
      entertainment: 600,
      other: 400,
    },
    assets: {
      checkingAccount: 12000,
      savingsAccount: 45000,
      emergencyFund: 30000,
      brokerage: 85000,
      retirement401k: 142000,
      rothIRA: 38000,
      hsa: 8500,
      realEstate: 0, // currently renting
      stockOptions: 97656, // (15625 vested * $8.75) - (15625 * $2.50)
      other: 5000,
    },
    liabilities: {
      mortgage: 0,
      studentLoans: 15000,
      carLoans: 0,
      creditCards: 2800,
      other: 0,
    },
    creditScore: 765,
  },

  realEstate: {
    primaryResidence: null, // currently renting
    propertyHistory: [],
    futurePropertyPlans: [
      {
        type: "purchase",
        targetDate: "2026-06-01",
        estimatedPrice: 525000,
        downPayment: 105000, // 20%
        notes: "Planning to buy first home in Austin suburbs",
      },
    ],
  },

  retirement: {
    targetRetirementAge: 65,
    targetRetirementDate: "2058-03-15",
    estimatedRetirementExpenses: 6500,
    socialSecurityEstimate: 2800,
    pensionEstimate: 0,
    retirementGoal: 2500000,
    currentRetirementSavings: 180000,
    projectedRetirementSavings: 2750000, // with continued contributions
    retirementAccounts: [
      {
        type: "401k",
        balance: 142000,
        annualContribution: 14500,
        employerContribution: 7250,
      },
      {
        type: "Roth IRA",
        balance: 38000,
        annualContribution: 7000,
        employerContribution: 0,
      },
    ],
  },

  lifeEvents: [
    {
      id: "event_001",
      type: "baby",
      name: "First Baby Due",
      targetDate: "2026-03-01",
      status: "planned",
      financialImpact: {
        oneTime: 12000, // medical bills, baby gear
        monthlyIncome: 0,
        monthlyExpenses: 1800, // childcare, diapers, formula, increased healthcare
        assets: 0,
        liabilities: 0,
      },
      details: {
        expectedDueDate: "2026-03-01",
        parentalLeave: {
          duration: 3, // months
          paidPercentage: 100,
        },
        childcarePlans: "Full-time daycare starting at 3 months",
        estimatedChildcareCost: 1500,
      },
    },
    {
      id: "event_002",
      type: "home_purchase",
      name: "Purchase First Home",
      targetDate: "2026-06-01",
      status: "planned",
      financialImpact: {
        oneTime: -115000, // down payment + closing costs
        monthlyIncome: 0,
        monthlyExpenses: 700, // mortgage+tax+insurance vs current rent
        assets: 525000, // property value
        liabilities: 420000, // mortgage
      },
      details: {
        propertyType: "Single Family Home",
        location: "Austin Suburbs",
        purchasePrice: 525000,
        downPayment: 105000,
        closingCosts: 10000,
        mortgage: {
          amount: 420000,
          interestRate: 6.25,
          term: 360, // months
          monthlyPayment: 2586,
        },
        propertyTax: 9450, // annual (1.8% in TX)
        insurance: 1800, // annual
        maintenance: 200, // monthly estimate
      },
    },
    {
      id: "event_003",
      type: "job_change",
      name: "Senior Engineering Manager Role",
      targetDate: "2027-09-01",
      status: "planned",
      financialImpact: {
        oneTime: 50000, // signing bonus
        monthlyIncome: 3000, // salary increase
        monthlyExpenses: 0,
        assets: 0,
        liabilities: 0,
      },
      details: {
        newRole: "Engineering Manager",
        newCompany: "GrowthTech Corp",
        salaryIncrease: 36000,
        signingBonus: 50000,
        stockOptions: {
          granted: 75000,
          exercisePrice: 5.00,
          vestingSchedule: {
            cliff: 12,
            vestingPeriod: 48,
            vestingFrequency: "monthly",
          },
        },
        previousStockOptions: {
          action: "exercise_and_sell",
          vestedShares: 40625, // will have by then
          estimatedProceeds: 254000, // assuming $8.75 price
        },
        benefits: {
          retirement401kMatch: 100, // 100% match up to 6%
          hsa: 3850, // employer contribution
        },
      },
    },
    {
      id: "event_004",
      type: "home_sale",
      name: "Sell First Home for Larger Property",
      targetDate: "2033-08-01",
      status: "planned",
      financialImpact: {
        oneTime: 175000, // net proceeds after sale
        monthlyIncome: 0,
        monthlyExpenses: 1200, // larger home costs
        assets: 260000, // increase in home equity
        liabilities: 210000, // new mortgage (net change)
      },
      details: {
        salePrice: 675000,
        mortgageBalance: 365000,
        sellingCosts: 40500, // 6% commission
        netProceeds: 269500,
        newHome: {
          purchasePrice: 750000,
          downPayment: 150000,
          mortgage: 600000,
          monthlyPayment: 3950,
        },
        reason: "Growing family needs more space",
      },
    },
    {
      id: "event_005",
      type: "baby",
      name: "Second Baby",
      targetDate: "2029-05-01",
      status: "planned",
      financialImpact: {
        oneTime: 10000,
        monthlyIncome: 0,
        monthlyExpenses: 1200, // second child childcare
        assets: 0,
        liabilities: 0,
      },
      details: {
        expectedDueDate: "2029-05-01",
        parentalLeave: {
          duration: 3,
          paidPercentage: 100,
        },
        childcarePlans: "Same daycare as first child, sibling discount",
        estimatedChildcareCost: 1200,
      },
    },
  ],
};

// Helper function to calculate net worth
export function calculateNetWorth(profile: DemoProfile): number {
  const totalAssets = Object.values(profile.finances.assets).reduce((sum, val) => sum + val, 0);
  const totalLiabilities = Object.values(profile.finances.liabilities).reduce((sum, val) => sum + val, 0);
  return totalAssets - totalLiabilities;
}

// Helper function to calculate monthly cash flow
export function calculateMonthlyCashFlow(profile: DemoProfile): number {
  const monthlyIncome =
    profile.finances.income.salary / 12 +
    profile.finances.income.bonus / 12 +
    profile.finances.income.investments / 12 +
    profile.finances.income.rental / 12 +
    profile.finances.income.other / 12;

  const monthlyExpenses = Object.values(profile.finances.expenses).reduce((sum, val) => sum + val, 0);

  return monthlyIncome - monthlyExpenses;
}

// Helper function to calculate stock option value
export function calculateStockOptionValue(options: StockOptions): number {
  const intrinsicValue = Math.max(0, options.currentMarketPrice - options.exercisePrice);
  return options.vested * intrinsicValue;
}

// Helper function to project retirement savings
export function projectRetirementSavings(
  profile: DemoProfile,
  annualReturn: number = 0.07,
  inflationRate: number = 0.03
): number {
  const yearsToRetirement = profile.retirement.targetRetirementAge - profile.personal.age;
  const currentSavings = profile.retirement.currentRetirementSavings;
  const annualContributions = profile.retirement.retirementAccounts.reduce(
    (sum, account) => sum + account.annualContribution + account.employerContribution,
    0
  );

  let futureValue = currentSavings;
  for (let year = 0; year < yearsToRetirement; year++) {
    futureValue = futureValue * (1 + annualReturn) + annualContributions;
  }

  return futureValue;
}

// Helper function to simulate life event impact
export function simulateLifeEvent(profile: DemoProfile, eventId: string): DemoProfile {
  const event = profile.lifeEvents.find((e) => e.id === eventId);
  if (!event) return profile;

  const updatedProfile = JSON.parse(JSON.stringify(profile)) as DemoProfile;

  // Apply one-time financial impact
  updatedProfile.finances.assets.checkingAccount += event.financialImpact.oneTime;

  // Apply recurring impacts to monthly expenses/income
  const currentExpenses = Object.values(updatedProfile.finances.expenses).reduce((sum, val) => sum + val, 0);
  const expenseMultiplier = (currentExpenses + event.financialImpact.monthlyExpenses) / currentExpenses;

  Object.keys(updatedProfile.finances.expenses).forEach((key) => {
    updatedProfile.finances.expenses[key as keyof typeof updatedProfile.finances.expenses] *= expenseMultiplier;
  });

  // Update assets and liabilities
  updatedProfile.finances.assets.realEstate += event.financialImpact.assets;
  updatedProfile.finances.liabilities.mortgage += event.financialImpact.liabilities;

  // Mark event as completed
  const eventToUpdate = updatedProfile.lifeEvents.find((e) => e.id === eventId);
  if (eventToUpdate) {
    eventToUpdate.status = "completed";
  }

  return updatedProfile;
}

export default demoProfile;
