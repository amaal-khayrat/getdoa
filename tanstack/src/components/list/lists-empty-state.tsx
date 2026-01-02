import { Link } from '@tanstack/react-router'
import { BookOpen, Search } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty'

interface ListsEmptyStateProps {
  searchQuery?: string
}

export function ListsEmptyState({ searchQuery }: ListsEmptyStateProps) {
  if (searchQuery) {
    return (
      <Empty className="border py-16">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Search className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No lists found</EmptyTitle>
          <EmptyDescription>
            No prayer lists match "{searchQuery}". Try a different search term.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <Empty className="border py-16">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookOpen className="size-6" />
        </EmptyMedia>
        <EmptyTitle>No public lists yet</EmptyTitle>
        <EmptyDescription>
          Be the first to share your prayer collection with the community!
        </EmptyDescription>
      </EmptyHeader>
      <Link to="/login" className={buttonVariants()}>
        Create Your First List
      </Link>
    </Empty>
  )
}
