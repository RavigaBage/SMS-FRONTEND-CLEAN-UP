# First-Time User Guide Component

An interactive onboarding guide that walks new users through the essential setup steps before they can start using your app.

## Features

- **Progressive Step System**: Multi-step wizard with visual progress tracking
- **Prerequisite Enforcement**: Users must complete each step before moving forward
- **Beautiful Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Works on all screen sizes
- **Customizable**: Easy to modify colors, steps, and content

## Prerequisites Required by the App

The guide enforces these setup steps in order:

1. **Add Teachers** - Users must add at least one teacher to the system
2. **Create Classes** - Set up classes with subjects and schedules
3. **Configure Settings** - Review app settings and preferences

## Integration Guide

### Step 1: Install Dependencies

```bash
npm install lucide-react
```

### Step 2: Add to Your App

Import and use the component in your main app file:

```jsx
import FirstTimeGuide from './first-time-guide';
import { useState, useEffect } from 'react';

function App() {
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Check if this is the user's first time
    const hasSeenGuide = localStorage.getItem('hasSeenGuide');
    if (!hasSeenGuide) {
      setShowGuide(true);
    }
  }, []);

  const handleGuideComplete = () => {
    setShowGuide(false);
    localStorage.setItem('hasSeenGuide', 'true');
  };

  return (
    <>
      {showGuide && <FirstTimeGuide onComplete={handleGuideComplete} />}
      {/* Your main app content */}
    </>
  );
}
```

### Step 3: Connect to Your Backend

Modify the component to actually perform actions when users click the buttons:

```jsx
const handleStepComplete = async (stepId) => {
  if (stepId === 'teachers') {
    // Navigate to teacher creation page
    navigate('/teachers/add');
  } else if (stepId === 'classes') {
    // Navigate to class creation page
    navigate('/classes/create');
  } else if (stepId === 'settings') {
    // Navigate to settings page
    navigate('/settings');
  }
  
  // Mark as completed
  if (!completedSteps.includes(stepId)) {
    setCompletedSteps([...completedSteps, stepId]);
    // Optionally save progress to backend
    await saveProgress(stepId);
  }
};
```

## Customization

### Changing Prerequisites

Edit the `prerequisites` array in the component:

```jsx
const prerequisites = [
  {
    id: 'your-step-id',
    icon: YourIcon, // from lucide-react
    title: 'Step Title',
    description: 'Step description text',
    action: 'Button Text',
    color: '#HEX_COLOR',
    bgGradient: 'linear-gradient(135deg, #START 0%, #END 100%)'
  },
  // Add more steps...
];
```

### Changing Colors

The component uses a purple gradient theme. To change:

```css
/* Main background gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);

/* Header gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Primary button */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Modifying Features List

Update the `features` array to show your app's capabilities:

```jsx
const features = [
  { title: 'Feature Name', desc: 'Feature description' },
  // Add more features...
];
```

## State Management Integration

### With Redux

```jsx
import { useSelector, useDispatch } from 'react-redux';

function FirstTimeGuide() {
  const dispatch = useDispatch();
  const completedSteps = useSelector(state => state.onboarding.completedSteps);
  
  const handleStepComplete = (stepId) => {
    dispatch(completeOnboardingStep(stepId));
  };
  
  // ... rest of component
}
```

### With Context API

```jsx
import { useOnboarding } from './OnboardingContext';

function FirstTimeGuide() {
  const { completedSteps, completeStep } = useOnboarding();
  
  const handleStepComplete = (stepId) => {
    completeStep(stepId);
  };
  
  // ... rest of component
}
```

## Checking Prerequisites

You can check if prerequisites are met before showing certain features:

```jsx
// In your main app
const arePrerequisitesMet = () => {
  const hasTeachers = checkIfTeachersExist();
  const hasClasses = checkIfClassesExist();
  const settingsConfigured = checkIfSettingsConfigured();
  
  return hasTeachers && hasClasses && settingsConfigured;
};

// Show guide if prerequisites not met
if (!arePrerequisitesMet()) {
  return <FirstTimeGuide />;
}
```

## Accessibility

The component includes:
- Keyboard navigation support
- Semantic HTML structure
- Clear visual feedback
- Appropriate ARIA labels (can be enhanced)

To improve accessibility further:

```jsx
<button
  className="nav-button primary"
  onClick={handleNext}
  aria-label="Proceed to next step"
  aria-disabled={!completedSteps.includes(prerequisites[currentStep].id)}
>
  Next Step
</button>
```

## Best Practices

1. **Save Progress**: Store completion state in localStorage or your backend
2. **Allow Skip**: Consider adding a "Skip Tour" option for experienced users
3. **Show Again**: Add a way for users to replay the guide from settings
4. **Validate Prerequisites**: Actually check if steps are completed before allowing progression
5. **Analytics**: Track which steps users complete/abandon

## Example: Adding Skip Functionality

```jsx
const handleSkip = () => {
  if (window.confirm('Are you sure you want to skip the setup guide? You can access it later from Settings.')) {
    setIsVisible(false);
    localStorage.setItem('guideSkipped', 'true');
  }
};

// Add skip button in navigation
<button className="nav-button secondary" onClick={handleSkip}>
  Skip Tour
</button>
```

## Example: Reopening the Guide

```jsx
// In your settings page
<button onClick={() => {
  localStorage.removeItem('hasSeenGuide');
  window.location.reload(); // Or update state to show guide
}}>
  Replay Setup Guide
</button>
```

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## License

Free to use and modify for your project.