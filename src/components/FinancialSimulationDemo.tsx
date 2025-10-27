import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import demoProfile, { calculateNetWorth, calculateMonthlyCashFlow } from '@/lib/demoProfile';
import { FinancialSimulator, commonScenarios } from '@/lib/simulator';

const FinancialSimulationDemo = () => {
  const [timeHorizon, setTimeHorizon] = useState(10); // years
  const [includeLifeEvents, setIncludeLifeEvents] = useState(true);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'scenarios' | 'retirement'>('overview');

  // Run simulation
  const simulationResult = useMemo(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + timeHorizon);

    const scenarios = selectedScenarios.map((s) => commonScenarios[s as keyof typeof commonScenarios]);

    const simulator = new FinancialSimulator(demoProfile, {
      startDate,
      endDate,
      annualReturn: 0.08,
      inflationRate: 0.03,
      taxRate: 0.25,
      includeLifeEvents,
      scenarios,
    });

    return simulator.runSimulation();
  }, [timeHorizon, includeLifeEvents, selectedScenarios]);

  // Format data for charts
  const netWorthData = useMemo(() => {
    return simulationResult.monthlySnapshots
      .filter((_, index) => index % 3 === 0) // Show every 3 months
      .map((snapshot) => ({
        date: snapshot.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        'Net Worth': Math.round(snapshot.netWorth),
        'Retirement Savings': Math.round(snapshot.retirementSavings),
        'Liquid Assets': Math.round(snapshot.liquidAssets),
        'Real Estate Equity': Math.round(snapshot.realEstateEquity),
      }));
  }, [simulationResult]);

  const cashFlowData = useMemo(() => {
    return simulationResult.monthlySnapshots
      .filter((_, index) => index % 3 === 0)
      .map((snapshot) => ({
        date: snapshot.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        Income: Math.round(snapshot.monthlyIncome),
        Expenses: Math.round(snapshot.monthlyExpenses),
        'Cash Flow': Math.round(snapshot.monthlyCashFlow),
        'Savings Rate': Math.round(snapshot.savingsRate),
      }));
  }, [simulationResult]);

  const lifeEventData = useMemo(() => {
    return simulationResult.lifeEventImpacts.map((impact) => ({
      event: impact.event.name,
      'Immediate Impact': Math.round(impact.immediateImpact.netWorthChange),
      '5-Year Impact': Math.round(impact.longTermImpact.fiveYearNetWorthImpact),
      date: impact.executionDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    }));
  }, [simulationResult]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentNetWorth = calculateNetWorth(demoProfile);
  const currentCashFlow = calculateMonthlyCashFlow(demoProfile);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Financial Life Simulation Demo
          </h1>
          <p className="text-gray-600">
            Comprehensive financial planning for {demoProfile.personal.name} - Age {demoProfile.personal.age}
          </p>
          
          {/* Current Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Current Net Worth</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentNetWorth)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Monthly Cash Flow</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(currentCashFlow)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Retirement Savings</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(demoProfile.finances.assets.retirement401k + demoProfile.finances.assets.rothIRA)}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Stock Options Value</p>
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(demoProfile.finances.assets.stockOptions)}
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Simulation Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time Horizon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Horizon: {timeHorizon} years
              </label>
              <input
                type="range"
                min="1"
                max="35"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Life Events Toggle */}
            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLifeEvents}
                  onChange={(e) => setIncludeLifeEvents(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Include Life Events</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                {demoProfile.lifeEvents.length} planned events
              </p>
            </div>

            {/* Scenarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Scenarios
              </label>
              <div className="space-y-1">
                {Object.keys(commonScenarios).map((key) => (
                  <label key={key} className="flex items-center space-x-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={selectedScenarios.includes(key)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScenarios([...selectedScenarios, key]);
                        } else {
                          setSelectedScenarios(selectedScenarios.filter((s) => s !== key));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'events', 'scenarios', 'retirement'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Net Worth Projection */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Net Worth Projection</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={netWorthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="Net Worth"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="Retirement Savings"
                        stackId="2"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Cash Flow Analysis */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Monthly Cash Flow</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={cashFlowData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={2} />
                      <Line type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} />
                      <Line type="monotone" dataKey="Cash Flow" stroke="#3b82f6" strokeWidth={3} />
                      <ReferenceLine y={0} stroke="#000" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Projected Net Worth ({timeHorizon}y)</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {formatCurrency(simulationResult.summary.highestNetWorth)}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{formatCurrency(simulationResult.summary.totalNetWorthGrowth)} growth
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Avg Monthly Cash Flow</p>
                    <p className="text-2xl font-bold text-green-700">
                      {formatCurrency(simulationResult.summary.averageMonthlyCashFlow)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Retirement Readiness</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {simulationResult.summary.retirementReadiness.toFixed(0)}%
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      of {formatCurrency(demoProfile.retirement.retirementGoal)} goal
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Life Events Tab */}
            {activeTab === 'events' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Life Events Impact Analysis</h3>
                  
                  {/* Events Timeline */}
                  <div className="space-y-4 mb-8">
                    {simulationResult.lifeEventImpacts.map((impact, index) => (
                      <div
                        key={index}
                        className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded-r-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-800">{impact.event.name}</h4>
                            <p className="text-sm text-gray-600">{impact.event.type.replace('_', ' ')}</p>
                            <p className="text-xs text-gray-500 mt-1">{impact.executionDate.toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${
                              impact.immediateImpact.netWorthChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {impact.immediateImpact.netWorthChange >= 0 ? '+' : ''}
                              {formatCurrency(impact.immediateImpact.netWorthChange)}
                            </p>
                            <p className="text-xs text-gray-500">immediate impact</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500">Cash Flow Change</p>
                            <p className={`font-semibold ${
                              impact.immediateImpact.cashFlowChange >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {impact.immediateImpact.cashFlowChange >= 0 ? '+' : ''}
                              {formatCurrency(impact.immediateImpact.cashFlowChange)}/mo
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">5-Year Impact</p>
                            <p className="font-semibold text-blue-600">
                              {formatCurrency(impact.longTermImpact.fiveYearNetWorthImpact)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Retirement Impact</p>
                            <p className="font-semibold text-purple-600">
                              {formatCurrency(impact.longTermImpact.retirementImpact)}
                            </p>
                          </div>
                        </div>

                        {impact.event.details && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600">
                              {JSON.stringify(impact.event.details, null, 2)}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Life Events Chart */}
                  {lifeEventData.length > 0 && (
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={lifeEventData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="event" angle={-45} textAnchor="end" height={120} />
                        <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                        <Tooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="Immediate Impact" fill="#3b82f6" />
                        <Bar dataKey="5-Year Impact" fill="#8b5cf6" />
                        <ReferenceLine y={0} stroke="#000" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            )}

            {/* Scenarios Tab */}
            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Scenario Analysis</h3>
                  
                  {selectedScenarios.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        No scenarios selected. Add scenarios from the controls above to see their impact.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedScenarios.map((scenarioKey) => {
                        const scenario = commonScenarios[scenarioKey as keyof typeof commonScenarios];
                        return (
                          <div key={scenarioKey} className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800">{scenario.name}</h4>
                            <p className="text-sm text-gray-600">{scenario.description}</p>
                            <div className="mt-2 flex space-x-4 text-sm">
                              <span className="text-gray-600">
                                Start: {scenario.startDate.toLocaleDateString()}
                              </span>
                              {scenario.endDate && (
                                <span className="text-gray-600">
                                  End: {scenario.endDate.toLocaleDateString()}
                                </span>
                              )}
                              <span className="font-semibold text-blue-600">
                                Impact: {scenario.value > 0 ? '+' : ''}{scenario.value}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      
                      <div className="mt-6 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                        <h4 className="font-semibold text-gray-800 mb-2">Combined Scenario Impact</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          With all selected scenarios applied, your projected outcomes are:
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-600">Final Net Worth</p>
                            <p className="text-xl font-bold text-blue-700">
                              {formatCurrency(netWorthData[netWorthData.length - 1]['Net Worth'])}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Avg Cash Flow</p>
                            <p className="text-xl font-bold text-green-700">
                              {formatCurrency(simulationResult.summary.averageMonthlyCashFlow)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Retirement Tab */}
            {activeTab === 'retirement' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Retirement Planning</h3>
                  
                  {/* Retirement Progress */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">Retirement Goal Progress</h4>
                      <span className="text-2xl font-bold text-purple-600">
                        {simulationResult.summary.retirementReadiness.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(simulationResult.summary.retirementReadiness, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Current: {formatCurrency(simulationResult.summary.totalSavings)}</span>
                      <span>Goal: {formatCurrency(demoProfile.retirement.retirementGoal)}</span>
                    </div>
                  </div>

                  {/* Retirement Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Target Retirement Age</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {demoProfile.retirement.targetRetirementAge}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {demoProfile.retirement.targetRetirementAge - demoProfile.personal.age} years away
                      </p>
                    </div>
                    
                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Monthly Retirement Income</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(demoProfile.retirement.estimatedRetirementExpenses)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">estimated need</p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">Social Security (est.)</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(demoProfile.retirement.socialSecurityEstimate)}/mo
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">401(k) Balance</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {formatCurrency(demoProfile.finances.assets.retirement401k)}
                      </p>
                    </div>
                  </div>

                  {/* Retirement Savings Over Time */}
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={netWorthData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                      <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="Retirement Savings"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.6}
                      />
                      <ReferenceLine
                        y={demoProfile.retirement.retirementGoal}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                        label="Goal"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Warnings and Milestones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Milestones */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">🎯 Milestones</h3>
            <div className="space-y-3">
              {simulationResult.milestones.length === 0 ? (
                <p className="text-gray-500 text-sm">No milestones achieved yet in this timeframe</p>
              ) : (
                simulationResult.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl">✓</div>
                    <div>
                      <p className="font-semibold text-gray-800">{milestone.name}</p>
                      <p className="text-sm text-gray-600">{milestone.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {milestone.date.toLocaleDateString()} - {formatCurrency(milestone.value)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Warnings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">⚠️ Warnings & Recommendations</h3>
            <div className="space-y-3">
              {simulationResult.warnings.length === 0 ? (
                <p className="text-gray-500 text-sm">No warnings - looking good!</p>
              ) : (
                simulationResult.warnings.slice(0, 5).map((warning, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      warning.severity === 'high'
                        ? 'bg-red-50 border-l-4 border-red-500'
                        : warning.severity === 'medium'
                        ? 'bg-yellow-50 border-l-4 border-yellow-500'
                        : 'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                  >
                    <p className="font-semibold text-gray-800 text-sm">{warning.message}</p>
                    <p className="text-xs text-gray-600 mt-1">{warning.recommendation}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSimulationDemo;
