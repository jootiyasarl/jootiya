"use client";

import { useEffect, useState, useRef } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { supabase } from '@/lib/supabaseClient';

interface ViralTrackerProps {
  adId: string;
  referrerId: string;
}

export function ViralTracker({ adId, referrerId }: ViralTrackerProps) {
  const [hasCounted, setHasCounted] = useState(false);
  const startTime = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!adId || !referrerId || hasCounted) return;

    const initTracker = async () => {
      // 1. Generate Fingerprint
      const fpPromise = FingerprintJS.load();
      const fp = await fpPromise;
      const result = await fp.get();
      const visitorFingerprint = result.visitorId;

      // 2. Behavioral Check: Wait 5 seconds on page
      timerRef.current = setTimeout(async () => {
        const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
        
        try {
          // Check if already exists to avoid unnecessary calls (though DB has unique constraint)
          const { data: existing } = await supabase
            .from('referrals')
            .select('id')
            .eq('ad_id', adId)
            .eq('fingerprint', visitorFingerprint)
            .maybeSingle();

          if (existing) {
            setHasCounted(true);
            return;
          }

          // 3. Log Referral
          const { error } = await supabase
            .from('referrals')
            .insert({
              ad_id: adId,
              referrer_id: referrerId,
              fingerprint: visitorFingerprint,
              time_on_page: timeSpent,
              is_valid: true // Initial assumption, Middleware/Trigger handles fraud
            });

          if (!error) {
            setHasCounted(true);
          }
        } catch (err) {
          console.error('Viral Tracker Error:', err);
        }
      }, 5000); // 5 seconds threshold
    };

    initTracker();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [adId, referrerId, hasCounted]);

  return null; // Hidden tracker
}
