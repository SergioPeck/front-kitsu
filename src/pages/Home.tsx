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

const BANNER_HEIGHT = "h-32";
const AUTO_ROTATE_MS = 4000;
const SWIPE_THRESHOLD_PX = 40;

const COVER_WIDTH = "w-36";
const COVER_HEIGHT = "h-48";

const UPDATE_COVER_WIDTH = "w-[70px]";
const UPDATE_COVER_HEIGHT = "h-[95px]";

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
    return <div className="bg-bg text-white p-4">Cargando...</div>;
  }

  return (
    <div className="bg-bg text-white min-h-screen px-3 pb-20">
      {banners.length > 0 && (
        <div className="mt-3">
          <div
            className={`w-full ${BANNER_HEIGHT} rounded-xl overflow-hidden`}
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
          >
            <img
              src={banners[activeBannerIndex].imageUrl}
              className="w-full h-full object-cover"
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
                  className={`h-2 rounded-full transition-all ${
                    idx === activeBannerIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-zinc-700"
                  }`}
                  aria-label={`Banner ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <h2 className="mt-5 mb-3 text-lg font-semibold">Popular - Semanal</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">

        {week.map((m) => (
          <div key={m.id} className={`${COVER_WIDTH} shrink-0`}>
            <img
              src={m.coverImage}
              className={`w-full ${COVER_HEIGHT} object-cover rounded-xl`}
              alt={m.title}
            />
            <p className="text-sm mt-2 truncate">{m.title}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 mb-3 text-lg font-semibold">Popular - Mensual</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide">
        {month.map((m) => (
          <div key={m.id} className={`${COVER_WIDTH} shrink-0`}>
            <img
              src={m.coverImage}
              className={`w-full ${COVER_HEIGHT} object-cover rounded-xl`}
              alt={m.title}
            />
            <p className="text-sm mt-2 truncate">{m.title}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 mb-3 text-lg font-semibold">Actualizaciones</h2>
      <div className="flex flex-col gap-3">
        {updates.map((manga) => (
          <div key={manga.id} className="flex gap-3 bg-zinc-900 p-3 rounded-xl">
            <img
              src={manga.coverImage}
              className={`${UPDATE_COVER_WIDTH} ${UPDATE_COVER_HEIGHT} object-cover rounded-lg self-center`}
              alt={manga.title}
            />

            <div className="flex-1">
              <p className="text-sm font-medium truncate">{manga.title}</p>

              <div className="mt-2 flex flex-col gap-1">
                {[
                  ...(manga.firstChapter ? [manga.firstChapter] : []),
                  ...(manga.lastChapters ?? []),
                ]
                  .filter(
                    (chap, idx, arr) =>
                      arr.findIndex((c) => c.id === chap.id) === idx,
                  )
                  .sort((a, b) => b.chapterNumber - a.chapterNumber)
                  .map((chap: Chapter) => (
                    <span
                      key={chap.id}
                      className={`
                        w-full text-[10px] px-2 py-1 rounded
                        ${
                          chap.chapterNumber === 1
                            ? "border border-orange-500 text-text-primary bg-zinc-900"
                            : "bg-zinc-800 text-text-primary"
                        }
                      `}
                    >
                      Cap {chap.chapterNumber}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button className="mt-6 w-full border border-orange-500 py-3 rounded-xl">
        Ver más
      </button>
    </div>
  );
}
