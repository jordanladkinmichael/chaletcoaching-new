'use client';

import React, { useState, useEffect } from 'react';
import { THEME } from '@/lib/theme';
import { TokenPackageId, Currency, formatPrice, getPackagePrice } from '@/lib/payment';

interface TokenPackage {
  id: TokenPackageId;
  name: string;
  price: number;
  tokens: number;
  description: string;
}

export default function TokenPurchase() {
  const [loading, setLoading] = useState<TokenPackageId | null>(null);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [currency, setCurrency] = useState<Currency>('EUR');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загружаем пакеты при монтировании
  useEffect(() => {
    const loadPackages = async () => {
      try {
        const response = await fetch('/api/tokens/topup');
        if (response.ok) {
          const data = await response.json();
          setPackages(data.packages);
        } else {
          setError('Failed to load token packages');
        }
      } catch {
        setError('Failed to load token packages');
      }
    };

    loadPackages();
  }, []);

  const handlePurchase = async (packageId: TokenPackageId) => {
    setLoading(packageId);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch('/api/tokens/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId, 
          currency 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process purchase');
      }

      setSuccess(`Successfully added ${data.tokensAdded.toLocaleString()} tokens! Your new balance is ${data.newBalance.toLocaleString()} tokens.`);
      
      // Обновляем баланс в родительском компоненте (если есть callback)
      if (typeof window !== 'undefined' && (window as unknown as { refreshBalance?: () => void }).refreshBalance) {
        (window as unknown as { refreshBalance: () => void }).refreshBalance();
      }

    } catch (error) {
      console.error('Purchase failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to process purchase');
    } finally {
      setLoading(null);
    }
  };

  const CurrencyToggle = () => (
    <div className="flex justify-center mb-6">
      <div className="inline-flex rounded-lg overflow-hidden border" style={{ borderColor: THEME.cardBorder }}>
        {(['EUR', 'GBP', 'USD'] as const).map((curr) => (
          <button
            key={curr}
            onClick={() => setCurrency(curr)}
            className={`px-3 py-2 text-xs md:text-sm font-medium ${
              currency === curr ? 'font-semibold' : 'opacity-60'
            }`}
            style={{ 
              background: currency === curr ? THEME.accent : 'transparent', 
              color: currency === curr ? '#0E0E10' : THEME.text 
            }}
          >
            {curr}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2" style={{ color: THEME.text }}>
          Get More AI Fitness Tokens
        </h2>
        <p className="text-lg opacity-80" style={{ color: THEME.secondary }}>
          Choose a package and start creating amazing fitness programs
        </p>
      </div>

      <CurrencyToggle />

      {/* Сообщения об ошибках и успехе */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className="relative rounded-xl p-6 border transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: THEME.card,
              borderColor: THEME.cardBorder,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            }}
          >
            {/* Популярный пакет */}
            {pkg.id === 'POPULAR' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2" style={{ color: THEME.text }}>
                {pkg.name}
              </h3>
              
              <div className="mb-4">
                <span className="text-4xl font-bold" style={{ color: THEME.accent }}>
                  {formatPrice(getPackagePrice(pkg.id, currency), currency)}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-sm opacity-70 mb-2" style={{ color: THEME.secondary }}>
                  {pkg.description}
                </p>
              </div>

              <div className="mb-6">
                <span className="text-2xl font-bold" style={{ color: THEME.text }}>
                  {pkg.tokens.toLocaleString()}
                </span>
                <span className="text-sm opacity-70" style={{ color: THEME.secondary }}>
                  {' '}tokens
                </span>
              </div>

              <button
                onClick={() => handlePurchase(pkg.id)}
                disabled={loading === pkg.id}
                className="w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
                style={{
                  backgroundColor: THEME.accent,
                  color: 'white',
                }}
              >
                {loading === pkg.id ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Add Tokens'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm opacity-70" style={{ color: THEME.secondary }}>
          Tokens are added instantly • Contact support for payment processing
        </p>
      </div>
    </div>
  );
}
