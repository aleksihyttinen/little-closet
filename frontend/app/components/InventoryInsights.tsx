"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { generateOutfit } from "../api";
import type { Language, Messages } from "../messages";
import type { ClothingItem, OutfitWeather, SizeOption } from "../types";

type InventoryInsightsProps = {
  items: ClothingItem[];
  sizes: SizeOption[];
  language: Language;
  loading: boolean;
  t: Messages;
  getCategoryName: (item: ClothingItem) => string;
  getSizeName: (item: ClothingItem) => string;
};

type UnitData = {
  id: string;
  name: string;
  units: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type OutfitSuggestion = {
  outfit: string;
  weather: OutfitWeather;
  language: Language;
};

type LocationErrorKey =
  | "locationPermissionDenied"
  | "locationUnavailable"
  | "locationTimeout"
  | "locationNotSupported";

type OutfitErrorKey = LocationErrorKey | "weatherOutfitError";

const categoryColors = [
  "#315c4c",
  "#d7a45b",
  "#638d9a",
  "#bb735c",
  "#8e9c62",
  "#7b718d",
  "#cf8c82",
  "#526a7a",
];

function getBrowserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("locationNotSupported" satisfies LocationErrorKey);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({
        latitude: coords.latitude,
        longitude: coords.longitude,
      }),
      (error) => {
        const errorKey: LocationErrorKey =
          error.code === error.PERMISSION_DENIED
            ? "locationPermissionDenied"
            : error.code === error.TIMEOUT
              ? "locationTimeout"
              : "locationUnavailable";
        reject(errorKey);
      },
      { enableHighAccuracy: false, maximumAge: 600_000, timeout: 10_000 },
    );
  });
}

function isLocationErrorKey(error: unknown): error is LocationErrorKey {
  return error === "locationPermissionDenied"
    || error === "locationUnavailable"
    || error === "locationTimeout"
    || error === "locationNotSupported";
}

