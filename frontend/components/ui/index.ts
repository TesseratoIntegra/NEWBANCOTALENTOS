// Form Components
export { Button, buttonVariants } from './Button'
export type { ButtonProps } from './Button'

export { Input } from './Input'
export type { InputProps } from './Input'

export { Textarea } from './Textarea'
export type { TextareaProps } from './Textarea'

export { SelectSimple as Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

// Also export the full shadcn Select components for advanced usage
export {
  Select as SelectRadix,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './Select'

// Display Components
export { Badge, badgeVariants } from './Badge'
export type { BadgeProps } from './Badge'

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from './Card'
export type { CardProps, CardHeaderProps } from './Card'

export { Skeleton, ProjectCardSkeleton, TableRowSkeleton, StatCardSkeleton } from './Skeleton'
export type { SkeletonProps } from './Skeleton'

// Feedback Components (custom - capital)
export { Modal, ConfirmModal } from './Modal'
export type { ModalProps } from './Modal'

export { ToastProvider, useToast } from './Toast'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

export { LoadingSpinner, PageLoading } from './LoadingSpinner'
export type { LoadingSpinnerProps } from './LoadingSpinner'

// Upload Components (custom - capital)
export { ImageUpload } from './ImageUpload'
export { VideoUpload } from './VideoUpload'

// shadcn components (lowercase)
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog'

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './dropdown-menu'

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './sheet'

export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table'

export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

export { Label } from './label'
export { Switch } from './switch'
export { Separator } from './separator'
export { Avatar, AvatarFallback, AvatarImage } from './avatar'
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip'
export { Popover, PopoverContent, PopoverTrigger } from './popover'
export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './command'
