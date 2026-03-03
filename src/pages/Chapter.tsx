import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type ChapterReaderResponse = {
  id: string;
  chapterNumber: number;
  title: string;
  images: string[];
  mangaId: string;
  prevChapterId: string | null;
  prevChapterNumber: number | null;
  nextChapterId: string | null;
  nextChapterNumber: number | null;
};

type ChapterListItem = {
  id: string;
  chapterNumber: number;
  title?: string;
};

function normalizeImages(images: unknown): string[] {
  // Caso: viene como string JSON directo
  if (typeof images === "string") {
    const s = images.trim();
    if (s.startsWith("[") && s.endsWith("]")) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed))
          return parsed.filter((x): x is string => typeof x === "string");
      } catch {
        // ignore
      }
    }
    return [];
  }

  if (!Array.isArray(images)) return [];

  const strs = images
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.trim());
  if (strs.length === 0) return [];

  // Caso normal: ya es un array de URLs limpias
  const looksClean = strs.every(
    (s) =>
      !s.startsWith("[") &&
      !s.endsWith("]") &&
      !s.startsWith('"') &&
      !s.endsWith('"'),
  );
  if (looksClean) return strs;

  // Caso: JSON array fragmentado en varios strings -> lo rearmamos
  const joined = strs.join(",").trim();
  if (joined.startsWith("[") && joined.endsWith("]")) {
    try {
      const parsed = JSON.parse(joined);
      if (Array.isArray(parsed))
        return parsed.filter((x): x is string => typeof x === "string");
    } catch {
      // ignore
    }
  }

  // Fallback: limpiar brackets/comillas sueltas por si viene medio corrupto
  return strs
    .map((s) =>
      s
        .replace(/^\[+/, "")
        .replace(/\]+$/, "")
        .replace(/^"+/, "")
        .replace(/"+$/, "")
        .trim(),
    )
    .filter(Boolean);
}

export function Chapter() {
  const { mangaSlug, cap } = useParams<{
    mangaSlug: string;
    cap: string;
  }>();

  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_BASE_URL as string;

  const capNum = useMemo(() => {
    if (!cap) return null;

    const s = cap.trim().toLowerCase();
    if (!s.startsWith("cap-")) return null;

    const raw = s.slice("cap-".length).trim();
    if (!raw) return null;

    const n = Number(raw);
    if (!Number.isFinite(n)) return null;
    if (n < 0) return null;

    return n;
  }, [cap]);

  const [reader, setReader] = useState<ChapterReaderResponse | null>(null);
  const [chapters, setChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mangaSlug || capNum == null) return;

    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API}/chapters/${mangaSlug}/cap-${capNum}`);
        if (!res.ok) throw new Error(`Error fetching chapter (${res.status})`);

        const data: ChapterReaderResponse = await res.json();
        console.log(data);
        if (alive) {
          const normalized: ChapterReaderResponse = {
            ...data,
            images: normalizeImages(data.images),
          };
          setReader(normalized);
        }
      } catch (e) {
        if (alive) {
          setError(e instanceof Error ? e.message : "Error fetching chapter");
          setReader(null);
        }
      } finally {
        if (alive) setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [API, mangaSlug, capNum]);

  useEffect(() => {
    if (!mangaSlug || !reader?.mangaId) return;

    const mangaId = reader.mangaId;
    let alive = true;

    // reemplazá SOLO el bloque del fetch/parsing dentro del useEffect de "chapters list"
    async function run() {
      setLoadingChapters(true);
      try {
        let res = await fetch(`${API}/manga/${mangaSlug}/chapters`);

        if (!res.ok) {
          res = await fetch(`${API}/chapters?mangaId=${mangaId}`);
        }

        if (!res.ok) {
          throw new Error(`Error fetching chapters list (${res.status})`);
        }

        const data = await res.json();

        // ✅ Soporta ambos formatos:
        // 1) Array directo: [{...}, {...}]
        // 2) Wrapper: { chapters: [{...}, {...}] }
        const list: ChapterListItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.chapters)
            ? data.chapters
            : [];

        if (alive) {
          const sorted = [...list].sort(
            (a, b) => a.chapterNumber - b.chapterNumber,
          );
          setChapters(sorted);
        }
      } catch {
        if (alive) setChapters([]);
      } finally {
        if (alive) setLoadingChapters(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [API, mangaSlug, reader?.mangaId]);

  useEffect(() => {
    function isTypingTarget(el: EventTarget | null) {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    }

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) return;

      // Evita que el navegador haga scroll horizontal o cosas raras
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
      }

      if (e.key === "ArrowLeft") {
        if (reader?.prevChapterNumber != null) {
          goToChapter(reader.prevChapterNumber);
        }
      }

      if (e.key === "ArrowRight") {
        if (reader?.nextChapterNumber != null) {
          goToChapter(reader.nextChapterNumber);
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [reader?.prevChapterNumber, reader?.nextChapterNumber, mangaSlug]);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "instant", // o "smooth" si querés animación
    });
  }, [capNum]);

  function goToChapter(n: number) {
    if (!mangaSlug) return;
    navigate(`/manga/${mangaSlug}/cap-${n}`);
  }

  const canPrev = reader?.prevChapterNumber != null;
  const canNext = reader?.nextChapterNumber != null;

  const currentValue = reader?.chapterNumber ?? capNum ?? "";

  const images = reader?.images ?? [];

  const NavBar = (
    <div className="w-full flex items-center justify-center gap-2 sm:gap-3">
      <button
        type="button"
        onClick={() =>
          reader?.prevChapterNumber != null &&
          goToChapter(reader.prevChapterNumber)
        }
        disabled={!canPrev}
        className={[
          "rounded px-3 py-2 text-sm theme-transition",
          "bg-bg-terciary text-text-primary border border-transparent",
          "hover:brightness-110 active:brightness-100",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "cursor-pointer",
        ].join(" ")}
      >
        Anterior
      </button>

      <div className="min-w-45 sm:min-w-60">
        <select
          value={currentValue}
          onChange={(e) => goToChapter(Number(e.target.value))}
          className={[
            "w-full rounded px-3 py-2 text-sm theme-transition",
            "bg-bg-secondary text-text-primary border border-transparent",
            "focus:outline-none focus:ring-2 focus:ring-(--accent-primary)/60",
            "cursor-pointer",
          ].join(" ")}
        >
          {chapters.length === 0 ? (
            <option value={currentValue}>
              Cap. {currentValue}
              {loadingChapters ? " (cargando...)" : ""}
            </option>
          ) : (
            chapters.map((c) => (
              <option key={c.id} value={c.chapterNumber}>
                Cap. {c.chapterNumber}
              </option>
            ))
          )}
        </select>
      </div>

      <button
        type="button"
        onClick={() =>
          reader?.nextChapterNumber != null &&
          goToChapter(reader.nextChapterNumber)
        }
        disabled={!canNext}
        className={[
          "rounded px-3 py-2 text-sm theme-transition",
          "bg-bg-terciary text-text-primary border border-transparent",
          "hover:brightness-110 active:brightness-100",
          "disabled:opacity-40 disabled:cursor-not-allowed",
          "cursor-pointer",
        ].join(" ")}
      >
        Siguiente
      </button>
    </div>
  );

  if (!mangaSlug || capNum == null) {
    return (
      <div className="min-h-dvh bg-bg-color text-text-primary flex items-center justify-center px-4">
        <div className="max-w-225 w-full bg-bg-secondary rounded p-4">
          Ruta inválida. Ej:{" "}
          <span className="text-text-secondary">
            /manga/steel-horizon/cap-2
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-bg-color text-text-primary">
      <div className="mx-auto w-full max-w-225 px-3 sm:px-4 py-4 sm:py-6">
        <div className="mb-4 sm:mb-6 bg-bg-secondary rounded p-3 sm:p-4">
          {loading ? (
            <div className="text-text-secondary">Cargando capítulo...</div>
          ) : error ? (
            <div className="text-red-400">{error}</div>
          ) : (
            <>
              <h1 className="text-lg sm:text-xl font-semibold text-text-title">
                {reader?.title
                  ? reader.title
                  : `Capítulo ${reader?.chapterNumber ?? capNum}`}
              </h1>
              <div className="mt-1 text-sm text-text-secondary">
                <Link to={`/manga/${mangaSlug}`} className="hover:underline">
                  {mangaSlug}
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="mb-3 sm:mb-4">{NavBar}</div>

        <div className="bg-bg-secondary rounded-2xl p-2 sm:p-3">
          {loading ? null : images.length === 0 ? (
            <div className="text-text-secondary text-sm p-3">
              No hay imágenes para este capítulo.
            </div>
          ) : (
            <div className="flex flex-col items-center">
              {images.map((src, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === images.length - 1;

                return (
                  <img
                    key={`${src}-${idx}`}
                    src={src}
                    alt={`Página ${idx + 1}`}
                    loading="lazy"
                    className={[
                      "w-full h-auto bg-bg-terciary",
                      isFirst ? "rounded-t-2xl" : "",
                      isLast ? "rounded-b-2xl" : "",
                    ].join(" ")}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-3 sm:mt-4">{NavBar}</div>
      </div>
    </div>
  );
}
