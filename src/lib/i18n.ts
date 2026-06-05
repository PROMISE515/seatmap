import { useCallback, useEffect, useState } from "react";

export type Locale = "en" | "es";

const ES_RE = /^es\b/i;

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language];
  return languages.some((language) => ES_RE.test(language)) ? "es" : "en";
}

export function useLocale() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  return locale;
}

type TranslationValue = string | ((...args: Array<string | number>) => string);

const translations = {
  en: {
    "nav.nearby": "Nearby",
    "nav.report": "Report",
    "home.srSubtitle": "Find seated toilets nearby in China",
    "home.subtitle": "Find a western toilet nearby in China",
    "home.saved": "Saved",
    "home.you": "You",
    "home.locatingTitle": "Locating you...",
    "home.locatingCaption": "You are safe now",
    "home.tryLocation": "Try Current Location Again",
    "home.findNearby": "Find Nearby Seated Toilet",
    "home.requestLocation": "Request browser location",
    "home.searchRadius": "Search 20 km radius",
    "home.mapCheck": "Map check",
    "home.tapToLocate": "Tap to locate",
    "home.checking": "Checking",
    "home.locationNeeded": "Location needed",
    "home.openedCities": "Opened cities",
    "home.viewOpenedCities": "View opened cities",
    "home.openedCitiesDescription": "Manual previews are available in these popular destinations.",
    "home.currentSearchArea": "Current search area",
    "home.openedResultsNearYou": (count) => `${count} results near you`,
    "home.areaNotOpen": (region) => `No nearby results in ${region}`,
    "home.checkingCity": "Checking your current area",
    "home.mapPreviewCurrent": "Map preview uses your current search area.",
    "home.turnOnLocation": "Turn on browser location, or choose an opened city below.",
    "home.thisArea": "This area",
    "home.locationUnavailable": "Location unavailable",
    "home.noMapBeforeLocation": "No map before location",
    "home.noMapHint": "Tap the green button to show a real map of your current search area.",
    "home.nearestOptions": "Nearest Options",
    "home.serviceNotOpen": "No nearby results",
    "home.readyWhen": "Ready when you are",
    "home.sortedByDistance": "Sorted by distance",
    "home.noToilets": "No toilets found within 20 km. Try moving and searching again.",
    "home.unsupported": (region, supported) =>
      `No traveler-friendly seated toilets found near ${region}. Try again nearby or choose a manual preview: ${supported}.`,
    "home.reportSeated": "Report a seated toilet",
    "home.readyCopy":
      "Tap the green button above.\nWe'll show traveler-friendly seated options near you in seconds.",
    "home.paywallTitle": "SeatMap Travel Pass",
    "home.paywallDescription":
      "Unlock the full result list, navigation details, and unlimited trip access.",
    "home.unlimited": "Unlimited searches",
    "home.days": (days) => `${days} ${Number(days) === 1 ? "day" : "days"}`,
    "home.lifetime": "Lifetime access",
    "home.saveAbout": (percent) => `Save about ${percent}%`,
    "home.best": "Best",
    "home.earnSearch": "Earn one free search",
    "home.shareExplain":
      "Send SeatMap to a friend. When they open your link, you get one extra free search.",
    "home.shareButton": "Share to earn 1 search",
    "home.preparingLink": "Preparing link...",
    "home.noAccount": "No account needed · Apple Pay / Google Pay supported",
    "home.shareSent": "Share sent",
    "home.shareCopied": "Share link copied",
    "home.shareUnavailable": "Share link unavailable",
    "home.shareUnavailableDescription":
      "The referral database may not be ready yet. Try again after deployment.",
    "home.shareEarnDescription": "You get one extra free search after a friend opens it.",
    "home.shareFailed": "Share failed",
    "home.shareFailedDescription": "Copy the page URL and try again.",
    "home.openedSeatMap": "Thanks for opening SeatMap",
    "home.friendEarned": "Your friend earned one extra free search.",
    "home.rewardSaveFailed": "Share reward could not be saved",
    "home.rewardSaveFailedDescription": "SeatMap still works, but the referral was not recorded.",
    "home.freeSearchEarned": "Free search earned",
    "home.sharedSearches": (count) =>
      `You have ${count} shared free ${Number(count) === 1 ? "search" : "searches"}.`,
    "card.minWalk": "min walk",
    "card.indoor": "Indoor",
    "card.accessible": "Accessible",
    "card.nursery": "Nursery",
    "card.public": "Public",
    "card.city": "City",
    "card.preview": "preview",
    "card.away": (distance) => `${distance}m away`,
    "card.needsConfirmation": "Needs confirmation",
    "card.likelyWestern": "Western Toilet",
    "card.previewVenue": "Opened city venue",
    "card.topRated": "Top Rated",
    "card.entries": (count) => `${count} entries`,
    "card.navigate": "Navigate",
    "card.needsSeated": "Needs seated confirmation",
    "card.useLocation": "Use current location to navigate",
    "card.alreadySaved": "Already saved",
    "card.saved": "Saved on this device",
    "card.alreadySavedDescription": "This place is already in your saved list.",
    "card.savedDescription": "Saved places stay in this browser only.",
    "card.view": "View",
    "card.savedToilet": "Saved toilet",
    "card.saveToilet": "Save toilet",
    "card.unlockResults": "Unlock results",
    "map.openInMaps": "Open in maps",
    "map.chooseApp": "Choose your preferred navigation app.",
    "review.title": "Review",
    "review.helper":
      "We are committed to providing reliable seated toilet and nursery room information. Your feedback helps us a lot.",
    "complaint.title": "Report this place",
    "complaint.reason": "What is wrong?",
    "complaint.noSeated": "No seated toilet",
    "complaint.noNursery": "No nursery room",
    "complaint.description": "Description",
    "complaint.descriptionPlaceholder": "Optional details, floor, entrance, or what you found...",
    "complaint.helper":
      "We are committed to providing reliable seated toilet and nursery room information. Your feedback helps us a lot.",
    "complaint.submit": "Submit report",
    "complaint.submitting": "Submitting",
    "complaint.thanks": "Thank you for reporting this place. We will verify it.",
    "complaint.outOfRange": "You need to be within 1km of this place to report it.",
    "complaint.locationNeeded": "Location access is needed to report this place within 1km.",
    "complaint.missingPlace": "This place cannot be reported because it is missing location data.",
    "complaint.placeNameNeeded": "Add a place name before filing a report.",
    "city.back": "Back",
    "city.publicToilets": (city) => `Public Toilets in ${city}`,
    "city.tagline": "Clean Western (seated) restrooms for travelers",
    "city.currentArea": "Current search area",
    "city.cityPreview": "City preview",
    "city.resultsNearYou": (city) => `${city} results near you`,
    "city.previewTitle": (city) => `${city} preview`,
    "city.distanceUsesLocation": "Distances and navigation use your current location.",
    "city.homeNavigationHint":
      "Open the green search button on the home page for current-location navigation.",
    "city.previewMode": "Preview mode",
    "city.previewExplain": (city) =>
      `These are curated ${city} venue candidates, not live distances from your current location. Use the home search for current-location navigation.`,
    "city.travelerTip": "Traveler tip",
    "city.neighborhoods": "Best neighborhoods to find one",
    "city.loading": "Loading...",
    "city.liveLocations": (count) => `${count} curated venues`,
    "city.liveFromAmap": "Fixed preview list",
    "city.noPublic": (city) => `No public toilets found in ${city}.`,
    "city.whyUse": (city) => `Why use SeatMap in ${city}?`,
    "city.reason1": "Curated venues focus on seated-toilet likelihood",
    "city.reason2": "Prioritizes malls, hotels, and traveler-friendly indoor venues",
    "city.reason3": "Free-entry options are highlighted when available",
    "city.reason4": "Live AMap results are cached for fast repeat searches",
    "city.footer": (city) => `SeatMap · Find a seated toilet in ${city} in under 10 seconds.`,
  },
  es: {
    "nav.nearby": "Cerca",
    "nav.report": "Reportar",
    "home.srSubtitle": "Encuentra baños con inodoro cerca en China",
    "home.subtitle": "Encuentra un baño con inodoro cerca en China",
    "home.saved": "Guardados",
    "home.you": "Tú",
    "home.locatingTitle": "Buscando tu ubicación...",
    "home.locatingCaption": "Ya estás en buenas manos",
    "home.tryLocation": "Intentar ubicación otra vez",
    "home.findNearby": "Buscar baño con inodoro cercano",
    "home.requestLocation": "Pedir ubicación del navegador",
    "home.searchRadius": "Buscar en radio de 20 km",
    "home.mapCheck": "Comprobación del mapa",
    "home.tapToLocate": "Toca para ubicarte",
    "home.checking": "Comprobando",
    "home.locationNeeded": "Ubicación necesaria",
    "home.openedCities": "Ciudades abiertas",
    "home.viewOpenedCities": "Ver ciudades abiertas",
    "home.openedCitiesDescription":
      "Las vistas previas manuales están disponibles en estos destinos populares.",
    "home.currentSearchArea": "Zona actual de búsqueda",
    "home.openedResultsNearYou": (count) => `${count} resultados cerca de ti`,
    "home.areaNotOpen": (region) => `No hay resultados cercanos en ${region}`,
    "home.checkingCity": "Comprobando tu zona actual",
    "home.mapPreviewCurrent": "La vista del mapa usa tu zona actual de búsqueda.",
    "home.turnOnLocation": "Activa la ubicación del navegador o elige una ciudad abierta abajo.",
    "home.thisArea": "Esta zona",
    "home.locationUnavailable": "Ubicación no disponible",
    "home.noMapBeforeLocation": "Sin mapa antes de ubicarte",
    "home.noMapHint": "Toca el botón verde para ver un mapa real de tu zona de búsqueda.",
    "home.nearestOptions": "Opciones más cercanas",
    "home.serviceNotOpen": "Sin resultados cercanos",
    "home.readyWhen": "Listo cuando quieras",
    "home.sortedByDistance": "Ordenado por distancia",
    "home.noToilets": "No se encontraron baños en 20 km. Muévete un poco e intenta otra vez.",
    "home.unsupported": (region, supported) =>
      `No se encontraron baños con inodoro para viajeros cerca de ${region}. Intenta otra vez cerca o elige una vista manual: ${supported}.`,
    "home.reportSeated": "Reportar un baño con inodoro",
    "home.readyCopy":
      "Toca el botón verde de arriba.\nTe mostraremos opciones cómodas para viajeros en segundos.",
    "home.paywallTitle": "Pase de viaje SeatMap",
    "home.paywallDescription":
      "Desbloquea toda la lista, los detalles de navegación y acceso ilimitado durante tu viaje.",
    "home.unlimited": "Búsquedas ilimitadas",
    "home.days": (days) => `${days} ${Number(days) === 1 ? "día" : "días"}`,
    "home.lifetime": "Acceso de por vida",
    "home.saveAbout": (percent) => `Ahorra aprox. ${percent}%`,
    "home.best": "Mejor",
    "home.earnSearch": "Gana una búsqueda gratis",
    "home.shareExplain":
      "Envía SeatMap a un amigo. Cuando abra tu enlace, tú recibes una búsqueda gratis extra.",
    "home.shareButton": "Compartir para ganar 1 búsqueda",
    "home.preparingLink": "Preparando enlace...",
    "home.noAccount": "Sin cuenta · Apple Pay / Google Pay disponible",
    "home.shareSent": "Compartido",
    "home.shareCopied": "Enlace copiado",
    "home.shareUnavailable": "Enlace no disponible",
    "home.shareUnavailableDescription":
      "La base de referidos puede no estar lista. Inténtalo después del despliegue.",
    "home.shareEarnDescription": "Recibes una búsqueda gratis extra cuando un amigo lo abre.",
    "home.shareFailed": "No se pudo compartir",
    "home.shareFailedDescription": "Copia la URL de la página e inténtalo otra vez.",
    "home.openedSeatMap": "Gracias por abrir SeatMap",
    "home.friendEarned": "Tu amigo ganó una búsqueda gratis extra.",
    "home.rewardSaveFailed": "No se pudo guardar la recompensa",
    "home.rewardSaveFailedDescription": "SeatMap funciona igual, pero no se registró el referido.",
    "home.freeSearchEarned": "Búsqueda gratis ganada",
    "home.sharedSearches": (count) =>
      `Tienes ${count} ${Number(count) === 1 ? "búsqueda gratis compartida" : "búsquedas gratis compartidas"}.`,
    "card.minWalk": "min caminando",
    "card.indoor": "Interior",
    "card.accessible": "Accesible",
    "card.nursery": "Sala familiar",
    "card.public": "Público",
    "card.city": "Ciudad",
    "card.preview": "vista previa",
    "card.away": (distance) => `a ${distance} m`,
    "card.needsConfirmation": "Por confirmar",
    "card.likelyWestern": "Inodoro occidental",
    "card.previewVenue": "Lugar abierto en esta ciudad",
    "card.topRated": "Mejor valorado",
    "card.entries": (count) => `${count} resultados`,
    "card.navigate": "Navegar",
    "card.needsSeated": "Falta confirmar inodoro",
    "card.useLocation": "Usa tu ubicación para navegar",
    "card.alreadySaved": "Ya guardado",
    "card.saved": "Guardado en este dispositivo",
    "card.alreadySavedDescription": "Este lugar ya está en tu lista.",
    "card.savedDescription": "Los guardados se quedan solo en este navegador.",
    "card.view": "Ver",
    "card.savedToilet": "Baño guardado",
    "card.saveToilet": "Guardar baño",
    "card.unlockResults": "Desbloquear resultados",
    "map.openInMaps": "Abrir en mapas",
    "map.chooseApp": "Elige tu app de navegación.",
    "review.title": "Reseña",
    "review.helper":
      "Nos esforzamos por ofrecer información fiable sobre baños con inodoro y salas de lactancia. Tu opinión nos ayuda mucho.",
    "complaint.title": "Reportar este lugar",
    "complaint.reason": "¿Qué problema hay?",
    "complaint.noSeated": "No hay inodoro sentado",
    "complaint.noNursery": "No hay sala de lactancia",
    "complaint.description": "Descripción",
    "complaint.descriptionPlaceholder":
      "Detalles opcionales, piso, entrada o lo que encontraste...",
    "complaint.helper":
      "Nos esforzamos por ofrecer información fiable sobre baños con inodoro y salas de lactancia. Tu opinión nos ayuda mucho.",
    "complaint.submit": "Enviar reporte",
    "complaint.submitting": "Enviando",
    "complaint.thanks": "Gracias por reportar este lugar. Lo verificaremos.",
    "complaint.outOfRange": "Debes estar a menos de 1 km de este lugar para reportarlo.",
    "complaint.locationNeeded":
      "Se necesita acceso a tu ubicación para reportar este lugar dentro de 1 km.",
    "complaint.missingPlace": "No se puede reportar este lugar porque faltan datos de ubicación.",
    "complaint.placeNameNeeded": "Agrega el nombre del lugar antes de enviar el reporte.",
    "city.back": "Volver",
    "city.publicToilets": (city) => `Baños públicos en ${city}`,
    "city.tagline": "Baños limpios con inodoro para viajeros",
    "city.currentArea": "Zona actual de búsqueda",
    "city.cityPreview": "Vista previa de ciudad",
    "city.resultsNearYou": (city) => `Resultados cerca de ti en ${city}`,
    "city.previewTitle": (city) => `Vista previa de ${city}`,
    "city.distanceUsesLocation": "Las distancias y navegación usan tu ubicación actual.",
    "city.homeNavigationHint":
      "Usa el botón verde de la página principal para navegar desde tu ubicación actual.",
    "city.previewMode": "Modo vista previa",
    "city.previewExplain": (city) =>
      `Estos son lugares seleccionados en ${city}, no distancias en vivo desde tu ubicación actual. Usa la búsqueda principal para navegar desde tu ubicación.`,
    "city.travelerTip": "Consejo para viajeros",
    "city.neighborhoods": "Mejores zonas para encontrar uno",
    "city.loading": "Cargando...",
    "city.liveLocations": (count) => `${count} lugares seleccionados`,
    "city.liveFromAmap": "Lista fija de vista previa",
    "city.noPublic": (city) => `No se encontraron baños públicos en ${city}.`,
    "city.whyUse": (city) => `Por qué usar SeatMap en ${city}`,
    "city.reason1": "Los lugares seleccionados priorizan la probabilidad de inodoro sentado",
    "city.reason2": "Prioriza centros comerciales, hoteles y lugares cómodos para viajeros",
    "city.reason3": "Destaca opciones de entrada gratuita",
    "city.reason4": "Los resultados de AMap se guardan para búsquedas rápidas",
    "city.footer": (city) =>
      `SeatMap · Encuentra un baño con inodoro en ${city} en menos de 10 segundos.`,
  },
} satisfies Record<Locale, Record<string, TranslationValue>>;

export type TranslationKey = keyof (typeof translations)["en"];

export function useT() {
  const locale = useLocale();
  const translate = useCallback(
    (key: TranslationKey, ...args: Array<string | number>) => {
      const value = translations[locale][key] ?? translations.en[key];
      return typeof value === "function" ? value(...args) : value;
    },
    [locale],
  );
  return { locale, t: translate };
}
