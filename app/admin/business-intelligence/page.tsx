'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Users, 
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Target,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface BusinessAnalytics {
  totalCost: number
  totalRevenue: number
  totalProfit: number
  averageProfitMargin: number
  totalDuration: number
  transcriptionCount: number
  uniqueUserCount: number
  costPerHour: number
  profitPerHour: number
}

interface UserAnalytics {
  tier: string
  userCount: number
  totalCost: number
  totalRevenue: number
  totalProfit: number
  totalDuration: number
  transcriptionCount: number
  averageProfitMargin: number
  costPerHour: number
  profitPerHour: number
}

interface CostTrend {
  _id: string
  totalCost: number
  totalDuration: number
  transcriptionCount: number
}

interface ProfitTrend {
  _id: string
  totalProfit: number
  totalRevenue: number
  averageProfitMargin: number
}

interface TopUser {
  userId: string
  email: string
  firstName: string
  lastName: string
  totalCost: number
  totalDuration: number
  transcriptionCount: number
  totalProfit: number
}

interface UserEngagement {
  userId: string
  email: string
  firstName: string
  lastName: string
  totalNotes: number
  totalExports: number
  lastActivity: Date
}

export default function BusinessIntelligencePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<{
    businessAnalytics: BusinessAnalytics
    userAnalytics: UserAnalytics[]
    costTrends: CostTrend[]
    profitTrends: ProfitTrend[]
    topUsersByCost: TopUser[]
    userEngagement: UserEngagement[]
    summary: any
  } | null>(null)
  
  const [dateRange, setDateRange] = useState('30') // days
  const [groupBy, setGroupBy] = useState('day')

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user?.email !== 'galaselfabian@gmail.com') {
      router.push('/')
      return
    }
    
    fetchBusinessIntelligence()
  }, [session, status, router, dateRange, groupBy])

  const fetchBusinessIntelligence = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - parseInt(dateRange))
      
      const response = await fetch(
        `/api/admin/business-intelligence?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&groupBy=${groupBy}`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch business intelligence data')
      }
      
      const result = await response.json()
      setData(result.data)
      
    } catch (error) {
      console.error('Error fetching business intelligence:', error)
      setError('Failed to load business intelligence data')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }

  const formatDuration = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`
    }
    return `${hours.toFixed(1)} hours`
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  if (status === 'loading' || isLoading) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Business Intelligence...</h2>
              <p className="text-gray-600 dark:text-gray-300">Analyzing your business metrics</p>
            </div>
          </div>
        </main>
      </>
    )
  }

  if (!session || session.user?.email !== 'galaselfabian@gmail.com') {
    return null
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
          <div className="flex items-center justify-center h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
              <button 
                onClick={fetchBusinessIntelligence}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header />
      
      <main className="pt-20 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Business Intelligence Dashboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Track your costs, profits, and user engagement in real-time
            </p>
          </div>

          {/* Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Group By
                </label>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
              
              <button
                onClick={fetchBusinessIntelligence}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {data && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Cost</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(data.businessAnalytics.totalCost)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Profit</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(data.businessAnalytics.totalProfit)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Hours Processed</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formatDuration(data.businessAnalytics.totalDuration)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {formatPercentage(data.businessAnalytics.averageProfitMargin)}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Analytics by Tier */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-600" />
                  User Analytics by Subscription Tier
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Tier</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Users</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Profit</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Hours</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.userAnalytics.map((tier, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4 font-medium text-gray-900 dark:text-white capitalize">
                            {tier.tier}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {tier.userCount}
                          </td>
                          <td className="py-3 px-4 text-red-600 dark:text-red-400">
                            {formatCurrency(tier.totalCost)}
                          </td>
                          <td className="py-3 px-4 text-green-600 dark:text-green-400">
                            {formatCurrency(tier.totalProfit)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatDuration(tier.totalDuration)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatPercentage(tier.averageProfitMargin)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Users by Cost */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Top Users by Cost (Monitor High-Usage Users)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Cost</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Hours</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Transcriptions</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Profit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topUsersByCost.map((user, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-red-600 dark:text-red-400 font-medium">
                            {formatCurrency(user.totalCost)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {formatDuration(user.totalDuration)}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {user.transcriptionCount}
                          </td>
                          <td className="py-3 px-4 text-green-600 dark:text-green-400">
                            {formatCurrency(user.totalProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* User Engagement */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  User Engagement (Notes & Exports)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">User</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Notes</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Exports</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Last Activity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.userEngagement.map((user, index) => (
                        <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {user.totalNotes}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {user.totalExports}
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                            {new Date(user.lastActivity).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Trends Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-600" />
                  Cost Trends Over Time
                </h2>
                <div className="h-64 flex items-end justify-between gap-2">
                  {data.costTrends.map((trend, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-red-500 dark:bg-red-600 rounded-t"
                        style={{ 
                          height: `${Math.max(10, (trend.totalCost / Math.max(...data.costTrends.map(t => t.totalCost))) * 200)}px` 
                        }}
                      ></div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                        {trend._id}
                      </p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">
                        {formatCurrency(trend.totalCost)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  )
}
