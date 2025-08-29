"use client";

import React from 'react';
import { X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

interface ProgressModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  steps: ProgressStep[];
  currentStepIndex: number;
  progress: number; // 0-100
  assetPreview?: {
    name: string;
    image: string;
    description: string;
  };
  showKeepOpen?: boolean;
  isSuccess?: boolean;
  successData?: {
    title: string;
    subtitle: string;
    actionButtons?: React.ReactNode;
  };
}

export function ProgressModal({
  isOpen,
  onClose,
  title,
  steps,
  currentStepIndex,
  progress,
  assetPreview,
  showKeepOpen = true,
  isSuccess = false,
  successData
}: ProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500" />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 animate-in slide-in-from-bottom-4 zoom-in-95 duration-500">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl border border-gray-600/50 shadow-2xl backdrop-blur-xl transform transition-all duration-300 hover:scale-[1.01]">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            {onClose && !isSuccess && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isSuccess && successData ? (
            // Success Screen
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400/30 to-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              
              <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">
                {successData.title}
              </h3>
              
              <p className="text-lg text-gray-300 mb-6 max-w-sm mx-auto leading-relaxed">
                {successData.subtitle}
              </p>

              {assetPreview && (
                <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 mb-6 border border-gray-700/30 hover:border-purple-500/30 transition-all duration-300">
                  <div className="text-center">
                    <img 
                      src={assetPreview.image} 
                      alt={assetPreview.name}
                      className="w-24 h-24 rounded-xl object-cover mx-auto mb-4 shadow-xl ring-3 ring-purple-500/20 hover:ring-purple-500/40 transition-all duration-300 hover:scale-105"
                    />
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{assetPreview.name}</h4>
                      <p className="text-gray-300 leading-relaxed">
                        {assetPreview.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {successData.actionButtons}
            </div>
          ) : (
            // Progress Screen
            <>
              {/* Asset Preview */}
              {assetPreview && (
                <div className="p-6 border-b border-gray-700/50">
                  <div className="text-center">
                    <img 
                      src={assetPreview.image} 
                      alt={assetPreview.name}
                      className="w-20 h-20 rounded-xl object-cover mx-auto mb-3 shadow-lg ring-2 ring-purple-500/30 hover:ring-purple-500/50 transition-all duration-300 hover:scale-110"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{assetPreview.name}</h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {assetPreview.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-base font-semibold text-gray-200">Progress</span>
                  <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div 
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-lg relative"
                    style={{ 
                      width: `${progress}%`,
                      boxShadow: '0 0 15px rgba(168, 85, 247, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse rounded-full" />
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="p-6">
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div 
                      key={step.id} 
                      className="flex items-start gap-4 animate-in slide-in-from-left duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Step Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {step.status === 'completed' ? (
                          <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : step.status === 'in_progress' ? (
                          <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                          </div>
                        ) : step.status === 'error' ? (
                          <div className="w-7 h-7 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-md">
                            <AlertCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 bg-gray-600/50 rounded-full flex items-center justify-center">
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-base font-semibold mb-1 ${
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'in_progress' ? 'text-yellow-400' :
                          step.status === 'error' ? 'text-red-400' :
                          'text-gray-400'
                        }`}>
                          {step.title}
                        </h4>
                        <p className="text-sm text-gray-300 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Keep Window Open Warning */}
                {showKeepOpen && !isSuccess && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-xs text-orange-300 text-center font-medium">
                      Please keep this window open until the process completes
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}