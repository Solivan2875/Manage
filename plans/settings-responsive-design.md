# MaxNote Settings - Responsive Design Specifications

## Responsive Design Strategy

The Settings page will follow a mobile-first responsive design approach, ensuring optimal experience across all device sizes while maintaining the established design language of MaxNote.

## Breakpoint System

```css
/* Breakpoints based on Tailwind CSS defaults */
/* Mobile: 0px - 767px */
/* Tablet: 768px - 1023px */
/* Desktop: 1024px and above */

/* Custom breakpoints for specific components */
/* Small Mobile: 0px - 479px */
/* Mobile: 480px - 767px */
/* Tablet: 768px - 1023px */
/* Small Desktop: 1024px - 1279px */
/* Large Desktop: 1280px and above */
```

## Layout Adaptations

### Mobile Layout (< 768px)

```typescript
// Mobile-specific adaptations
const MobileSettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Collapsible sidebar that becomes bottom navigation */}
      <MobileSettingsNav />
      
      {/* Main content takes full width */}
      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
};

// Mobile navigation component
const MobileSettingsNav: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  return (
    <>
      {/* Floating action button */}
      <button
        onClick={() => setIsNavOpen(!isNavOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 bg-teal-600 text-white rounded-full shadow-lg flex items-center justify-center md:hidden"
        aria-label="Menu de configurações"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Bottom sheet navigation */}
      <div className={`fixed inset-x-0 bottom-0 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
        isNavOpen ? 'translate-y-0' : 'translate-y-full'
      }`}>
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-xl">
          <div className="px-4 py-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configurações
            </h3>
            <nav className="space-y-2">
              {/* Navigation items */}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};
```

### Tablet Layout (768px - 1023px)

```typescript
// Tablet-specific adaptations
const TabletSettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar becomes slide-out or persistent based on orientation */}
      <aside className="w-64 lg:w-64 flex-shrink-0 transform transition-transform duration-300 ease-in-out">
        <SettingsSidebar />
      </aside>
      
      {/* Main content with appropriate padding */}
      <main className="flex-1 lg:ml-0 p-4 lg:p-6">
        {children}
      </main>
    </div>
  );
};
```

### Desktop Layout (1024px+)

```typescript
// Desktop layout (already designed in main architecture)
const DesktopSettingsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <aside className="w-64 flex-shrink-0">
        <SettingsSidebar />
      </aside>
      
      {/* Main content with standard padding */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};
```

## Component-Specific Responsive Behavior

### SettingsLayout Component

```typescript
// Responsive SettingsLayout
const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Responsive sidebar */}
      <aside className="lg:w-64 w-full lg:flex-shrink-0">
        {/* Mobile: Tab bar */}
        <div className="lg:hidden flex overflow-x-auto pb-2 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex-shrink-0 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-teal-700 dark:text-teal-400 border-b-2 border-teal-600'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border-b-2 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop: Vertical sidebar */}
        <nav className="hidden lg:block space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 border-l-4 border-teal-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <TabIcon className="w-5 h-5" />
              <span>{tab.label}</span>
              {activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 min-w-0">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {children}
        </div>
      </main>
    </div>
  );
};
```

### SettingsCard Component

```typescript
// Responsive SettingsCard
const SettingsCard: React.FC<SettingsCardProps> = ({
  title,
  description,
  children,
  className
}) => {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700",
      "shadow-sm hover:shadow-md transition-shadow",
      // Mobile adjustments
      "mx-4 lg:mx-0 mb-4 lg:mb-6",
      // Responsive padding
      "p-4 lg:p-6",
      className
    )}>
      {(title || description) && (
        <div className="mb-4 lg:mb-6 border-b border-gray-200 dark:border-gray-700 pb-4 lg:pb-6">
          {title && (
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {description}
            </p>
          )}
        </div>
      )}
      
      <div className={cn(
        // Responsive spacing
        "space-y-4 lg:space-y-6",
        // Mobile-specific adjustments
        "text-sm lg:text-base"
      )}>
        {children}
      </div>
    </div>
  );
};
```

### Form Components

```typescript
// Responsive form layouts
const ResponsiveFormLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Single column on mobile, two columns on larger screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {children}
      </div>
    </div>
  );
};

// Responsive input sizing
const ResponsiveInput: React.FC<SettingsInputProps> = (props) => {
  return (
    <input
      {...props}
      className={cn(
        "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg",
        "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
        "focus:ring-2 focus:ring-teal-500 focus:border-teal-500",
        "text-base lg:text-sm", // Smaller text on larger screens
        props.className
      )}
    />
  );
};
```

