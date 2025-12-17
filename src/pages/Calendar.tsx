import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Plus, Edit, Trash2, MoreHorizontal } from 'lucide-react';

interface Event {
    id: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    type: 'meeting' | 'task' | 'reminder' | 'event';
    location?: string;
    attendees?: string[];
    color: string;
}

const mockEvents: Event[] = [
    {
        id: '1',
        title: 'Team standup',
        date: new Date('2025-12-16'),
        startTime: '09:00',
        endTime: '09:30',
        type: 'meeting',
        location: 'Virtual',
        attendees: ['John', 'Sarah', 'Mike'],
        color: 'bg-blue-500',
    },
    {
        id: '2',
        title: 'Deadline: MaxNote Launch',
        date: new Date('2025-12-18'),
        startTime: '17:00',
        endTime: '17:00',
        type: 'task',
        color: 'bg-red-500',
    },
    {
        id: '3',
        title: 'Doctor appointment',
        date: new Date('2025-12-18'),
        startTime: '14:00',
        endTime: '15:00',
        type: 'reminder',
        location: 'Medical Center',
        color: 'bg-purple-500',
    },
    {
        id: '4',
        title: 'Product demo',
        date: new Date('2025-12-20'),
        startTime: '15:00',
        endTime: '16:00',
        type: 'meeting',
        attendees: ['Clients', 'Sales team'],
        color: 'bg-green-500',
    },
];

