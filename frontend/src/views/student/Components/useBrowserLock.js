import { useEffect } from 'react';
console.log('🟢 useBrowserLock FILE LOADED');

export default function useBrowserLock({
  isExamStarted,
  isExamTerminated,
  checkAndUpdateViolation
}) {
  useEffect(() => {
    // 🚫 Do nothing if exam not running
    if (!isExamStarted || isExamTerminated) return;

    // ===============================
    // 1️⃣ FORCE FULLSCREEN
    // ===============================
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Fullscreen request blocked');
      }
    };

    console.log('🟡 BrowserLock effect running', {
        isExamStarted,
        isExamTerminated
        });


    // ⚠️ NOTE:
    // Fullscreen MUST be triggered once from user action
    // (Start Test button). This is only fallback.
    enterFullscreen();

    // ===============================
    // 2️⃣ TAB SWITCH / MINIMIZE
    // ===============================
    const handleVisibilityChange = () => {
      if (document.hidden) {
        checkAndUpdateViolation(
          'tabSwitch',
          true,
          'Tab switching detected'
        );
      }
    };

    // ===============================
    // 3️⃣ ALT+TAB / WINDOW FOCUS LOSS
    // ===============================
    const handleBlur = () => {
      checkAndUpdateViolation(
        'windowBlur',
        true,
        'Window focus lost'
      );
    };

    // ===============================
    // 4️⃣ BLOCK SHORTCUT KEYS
    // ===============================
    const handleKeyDown = (e) => {
      const blockedKeys = [
        'Escape',
        'F11',
        'Tab',
        'Alt',
        'Meta',
        'F12'
      ];

      // Basic blocked keys
      if (
        blockedKeys.includes(e.key) ||
        (e.altKey && e.key === 'Tab') ||
        (e.ctrlKey && ['c', 'v', 'x', 'n', 't'].includes(e.key.toLowerCase())) ||
        (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        checkAndUpdateViolation(
          'shortcutKey',
          true,
          'Restricted key pressed'
        );
      }
    };

    // ===============================
    // 5️⃣ BLOCK RIGHT CLICK
    // ===============================
    const handleContextMenu = (e) => {
      e.preventDefault();
      checkAndUpdateViolation(
        'shortcutKey',
        true,
        'Right click detected'
      );
    };

    // ===============================
    // 6️⃣ FULLSCREEN EXIT DETECTION
    // ===============================
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        checkAndUpdateViolation(
          'fullscreenExit',
          true,
          'Exited fullscreen'
        );
        enterFullscreen(); // force back
      }
    };

    // ===============================
    // REGISTER EVENTS
    // ===============================
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // ===============================
    // CLEANUP
    // ===============================
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isExamStarted, isExamTerminated, checkAndUpdateViolation]);
}
