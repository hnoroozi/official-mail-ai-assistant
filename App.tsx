
import React, { useState, useEffect } from 'react';
import { AppScreen, LetterItem, LetterAnalysis, SupportedLanguage, AppSettings } from './types.ts';
import Onboarding from './components/Onboarding.tsx';
import Home from './components/Home.tsx';
import CameraScan from './components/CameraScan.tsx';
import Processing from './components/Processing.tsx';
import Results from './components/Results.tsx';
import Library from './components/Library.tsx';
import Settings from './components/Settings.tsx';
import Navigation from './components/Navigation.tsx';
import Chat from './components/Chat.tsx';
import Agenda from './components/Agenda.tsx';
import Insights from './components/Insights.tsx';
import Help from './components/Help.tsx';

const STORAGE_KEY = 'explain_my_letter_history';
const LANG_KEY = 'explain_my_letter_lang';
const SETTINGS_KEY = 'explain_my_letter_settings';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('ONBOARDING');
  const [history, setHistory] = useState<LetterItem[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentLetterId, setCurrentLetterId] = useState<string | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<SupportedLanguage>('English');
  const [settings, setSettings] = useState<AppSettings>({
    userName: 'User',
    biometricLock: false,
    familyVaultEnabled: false
  });

  const isRtl = preferredLanguage === 'Persian' || preferredLanguage === 'Arabic';

  useEffect(() => {
    const savedHistory = localStorage.getItem(STORAGE_KEY);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedLang = localStorage.getItem(LANG_KEY) as SupportedLanguage;
    if (savedLang) setPreferredLanguage(savedLang);

    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsed }));
    }

    const hasOnboarded = localStorage.getItem('onboarded');
    if (hasOnboarded) setScreen('HOME');
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem(LANG_KEY, preferredLanguage);
  }, [preferredLanguage]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboarded', 'true');
    setScreen('HOME');
  };

  const handleScanComplete = (images: string[]) => {
    setCurrentImages(images);
    setScreen('PROCESSING');
  };

  const handleProcessingComplete = (analysis: LetterAnalysis) => {
    const newItem: LetterItem = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      imageUrls: currentImages,
      analysis: analysis,
      verifiedFields: []
    };
    setHistory([newItem, ...history]);
    setCurrentLetterId(newItem.id);
    setScreen('RESULTS');
  };

  const handleDeleteLetter = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
    if (currentLetterId === id) setScreen('HOME');
  };

  const handleToggleTask = (letterId: string, taskIndex: number) => {
    setHistory(prev => prev.map(item => {
      if (item.id !== letterId) return item;
      const newActions = [...item.analysis.actions];
      if (newActions[taskIndex]) {
        newActions[taskIndex] = { ...newActions[taskIndex], completed: !newActions[taskIndex].completed };
      }
      return { ...item, analysis: { ...item.analysis, actions: newActions } };
    }));
  };

  const handleToggleReminder = (letterId: string, deadlineIndex: number) => {
    setHistory(prev => prev.map(item => {
      if (item.id !== letterId) return item;
      const newDeadlines = [...item.analysis.deadlines];
      if (newDeadlines[deadlineIndex]) {
        newDeadlines[deadlineIndex] = { ...newDeadlines[deadlineIndex], reminderSet: !newDeadlines[deadlineIndex].reminderSet };
      }
      return { ...item, analysis: { ...item.analysis, deadlines: newDeadlines } };
    }));
  };

  const handleToggleVerification = (letterId: string, fieldId: string) => {
    setHistory(prev => prev.map(item => {
      if (item.id !== letterId) return item;
      const currentVerified = item.verifiedFields || [];
      const newVerified = currentVerified.includes(fieldId)
        ? currentVerified.filter(f => f !== fieldId)
        : [...currentVerified, fieldId];
      return { ...item, verifiedFields: newVerified };
    }));
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const navigateToLetter = (item: LetterItem) => {
    setCurrentLetterId(item.id);
    setCurrentImages(item.imageUrls);
    setScreen('RESULTS');
  };

  const currentItem = history.find(h => h.id === currentLetterId);

  const renderScreen = () => {
    switch (screen) {
      case 'ONBOARDING':
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case 'HOME':
        return <Home 
          onScan={() => setScreen('SCAN')} 
          onUpload={handleScanComplete}
          history={history} 
          preferredLanguage={preferredLanguage}
          userName={settings.userName}
          onSeeAll={() => setScreen('LIBRARY')} 
          onSelectLetter={navigateToLetter} 
          onSettings={() => setScreen('SETTINGS')}
        />;
      case 'SCAN':
        return <CameraScan onCancel={() => setScreen('HOME')} onComplete={handleScanComplete} />;
      case 'PROCESSING':
        return <Processing images={currentImages} targetLanguage={preferredLanguage} onComplete={handleProcessingComplete} onError={() => setScreen('HOME')} />;
      case 'RESULTS':
        return currentItem ? (
          <Results 
            analysis={currentItem.analysis} 
            images={currentItem.imageUrls} 
            targetLanguage={preferredLanguage}
            verifiedFields={currentItem.verifiedFields || []}
            onBack={() => setScreen('HOME')} 
            onAskQuestion={() => setScreen('CHAT')}
            onToggleAction={(idx) => handleToggleTask(currentItem.id, idx)}
            onToggleReminder={(idx) => handleToggleReminder(currentItem.id, idx)}
            onToggleVerification={(fieldId) => handleToggleVerification(currentItem.id, fieldId)}
            onDelete={() => {
              if (window.confirm("Delete this letter forever?")) handleDeleteLetter(currentItem.id);
            }}
          />
        ) : null;
      case 'CHAT':
        return currentItem ? <Chat analysis={currentItem.analysis} preferredLanguage={preferredLanguage} onBack={() => setScreen('RESULTS')} /> : null;
      case 'AGENDA':
        return <Agenda history={history} preferredLanguage={preferredLanguage} onToggleAction={handleToggleTask} onSelectLetter={navigateToLetter} />;
      case 'INSIGHTS':
        return <Insights history={history} preferredLanguage={preferredLanguage} />;
      case 'LIBRARY':
        return <Library history={history} preferredLanguage={preferredLanguage} onBack={() => setScreen('HOME')} onSelectLetter={navigateToLetter} onDelete={handleDeleteLetter} />;
      case 'HELP':
        return <Help preferredLanguage={preferredLanguage} onBack={() => setScreen('SETTINGS')} />;
      case 'SETTINGS':
        return (
          <Settings 
            onBack={() => setScreen('HOME')} 
            preferredLanguage={preferredLanguage}
            onLanguageChange={setPreferredLanguage}
            history={history}
            settings={settings}
            onUpdateSettings={updateSettings}
            onReset={() => { 
              setHistory([]); 
              localStorage.removeItem('onboarded'); 
              setScreen('ONBOARDING'); 
            }}
            onHelp={() => setScreen('HELP')}
          />
        );
      default:
        return <Home onScan={() => setScreen('SCAN')} onUpload={handleScanComplete} preferredLanguage={preferredLanguage} history={history} userName={settings.userName} onSeeAll={() => setScreen('LIBRARY')} onSelectLetter={navigateToLetter} onSettings={() => setScreen('SETTINGS')} />;
    }
  };

  return (
    <div 
      className={`max-w-md mx-auto min-h-screen relative flex flex-col bg-white shadow-xl overflow-hidden print:max-w-none print:shadow-none ${isRtl ? 'text-right' : 'text-left'}`} 
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <main className="flex-1 overflow-y-auto pb-20 print:pb-0">
        {renderScreen()}
      </main>
      {screen !== 'ONBOARDING' && screen !== 'SCAN' && screen !== 'PROCESSING' && screen !== 'CHAT' && (
        <Navigation 
          currentScreen={screen} 
          preferredLanguage={preferredLanguage}
          onNavigate={(s) => setScreen(s)} 
          onScan={() => setScreen('SCAN')} 
          className="no-print"
        />
      )}
    </div>
  );
};

export default App;