export const Calendar = () => {
    const [events, setEvents] = useState<Event[]>(mockEvents);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<'month' | 'week' | 'day'>('month');
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState('');
    const [newEventDate, setNewEventDate] = useState('');
    const [newEventStartTime, setNewEventStartTime] = useState('');
    const [newEventEndTime, setNewEventEndTime] = useState('');
    const [newEventType, setNewEventType] = useState<'meeting' | 'task' | 'reminder' | 'event'>('event');
    const [newEventLocation, setNewEventLocation] = useState('');
    const [newEventAttendees, setNewEventAttendees] = useState('');
    const [newEventColor, setNewEventColor] = useState('bg-blue-500');
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingDate, setEditingDate] = useState('');
    const [editingStartTime, setEditingStartTime] = useState('');
    const [editingEndTime, setEditingEndTime] = useState('');
    const [editingType, setEditingType] = useState<'meeting' | 'task' | 'reminder' | 'event'>('event');
    const [editingLocation, setEditingLocation] = useState('');
    const [editingAttendees, setEditingAttendees] = useState('');
    const [editingColor, setEditingColor] = useState('bg-blue-500');
    const [showOptions, setShowOptions] = useState<string | null>(null);
    const newEventRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isCreatingNew && newEventRef.current) {
            newEventRef.current.focus();
        }
    }, [isCreatingNew]);

    const createNewEvent = () => {
        if (newEventTitle.trim() && newEventDate) {
            const newEvent: Event = {
                id: Date.now().toString(),
                title: newEventTitle.trim(),
                date: new Date(newEventDate),
                startTime: newEventStartTime,
                endTime: newEventEndTime,
                type: newEventType,
                location: newEventLocation.trim(),
                attendees: newEventAttendees.split(',').map(a => a.trim()).filter(a => a),
                color: newEventColor,
            };
            setEvents([...events, newEvent]);
            setNewEventTitle('');
            setNewEventDate('');
            setNewEventStartTime('');
            setNewEventEndTime('');
            setNewEventType('event');
            setNewEventLocation('');
            setNewEventAttendees('');
            setNewEventColor('bg-blue-500');
            setIsCreatingNew(false);
        }
    };

    const deleteEvent = (id: string) => {
        setEvents(events.filter(event => event.id !== id));
        setShowOptions(null);
    };

    const startEditing = (event: Event) => {
        setEditingEventId(event.id);
        setEditingTitle(event.title);
        setEditingDate(event.date.toISOString().split('T')[0]);
        setEditingStartTime(event.startTime);
        setEditingEndTime(event.endTime);
        setEditingType(event.type);
        setEditingLocation(event.location || '');
        setEditingAttendees(event.attendees ? event.attendees.join(', ') : '');
        setEditingColor(event.color);
        setShowOptions(null);
    };

    const saveEdit = () => {
        if (editingEventId && editingTitle.trim() && editingDate) {
            setEvents(events.map(event =>
                event.id === editingEventId
                    ? {
                        ...event,
                        title: editingTitle.trim(),
                        date: new Date(editingDate),
                        startTime: editingStartTime,
                        endTime: editingEndTime,
                        type: editingType,
                        location: editingLocation.trim(),
                        attendees: editingAttendees.split(',').map(a => a.trim()).filter(a => a),
                        color: editingColor
                    }
                    : event
            ));
            setEditingEventId(null);
            setEditingTitle('');
            setEditingDate('');
            setEditingStartTime('');
            setEditingEndTime('');
            setEditingType('event');
            setEditingLocation('');
            setEditingAttendees('');
            setEditingColor('bg-blue-500');
        }
    };

    const cancelEdit = () => {
        setEditingEventId(null);
        setEditingTitle('');
        setEditingDate('');
        setEditingStartTime('');
        setEditingEndTime('');
        setEditingType('event');
        setEditingLocation('');
        setEditingAttendees('');
        setEditingColor('bg-blue-500');
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const getEventsForDate = (date: Date | null) => {
        if (!date) return [];
        return events.filter(event =>
            event.date.toDateString() === date.toDateString()
        );
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const isToday = (date: Date | null) => {
        if (!date) return false;
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const upcomingEvents = events
        .filter(event => event.date >= new Date())
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 5);

    const EventForm = ({
        isEditing = false,
        onCancel,
        onSave
    }: {
        isEditing?: boolean;
        onCancel: () => void;
        onSave: () => void;
    }) => (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
            <div className="space-y-4">
                <input
                    ref={isEditing ? undefined : newEventRef}
                    type="text"
                    value={isEditing ? editingTitle : newEventTitle}
                    onChange={(e) => isEditing ? setEditingTitle(e.target.value) : setNewEventTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Event title"
                />
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="date"
                        value={isEditing ? editingDate : newEventDate}
                        onChange={(e) => isEditing ? setEditingDate(e.target.value) : setNewEventDate(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <select
                        value={isEditing ? editingType : newEventType}
                        onChange={(e) => isEditing ? setEditingType(e.target.value as any) : setNewEventType(e.target.value as any)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                        <option value="event">Event</option>
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="reminder">Reminder</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <input
                        type="time"
                        value={isEditing ? editingStartTime : newEventStartTime}
                        onChange={(e) => isEditing ? setEditingStartTime(e.target.value) : setNewEventStartTime(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <input
                        type="time"
                        value={isEditing ? editingEndTime : newEventEndTime}
                        onChange={(e) => isEditing ? setEditingEndTime(e.target.value) : setNewEventEndTime(e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
                <input
                    type="text"
                    value={isEditing ? editingLocation : newEventLocation}
                    onChange={(e) => isEditing ? setEditingLocation(e.target.value) : setNewEventLocation(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Location (optional)"
                />
                <input
                    type="text"
                    value={isEditing ? editingAttendees : newEventAttendees}
                    onChange={(e) => isEditing ? setEditingAttendees(e.target.value) : setNewEventAttendees(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Attendees (comma separated, optional)"
                />
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Color:</span>
                    <div className="flex gap-2">
                        {['bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'].map(color => (
                            <button
                                key={color}
                                onClick={() => isEditing ? setEditingColor(color) : setNewEventColor(color)}
                                className={`w-6 h-6 rounded-full ${color} ${(isEditing ? editingColor : newEventColor) === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSave}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
                    >
                        {isEditing ? 'Update Event' : 'Create Event'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-full">
            {/* Main Calendar */}
            <div className="flex-1 p-8 overflow-auto">
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">{monthName}</h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={previousMonth}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                Today
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setView('day')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'day' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Day
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'week' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Week
                        </button>
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === 'month' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Month
                        </button>
                    </div>
                </header>

                {isCreatingNew && (
                    <EventForm
                        onCancel={() => {
                            setIsCreatingNew(false);
                            setNewEventTitle('');
                            setNewEventDate('');
                            setNewEventStartTime('');
                            setNewEventEndTime('');
                            setNewEventType('event');
                            setNewEventLocation('');
                            setNewEventAttendees('');
                            setNewEventColor('bg-blue-500');
                        }}
                        onSave={createNewEvent}
                    />
                )}

                {/* Calendar Grid */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Week days header */}
                    <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
                        {weekDays.map(day => (
                            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-600">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar days */}
                    <div className="grid grid-cols-7">
                        {days.map((date, index) => {
                            const events = getEventsForDate(date);
                            return (
                                <div
                                    key={index}
                                    className={`min-h-[120px] border-b border-r border-gray-100 p-2 ${!date ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'
                                        } transition-colors`}
                                >
                                    {date && (
                                        <>
                                            <div className={`text-sm font-medium mb-1 ${isToday(date)
                                                ? 'inline-flex items-center justify-center w-7 h-7 rounded-full bg-teal-600 text-white'
                                                : 'text-gray-700'
                                                }`}>
                                                {date.getDate()}
                                            </div>
                                            <div className="space-y-1">
                                                {events.map(event => (
                                                    <div
                                                        key={event.id}
                                                        className={`text-xs ${event.color} text-white px-2 py-1 rounded truncate cursor-pointer hover:opacity-90 transition-opacity relative`}
                                                        title={event.title}
                                                    >
                                                        {event.startTime} {event.title}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowOptions(showOptions === event.id ? null : event.id);
                                                            }}
                                                            className="absolute right-1 top-1 opacity-0 hover:opacity-100"
                                                        >
                                                            <MoreHorizontal className="w-3 h-3 text-white" />
                                                        </button>

                                                        {showOptions === event.id && (
                                                            <div className="absolute z-10 right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        startEditing(event);
                                                                    }}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
                                                                    <Edit className="w-4 h-4" />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteEvent(event.id);
                                                                    }}
                                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Sidebar with upcoming events */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 p-6 overflow-auto">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-teal-600" />
                    Upcoming Events
                </h2>

                {editingEventId && (
                    <EventForm
                        isEditing={true}
                        onCancel={cancelEdit}
                        onSave={saveEdit}
                    />
                )}

                <div className="space-y-3 mb-6">
                    {upcomingEvents.map(event => (
                        <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer relative">
                            <div className="flex items-start gap-3">
                                <div className={`w-1 h-full ${event.color} rounded-full`} />
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1">{event.title}</h3>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-3.5 h-3.5" />
                                            <span>{event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{event.startTime} - {event.endTime}</span>
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>{event.location}</span>
                                            </div>
                                        )}
                                        {event.attendees && (
                                            <div className="flex items-center gap-2">
                                                <Users className="w-3.5 h-3.5" />
                                                <span>{event.attendees.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowOptions(showOptions === event.id ? null : event.id)}
                                className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-md"
                            >
                                <MoreHorizontal className="w-4 h-4 text-gray-400" />
                            </button>

                            {showOptions === event.id && (
                                <div className="absolute z-10 right-2 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
                                    <button
                                        onClick={() => startEditing(event)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteEvent(event.id)}
                                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {!isCreatingNew && !editingEventId && (
                    <button
                        onClick={() => setIsCreatingNew(true)}
                        className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-teal-400 hover:text-teal-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add event</span>
                    </button>
                )}
            </div>
        </div>
    );
};
