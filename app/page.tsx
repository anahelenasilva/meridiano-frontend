'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar, FileText, Filter } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { useState } from 'react';

import { apiService } from '@/src/services/api';
import type { BriefingsResponse } from '@/src/types/api';

export default function HomePage() {
  const [selectedProfile, setSelectedProfile] = useState<string>('');

  const { data, isLoading, error } = useQuery<BriefingsResponse>({
    queryKey: ['briefings', selectedProfile],
    queryFn: async () => {
      const response = await apiService.getBriefings(selectedProfile || undefined);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading Briefings</h2>
          <p className="text-gray-600 dark:text-gray-400">Fetching your latest news summaries...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full mb-6">
            <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unable to Load Briefings</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">We encountered an error while fetching your briefings. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { briefings, available_profiles } = data || { briefings: [], available_profiles: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4 sm:mb-6">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            News Briefings
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
            AI-powered summaries and insights from your curated news feeds
          </p>

          {/* Stats Bar */}
          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 dark:bg-green-500 rounded-full"></div>
              <span>{briefings.length} briefings available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-400 dark:bg-blue-500 rounded-full"></div>
              <span>{available_profiles.length} profiles active</span>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6 sm:mb-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 dark:bg-blue-900 rounded-lg flex-shrink-0">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">Filter Briefings</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Choose a profile to see specific content</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <select
                  value={selectedProfile}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full sm:min-w-[200px] bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-500 dark:text-gray-300 [&:has(option:checked:not([value='']))]:text-gray-900 dark:[&:has(option:checked:not([value='']))]:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:border-gray-300 dark:hover:border-gray-500"
                >
                  <option value="">All Profiles</option>
                  {available_profiles.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>

                {selectedProfile && (
                  <button
                    onClick={() => setSelectedProfile('')}
                    className="px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Clear filter</span>
                    <span className="text-lg">&times;</span>
                  </button>
                )}
              </div>
            </div>

            {selectedProfile && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Showing briefings for:</span>
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                    {selectedProfile}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Briefings List */}
        {briefings.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="max-w-md mx-auto px-4">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">No briefings found</h3>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed">
                {selectedProfile
                  ? `No briefings are available for the ${selectedProfile} profile yet.`
                  : 'No briefings have been generated yet. Check back soon for AI-powered news summaries.'
                }
              </p>
              {selectedProfile && (
                <button
                  onClick={() => setSelectedProfile('')}
                  className="mt-4 sm:mt-6 inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-lg sm:rounded-xl text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  View All Briefings
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 lg:gap-8">
            {briefings.map((briefing, index) => (
              <div
                key={briefing.id}
                className="group bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-4 sm:p-6 lg:p-8">
                  {/* Briefing Header */}
                  <div className="flex items-start justify-between mb-4 sm:mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-800 dark:text-blue-300">
                          {briefing.feed_profile}
                        </span>
                        <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="whitespace-nowrap">{moment(briefing.generated_at).format('MMM D, YYYY • h:mm A')}</span>
                        </div>
                      </div>

                      <Link
                        href={`/briefing/${briefing.id}`}
                        className="block group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
                      >
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 leading-tight">
                          {briefing.title}
                        </h2>
                      </Link>
                    </div>

                    <div className="ml-3 sm:ml-6 flex-shrink-0">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* Briefing Summary */}
                  {briefing.summary && (
                    <div className="mb-4 sm:mb-6">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-blue-900 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-blue-500 dark:border-blue-400">
                        <p className="text-sm sm:text-base lg:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                          {briefing.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-100 dark:border-gray-700">
                    <Link
                      href={`/briefing/${briefing.id}`}
                      className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 dark:hover:from-blue-600 dark:hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <span>Read Full Briefing</span>
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>

                    <Link
                      href={`/articles?feed_profile=${briefing.feed_profile}`}
                      className="inline-flex items-center justify-center sm:justify-start text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200 group"
                    >
                      <span>View related articles</span>
                      <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
