"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ReactPaginate from "react-paginate";
import { useLastUpdates } from "@/hooks/mangadex";
import { useMangadex } from "@/contexts/mangadex";

import { ExtendChapter } from "@/types/mangadex";
import { Constants } from "@/constants";
import { FaClock } from "react-icons/fa";
import { AspectRatio } from "@/components/shadcn/aspect-ratio";
import { DataLoader } from "@/components/DataLoader";
import { Utils } from "@/utils";

const MangaTile = (props: {
  id: string;
  title: string;
  thumbnail: string;
  chapters: ExtendChapter[];
}) => {
  const { mangaStatistics } = useMangadex();
  return (
    <div className="group">
      <figure className="clearfix">
        <div className="relative mb-2">
          <Link
            title={props.title}
            href={Constants.Routes.nettrom.manga(props.id)}
          >
            <AspectRatio
              ratio={Constants.Nettrom.MANGA_COVER_RATIO}
              className="overflow-hidden rounded-lg group-hover:shadow-lg"
            >
              <div className="absolute bottom-0 left-0 z-[1] h-3/5 w-full bg-gradient-to-t from-neutral-900 from-[15%] to-transparent transition-all duration-500 group-hover:h-3/4"></div>
              <img
                src={props.thumbnail}
                className="lazy h-full w-full object-cover transition duration-500 group-hover:scale-[102%]"
                data-original={props.thumbnail}
                alt={props.title}
              />
            </AspectRatio>
          </Link>
          <div className="absolute bottom-0 left-0 z-[2] w-full px-2 py-1.5">
            <h3 className="mb-2 line-clamp-2 text-[14px] font-semibold leading-tight text-white transition group-hover:line-clamp-4">
              {props.title}
            </h3>
            <span className="flex items-center justify-between gap-[4px] text-[11px] text-muted-foreground">
              <span className="flex items-center gap-[4px]">
                <i className="fa fa-star"></i>
                {Utils.Number.formatViews(
                  Math.round(
                    (mangaStatistics[props.id]?.rating?.bayesian || 0) * 10,
                  ) / 10,
                )}
              </span>
              <span className="flex items-center gap-[4px]">
                <i className="fa fa-comment" />
                {Utils.Number.formatViews(
                  mangaStatistics[props.id]?.comments?.repliesCount || 0,
                )}
              </span>
              <span className="flex items-center gap-[4px]">
                <i className="fa fa-heart" />
                {Utils.Number.formatViews(
                  mangaStatistics[props.id]?.follows || 0,
                )}
              </span>
            </span>
          </div>
        </div>
        <figcaption>
          <ul className="flex flex-col gap-[4px]">
            {props.chapters.slice(0, 3).map((chapter) => (
              <li
                className="flex items-center justify-between gap-x-2 text-[12px]"
                key={chapter.id}
              >
                <Link
                  href={Constants.Routes.nettrom.chapter(chapter.id)}
                  title={Utils.Mangadex.getChapterTitle(chapter)}
                  className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap text-web-title transition hover:text-web-titleLighter"
                >
                  {Utils.Mangadex.getChapterTitle(chapter)}
                </Link>
                <span className="whitespace-nowrap leading-[13px] text-muted-foreground">
                  {Utils.Date.formatNowDistance(
                    new Date(chapter.attributes.readableAt),
                  )}
                </span>
              </li>
            ))}
          </ul>
        </figcaption>
      </figure>
    </div>
  );
};

export default function NewUpdates({
  title,
  groupId,
}: {
  title?: string;
  groupId?: string;
}) {
  const [page, setPage] = useState(0);
  const { chapters, isLoading, error, total } = useLastUpdates({
    page,
    groupId,
  });
  const { mangas, updateMangas, updateMangaStatistics, mangaStatistics } =
    useMangadex();
  const updates: Record<string, ExtendChapter[]> = {};

  if (chapters) {
    for (const chapter of chapters) {
      const mangaId = chapter.manga?.id;
      if (!mangaId) continue;
      if (!updates[mangaId]) {
        updates[mangaId] = [];
      }
      updates[mangaId].push(chapter);
    }
  }

  useEffect(() => {
    if (chapters?.length > 0) {
      updateMangas({
        ids: chapters.filter((c) => !!c?.manga?.id).map((c) => c.manga!.id),
      });
    }
  }, [chapters]);

  useEffect(() => {
    if (chapters?.length > 0) {
      updateMangaStatistics({
        manga: chapters.filter((c) => !!c?.manga?.id).map((c) => c.manga!.id!),
      });
    }
  }, [chapters]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  return (
    <div className="Module Module-163">
      <div className="ModuleContent">
        <div className="items">
          <div className="relative">
            <h1 className="my-0 mb-5 flex items-center gap-3 text-[20px] text-web-title">
              <FaClock />
              <span>Truyện mới cập nhật</span>
            </h1>
            {/* <Link
              className="filter-icon"
              title="Tìm truyện nâng cao"
              href={routes.nettrom.search}
            >
              <i className="fa fa-filter"></i>
            </Link> */}
          </div>
          <DataLoader isLoading={isLoading} error={error}>
            <div className="grid grid-cols-2 gap-[20px] lg:grid-cols-4">
              {Object.entries(updates).map(([mangaId, chapterList]) => {
                const coverArt = Utils.Mangadex.getCoverArt(mangas[mangaId]);
                const mangaTitle = Utils.Mangadex.getMangaTitle(
                  mangas[mangaId],
                );
                return (
                  <MangaTile
                    id={mangaId}
                    key={mangaId}
                    thumbnail={coverArt}
                    title={mangaTitle}
                    chapters={chapterList}
                  />
                );
              })}
            </div>
          </DataLoader>
        </div>
        <div
          id="ctl00_mainContent_ctl00_divPager"
          className="pagination-outter"
        >
          <ReactPaginate
            breakLabel="..."
            nextLabel=">"
            onPageChange={(event) => {
              setPage(event.selected);
            }}
            pageRangeDisplayed={5}
            pageCount={Math.floor(
              total / Constants.Mangadex.LAST_UPDATES_LIMIT,
            )}
            previousLabel="<"
            renderOnZeroPageCount={null}
            marginPagesDisplayed={2}
            pageClassName="text-center"
            containerClassName="pagination"
            activeClassName="active"
            previousClassName="text-center"
            nextClassName="text-center"
            breakClassName="text-center"
            forcePage={page}
          />
        </div>
      </div>
    </div>
  );
}