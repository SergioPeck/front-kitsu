import { useEffect, useState } from "react";

type Manga = {
  id: string;
  title: string;
  coverImage: string;
};

type Chapter = {
  id: string;
  chapterNumber: number;
};

type Banner = {
  id: string;
  mangaId: string;
  imageUrl: string;
  isActive: boolean;
  sortOrder: number;
};

type Update = {
  id: string;
  title: string;
  coverImage: string;
  firstChapter?: Chapter | null;
  lastChapters?: Chapter[];
};

const AUTO_ROTATE_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function Home() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [week, setWeek] = useState<Manga[]>([]);
  const [month, setMonth] = useState<Manga[]>([]);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bannerRes, weekRes, monthRes, updatesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/banners/home`),
          fetch(`${API_BASE_URL}/rankings/mangas?range=week`),
          fetch(`${API_BASE_URL}/rankings/mangas?range=month`),
          fetch(`${API_BASE_URL}/manga/recent`),
        ]);

        const weekData = await weekRes.json();
        const monthData = await monthRes.json();
        const updatesData = await updatesRes.json();
        const bannersData = (await bannerRes.json()) as Banner[];

        const activeBanners =
          bannersData
            ?.filter((b) => b.isActive)
            ?.sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

        setBanners(activeBanners);
        setActiveBannerIndex(0);
        setWeek(weekData.items || []);
        setMonth(monthData.items || []);
        setUpdates(updatesData.items || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const id = window.setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, AUTO_ROTATE_MS);

    return () => window.clearInterval(id);
  }, [banners.length]);

  if (loading) {
    return <div className="bg-bg text-text-title p-4">Cargando...</div>;
  }

  return (
    <div className="bg-bg text-text-title min-h-screen pb-20">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-6">
        {banners.length > 0 && (
          <div className="mt-3">
            {/* Banner clickeable */}
            <div
              className="w-full overflow-hidden rounded-xl bg-bg-secondary h-auto
              cursor-pointer transition-transform duration-200
              hover:scale-[1.01] active:scale-[0.99]"
              tabIndex={0}
              role="button"
              aria-label="Abrir banner"
              onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (touchStartX === null) return;

                const endX = e.changedTouches[0].clientX;
                const delta = endX - touchStartX;

                if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
                  setTouchStartX(null);
                  return;
                }

                if (delta < 0) {
                  setActiveBannerIndex((prev) => (prev + 1) % banners.length);
                } else {
                  setActiveBannerIndex(
                    (prev) => (prev - 1 + banners.length) % banners.length,
                  );
                }

                setTouchStartX(null);
              }}
              // cuando conectes navegación:
              // onClick={() => navigate(`/manga/${banners[activeBannerIndex].mangaId}`)}
            >
              <img
                src={banners[activeBannerIndex].imageUrl}
                className="h-full w-full object-cover object-center"
                alt="Banner"
                draggable={false}
              />
            </div>

            {banners.length > 1 && (
              <div className="flex justify-center gap-2 mt-2">
                {banners.map((b, idx) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveBannerIndex(idx)}
                    className={[
                      "h-2 rounded-full transition-all",
                      "cursor-pointer",
                      "hover:brightness-125",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70",
                      idx === activeBannerIndex
                        ? "w-6 bg-white"
                        : "w-2 bg-zinc-700",
                    ].join(" ")}
                    aria-label={`Banner ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <h2 className="mt-5 mb-3 text-lg text-text-title font-semibold">
          Popular - Semanal
        </h2>

        <div className="flex gap-3 overflow-x-auto scrollbar-thin py-1 overflow-y-hidden">
          {week.map((m) => (
            <div
              key={m.id}
              className="shrink-0 w-32 sm:w-36 cursor-pointer
             transition-transform duration-200
             hover:scale-105"
              tabIndex={0}
              role="button"
              aria-label={`Abrir ${m.title}`}
              // onClick={() => navigate(`/manga/${m.id}`)}
            >
              <img
                src={m.coverImage}
                className="w-full h-48 sm:h-56 object-cover rounded-xl"
                alt={m.title}
              />
              <p className="text-sm mt-2 truncate">{m.title}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-lg text-text-title font-semibold">
          Popular - Mensual
        </h2>

        <div className="flex gap-3 overflow-x-auto scrollbar-thin py-1 overflow-y-hidden">
          {month.map((m) => (
            <div
              key={m.id}
              className="shrink-0 w-32 sm:w-36 cursor-pointer
             transition-transform duration-200
             hover:scale-105"
              tabIndex={0}
              role="button"
              aria-label={`Abrir ${m.title}`}
              // onClick={() => navigate(`/manga/${m.id}`)}
            >
              <img
                src={m.coverImage}
                className="w-full h-48 sm:h-56 object-cover rounded-xl"
                alt={m.title}
              />
              <p className="text-sm mt-2 truncate">{m.title}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-6 mb-3 text-lg text-text-title font-semibold">
          Actualizaciones
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {updates.map((manga) => (
            <div
              key={manga.id}
              className="flex gap-3 bg-bg-secondary p-3 rounded-xl"
              tabIndex={0}
              role="button"
              aria-label={`Abrir ${manga.title}`}
              // onClick={() => navigate(`/manga/${manga.id}`)}
            >
              <img
                src={manga.coverImage}
                className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-lg self-center
                  cursor-pointer transition-transform duration-200
                  hover:scale-105"
                alt={manga.title}
              />

              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary font-medium truncate
                  cursor-pointer transition-transform duration-200
                  hover:scale-[1.02]">
                  {manga.title}
                </p>

                <div className="mt-2 flex flex-col gap-2">
                  {[
                    ...(manga.lastChapters ?? []),
                    ...(manga.firstChapter ? [manga.firstChapter] : []),
                  ]
                    .filter(
                      (chap, idx, arr) =>
                        arr.findIndex((c) => c.id === chap.id) === idx,
                    )
                    .sort((a, b) => b.chapterNumber - a.chapterNumber)
                    .map((chap: Chapter) => (
                      <button
                        key={chap.id}
                        type="button"
                        className={[
                          "text-left rounded px-2 py-1 text-xs",
                          "bg-bg-terciary text-text-primary",
                          "cursor-pointer transition",
                          "hover:brightness-110 active:brightness-100 transition-transform duration-200 hover:scale-[1.02]",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70",
                          chap.chapterNumber === 1
                            ? "border border-orange-500"
                            : "",
                        ].join(" ")}
                        aria-label={`Abrir capítulo ${chap.chapterNumber}`}
                        // onClick={(e) => { e.stopPropagation(); navigate(`/chapters/${chap.id}`); }}
                      >
                        Cap {chap.chapterNumber}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className={[
            "mt-6 w-full border border-orange-500 py-3 rounded-xl",
            "cursor-pointer transition",
            "hover:bg-orange-500/10 hover:border-orange-400",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70",
            "active:scale-[0.99]",
          ].join(" ")}
        >
          Ver más
        </button>
      </div>
    </div>
  );
}
