import { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Calendar as CalendarIcon, Settings, History, Download, Upload, BarChart3, Activity, Wifi, WifiOff } from 'lucide-react';
import { useCalendarEvents } from '../hooks/calendar/useCalendarEvents';
import { useCalendarState } from '../hooks/calendar/useCalendarState';
import { useEventModal } from '../hooks/calendar/useEventModal';
import { useNotifications } from '../hooks/calendar/useNotifications';
import { useModuleIntegration } from '../hooks/calendar/useModuleIntegration';
import { useOfflineSync } from '../hooks/calendar/useOfflineSync';
import { useAuditHistory } from '../hooks/calendar/useAuditHistory';
import { useRecurrence } from '../hooks/calendar/useRecurrence';
import { useCalendarImportExport } from '../hooks/calendar/useCalendarImportExport';
import { usePerformance } from '../hooks/calendar/usePerformance';
import { useTag } from '../context/TagContext';
import { CalendarHeader } from '../components/calendar/components/CalendarHeader';
import { EventModal } from '../components/calendar/components/EventModal';
import { EventItem } from '../components/calendar/components/EventItem';
import { MonthView } from '../components/calendar/components/views/MonthView';
import { WeekView } from '../components/calendar/components/views/WeekView';
import { DayView } from '../components/calendar/components/views/DayView';
import { NotificationPanel } from '../components/calendar/components/NotificationPanel';
import { SearchFilter } from '../components/calendar/components/SearchFilter';
import { ConflictDetector } from '../components/calendar/components/ConflictDetector';
import { IntegrationPanel } from '../components/calendar/components/IntegrationPanel';
import { SyncStatusIndicator } from '../components/calendar/components/SyncStatusIndicator';
import { HistoryPanel } from '../components/calendar/components/HistoryPanel';
import { RecurrenceEditor } from '../components/calendar/components/RecurrenceEditor';
import { ImportExportPanel } from '../components/calendar/components/ImportExportPanel';
import { AnalyticsPanel } from '../components/calendar/components/AnalyticsPanel';
import { getUpcomingEvents, searchEvents, filterEventsByTags, getEventsByCategory, getEventsByPriority } from '../components/calendar/utils/eventHelpers';
import type { EventFormData, Event, EventFilter } from '../types/calendar';