### Data Tables and Lists

```typescript
// Responsive data display
const ResponsiveDataTable: React.FC<{ data: any[]; columns: any[] }> = ({ data, columns }) => {
  return (
    <div className="overflow-x-auto lg:overflow-visible">
      {/* Mobile: Card-based layout */}
      <div className="lg:hidden space-y-4">
        {data.map((row, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            {columns.map((column, colIndex) => (
              <div key={colIndex} className="mb-2 last:mb-0">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {column.header}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  {row[column.key]}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden lg:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {columns.map((column, index) => (
                <th key={index} className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-4 py-3">
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

## Touch-Friendly Interactions

```typescript
// Mobile-optimized button sizes
const MobileButton: React.FC<SettingsButtonProps> = ({ children, ...props }) => {
  return (
    <button
      {...props}
      className={cn(
        "min-h-[44px] min-w-[44px]", // Minimum touch target size
        "text-base lg:text-sm", // Larger text on mobile
        "px-4 py-3 lg:px-3 lg:py-2", // More padding on mobile
        props.className
      )}
    >
      {children}
    </button>
  );
};

// Touch-friendly toggle switches
const MobileToggle: React.FC<SettingsToggleProps> = ({ label, ...props }) => {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-base lg:text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <button
        {...props}
        className={cn(
          "relative inline-flex h-8 w-14 items-center rounded-full transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2",
          // Larger touch area
          "lg:h-6 lg:w-11"
        )}
      >
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
};
```

## Accessibility Enhancements

```typescript
// Focus management for mobile
const useMobileFocusManagement = () => {
  useEffect(() => {
    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        // Manage focus within modal/dialog on mobile
        const focusableElements = document.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
          e.preventDefault();
          const firstElement = focusableElements[0] as HTMLElement;
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleFocusTrap);
    return () => document.removeEventListener('keydown', handleFocusTrap);
  }, []);

  return null;
};

// Screen reader announcements
const useScreenReaderAnnouncements = () => {
  const announce = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  return { announce };
};
```

## Performance Optimizations

```typescript
// Lazy loading for mobile
const useLazyComponentLoading = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile };
};

// Optimized rendering for mobile
const OptimizedSettingsSection: React.FC<{ 
  title: string; 
  children: React.ReactNode;
  lazy?: boolean;
}> = ({ title, children, lazy = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!lazy) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
  }, [lazy]);

  return (
    <div ref={sectionRef} className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      
      <div className={cn(
        "transition-all duration-300",
        !isVisible && "opacity-0 transform translate-y-4",
        isVisible && "opacity-100 transform translate-y-0"
      )}>
        {children}
      </div>
    </div>
  );
};
```

## CSS Media Queries

```css
/* Custom responsive utilities */
.settings-container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
}

.settings-grid {
  @apply grid grid-cols-1 gap-4;
}

@media (min-width: 640px) {
  .settings-grid {
    @apply grid-cols-2 gap-6;
  }
}

@media (min-width: 1024px) {
  .settings-grid {
    @apply grid-cols-3 gap-8;
  }
}

.settings-form {
  @apply space-y-4;
}

@media (min-width: 768px) {
  .settings-form {
    @apply space-y-6;
  }
}

.settings-card {
  @apply bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm;
}

@media (max-width: 767px) {
  .settings-card {
    @apply mx-4 shadow-lg;
  }
}

.settings-input {
  @apply w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500;
}

@media (min-width: 768px) {
  .settings-input {
    @apply text-sm;
  }
}

/* Touch-friendly targets */
@media (max-width: 767px) {
  .settings-touch-target {
    min-height: 44px;
    min-width: 44px;
  }
  
  .settings-toggle {
    height: 48px;
    width: 80px;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .settings-animate {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .settings-high-contrast {
    border-width: 2px;
    filter: contrast(1.2);
  }
}
```

This responsive design system ensures that:
1. Mobile users get optimized touch interfaces and simplified layouts
2. Tablet users benefit from adaptive layouts that use screen space efficiently
3. Desktop users get the full-featured experience with optimal information density
4. All users get accessible, performant interfaces that respect their device capabilities
5. Performance is optimized through lazy loading and efficient rendering patterns