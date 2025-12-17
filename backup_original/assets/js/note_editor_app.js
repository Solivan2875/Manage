/**
 * MaxNote - Complete Note-Taking Application
 * Inspired by Amplenote with unique MaxNote identity
 */

(function() {
  'use strict';

  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
    console.error('[MaxNote] React libraries not loaded');
    return;
  }

  const { useState, useEffect, useRef, useCallback } = React;

  // Left Sidebar Navigation Component
  function LeftSidebar({ activeSection, onSectionChange, userName }) {
    const sections = [
      { id: 'jots', icon: 'flash_on', label: 'JOTS' },
      { id: 'notes', icon: 'description', label: 'NOTES' },
      { id: 'tasks', icon: 'check_box', label: 'TASKS' },
      { id: 'calendar', icon: 'event', label: 'CALENDAR' }
    ];

    return React.createElement('div', { className: 'left-sidebar' },
      // User Profile
      React.createElement('div', { className: 'user-profile' },
        React.createElement('div', { className: 'user-avatar' },
          React.createElement('i', { className: 'material-icons' }, 'account_circle')
        ),
        React.createElement('div', { className: 'user-name' }, userName),
        React.createElement('i', { className: 'material-icons dropdown-icon' }, 'expand_more')
      ),

      // Navigation Menu
      React.createElement('nav', { className: 'nav-menu' },
        sections.map(section =>
          React.createElement('div', {
            key: section.id,
            className: `nav-item ${activeSection === section.id ? 'active' : ''}`,
            onClick: () => onSectionChange(section.id)
          },
            React.createElement('i', { className: 'material-icons' }, section.icon),
            React.createElement('span', null, section.label)
          )
        )
      ),

      // Shortcuts Section
      React.createElement('div', { className: 'shortcuts-section' },
        React.createElement('div', { className: 'section-title' }, 'SHORTCUTS'),
        React.createElement('div', { className: 'shortcut-item' },
          React.createElement('i', { className: 'material-icons star-icon' }, 'star'),
          React.createElement('span', null, 'daily-jots')
        )
      ),

      // Tags Section
      React.createElement('div', { className: 'tags-section' },
        React.createElement('div', { className: 'section-title' },
          React.createElement('span', null, 'TAGS'),
          React.createElement('i', { className: 'material-icons' }, 'settings')
        )
      ),

      // Bottom Icons
      React.createElement('div', { className: 'bottom-icons' },
        React.createElement('i', { className: 'material-icons' }, 'extension'),
        React.createElement('i', { className: 'material-icons' }, 'timeline'),
        React.createElement('i', { className: 'material-icons' }, 'emoji_emotions')
      )
    );
  }

  // Notes List Component (Middle Panel)
  function NotesList({ notes, selectedNote, onSelectNote, onNewNote, searchQuery, onSearchChange }) {
    return React.createElement('div', { className: 'notes-list-panel' },
      // Search Bar
      React.createElement('div', { className: 'search-bar-container' },
        React.createElement('i', { className: 'material-icons search-icon' }, 'search'),
        React.createElement('input', {
          type: 'text',
          className: 'search-input',
          placeholder: 'Search notes',
          value: searchQuery,
          onChange: (e) => onSearchChange(e.target.value)
        }),
        React.createElement('i', { className: 'material-icons' }, 'tune'),
        React.createElement('i', { className: 'material-icons' }, 'arrow_back')
      ),

      // Notes Header
      React.createElement('div', { className: 'notes-header' },
        React.createElement('div', { className: 'notes-count' },
          `${notes.length} NOTES`
        ),
        React.createElement('button', {
          className: 'new-note-btn',
          onClick: onNewNote
        },
          React.createElement('i', { className: 'material-icons' }, 'add'),
          React.createElement('span', null, 'New note')
        )
      ),

      // Sort Options
      React.createElement('div', { className: 'sort-options' },
        React.createElement('span', null, 'Last changed'),
        React.createElement('i', { className: 'material-icons' }, 'arrow_drop_down')
      ),

      // Notes List
      React.createElement('div', { className: 'notes-items' },
        notes.length === 0 ?
          React.createElement('div', { className: 'empty-state' },
            React.createElement('p', null, 'No notes yet')
          ) :
          notes.map(note =>
            React.createElement('div', {
              key: note.id,
              className: `note-list-item ${note.id === selectedNote?.id ? 'selected' : ''}`,
              onClick: () => onSelectNote(note)
            },
              React.createElement('div', { className: 'note-item-icon' },
                React.createElement('i', { className: 'material-icons' }, 'description')
              ),
              React.createElement('div', { className: 'note-item-content' },
                React.createElement('div', { className: 'note-item-title' }, note.title),
                React.createElement('div', { className: 'note-item-preview' }, note.preview),
                note.tags && note.tags.length > 0 && React.createElement('div', { className: 'note-item-tags' },
                  note.tags.map(tag =>
                    React.createElement('span', { key: tag, className: 'tag-badge' }, tag)
                  )
                ),
                React.createElement('div', { className: 'note-item-time' }, note.timeAgo)
              )
            )
          )
      )
    );
  }

  // Note Editor Component (Right Panel)
  function NoteEditor({ note, onSave, onClose }) {
    const [content, setContent] = useState(note?.content || '');
    const [title, setTitle] = useState(note?.title || 'untitled note');
    const [isSaving, setIsSaving] = useState(false);
    const editorRef = useRef(null);

    useEffect(() => {
      if (note) {
        setContent(note.content || '');
        setTitle(note.title || 'untitled note');
      }
    }, [note?.id]);

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (note && content !== note.content) {
          handleSave();
        }
      }, 1500);
      return () => clearTimeout(timeoutId);
    }, [content]);

    const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
        onSave({...note, content, title: extractTitle(content)});
        setIsSaving(false);
      }, 300);
    };

    const extractTitle = (text) => {
      const firstLine = text.split('\n')[0]?.trim();
      return firstLine && firstLine.length > 0 ? firstLine : 'untitled note';
    };

    if (!note) {
      return React.createElement('div', { className: 'editor-empty-state' },
        React.createElement('div', { className: 'empty-illustration' },
          React.createElement('img', {
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZTBmMmZlIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtc2l6ZT0iNjAiIGZpbGw9IiM2N2IyZGQiPvCfk5o8L3RleHQ+PC9zdmc+',
            alt: 'No note selected'
          })
        ),
        React.createElement('h2', null, 'Tip of the day'),
        React.createElement('p', null, '5 todo lists to consider creating:'),
        React.createElement('ol', null,
          React.createElement('li', null, 'Movies to watch / books to read'),
          React.createElement('li', null, 'Local places to visit'),
          React.createElement('li', null, 'Summer / winter bucket list'),
          React.createElement('li', null, 'Date ideas'),
          React.createElement('li', null, 'Questions to ask elders')
        ),
        React.createElement('button', {
          className: 'start-note-btn',
          onClick: () => onClose()
        },
          React.createElement('i', { className: 'material-icons' }, 'add'),
          'Start a new note'
        )
      );
    }

    return React.createElement('div', { className: 'note-editor-panel' },
      // Editor Header
      React.createElement('div', { className: 'editor-header' },
        React.createElement('h1', { className: 'editor-title' }, title),
        React.createElement('div', { className: 'editor-actions' },
          React.createElement('button', { className: 'editor-btn', title: 'Add a tag' },
            React.createElement('i', { className: 'material-icons' }, 'label')
          ),
          React.createElement('button', { className: 'editor-btn' },
            React.createElement('i', { className: 'material-icons' }, 'more_horiz')
          ),
          isSaving && React.createElement('span', { className: 'saving-text' }, 'Saving...'),
          React.createElement('button', { className: 'publish-btn' },
            React.createElement('i', { className: 'material-icons' }, 'cloud_upload')
          )
        )
      ),

      // Editor Toolbar
      React.createElement('div', { className: 'editor-toolbar' },
        React.createElement('div', { className: 'toolbar-group' },
          React.createElement('button', { className: 'toolbar-btn', title: 'Bold' },
            React.createElement('i', { className: 'material-icons' }, 'format_bold')
          ),
          React.createElement('button', { className: 'toolbar-btn', title: 'Italic' },
            React.createElement('i', { className: 'material-icons' }, 'format_italic')
          ),
          React.createElement('button', { className: 'toolbar-btn', title: 'Strikethrough' },
            React.createElement('i', { className: 'material-icons' }, 'strikethrough_s')
          ),
          React.createElement('button', { className: 'toolbar-btn', title: 'Code' },
            React.createElement('i', { className: 'material-icons' }, 'code')
          )
        ),
        React.createElement('div', { className: 'toolbar-group' },
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('span', null, 'H1')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('span', null, 'H2')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('span', null, 'H3')
          )
        ),
        React.createElement('div', { className: 'toolbar-group' },
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'checklist')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'format_list_bulleted')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'format_list_numbered')
          )
        ),
        React.createElement('div', { className: 'toolbar-group' },
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'table_chart')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'link')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'image')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'attach_file')
          )
        ),
        React.createElement('div', { className: 'toolbar-group' },
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'expand_more')
          )
        ),
        React.createElement('div', { className: 'toolbar-group' },
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'undo')
          ),
          React.createElement('button', { className: 'toolbar-btn' },
            React.createElement('i', { className: 'material-icons' }, 'redo')
          ),
          React.createElement('button', { className: 'toolbar-btn publish-small' },
            React.createElement('i', { className: 'material-icons' }, 'cloud_upload')
          )
        )
      ),

      // Editor Content
      React.createElement('textarea', {
        ref: editorRef,
        className: 'editor-textarea',
        value: content,
        onChange: (e) => setContent(e.target.value),
        placeholder: 'Your mistake was a hidden intention',
        spellCheck: true
      })
    );
  }

  // Main MaxNote App
  function NoteEditorApp(props) {
    const [activeSection, setActiveSection] = useState('notes');
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
      const saved = localStorage.getItem('maxnote-notes');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setNotes(parsed);
          if (parsed.length > 0) setSelectedNote(parsed[0]);
        } catch (e) {
          initializeDefaultNotes();
        }
      } else {
        initializeDefaultNotes();
      }
    }, []);

    const initializeDefaultNotes = () => {
      const defaultNotes = [
        {
          id: 1,
          title: 'Welcome to MaxNote',
          content: 'Welcome to MaxNote\n\nYour powerful note-taking companion.',
          preview: 'Your powerful note-taking companion.',
          tags: ['welcome'],
          timeAgo: 'less than a minute ago',
          createdAt: new Date().toISOString()
        }
      ];
      setNotes(defaultNotes);
      setSelectedNote(defaultNotes[0]);
    };

    useEffect(() => {
      if (notes.length > 0) {
        localStorage.setItem('maxnote-notes', JSON.stringify(notes));
      }
    }, [notes]);

    const handleNewNote = () => {
      const newNote = {
        id: Date.now(),
        title: 'untitled note',
        content: '',
        preview: '',
        tags: [],
        timeAgo: 'less than a minute ago',
        createdAt: new Date().toISOString()
      };
      setNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    };

    const handleSaveNote = (updatedNote) => {
      setNotes(notes.map(n => n.id === updatedNote.id ? {
        ...updatedNote,
        preview: updatedNote.content.substring(0, 100),
        timeAgo: 'just now'
      } : n));
      setSelectedNote(updatedNote);
    };

    return React.createElement('div', { className: 'maxnote-full-app' },
      React.createElement(LeftSidebar, {
        activeSection,
        onSectionChange: setActiveSection,
        userName: props.person?.name || 'User'
      }),
      React.createElement(NotesList, {
        notes,
        selectedNote,
        onSelectNote: setSelectedNote,
        onNewNote: handleNewNote,
        searchQuery,
        onSearchChange: setSearchQuery
      }),
      React.createElement(NoteEditor, {
        note: selectedNote,
        onSave: handleSaveNote,
        onClose: handleNewNote
      })
    );
  }

  // Mount
  function mountApp() {
    const container = document.querySelector('[data-react-class="NoteEditorApp"]');
    if (!container) return;

    const propsData = container.getAttribute('data-react-props');
    let props = {};
    if (propsData) {
      try { props = JSON.parse(propsData); } catch (e) {}
    }

    const root = ReactDOM.createRoot(container);
    root.render(React.createElement(NoteEditorApp, props));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    mountApp();
  }

  window.MaxNote = { NoteEditorApp, mount: mountApp, version: '2.0.0' };

})();
