export interface PlanetPlacement {
  name: string;
  sign: string;
  house: number;
  degree: number;
}

export interface YogaResult {
  name: string;
  detected: boolean;
  message: string;
}

export function detectPanchaMahapurushaYogas(
  planets: PlanetPlacement[],
  gender?: string
): YogaResult[] {
  const yogas: YogaResult[] = [];
  const jupiter = planets.find(p => p.name === "Jupiter");
  if (
    jupiter &&
    [1, 4, 7, 10].includes(jupiter.house) &&
    ["Pisces", "Sagittarius"].includes(jupiter.sign)
  ) {
    yogas.push({
      name: "Hamsa Yoga",
      detected: true,
      message:
        gender === "female"
          ? "Hamsa Yoga: Blessed with saintly wisdom and divine protection."
          : "Hamsa Yoga: Blessed with saintly wisdom and divine authority.",
    });
  }
  return yogas;
}

export function detectAllYogas(
  planets: PlanetPlacement[],
  gender?: string
): YogaResult[] {
  return detectPanchaMahapurushaYogas(planets, gender);
}
