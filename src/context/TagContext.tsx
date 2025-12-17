import { createContext, useContext, useState, type ReactNode } from 'react';

interface TagContextType {
    selectedTag: string | null;
    setSelectedTag: (tag: string | null) => void;
    clearTagFilter: () => void;
}

const TagContext = createContext<TagContextType | undefined>(undefined);

export const TagProvider = ({ children }: { children: ReactNode }) => {
    const [selectedTag, setSelectedTagState] = useState<string | null>(null);

    const setSelectedTag = (tag: string | null) => {
        setSelectedTagState(tag);
    };

    const clearTagFilter = () => {
        setSelectedTagState(null);
    };

    return (
        <TagContext.Provider value={{ selectedTag, setSelectedTag, clearTagFilter }}>
            {children}
        </TagContext.Provider>
    );
};

export const useTag = () => {
    const context = useContext(TagContext);
    if (!context) {
        throw new Error('useTag must be used within TagProvider');
    }
    return context;
};