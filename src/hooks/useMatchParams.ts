"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useMatch } from "@/contexts/MatchContext";

export function useMatchParams() {
  const searchParams = useSearchParams();
  const match = useMatch();

  /* Read URL params into context on mount */
  useEffect(() => {
    const h = searchParams.get("home");
    const a = searchParams.get("away");
    const hf = searchParams.get("hf");
    const af = searchParams.get("af");

    if (h && h !== match.homeTeam) match.setHomeTeam(h);
    if (a && a !== match.awayTeam) match.setAwayTeam(a);
    if (hf && hf !== match.homeFormation) match.setHomeFormation(hf);
    if (af && af !== match.awayFormation) match.setAwayFormation(af);
    /* only run on mount */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Write context changes back to URL silently */
  useEffect(() => {
    const params = new URLSearchParams();
    if (match.homeTeam) params.set("home", match.homeTeam);
    if (match.awayTeam) params.set("away", match.awayTeam);
    if (match.homeFormation) params.set("hf", match.homeFormation);
    if (match.awayFormation) params.set("af", match.awayFormation);

    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [match.homeTeam, match.awayTeam, match.homeFormation, match.awayFormation]);

  const shareUrl = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url).catch(() => {});
    return url;
  };

  return { shareUrl };
}
