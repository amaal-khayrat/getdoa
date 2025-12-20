import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { GripVertical, Plus, X } from 'lucide-react'
import { useDoaListActions, useDoaListState } from './doa-list-builder'
import type { DragEndEvent } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isPrayerSelected, truncateText } from '@/utils/text-helpers'

// Sortable item component
function SortablePrayerItem({ prayer, index }: { prayer: any; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prayer.slug })

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const { language, selectedPrayers } = useDoaListState()
  const { removePrayer, reorderPrayers } = useDoaListActions()

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-background rounded-lg border p-3 hover:shadow-sm transition-all"
    >
      {/* Prayer Number and Drag Handle */}
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 mt-1">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
            {index + 1}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 cursor-grab active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* Prayer Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm mb-1">
            {language === 'my' ? prayer.name_my : prayer.name_en}
          </h4>
          <p
            className="font-arabic text-sm text-muted-foreground mb-1 line-clamp-2"
            dir="rtl"
          >
            {truncateText(prayer.content, 100)}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {language === 'my' ? prayer.meaning_my : prayer.meaning_en}
          </p>
        </div>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => removePrayer(prayer.slug)}
          className="opacity-0 group-hover:opacity-100 transition-opacity lg:block"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Reorder Buttons for Mobile - hidden when dragging */}
      {!isDragging && (
        <div className="flex justify-center gap-2 mt-2 lg:hidden">
          <Button
            variant="outline"
            size="xs"
            disabled={index === 0}
            onClick={() => reorderPrayers(index, index - 1)}
          >
            ↑
          </Button>
          <Button
            variant="outline"
            size="xs"
            disabled={index === selectedPrayers.length - 1}
            onClick={() => reorderPrayers(index, index + 1)}
          >
            ↓
          </Button>
        </div>
      )}
    </div>
  )
}

export function SelectedPrayersPanel({
  filteredPrayers,
}: {
  filteredPrayers: Array<any>
}) {
  const { selectedPrayers, title, description, language } = useDoaListState()

  const { updateState, addPrayer, reorderPrayers } = useDoaListActions()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = selectedPrayers.findIndex(
        (item) => item.slug === active.id,
      )
      const newIndex = selectedPrayers.findIndex(
        (item) => item.slug === over?.id,
      )

      if (oldIndex !== -1 && newIndex !== -1) {
        updateState({
          selectedPrayers: arrayMove(selectedPrayers, oldIndex, newIndex),
        })
      }
    }
  }

  return (
    <div className="bg-card rounded-lg border h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="space-y-3">
          <Input
            placeholder="Enter list title..."
            value={title}
            onChange={(e) => updateState({ title: e.target.value })}
            className="text-lg font-semibold"
          />
          <Input
            placeholder="Add a description (optional)..."
            value={description}
            onChange={(e) => updateState({ description: e.target.value })}
            className="text-sm"
          />
        </div>

        {/* Bismillah */}
        <div className="mt-4 text-center">
          <p className="font-arabic text-xl text-foreground" dir="rtl">
            بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ
          </p>
        </div>
      </div>

      {/* Prayers List */}
      <div className="flex-1 overflow-y-auto p-4">
        {selectedPrayers.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No prayers selected</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Select prayers from the right panel to create your personalized
              prayer list
            </p>
            <p className="text-xs text-primary">You can add up to 15 prayers</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedPrayers.map((p) => p.slug)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {selectedPrayers.map((prayer, index) => (
                  <SortablePrayerItem
                    key={prayer.slug}
                    prayer={prayer}
                    index={index}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Quick Add Suggestions */}
        {selectedPrayers.length > 0 && selectedPrayers.length < 15 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Quick Add Suggestions</h4>
            <div className="space-y-2">
              {filteredPrayers
                .filter(
                  (prayer) => !isPrayerSelected(selectedPrayers, prayer.slug),
                )
                .slice(0, 3)
                .map((prayer) => (
                  <div
                    key={prayer.slug}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {language === 'my' ? prayer.name_my : prayer.name_en}
                      </p>
                      <p
                        className="font-arabic text-xs text-muted-foreground truncate"
                        dir="rtl"
                      >
                        {prayer.content.slice(0, 50)}...
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addPrayer(prayer)}
                      className="ml-2"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{selectedPrayers.length} of 15 prayers</span>
          {selectedPrayers.length === 15 && (
            <span className="text-primary">Maximum reached</span>
          )}
        </div>
      </div>
    </div>
  )
}
