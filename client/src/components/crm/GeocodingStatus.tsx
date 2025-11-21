import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Play, Pause, RotateCcw } from 'lucide-react';
import {
  getGeocodingStats,
  startBackgroundGeocoding,
  stopBackgroundGeocoding,
  resetGeocodingProgress,
} from '@/lib/backgroundGeocoder';

export function GeocodingStatus() {
  const [stats, setStats] = useState(getGeocodingStats());
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateStats = () => {
      setStats(getGeocodingStats());
    };

    // Update every 5 seconds
    const interval = setInterval(updateStats, 5000);

    // Listen for geocoding events
    const handleProgress = () => updateStats();
    window.addEventListener('geocodingProgress', handleProgress);
    window.addEventListener('geocodingComplete', handleProgress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('geocodingProgress', handleProgress);
      window.removeEventListener('geocodingComplete', handleProgress);
    };
  }, []);

  const percentComplete = (stats.geocodedContacts / stats.totalContacts) * 100;
  const isComplete = stats.remaining === 0 && stats.geocodedContacts > 0;

  if (stats.geocodedContacts === 0 && !stats.isRunning) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Address Geocoding</CardTitle>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-blue-600 hover:text-blue-700 underline"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-900 font-medium">
              {stats.totalGeocoded} of {stats.totalContacts} addresses geocoded
              {stats.alreadyGeocoded > 0 && (
                <span className="text-xs text-blue-700 ml-2">({stats.alreadyGeocoded} existing)</span>
              )}
            </span>
            <span className="text-xs text-blue-700">
              {percentComplete.toFixed(1)}%
            </span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>

        <div className="flex gap-2">
          {!stats.isRunning && !isComplete && (
            <Button
              size="sm"
              onClick={() => startBackgroundGeocoding()}
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="h-3 w-3" />
              Start Geocoding
            </Button>
          )}

          {stats.isRunning && (
            <Button
              size="sm"
              onClick={() => stopBackgroundGeocoding()}
              variant="outline"
              className="gap-2"
            >
              <Pause className="h-3 w-3" />
              Pause
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => resetGeocodingProgress()}
            variant="ghost"
            className="gap-2"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>

        {showDetails && (
          <div className="mt-3 p-3 bg-white rounded border border-blue-100 text-xs space-y-1">
            <div className="text-blue-900">
              <strong>Status:</strong> {stats.isRunning ? '🔄 Running' : '⏸️ Paused'}
            </div>
            <div className="text-blue-900">
              <strong>Rate:</strong> {stats.ratePerSecond} per second
            </div>
            <div className="text-blue-900">
              <strong>Elapsed:</strong> {Math.floor(stats.elapsedSeconds / 60)}m {stats.elapsedSeconds % 60}s
            </div>
            {stats.remaining > 0 && stats.ratePerSecond > 0 && (
              <div className="text-blue-900">
                <strong>Est. Time:</strong> {Math.ceil(stats.remaining / stats.ratePerSecond)}s remaining
              </div>
            )}
            {stats.failedAddresses.length > 0 && (
              <div className="text-red-700 pt-2">
                <strong>Failed:</strong> {stats.failedAddresses.length} addresses
              </div>
            )}
          </div>
        )}

        {isComplete && (
          <div className="text-sm text-green-700 font-medium">
            ✓ All addresses successfully geocoded!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
