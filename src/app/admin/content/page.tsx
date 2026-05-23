"use client";

import { useAdminContent } from "@/hooks/useAdminContent";
import { ContentDetailModal } from "@/components/admin/ContentDetailModal";

// Import modular components
import AdminContentHeader from "@/components/admin/content/AdminContentHeader";
import AdminContentFilters from "@/components/admin/content/AdminContentFilters";
import AdminContentTable from "@/components/admin/content/AdminContentTable";
import AdminContentBlockModal from "@/components/admin/content/AdminContentBlockModal";

export default function AdminContentPage() {
  const {
    activeTab,
    contents,
    loading,
    filter,
    searchTerm,
    page,
    totalPages,
    totalItems,
    blockModal,
    blockReason,
    detailModal,
    isTrendingTab,
    startItem,
    endItem,
    viewsLabel,
    clicksLabel,
    sectionDescription,
    dispatch,
    handleSearch,
    handleFilterChange,
    handleTabChange,
    handleBlockContent,
    handleUnblockContent,
  } = useAdminContent();

  return (
    <div className="gap-y-6">
      <AdminContentHeader
        activeTab={activeTab}
        sectionDescription={sectionDescription}
        onTabChange={handleTabChange}
      />
      <AdminContentFilters
        isTrendingTab={isTrendingTab}
        filter={filter}
        searchTerm={searchTerm}
        onFilterChange={handleFilterChange}
        onSearchTermChange={(value) => dispatch({ searchTerm: value })}
        onSearch={handleSearch}
      />
      <AdminContentTable
        activeTab={activeTab}
        isTrendingTab={isTrendingTab}
        contents={contents}
        loading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        startItem={startItem}
        endItem={endItem}
        viewsLabel={viewsLabel}
        clicksLabel={clicksLabel}
        onOpenDetail={(content) =>
          dispatch({
            detailModal: {
              open: true,
              tmdbId: content.tmdbId,
              contentType: content.contentType === "tv_series" ? "tv" : "movie",
            },
          })
        }
        onOpenBlock={(content) => {
          dispatch({ blockReason: "" });
          dispatch({ blockModal: { open: true, content } });
        }}
        onUnblock={handleUnblockContent}
        onPageChange={(newPage) => {
          if (newPage !== page) {
            dispatch({ page: newPage });
          }
        }}
      />

      <ContentDetailModal
        open={detailModal.open}
        onClose={() =>
          dispatch({ detailModal: { open: false, tmdbId: 0, contentType: "movie" } })
        }
        tmdbId={detailModal.tmdbId}
        contentType={detailModal.contentType}
      />

      <AdminContentBlockModal
        open={blockModal.open}
        title={blockModal.content?.title}
        reason={blockReason}
        isTrendingTab={isTrendingTab}
        onReasonChange={(value) => dispatch({ blockReason: value })}
        onCancel={() => {
          dispatch({ blockModal: { open: false, content: null } });
          dispatch({ blockReason: "" });
        }}
        onConfirm={handleBlockContent}
      />
    </div>
  );
}
