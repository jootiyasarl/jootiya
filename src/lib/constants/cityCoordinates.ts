export const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    "Tanger": { lat: 35.7595, lng: -5.8340 },
    "Tétouan": { lat: 35.5677, lng: -5.3626 },
    "Al Hoceïma": { lat: 35.2446, lng: -3.9321 },
    "Chefchaouen": { lat: 35.1688, lng: -5.2636 },
    "Larache": { lat: 35.1927, lng: -6.1557 },

    "Oujda": { lat: 34.6819, lng: -1.9001 },
    "Nador": { lat: 35.1740, lng: -2.9287 },
    "Berkane": { lat: 34.9192, lng: -2.3160 },

    "Fès": { lat: 34.0181, lng: -5.0078 },
    "Meknès": { lat: 33.8935, lng: -5.5516 },
    "Taza": { lat: 34.2182, lng: -4.0101 },
    "Ifrane": { lat: 33.5228, lng: -5.1074 },

    "Rabat": { lat: 34.0209, lng: -6.8416 },
    "Salé": { lat: 34.0321, lng: -6.8041 },
    "Kénitra": { lat: 34.2610, lng: -6.5802 },
    "Témara": { lat: 33.8953, lng: -6.9150 },
    "Skhirat": { lat: 33.8507, lng: -7.0317 },

    "Casablanca": { lat: 33.5731, lng: -7.5898 },
    "Mohammedia": { lat: 33.6896, lng: -7.3887 },
    "Settat": { lat: 33.0010, lng: -7.6166 },
    "El Jadida": { lat: 33.2562, lng: -8.5085 },

    "Béni Mellal": { lat: 32.3394, lng: -6.3608 },
    "Khénifra": { lat: 32.9333, lng: -5.6667 },

    "Marrakech": { lat: 31.6295, lng: -7.9811 },
    "Safi": { lat: 32.2994, lng: -9.2372 },
    "Essaouira": { lat: 31.5085, lng: -9.7595 },

    "Errachidia": { lat: 31.9317, lng: -4.4239 },
    "Ouarzazate": { lat: 30.9335, lng: -6.9370 },

    "Agadir": { lat: 30.4278, lng: -9.5981 },
    "Inezgane": { lat: 30.3658, lng: -9.5250 },
    "Taroudant": { lat: 30.4703, lng: -8.8770 },
    "Tiznit": { lat: 29.6974, lng: -9.7305 },

    "Guelmim": { lat: 28.9880, lng: -10.0574 },
    "Tan-Tan": { lat: 28.4380, lng: -11.1032 },

    "Laâyoune": { lat: 27.1500, lng: -13.1991 },
    "Dakhla": { lat: 23.7000, lng: -15.9500 },
};

// Helper to get coordinates, default to Casablanca or approximate center if not found
export function getCityCoordinates(cityName: string) {
    return CITY_COORDINATES[cityName] || CITY_COORDINATES["Casablanca"];
}