export default function InventoryInsights({
  items,
  sizes,
  language,
  loading,
  t,
  getCategoryName,
  getSizeName,
}: InventoryInsightsProps) {
  const locale = language === "fi" ? "fi-FI" : "en-US";
  const numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const coordinates = useRef<Coordinates | null>(null);
  const locationRequest = useRef<Promise<Coordinates> | null>(null);
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [outfitError, setOutfitError] = useState<{
    key: OutfitErrorKey;
    language: Language;
  } | null>(null);

  useEffect(() => {
    let active = true;

    const loadOutfit = async () => {
      try {
        const location = coordinates.current ?? await (
          locationRequest.current ??= getBrowserLocation()
        );
        if (!active) return;
        coordinates.current = location;
        locationRequest.current = null;

        const result = await generateOutfit(
          location.latitude,
          location.longitude,
          language,
        );
        if (active) {
          setSuggestion({ ...result, language });
          setSuggestionOpen(false);
          setOutfitError(null);
        }
      } catch (error) {
        if (active) {
          if (!coordinates.current) locationRequest.current = null;
          setOutfitError({
            key: isLocationErrorKey(error) ? error : "weatherOutfitError",
            language,
          });
        }
      }
    };

    void loadOutfit();
    return () => {
      active = false;
    };
  }, [language]);

  const categoryTotals = new Map<string, UnitData>();
  for (const item of items) {
    const existing = categoryTotals.get(item.category_id);
    categoryTotals.set(item.category_id, {
      id: item.category_id,
      name: getCategoryName(item),
      units: (existing?.units ?? 0) + item.quantity,
    });
  }
  const categoryData = [...categoryTotals.values()].filter((entry) => entry.units > 0);

  const sizeData: UnitData[] = [...sizes]
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .map((size) => ({
      id: size.id,
      name: size.name,
      units: items
        .filter((item) => item.size_id === size.id)
        .reduce((total, item) => total + item.quantity, 0),
    }));

  const recentItems = [...items]
    .sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))
    .slice(0, 5);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : dateFormat.format(date);
  };

  const formatUnits = (value: number | string | undefined) =>
    `${numberFormat.format(Number(value ?? 0))} ${t.unitsLabel}`;

  return (
    <section className="mb-8 border-y border-[#cdd4cd] py-5" aria-labelledby="inventory-insights-title">
      <h2 id="inventory-insights-title" className="mb-5 text-lg font-semibold text-[#293730]">
        {t.inventoryInsights}
      </h2>
      <div className="mb-7 border-b border-[#e1e5df] pb-5">
        <h3 className="text-sm font-semibold text-[#45534b]">{t.weatherOutfitTitle}</h3>
        {outfitError?.language === language ? (
          <p role="alert" className="mt-3 text-sm text-[#8c3928]">{t[outfitError.key]}</p>
        ) : null}
        {!suggestion || suggestion.language !== language ? (
          !outfitError || outfitError.language !== language ? (
            <p role="status" className="mt-3 text-sm text-[#68746d]">
              {t.loadingWeatherOutfit}
            </p>
          ) : null
        ) : (
          <div className="mt-4" aria-live="polite">
            <div className="border-l-2 border-[#94adb0] bg-white/70 px-4 py-3">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">
                {t.currentWeather}
              </h4>
              <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#34433b]">
                <span>
                  {numberFormat.format(suggestion.weather.current.temperature_2m)} °C
                </span>
                <span>
                  {t.feelsLike} {numberFormat.format(suggestion.weather.current.apparent_temperature)} °C
                </span>
                <span>
                  {t.wind} {numberFormat.format(suggestion.weather.current.wind_speed_10m)} km/h
                </span>
                <span>
                  {t.precipitation} {numberFormat.format(suggestion.weather.current.precipitation)} mm
                </span>
              </p>
            </div>
            <button
              type="button"
              aria-expanded={suggestionOpen}
              aria-controls="weather-outfit-suggestion"
              onClick={() => setSuggestionOpen((open) => !open)}
              className="mt-3 min-h-10 rounded-md border border-[#cbd3ca] bg-white px-4 text-sm font-semibold text-[#315c4c] transition hover:bg-[#f4f6f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315c4c]"
            >
              {suggestionOpen ? t.hideOutfitSuggestion : t.showOutfitSuggestion}
            </button>
            {suggestionOpen ? (
              <p
                id="weather-outfit-suggestion"
                className="mt-4 whitespace-pre-line text-sm leading-6 text-[#34433b]"
              >
                {suggestion.outfit}
              </p>
            ) : null}
          </div>
        )}
      </div>
      <div className="grid gap-7 lg:grid-cols-3 lg:gap-0">
        <section className="min-w-0 lg:pr-6">
          <h3 className="mb-3 text-sm font-semibold text-[#45534b]">{t.unitsByCategory}</h3>
          {loading ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.loading}</p>
          ) : categoryData.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.noChartData}</p>
          ) : (
            <>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart accessibilityLayer>
                    <Pie
                      data={categoryData}
                      dataKey="units"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={86}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={entry.id} fill={categoryColors[index % categoryColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatUnits(value as number | string | undefined)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 grid max-h-36 gap-x-4 gap-y-1 overflow-y-auto text-xs sm:grid-cols-2">
                {categoryData.map((entry, index) => (
                  <li key={entry.id} className="flex min-w-0 items-center gap-2 text-[#59675e]">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                    />
                    <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                    <span className="shrink-0 font-medium tabular-nums">{numberFormat.format(entry.units)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section className="min-w-0 border-[#e1e5df] lg:border-l lg:px-6">
          <h3 className="mb-3 text-sm font-semibold text-[#45534b]">{t.unitsBySize}</h3>
          {loading ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.loading}</p>
          ) : sizeData.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.noChartData}</p>
          ) : (
            <div className="w-full" style={{ height: `${Math.max(320, sizeData.length * 28)}px` }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  accessibilityLayer
                  data={sizeData}
                  layout="vertical"
                  margin={{ top: 2, right: 12, bottom: 2, left: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#e5e9e2" />
                  <XAxis type="number" allowDecimals={false} hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    interval={0}
                    minTickGap={0}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#59675e", fontSize: 12 }}
                  />
                  <Tooltip formatter={(value) => formatUnits(value as number | string | undefined)} />
                  <Bar dataKey="units" fill="#638d9a" radius={[0, 3, 3, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="min-w-0 border-[#e1e5df] lg:border-l lg:pl-6">
          <h3 className="mb-3 text-sm font-semibold text-[#45534b]">{t.recentlyUpdated}</h3>
          {loading ? (
            <p className="py-8 text-sm text-[#68746d]">{t.loading}</p>
          ) : recentItems.length === 0 ? (
            <p className="py-8 text-sm text-[#68746d]">{t.noRecentUpdates}</p>
          ) : (
            <ol className="divide-y divide-[#e8ebe6]">
              {recentItems.map((item) => (
                <li key={item.id} className="py-3 first:pt-0">
                  <p className="truncate text-sm font-medium text-[#34433b]">{item.name}</p>
                  <p className="mt-1 truncate text-xs text-[#68746d]">
                    {getCategoryName(item)} · {getSizeName(item)} · {formatUnits(item.quantity)}
                  </p>
                  <time dateTime={item.updated_at} className="mt-1 block text-xs text-[#718077]">
                    {formatDate(item.updated_at)}
                  </time>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </section>
  );
}