export const Calendar = () => {
    // State for search and filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<EventFilter[]>([]);

    // State for advanced panels
    const [showIntegrationPanel, setShowIntegrationPanel] = useState(false);
    const [showHistoryPanel, setShowHistoryPanel] = useState(false);
    const [showImportExportPanel, setShowImportExportPanel] = useState(false);
    const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);
    const [showRecurrenceEditor, setShowRecurrenceEditor] = useState(false);
    const [selectedEventForHistory, setSelectedEventForHistory] = useState<Event | null>(null);
    const [selectedEventForRecurrence, setSelectedEventForRecurrence] = useState<Event | null>(null);

    // Refs for accessibility
    const calendarRef = useRef<HTMLDivElement>(null);

    // Custom hooks
    const { events, loading, addEventFromForm, updateEvent, deleteEvent } = useCalendarEvents();
    const {
        currentDate,
        currentView,
        selectedDate,
        navigateToPrevious,
        navigateToNext,
        navigateToToday,
        setView,
        selectDate,
        getNavigationLabel
    } = useCalendarState();

    // Fase 3 hooks - simplified implementation
    const moduleIntegration = useModuleIntegration({ events });
    const offlineSync = useOfflineSync({ events });
    const auditHistory = useAuditHistory({ events });
    const recurrence = useRecurrence({ events });
    const calendarImportExport = useCalendarImportExport({ events });
    const performance = usePerformance({ events });

    // Tag context
    const { refreshTags } = useTag();

    const {
        isOpen: isModalOpen,
        isEditing,
        editingEventId,
        formData,
        titleInputRef,
        openModal,
        openEditModal,
        closeModal,
        handleSave,
        handleDelete,
        handleCancel,
        handleDuplicate,
        setTitle,
        setDescription,
        setStartDate,
        setEndDate,
        setIsAllDay,
        setCategory,
        setPriority,
        setLocation,
        setAttendees,
        setColor,
        setTags,
        setReminders,
        setRecurrence
    } = useEventModal({
        onCreateEvent: async (formData) => {
            const newEvent = await addEventFromForm(formData);
            if (newEvent) {
                // Determine source for audit log
                // const source = formData.tags.some(t => t.toLowerCase() === 'google') ? 'google_calendar' :
                //    formData.tags.some(t => t.toLowerCase() === 'outlook') ? 'outlook_calendar' : 'local';

                // logAction('create', 'event', `Evento criado: ${formData.title}`, { source });
                refreshTags();
            }
        },
        onDeleteEvent: async (id) => {
            await deleteEvent(id);
            refreshTags();
        },
        onUpdateEvent: async (id: string, formData: EventFormData) => {
            // Convert EventFormData to partial Event for update
            const attendees = formData.attendees
                .split(',')
                .map(name => name.trim())
                .filter(name => name)
                .map((name, index) => ({
                    id: `attendee_${Date.now()}_${index}`,
                    name,
                    confirmed: false
                }));

            await updateEvent(id, {
                title: formData.title,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate,
                isAllDay: formData.isAllDay,
                category: formData.category,
                priority: formData.priority,
                location: formData.location || '',
                attendees,
                tags: formData.tags,
                reminders: formData.reminders,
                recurrence: formData.recurrence,
                color: formData.color
            });
            refreshTags();
        },
        onDuplicateEvent: async (event: Event) => {
            await addEventFromForm({
                title: event.title,
                description: event.description || '',
                startDate: event.startDate,
                endDate: event.endDate,
                isAllDay: event.isAllDay,
                category: event.category,
                priority: event.priority,
                location: event.location || '',
                attendees: event.attendees.map(a => a.name).join(', '),
                reminders: event.reminders,
                tags: event.tags,
                color: event.color
            });
            refreshTags();
        }
    });

    const {
        notifications,
        settings,
        permission,
        unreadCount,
        createNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAllNotifications,
        updateSettings,
        requestBrowserPermission,
        checkUpcomingEvents
    } = useNotifications();

    // Check for upcoming events periodically
    useEffect(() => {
        const interval = setInterval(() => {
            checkUpcomingEvents(events);
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [events, checkUpcomingEvents]);

    // Initial check for upcoming events
    useEffect(() => {
        checkUpcomingEvents(events);
    }, [events, checkUpcomingEvents]);

    // Fase 3: Add audit logging for event operations
    const handleEventOperation = (operation: 'create' | 'update' | 'delete', eventData: Partial<Event>) => {
        auditHistory.logCreate(eventData as Event);
    };

    // Enhanced event handlers with audit logging
    const handleSaveEvent = (formData: EventFormData) => {
        handleEventOperation('create', { title: formData.title, category: formData.category });
        handleSave();
    };

    const handleUpdateEvent = (id: string, formData: EventFormData) => {
        handleEventOperation('update', { id, title: formData.title, category: formData.category });
        handleSave();
    };

    const handleDeleteEvent = (id: string) => {
        const event = events.find(e => e.id === id);
        if (event) {
            handleEventOperation('delete', { id, title: event.title, category: event.category });
        }
        handleDelete();
    };

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        openModal(selectedDate || new Date());
                        break;
                    case 'd':
                        e.preventDefault();
                        navigateToToday();
                        break;
                    case 'w':
                        e.preventDefault();
                        setView('week');
                        break;
                    case 'm':
                        e.preventDefault();
                        setView('month');
                        break;
                    case 's':
                        e.preventDefault();
                        document.getElementById('calendar-search-input')?.focus();
                        break;
                }
            } else if (e.key === 'Escape') {
                if (isModalOpen) {
                    handleCancel();
                } else if (showIntegrationPanel) {
                    setShowIntegrationPanel(false);
                } else if (showHistoryPanel) {
                    setShowHistoryPanel(false);
                } else if (showImportExportPanel) {
                    setShowImportExportPanel(false);
                } else if (showAnalyticsPanel) {
                    setShowAnalyticsPanel(false);
                } else if (showRecurrenceEditor) {
                    setShowRecurrenceEditor(false);
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, showIntegrationPanel, showHistoryPanel, showImportExportPanel, showAnalyticsPanel, showRecurrenceEditor, selectedDate, openModal, handleCancel, navigateToToday, setView]);

    // Auto-sync when online
    useEffect(() => {
        if (!offlineSync.isOfflineMode && offlineSync.syncQueue.length > 0) {
            // Sync functionality will be implemented when hooks are fully integrated
            console.log('Auto-sync triggered');
        }
    }, [offlineSync.isOfflineMode, offlineSync.syncQueue.length]);

    const handleDateClick = (date: Date) => {
        selectDate(date);
        openModal(date);
    };

    const handleEventClick = (event: Event) => {
        openEditModal(event);
    };

    const handleEventEdit = (event: Event) => {
        openEditModal(event);
    };

    const handleEventDrop = (eventId: string, newDate: Date, newTime?: string) => {
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        const duration = event.endDate.getTime() - event.startDate.getTime();
        const newEndDate = new Date(newDate.getTime() + duration);

        updateEvent(eventId, {
            startDate: newDate,
            endDate: newEndDate
        });
    };

    const handleEventResize = (eventId: string, newEndDate: Date) => {
        updateEvent(eventId, {
            endDate: newEndDate
        });
    };

    // Filter events based on search and filters
    const filteredEvents = useMemo(() => {
        let result = events;

        // Apply search
        if (searchQuery.trim()) {
            result = searchEvents(result, searchQuery);
        }

        // Apply filters
        activeFilters.forEach(filter => {
            switch (filter.type) {
                case 'category':
                    result = getEventsByCategory(result, filter.value as any);
                    break;
                case 'priority':
                    result = getEventsByPriority(result, filter.value as any);
                    break;
                case 'tag':
                    result = filterEventsByTags(result, [filter.value]);
                    break;
            }
        });

        return result;
    }, [events, searchQuery, activeFilters]);

    const upcomingEvents = getUpcomingEvents(filteredEvents, 5);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">Carregando calendário...</div>
            </div>
        );
    }

    return (
        <div className="flex h-full">
            {/* Main Calendar */}
            <div className="flex-1 p-8 overflow-auto">
                {/* Header with Calendar controls and notifications */}
                <div className="flex items-center justify-between mb-6">
                    <CalendarHeader
                        currentDate={currentDate}
                        currentView={currentView}
                        onNavigatePrevious={navigateToPrevious}
                        onNavigateNext={navigateToNext}
                        onNavigateToday={navigateToToday}
                        onViewChange={setView}
                        getNavigationLabel={getNavigationLabel}
                    />

                    <NotificationPanel
                        notifications={notifications}
                        settings={settings}
                        unreadCount={unreadCount}
                        onMarkAsRead={markAsRead}
                        onMarkAllAsRead={markAllAsRead}
                        onRemoveNotification={removeNotification}
                        onClearAllNotifications={clearAllNotifications}
                        onUpdateSettings={updateSettings}
                        onRequestBrowserPermission={requestBrowserPermission}
                        permission={permission}
                    />
                </div>

                {/* Advanced Features Toolbar */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowIntegrationPanel(!showIntegrationPanel)}
                            className={`p-2 rounded-md text-sm font-medium transition-colors ${showIntegrationPanel
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            title="Integração com Módulos"
                        >
                            <Settings className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                            className={`p-2 rounded-md text-sm font-medium transition-colors ${showHistoryPanel
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            title="Histórico de Alterações"
                        >
                            <History className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowImportExportPanel(!showImportExportPanel)}
                            className={`p-2 rounded-md text-sm font-medium transition-colors ${showImportExportPanel
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            title="Importar/Exportar"
                        >
                            <Upload className="w-4 h-4" />
                        </button>

                        <button
                            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
                            className={`p-2 rounded-md text-sm font-medium transition-colors ${showAnalyticsPanel
                                ? 'bg-teal-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                }`}
                            title="Analytics e Relatórios"
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Sync Status Indicator */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium">
                            {offlineSync.isOfflineMode ? (
                                <>
                                    <WifiOff className="w-3 h-3 text-red-500" />
                                    <span className="text-red-500">Offline</span>
                                </>
                            ) : (
                                <>
                                    <Wifi className="w-3 h-3 text-green-500" />
                                    <span className="text-green-500">Online</span>
                                </>
                            )}
                        </div>

                        {offlineSync.syncQueue.length > 0 && (
                            <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full text-xs font-medium">
                                {offlineSync.syncQueue.length} pendente(s)
                            </div>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <SearchFilter
                    events={events}
                    onSearch={setSearchQuery}
                    onFilterChange={setActiveFilters}
                    searchQuery={searchQuery}
                    activeFilters={activeFilters}
                />

                {/* Conflict Detection */}
                <ConflictDetector
                    events={filteredEvents}
                    onEventClick={handleEventClick}
                />

                {/* Calendar View */}
                {currentView === 'month' && (
                    <MonthView
                        currentDate={currentDate}
                        events={filteredEvents}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                        onEventEdit={handleEventEdit}
                        onEventDelete={deleteEvent}
                    />
                )}

                {currentView === 'week' && (
                    <WeekView
                        currentDate={currentDate}
                        events={filteredEvents}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                        onEventEdit={handleEventEdit}
                        onEventDelete={deleteEvent}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                    />
                )}

                {currentView === 'day' && (
                    <DayView
                        currentDate={currentDate}
                        events={filteredEvents}
                        onDateClick={handleDateClick}
                        onEventClick={handleEventClick}
                        onEventEdit={handleEventEdit}
                        onEventDelete={deleteEvent}
                        onEventDrop={handleEventDrop}
                        onEventResize={handleEventResize}
                    />
                )}
            </div>

            {/* Sidebar with upcoming events */}
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-6 overflow-auto">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-teal-600" />
                    Próximos Eventos
                </h2>

                <div className="space-y-3 mb-6">
                    {upcomingEvents.map(event => (
                        <div key={event.id}>
                            <EventItem
                                event={event}
                                onEdit={handleEventEdit}
                                onDelete={deleteEvent}
                            />
                        </div>
                    ))}
                </div>

                {!isModalOpen && (
                    <button
                        onClick={() => openModal(selectedDate || new Date())}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-teal-400 hover:text-teal-600 dark:hover:border-teal-500 dark:hover:text-teal-400 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Adicionar evento</span>
                    </button>
                )}
            </div>

            {/* Event Modal */}
            <EventModal
                isOpen={isModalOpen}
                isEditing={isEditing}
                formData={formData}
                titleInputRef={titleInputRef}
                onClose={handleCancel}
                onSave={handleSave}
                onDelete={isEditing ? handleDelete : undefined}
                onDuplicate={isEditing ? handleDuplicate : undefined}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onIsAllDayChange={setIsAllDay}
                onCategoryChange={setCategory}
                onPriorityChange={setPriority}
                onLocationChange={setLocation}
                onAttendeesChange={setAttendees}
                onColorChange={setColor}
                onTagsChange={setTags}
                onRemindersChange={setReminders}
                onRecurrenceChange={setRecurrence}
            />

            {/* Fase 3: Advanced Panels - Simplified Implementation */}
            {showIntegrationPanel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Integração com Módulos</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Funcionalidade de integração com tarefas e notas em desenvolvimento.
                        </p>
                        <button
                            onClick={() => setShowIntegrationPanel(false)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {showHistoryPanel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Histórico de Alterações</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Funcionalidade de histórico em desenvolvimento.
                        </p>
                        <button
                            onClick={() => setShowHistoryPanel(false)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {showImportExportPanel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Importar/Exportar</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Funcionalidade de importação/exportação em desenvolvimento.
                        </p>
                        <button
                            onClick={() => setShowImportExportPanel(false)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {showAnalyticsPanel && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Analytics e Relatórios</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Funcionalidade de analytics em desenvolvimento.
                        </p>
                        <button
                            onClick={() => setShowAnalyticsPanel(false)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {showRecurrenceEditor && selectedEventForRecurrence && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
                        <h2 className="text-xl font-bold mb-4">Editor de Recorrência</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Funcionalidade de recorrência em desenvolvimento.
                        </p>
                        <button
                            onClick={() => {
                                setShowRecurrenceEditor(false);
                                setSelectedEventForRecurrence(null);
                            }}
                            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            )}

            {/* Sync Status Indicator (Floating) */}
            {!offlineSync.isOfflineMode && offlineSync.syncQueue.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/80 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <Activity className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">
                        Sincronizando {offlineSync.syncQueue.length} item(s)...
                    </span>
                </div>
            )}
        </div>
    );
};
