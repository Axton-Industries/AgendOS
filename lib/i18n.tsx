"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

export type Lang = "en" | "es";

const translations = {
  en: {
    // Global
    agendos: "AGENDOS",
    modules: "Modules",
    settings: "Settings",
    today: "Today",
    send: "Send",
    search: "Search",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    cancel: "Cancel",
    close: "Close",
    loading: "Loading…",
    thinking: "thinking…",
    version: "v0.1",

    // Sidebar
    expandSidebar: "Expand sidebar",
    collapseSidebar: "Collapse sidebar",
    openMenu: "Open menu",
    openSettings: "Open settings",
    switchToLight: "Switch to light",
    switchToDark: "Switch to dark",
    toggleTheme: "Toggle dark/light mode",

    // Modules
    dailyBrief: "Daily Brief",
    aiAssistant: "AI Assistant",
    calendar: "Calendar",
    weather: "Weather",
    balance: "Balance",
    notes: "Notes",
    health: "Health",
    maps: "Maps",
    news: "News",
    notifications: "Notifications",

    // Brief page
    weatherLabel: "Weather",
    feelsLike: "Feels like",
    chanceOfRain: "chance of rain",
    weatherUnavailable: "Weather unavailable",
    balanceLabel: "Balance",
    thisMonth: "this month",
    noEventsToday: "No events today.",
    upcoming: "Upcoming",

    // Assistant dock
    closeAssistant: "Close assistant",
    askAssistant: "Ask the assistant",
    assistantTitle: "ASSISTANT",
    listening: "● listening",
    assistantHint: 'Ask me about your data or anything online. Try: "What\'s on my calendar tomorrow?", "Read me the latest tech news", or just speak.',
    askAnything: "Ask me anything…",
    speakInstead: "Speak instead of typing",

    // Assistant page
    assistantPageTitle: "AI Assistant",
    assistantPageHint: "Ask me anything about your day. Try:",
    assistantHint1: '"What do I have tomorrow?"',
    assistantHint2: '"Create a meeting tomorrow at 10."',
    assistantHint3: '"How much did I spend this month?"',
    assistantHint4: '"Will it rain during my next event?"',
    askAssistantPlaceholder: "Ask your assistant…",

    // Calendar
    month: "Month",
    week: "Week",
    agenda: "Agenda",
    next30Days: "Next 30 days",
    weekOf: "Week of",
    event: "Event",
    newEvent: "New event",
    editEvent: "Edit event",
    createEvent: "Create event",
    saveChanges: "Save changes",
    date: "Date",
    start: "Start",
    end: "End",
    title: "Title",
    location: "Location",
    locationOptional: "Location (optional)",
    description: "Description",
    descriptionOptional: "Description (optional)",
    category: "Category",
    noEventsNext30: "No events in the next 30 days.",
    mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
    more: "more",
    moreEvents: "+{n} more",
    prev: "←",
    next: "→",
    percentRain: "{n}% rain",

    // Calendar categories
    catDefault: "Default",
    catWork: "Work",
    catPersonal: "Personal",
    catHealth: "Health",
    catSocial: "Social",

    // Weather page
    weatherPageTitle: "Weather",
    searchLocation: "Search location…",
    rain: "Rain",
    wind: "Wind",
    humidity: "Humidity",
    hourly: "Hourly",
    forecast7day: "7-day forecast",
    noResults: "No results for",

    // Balance page
    balancePageTitle: "Balance",
    currentBalance: "Current balance",
    incomeThisMonth: "Income this month",
    spentThisMonth: "Spent this month",
    spendingByCategory: "Spending by category (this month)",
    addTransaction: "Add transaction",
    recentTransactions: "Recent transactions",
    expense: "expense",
    income: "income",
    amount: "Amount (€)",
    descriptionExample: "Description (e.g.",
    categoryExample: "Category (e.g.",
    groceries: "Groceries",
    salary: "Salary",
    food: "Food",
    work: "Work",
    noTransactions: "No transactions yet.",
    incomeFallback: "Income",
    expenseFallback: "Expense",

    // Notes page
    notesPageTitle: "Notes",
    searchNotes: "Search notes…",
    noNotes: "No notes",
    matchingSearch: " matching your search",
    yet: " yet",
    note: "Note",
    newNote: "New note",
    editNote: "Edit note",
    writeSomething: "Write something…",
    deleteNote: "Delete this note?",
    saveNote: "Save",
    addNote: "+ Note",

    // Health page
    healthPageTitle: "Health",
    avgSleep: "Avg sleep (7d)",
    avgSteps: "Avg steps (7d)",
    avgWeight: "Avg weight (7d)",
    avgHR: "Avg resting HR (7d)",
    logMetrics: "Log metrics",
    sleep: "Sleep (h)",
    steps: "Steps",
    weight: "Weight (kg)",
    restingHR: "Resting HR",
    noteOptional: "Note (optional)",
    saveMetrics: "Save metrics",
    recentEntries: "Recent entries",
    noEntries: "No entries yet.",
    healthNote: "Manual tracking for now — Garmin / Apple Health / Fitbit / Oura integrations can be added to the health service later.",
    sleepLabel: "Sleep (h)",
    stepsLabel: "Steps",
    weightLabel: "Weight (kg)",
    restingHRLabel: "Resting HR",
    hoursAbbrev: "{n} h",
    kgAbbrev: "{n} kg",
    bpmAbbrev: "{n} bpm",
    hoursSuffix: "{n}h",
    stepsSuffix: "{n} steps",

    // Maps page
    mapsPageTitle: "Maps",
    savedPlaces: "Saved places",
    searchPlaceToSave: "Search a place to save…",
    directions: "Directions",
    from: "From (e.g. Valladolid)",
    to: "To (e.g. Salamanca)",
    car: "Car",
    bike: "Bike",
    onFoot: "On foot",
    getRoute: "Get route",
    openDirections: "Open directions on OpenStreetMap →",
    noSavedPlaces: "No saved places yet.",
    selectPlaceHint: "Select a saved place to view it on the map.",
    routeInfo: "{km} km · {min} min by {mode}",

    // News page
    newsPageTitle: "News",
    all: "All",
    world: "World",
    tech: "Tech",
    sport: "Sport",
    loadingFeeds: "Loading feeds…",
    noHeadlines: "No headlines available right now.",
    newsFooter: "Headlines from BBC and The Guardian RSS feeds. Ask the AI to summarize them.",

    // Notifications page
    notificationsPageTitle: "Notifications",
    attentionToday: "Nothing needs your attention today.",
    newReminder: "New reminder",
    addReminder: "Add reminder",
    reminders: "Reminders",
    showDone: "Show done",
    noReminders: "No reminders.",
    notificationsFooter: "In-app reminders and calendar notifications for now — external email integration (IMAP/Gmail) can be added to this module later.",
    reminderPlaceholder: "e.g. Call the dentist",

    // Settings page
    settingsPageTitle: "Settings",
    settingsDescription: "Configure how AgendOS connects to external services.",
    apis: "API's",
    quickSetup: "Quick setup",
    getKey: "Get a free key →",
    baseUrl: "Base URL",
    model: "Model",
    noModelsLoaded: 'No models loaded — press "Load models".',
    loadModels: "Load models",
    reloadModels: "Reload",
    modelsAvailable: "{n} models available — grouped by tier.",
    modelsFree: "Free models",
    modelsPaid: "Paid models",
    modelsAll: "All models",
    saveFailed: "Save failed",
    couldNotLoadModels: "Could not load models",
    apiKey: "API Key",
    apiKeyPlaceholder: "•••••••• (already set, leave blank to keep)",
    apiKeyPlaceholderNew: "sk-…",
    savedMsg: "Saved.",
    test: "Test",
    connected: "connected — model replied",
    saveConfig: "Save configuration",
    testConnection: "Test connection",
    testing: "Testing…",
    couldNotLoad: "Could not load settings",
    presetLocalNote: "Runs on your machine — works instantly, no key needed.",
    presetKeyNote: "Needs your free key — get one from the link, paste it in the key field.",

    // Language
    language: "Idioma",
    english: "English",
    spanish: "Español",
  },
  es: {
    // Global
    agendos: "AGENDOS",
    modules: "Módulos",
    settings: "Ajustes",
    today: "Hoy",
    send: "Enviar",
    search: "Buscar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    add: "Añadir",
    cancel: "Cancelar",
    close: "Cerrar",
    loading: "Cargando…",
    thinking: "pensando…",
    version: "v0.1",

    // Sidebar
    expandSidebar: "Expandir barra lateral",
    collapseSidebar: "Contraer barra lateral",
    openMenu: "Abrir menú",
    openSettings: "Abrir ajustes",
    switchToLight: "Cambiar a modo claro",
    switchToDark: "Cambiar a modo oscuro",
    toggleTheme: "Alternar modo oscuro/claro",

    // Modules
    dailyBrief: "Resumen Diario",
    aiAssistant: "Asistente IA",
    calendar: "Calendario",
    weather: "Clima",
    balance: "Balance",
    notes: "Notas",
    health: "Salud",
    maps: "Mapas",
    news: "Noticias",
    notifications: "Notificaciones",

    // Brief page
    weatherLabel: "Clima",
    feelsLike: "Sensación",
    chanceOfRain: "probabilidad de lluvia",
    weatherUnavailable: "Clima no disponible",
    balanceLabel: "Balance",
    thisMonth: "este mes",
    noEventsToday: "Sin eventos hoy.",
    upcoming: "Próximos",

    // Assistant dock
    closeAssistant: "Cerrar asistente",
    askAssistant: "Preguntar al asistente",
    assistantTitle: "ASISTENTE",
    listening: "● escuchando",
    assistantHint: 'Pregúntame sobre tus datos o cualquier cosa online. Prueba: "¿Qué tengo en el calendario mañana?", "Lee las últimas noticias de tecnología", o simplemente habla.',
    askAnything: "Pregúntame algo…",
    speakInstead: "Hablar en lugar de escribir",

    // Assistant page
    assistantPageTitle: "Asistente IA",
    assistantPageHint: "Pregúntame lo que quieras sobre tu día. Prueba:",
    assistantHint1: '"¿Qué tengo mañana?"',
    assistantHint2: '"Crea una reunión mañana a las 10."',
    assistantHint3: '"¿Cuánto gasté este mes?"',
    assistantHint4: '"¿Lloverá durante mi próximo evento?"',
    askAssistantPlaceholder: "Pregúntale a tu asistente…",

    // Calendar
    month: "Mes",
    week: "Semana",
    agenda: "Agenda",
    next30Days: "Próximos 30 días",
    weekOf: "Semana del",
    event: "Evento",
    newEvent: "Nuevo evento",
    editEvent: "Editar evento",
    createEvent: "Crear evento",
    saveChanges: "Guardar cambios",
    date: "Fecha",
    start: "Inicio",
    end: "Fin",
    title: "Título",
    location: "Ubicación",
    locationOptional: "Ubicación (opcional)",
    description: "Descripción",
    descriptionOptional: "Descripción (opcional)",
    category: "Categoría",
    noEventsNext30: "Sin eventos en los próximos 30 días.",
    mon: "Lun", tue: "Mar", wed: "Mié", thu: "Jue", fri: "Vie", sat: "Sáb", sun: "Dom",
    more: "más",
    moreEvents: "+{n} más",
    prev: "←",
    next: "→",
    percentRain: "{n}% lluvia",

    // Calendar categories
    catDefault: "Predeterminada",
    catWork: "Trabajo",
    catPersonal: "Personal",
    catHealth: "Salud",
    catSocial: "Social",

    // Weather page
    weatherPageTitle: "Clima",
    searchLocation: "Buscar ubicación…",
    rain: "Lluvia",
    wind: "Viento",
    humidity: "Humedad",
    hourly: "Por hora",
    forecast7day: "Pronóstico 7 días",
    noResults: "Sin resultados para",

    // Balance page
    balancePageTitle: "Balance",
    currentBalance: "Balance actual",
    incomeThisMonth: "Ingresos este mes",
    spentThisMonth: "Gastado este mes",
    spendingByCategory: "Gasto por categoría (este mes)",
    addTransaction: "Añadir transacción",
    recentTransactions: "Transacciones recientes",
    expense: "gasto",
    income: "ingreso",
    amount: "Cantidad (€)",
    descriptionExample: "Descripción (ej.",
    categoryExample: "Categoría (ej.",
    groceries: "Compras",
    salary: "Salario",
    food: "Comida",
    work: "Trabajo",
    noTransactions: "Sin transacciones aún.",
    incomeFallback: "Ingreso",
    expenseFallback: "Gasto",

    // Notes page
    notesPageTitle: "Notas",
    searchNotes: "Buscar notas…",
    noNotes: "Sin notas",
    matchingSearch: " que coincidan con tu búsqueda",
    yet: " aún",
    note: "Nota",
    newNote: "Nueva nota",
    editNote: "Editar nota",
    writeSomething: "Escribe algo…",
    deleteNote: "¿Eliminar esta nota?",
    saveNote: "Guardar",
    addNote: "+ Nota",

    // Health page
    healthPageTitle: "Salud",
    avgSleep: "Sueño medio (7d)",
    avgSteps: "Pasos medios (7d)",
    avgWeight: "Peso medio (7d)",
    avgHR: "FC reposo media (7d)",
    logMetrics: "Registrar métricas",
    sleep: "Sueño (h)",
    steps: "Pasos",
    weight: "Peso (kg)",
    restingHR: "FC reposo",
    noteOptional: "Nota (opcional)",
    saveMetrics: "Guardar métricas",
    recentEntries: "Entradas recientes",
    noEntries: "Sin entradas aún.",
    healthNote: "Seguimiento manual por ahora — se pueden integrar Garmin / Apple Health / Fitbit / Oura más adelante.",
    sleepLabel: "Sueño (h)",
    stepsLabel: "Pasos",
    weightLabel: "Peso (kg)",
    restingHRLabel: "FC reposo",
    hoursAbbrev: "{n} h",
    kgAbbrev: "{n} kg",
    bpmAbbrev: "{n} bpm",
    hoursSuffix: "{n}h",
    stepsSuffix: "{n} pasos",

    // Maps page
    mapsPageTitle: "Mapas",
    savedPlaces: "Lugares guardados",
    searchPlaceToSave: "Buscar un lugar para guardar…",
    directions: "Direcciones",
    from: "Desde (ej. Valladolid)",
    to: "Hasta (ej. Salamanca)",
    car: "Coche",
    bike: "Bicicleta",
    onFoot: "A pie",
    getRoute: "Obtener ruta",
    openDirections: "Abrir direcciones en OpenStreetMap →",
    noSavedPlaces: "Sin lugares guardados aún.",
    selectPlaceHint: "Selecciona un lugar guardado para verlo en el mapa.",
    routeInfo: "{km} km · {min} min en {mode}",

    // News page
    newsPageTitle: "Noticias",
    all: "Todas",
    world: "Mundo",
    tech: "Tecnología",
    sport: "Deportes",
    loadingFeeds: "Cargando feeds…",
    noHeadlines: "No hay titulares disponibles ahora mismo.",
    newsFooter: "Titulares de BBC y The Guardian RSS. Pide a la IA que los resuma.",

    // Notifications page
    notificationsPageTitle: "Notificaciones",
    attentionToday: "Nada requiere tu atención hoy.",
    newReminder: "Nuevo recordatorio",
    addReminder: "Añadir recordatorio",
    reminders: "Recordatorios",
    showDone: "Mostrar completados",
    noReminders: "Sin recordatorios.",
    notificationsFooter: "Recordatorios y notificaciones de calendario por ahora — se puede integrar correo externo (IMAP/Gmail) más adelante.",
    reminderPlaceholder: "ej. Llamar al dentista",

    // Settings page
    settingsPageTitle: "Ajustes",
    settingsDescription: "Configura cómo AgendOS se conecta a servicios externos.",
    apis: "API's",
    quickSetup: "Configuración rápida",
    getKey: "Obtener clave gratis →",
    baseUrl: "URL base",
    model: "Modelo",
    noModelsLoaded: 'Sin modelos cargados — pulsa "Cargar modelos".',
    loadModels: "Cargar modelos",
    reloadModels: "Recargar",
    modelsAvailable: "{n} modelos disponibles — agrupados por categoría.",
    modelsFree: "Modelos gratis",
    modelsPaid: "Modelos de pago",
    modelsAll: "Todos los modelos",
    saveFailed: "Error al guardar",
    couldNotLoadModels: "No se pudieron cargar los modelos",
    apiKey: "Clave API",
    apiKeyPlaceholder: "•••••••• (ya configurada, deja en blanco para mantener)",
    apiKeyPlaceholderNew: "sk-…",
    savedMsg: "Guardado.",
    test: "Test",
    connected: "conectado — el modelo respondió",
    saveConfig: "Guardar configuración",
    testConnection: "Probar conexión",
    testing: "Probando…",
    couldNotLoad: "No se pudieron cargar los ajustes",
    presetLocalNote: "Se ejecuta en tu máquina — funciona al instante, sin clave.",
    presetKeyNote: "Necesita tu clave gratuita — consíguela en el enlace y pégala en el campo de clave.",

    // Language
    language: "Idioma",
    english: "English",
    spanish: "Español",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("agendos-lang");
      if (saved === "en" || saved === "es") setLangState(saved);
    } catch {}
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem("agendos-lang", l); } catch {}
    document.documentElement.lang = l;
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    let str: string = translations[lang][key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useTranslations must be used within I18nProvider");
  return ctx;
}
