"use client";

import { useRef, useState, useSyncExternalStore } from "react";
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
import { generateOutfit, type ApiMode } from "../api";
import type { Language, Messages } from "../messages";
import type { ClothingItem, OutfitWeather, SizeOption } from "../types";

type InventoryInsightsProps = {
  items: ClothingItem[];
  sizes: SizeOption[];
  totalUnits: number;
  language: Language;
  loading: boolean;
  t: Messages;
  getCategoryName: (item: ClothingItem) => string;
  getSizeName: (item: ClothingItem) => string;
  apiMode?: ApiMode;
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
  "#315c4c", // deep green
  "#d7a45b", // ochre
  "#638d9a", // muted blue
  "#bb735c", // terracotta
  "#8e9c62", // olive
  "#7b718d", // muted purple
  "#cf8c82", // dusty rose
  "#526a7a", // slate blue
  "#9b7b5b", // warm brown
  "#6f927c", // sage
  "#b38b9b", // dusty mauve
  "#c28f5c", // caramel
  "#668b8b", // muted teal
  "#9a8f65", // khaki
  "#7d6b5d", // taupe
  "#a66f67", // muted brick
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

const desktopQuery = "(hover: hover) and (pointer: fine)";

function subscribeToDesktop(callback: () => void) {
  const media = window.matchMedia(desktopQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

// Chart animations block touch input on iOS, so only animate on desktop pointers.
function useChartAnimation() {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  );
}

export default function InventoryInsights({
  items,
  sizes,
  totalUnits,
  language,
  loading,
  t,
  getCategoryName,
  getSizeName,
  apiMode = "authenticated",
}: InventoryInsightsProps) {
  const locale = language === "fi" ? "fi-FI" : "en-US";
  const numberFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });
  const dateFormat = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
  const coordinates = useRef<Coordinates | null>(null);
  const locationRequest = useRef<Promise<Coordinates> | null>(null);
  const animateCharts = useChartAnimation();
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);
  const generatingSuggestionRef = useRef(false);
  const [outfitError, setOutfitError] = useState<{
    key: OutfitErrorKey;
    language: Language;
  } | null>(null);

  const generateWeatherOutfit = async () => {
    if (generatingSuggestionRef.current) return;
    if (suggestion?.language === language) {
      setSuggestionOpen((open) => !open);
      return;
    }

    generatingSuggestionRef.current = true;
    setGeneratingSuggestion(true);
    setOutfitError(null);

    try {
      const location = coordinates.current ?? await (
        locationRequest.current ??= getBrowserLocation()
      );
      coordinates.current = location;
      locationRequest.current = null;

      const result = await generateOutfit(
        location.latitude,
        location.longitude,
        language,
        apiMode,
      );
      setSuggestion({ ...result, language });
      setSuggestionOpen(true);
    } catch (error) {
      if (!coordinates.current) locationRequest.current = null;
      setOutfitError({
        key: isLocationErrorKey(error) ? error : "weatherOutfitError",
        language,
      });
    } finally {
      generatingSuggestionRef.current = false;
      setGeneratingSuggestion(false);
    }
  };

  const categoryTotals = new Map<string, UnitData>();
  for (const item of items) {
    const existing = categoryTotals.get(item.category_id);
    categoryTotals.set(item.category_id, {
      id: item.category_id,
      name: getCategoryName(item),
      units: (existing?.units ?? 0) + 1,
    });
  }
  const categoryData = [...categoryTotals.values()].filter((entry) => entry.units > 0);

  type SizeByCategory = {
    name: string;
    [key: string]: number | string;
  };

  const sizeData: SizeByCategory[] = [...sizes]
    .sort((left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name))
    .map((size) => {
      const row: SizeByCategory = { name: size.name };
      for (const item of items.filter((item) => item.size_id === size.id)) {
        const categoryId = item.category_id;
        row[categoryId] = (row[categoryId] as number | undefined ?? 0) + 1;
      }
      return row;
    })
    .filter((row) => Object.values(row).some((v, i) => i > 0 && typeof v === "number" && v > 0));

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
    <section aria-labelledby="inventory-insights-title">
      <h2 id="inventory-insights-title" className="mb-5 text-lg font-semibold text-[#45534b]">
        {t.inventoryInsights}
      </h2>
      <div className="mb-7 border border-[#d6dbd3] bg-white p-5 shadow-[0_8px_24px_rgba(35,53,43,0.04)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg text-[#60766b] font-semibold">{t.weatherOutfitTitle}</h3>
          <button
            type="button"
            aria-expanded={suggestion?.language === language && suggestionOpen}
            aria-controls={suggestion?.language === language ? "weather-outfit-content" : undefined}
            disabled={generatingSuggestion}
            onClick={() => void generateWeatherOutfit()}
            className="min-h-10 rounded-md border border-[#cbd3ca] px-3 text-sm font-semibold text-[#45534b] transition hover:bg-[#f4f6f1] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {generatingSuggestion
              ? t.generatingOutfit
              : suggestion?.language === language
                ? suggestionOpen ? t.hideWeatherOutfit : t.showWeatherOutfit
                : t.generateOutfit}
          </button>
        </div>
        {outfitError?.language === language ? (
          <p role="alert" className="mt-3 text-sm text-[#8c3928]">{t[outfitError.key]}</p>
        ) : null}
        {suggestion?.language === language ? (
          <div
            id="weather-outfit-content"
            hidden={!suggestionOpen}
            aria-live="polite"
            className="mt-5 border-t border-[#e1e5df] pt-4"
          >
            <div className="rounded-md border border-[#d8e2da] bg-[#f4f7f2] p-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">
                {t.currentWeather}
              </h4>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-2xl font-semibold tabular-nums text-[#315c4c]">
                  {numberFormat.format(suggestion.weather.current.temperature_2m)} °C
                </span>
                <div className="flex flex-wrap gap-2 text-xs text-[#45534b]">
                  <span className="rounded-full border border-[#d6dbd3] bg-white px-2.5 py-1">
                    {t.feelsLike} {numberFormat.format(suggestion.weather.current.apparent_temperature)} °C
                  </span>
                  <span className="rounded-full border border-[#d6dbd3] bg-white px-2.5 py-1">
                    {t.wind} {numberFormat.format(suggestion.weather.current.wind_speed_10m)} km/h
                  </span>
                  <span className="rounded-full border border-[#d6dbd3] bg-white px-2.5 py-1">
                    {t.precipitation} {numberFormat.format(suggestion.weather.current.precipitation)} mm
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-line text-sm leading-6 text-[#34433b]">
              {suggestion.outfit}
            </p>
          </div>
        ) : null}
      </div>
      <section className="mb-8 border-y border-[#cdd4cd] py-5">
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <div className="border-l-2 border-[#a9bd8b] bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">{t.piecesInCloset}</p>
            <p className="mt-1 text-2xl font-semibold">{totalUnits}</p>
          </div>
          <div className="border-l-2 border-[#94adb0] bg-white/70 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#65716b]">{t.categories}</p>
            <p className="mt-1 text-2xl font-semibold">
              {new Set(items.map((item) => item.category_id)).size}
            </p>
          </div>
        </div></section>
      <div className="grid gap-8 lg:grid-cols-3 lg:gap-0">
        <section className="min-w-0 mb-8 lg:mb-0 lg:pr-6">
          <h3 className="mb-3 text-sm font-semibold text-[#45534b]">{t.unitsByCategory}</h3>
          {loading ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.loading}</p>
          ) : categoryData.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.noChartData}</p>
          ) : (
            <>
              <div className="h-60 w-full min-w-0">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={1}
                  initialDimension={{ width: 320, height: 240 }}
                >
                  <PieChart accessibilityLayer>
                    <Pie
                      data={categoryData}
                      dataKey="units"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={86}
                      paddingAngle={2}
                      stroke="none"
                      isAnimationActive={animateCharts}
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

        <section className="min-w-0 mb-8 lg:mb-0 border-[#e1e5df] lg:border-l lg:px-6">
          <h3 className="mb-3 text-sm font-semibold text-[#45534b]">{t.unitsBySize}</h3>
          {loading ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.loading}</p>
          ) : sizeData.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#68746d]">{t.noChartData}</p>
          ) : (
            <div className="w-full">
              <div
                className="w-full"
                style={{ height: `${Math.min(480, Math.max(220, sizeData.length * 28))}px` }}
              >
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
                    {categoryData.map((category, index) => (
                      <Bar
                        key={category.id}
                        dataKey={category.id}
                        stackId="categories"
                        fill={categoryColors[index % categoryColors.length]}
                        radius={index === categoryData.length - 1 ? [0, 3, 3, 0] : 0}
                        maxBarSize={18}
                        isAnimationActive={animateCharts}
                        name={category.name}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <ul className="mt-2 grid max-h-28 grid-cols-2 gap-x-3 gap-y-1 overflow-y-auto text-xs sm:max-h-36 sm:grid-cols-3">
                {categoryData.map((category, index) => (
                  <li key={category.id} className="flex min-w-0 items-center gap-2 text-[#59675e]">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: categoryColors[index % categoryColors.length] }}
                    />
                    <span className="min-w-0 truncate">{category.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="min-w-0 lg:mb-0 border-[#e1e5df] lg:border-l lg:pl-6">
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
                    {getCategoryName(item)} · {getSizeName(item)}
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
