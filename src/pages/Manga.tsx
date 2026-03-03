import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

type MangaType = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status: string;
  origin: string;
};

type ChapterType = {
  id: string;
  chapterNumber: number;
  createdAt?: string;
};

function timeAgoLabel(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;

  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `hace ${diffH} h`;

  const diffD = Math.floor(diffH / 24);
  return `hace ${diffD} d`;
}

export function Manga() {
  const { mangaSlug } = useParams<{ mangaSlug: string }>();
  const navigate = useNavigate();

  const [manga, setManga] = useState<MangaType | null>(null);
  const [chapters, setChapters] = useState<ChapterType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL as string | undefined;

  useEffect(() => {
    if (!mangaSlug) {
      setError("Missing mangaId in URL");
      setLoading(false);
      return;
    }
    if (!apiBase) {
      setError("Missing VITE_API_BASE_URL in .env");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const run = async () => {
      try {
        setError(null);
        setLoading(true);

        const mangaRes = await fetch(`${apiBase}/manga/${mangaSlug}`, {
          signal: controller.signal,
        });
        if (!mangaRes.ok)
          throw new Error(`Manga fetch failed: ${mangaRes.status}`);
        const mangaData: MangaType = await mangaRes.json();
        setManga(mangaData);

        const chaptersRes = await fetch(
          `${apiBase}/manga/${mangaSlug}/chapters`,
          {
            signal: controller.signal,
          },
        );

        if (chaptersRes.ok) {
          const chaptersData = (await chaptersRes.json()) as {
            chapters?: ChapterType[];
          };
          setChapters(
            Array.isArray(chaptersData.chapters) ? chaptersData.chapters : [],
          );
          console.log(chaptersData);
        } else {
          setChapters([]);
        }
      } catch (err) {
        if ((err as { name?: string }).name === "AbortError") return;
        console.error(err);
        setError("Failed to load manga");
        setManga(null);
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    run();

    return () => controller.abort();
  }, [mangaSlug, apiBase]);

  const firstChapterNumber = useMemo(() => {
    if (chapters.length === 0) return null;
    return Math.min(...chapters.map((c) => c.chapterNumber));
  }, [chapters]);

  const lastChapterNumber = useMemo(() => {
    if (chapters.length === 0) return null;
    return Math.max(...chapters.map((c) => c.chapterNumber));
  }, [chapters]);

  const onOpenChapter = (chapterNumber: number) => {
    navigate(`/manga/${mangaSlug}/cap-${chapterNumber}`);
  };

  const onReadFirst = () => {
    if (firstChapterNumber != null) onOpenChapter(firstChapterNumber);
  };

  const onReadLast = () => {
    if (lastChapterNumber != null) onOpenChapter(lastChapterNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg text-text-title px-4 pb-10 flex items-center justify-center">
        <p className="text-text-title/70 text-sm">Cargando…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bg text-text-title px-4 pb-10 flex items-center justify-center">
        <div className="max-w-sm w-full rounded-xl border border-white/10 bg-bg p-4">
          <p className="text-sm text-text-title/90 font-semibold">Error</p>
          <p className="mt-1 text-sm text-text-title/70">{error}</p>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-screen bg-bg text-text-title px-4 pb-10 flex items-center justify-center">
        <p className="text-text-title/70 text-sm">No se encontró el manga.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-title px-4 pb-10">
      {/* HERO */}
      <section className="mx-auto w-full max-w-6xl pt-6">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.55)]">
          {/* Background */}
          <div className="absolute inset-0">
            <img
              src={manga.coverImage}
              alt=""
              className="h-full w-full object-cover blur-xs scale-110 "
              loading="lazy"
            />
            <div className="absolute inset-0 bg-(--hero-overlay)" />
            <div className="absolute inset-0 bg-linear-to-r from-(--hero-grad-from) via-(--hero-grad-via) to-(--hero-grad-to)" />
          </div>

          {/* Content */}
          <div className="relative p-4 sm:p-6 lg:p-8">
            <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:gap-8 xl:grid-cols-[280px_1fr]">
              {/* Cover */}
              <div className="flex justify-center lg:justify-start">
                <div className="w-8/12 max-w-65 lg:w-full lg:max-w-none">
                  <div className="overflow-hidden rounded-2xl border border-white/10 shadow-[0_12px_24px_rgba(0,0,0,0.45)]">
                    <img
                      src={manga.coverImage}
                      alt={manga.title}
                      className="h-auto w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>

              {/* Text */}
              <div className="min-w-0">
                <h1 className="text-center text-[20px] text-(--hero-title) leading-snug font-semibold sm:text-[24px] lg:text-left lg:text-[34px]">
                  {manga.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-[12px] text-text-title lg:justify-start">
                  <span className="inline-flex items-center gap-2">
                    <span className="text-(--hero-muted)/60">Status</span>
                    <span className="inline-block size-2 rounded-full bg-bg-secondary/40" />
                    <span className="text-(--hero-title)/85">
                      {manga.status}
                    </span>
                  </span>

                  <span className="text-(--hero-title)/35">•</span>

                  <span className="inline-flex items-center gap-2">
                    <span className="text-(--hero-muted)/60">Origen</span>
                    <span className="text-(--hero-title)/85">
                      {manga.origin}
                    </span>
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-(--hero-muted)/70 text-[12px] font-medium tracking-wide uppercase">
                    Sinopsis
                  </p>
                  <p className="mt-2 text-(--hero-title) y/80 text-[13px] leading-relaxed lg:text-[14px] lg:leading-6">
                    {manga.description}
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-5 flex gap-3 lg:mt-6 lg:max-w-90">
                  <button
                    type="button"
                    onClick={onReadFirst}
                    disabled={!firstChapterNumber}
                    className={[
                      "flex-1 rounded-lg border border-(--accent-primary) bg-amber-500 py-2.5 text-[13px] font-medium",
                      "shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition active:scale-[0.99]",
                      !firstChapterNumber
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:brightness-110",
                    ].join(" ")}
                  >
                    Leer
                    <br />
                    Primero
                  </button>

                  <button
                    type="button"
                    onClick={onReadLast}
                    disabled={!lastChapterNumber}
                    className={[
                      "flex-1 rounded-lg border border-(--accent-primary) bg-bg-secondary py-2.5 text-[13px] font-medium",
                      "shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition active:scale-[0.99]",
                      !lastChapterNumber
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:brightness-110",
                    ].join(" ")}
                  >
                    Leer
                    <br />
                    Último
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHAPTERS */}
      <section className="mx-auto w-full max-w-6xl mt-8">
        <p className="text-text-primary/80 text-[13px] font-semibold">
          Capítulos
        </p>

        {chapters.length === 0 ? (
          <p className="mt-2 text-text-primary/50 text-[12px]">
            Todavía no hay capítulos.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {chapters
              .slice()
              .sort((a, b) => b.chapterNumber - a.chapterNumber)
              .map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onOpenChapter(c.chapterNumber)}
                  className={[
                    "rounded-xl bg-bg-secondary border border-white/10 px-3 py-3 text-left",
                    "shadow-[0_10px_18px_rgba(0,0,0,0.35)] transition cursor-pointer",
                    "hover:brightness-110 active:scale-[0.99]",
                  ].join(" ")}
                >
                  <div className="text-[13px] font-semibold text-text-primary/90">
                    Cap {String(c.chapterNumber).padStart(2, "0")}
                  </div>
                  <div className="mt-1 text-[11px] text-text-secondary">
                    {timeAgoLabel(c.createdAt) ?? "hace tiempo"}
                  </div>
                </button>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
