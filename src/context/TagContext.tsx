import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { notesService, jotsService, tasksService, eventsService } from '../services/supabaseService';
import { useAuth } from './AuthContext';

interface TagWithCount {
    name: string;
    count: number;
    sources: ('notes' | 'jots' | 'tasks' | 'events')[];
}

interface TagContextType {
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    clearTagFilter: () => void;
    tags: TagWithCount[];
    isLoadingTags: boolean;
    refreshTags: () => Promise<void>;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [selectedTag, setSelectedTagState] = useState<string | null>(null);
    const [tags, setTags] = useState<TagWithCount[]>([]);
    const [isLoadingTags, setIsLoadingTags] = useState(false);

    const setSelectedTag = (tag: string | null) => {
        setSelectedTagState(tag);
    };

    const clearTagFilter = () => {
        setSelectedTagState(null);
    };

    // Fetch all tags from notes, jots, and tasks
    const refreshTags = useCallback(async () => {
        if (!user) {
            setTags([]);
            return;
        }

        setIsLoadingTags(true);

        try {
            // Fetch data from all sources in parallel
            const [notesResult, jotsResult, tasksResult, eventsResult] = await Promise.all([
                notesService.getAll(),
                jotsService.getAll(),
                tasksService.getAll(),
                eventsService.getAll(),
            ]);

            // Collect all tags with their sources
            const tagMap = new Map<string, { count: number; sources: Set<'notes' | 'jots' | 'tasks' | 'events'> }>();

            // Process notes tags
            if (notesResult.data) {
                notesResult.data.forEach(note => {
                    (note.tags || []).forEach(tag => {
                        const existing = tagMap.get(tag);
                        if (existing) {
                            existing.count++;
                            existing.sources.add('notes');
                        } else {
                            tagMap.set(tag, { count: 1, sources: new Set(['notes']) });
                        }
                    });
                });
            }

            // Process jots tags
            if (jotsResult.data) {
                jotsResult.data.forEach(jot => {
                    (jot.tags || []).forEach(tag => {
                        const existing = tagMap.get(tag);
                        if (existing) {
                            existing.count++;
                            existing.sources.add('jots');
                        } else {
                            tagMap.set(tag, { count: 1, sources: new Set(['jots']) });
                        }
                    });
                });
            }

            // Process tasks tags
            if (tasksResult.data) {
                tasksResult.data.forEach(task => {
                    (task.tags || []).forEach(tag => {
                        const existing = tagMap.get(tag);
                        if (existing) {
                            existing.count++;
                            existing.sources.add('tasks');
                        } else {
                            tagMap.set(tag, { count: 1, sources: new Set(['tasks']) });
                        }
                    });
                });
            }

            // Process events tags
            if (eventsResult.data) {
                eventsResult.data.forEach(event => {
                    (event.tags || []).forEach(tag => {
                        const existing = tagMap.get(tag);
                        if (existing) {
                            existing.count++;
                            existing.sources.add('events');
                        } else {
                            tagMap.set(tag, { count: 1, sources: new Set(['events']) });
                        }
                    });
                });
            }

            // Convert to array and sort by count (descending), then by name (ascending)
            const tagsArray: TagWithCount[] = Array.from(tagMap.entries())
                .map(([name, { count, sources }]) => ({
                    name,
                    count,
                    sources: Array.from(sources) as ('notes' | 'jots' | 'tasks' | 'events')[],
                }))
                .sort((a, b) => {
                    if (b.count !== a.count) return b.count - a.count;
                    return a.name.localeCompare(b.name);
                });

            setTags(tagsArray);
        } catch (err) {
            console.error('Error loading tags:', err);
            setTags([]);
        } finally {
            setIsLoadingTags(false);
        }
    }, [user]);

    // Load tags when user changes
    useEffect(() => {
        refreshTags();
    }, [refreshTags]);

    return (
        <TagContext.Provider value={{
            selectedTag,
            setSelectedTag,
            clearTagFilter,
            tags,
            isLoadingTags,
            refreshTags,
        }}>
            {children}
        </TagContext.Provider>
    );
};

export const useTag = () => {
    const context = useContext(TagContext);
    if (!context) {
        throw new Error('useTag deve ser usado dentro de TagProvider');
    }
    return context;
};