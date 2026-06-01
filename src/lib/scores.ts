export function scoreTone(score: number) {
  if (score >= 8) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
  }

  if (score >= 5) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700"
  }

  return "border-red-500/30 bg-red-500/10 text-red-700"
}

export function scoreRingTone(score: number) {
  if (score >= 8) {
    return "border-emerald-500 bg-emerald-500/10 text-emerald-700"
  }

  if (score >= 5) {
    return "border-amber-500 bg-amber-500/10 text-amber-700"
  }

  return "border-red-500 bg-red-500/10 text-red-700"
}
