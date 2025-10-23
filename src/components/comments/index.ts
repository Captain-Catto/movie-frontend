// Comment System Components Export
// Central export point for all comment-related components

export { default as CommentSection } from "./CommentSection";
export { default as CommentForm } from "./CommentForm";
export { default as CommentItem } from "./CommentItem";

// Re-export types for convenience
export type {
  Comment,
  CommentResponse,
  CreateCommentDto,
  UpdateCommentDto,
  CreateCommentReportDto,
  CommentSectionProps,
  CommentFormProps,
  CommentItemProps,
  CommentSortOption,
  ReportReason,
} from "@/types/comment.types";
