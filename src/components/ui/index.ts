// src/components/ui/index.ts
// Central export — import semua UI components dari satu tempat:
// import { Button, Card, Badge, Input, Modal } from "@/components/ui"

export { Button } from "./button";
export type { ButtonProps } from "./button";

export { Card, CardHeader, CardFooter } from "./card";
export type { CardProps, CardHeaderProps, CardFooterProps } from "./card";

export {
  Badge,
  JobStatusBadge,
  PriorityBadge,
  jobStatusVariant,
  jobStatusLabel,
  priorityVariant,
} from "./badge";
export type { BadgeProps } from "./badge";

export { Input, Textarea, Select } from "./input";
export type { InputProps, TextareaProps, SelectProps } from "./input";

export { Modal, ConfirmModal } from "./modal";
export type { ModalProps, ConfirmModalProps } from "./modal";