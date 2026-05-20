import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

export function useLeaderboard() {
  const [ranking, setRanking] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Chargement initial
    fetchLeaderboard();

    // Écouter les mises à jour XP en temps réel
    const subscription = supabase
      .channel('leaderboard-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          // Mettre à jour le leaderboard localement
          setRanking(prev => {
            const updated = prev.map((u: any) =>
              u.id === payload.new.id ? { ...u, ...payload.new } : u
            );
            return updated.sort((a: any, b: any) => b.total_xp - a.total_xp)
              .map((u: any, i: number) => ({ ...u, rank: i + 1 }));
          });
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(50);
    setRanking(data || []);
    setLoading(false);
  };

  return { ranking, loading };
}