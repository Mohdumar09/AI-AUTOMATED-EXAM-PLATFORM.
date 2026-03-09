import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const CheatingLogContext = createContext();

export const CheatingLogProvider = ({ children }) => {
  const { userInfo } = useSelector((state) => state.auth);
  const [cheatingLog, setCheatingLog] = useState({
    noFaceCount: 0,
    multipleFaceCount: 0,
    cellPhoneCount: 0,
    prohibitedObjectCount: 0,
    examId: '',
    username: userInfo?.name || '',
    email: userInfo?.email || '',
    screenshots: [],
  });

  useEffect(() => {
    if (userInfo) {
      setCheatingLog((prev) => ({
        ...prev,
        username: userInfo.name,
        email: userInfo.email,
      }));
    }
  }, [userInfo]);

  const updateCheatingLog = (newLog) => {
    setCheatingLog((prev) => {
      // Ensure we preserve existing counts if they're not in newLog
      const updatedLog = {
        ...prev,
        ...newLog,
        noFaceCount: typeof newLog.noFaceCount === 'number' ? newLog.noFaceCount : prev.noFaceCount,
        multipleFaceCount: typeof newLog.multipleFaceCount === 'number' ? newLog.multipleFaceCount : prev.multipleFaceCount,
        cellPhoneCount: typeof newLog.cellPhoneCount === 'number' ? newLog.cellPhoneCount : prev.cellPhoneCount,
        prohibitedObjectCount: typeof newLog.prohibitedObjectCount === 'number' ? newLog.prohibitedObjectCount : prev.prohibitedObjectCount,
        screenshots: newLog.screenshots || prev.screenshots || [],
      };
      console.log('Previous state:', prev);
      console.log('New log data:', newLog);
      console.log('Updated cheating log:', updatedLog);
      return updatedLog;
    });
  };

  const resetCheatingLog = (examId) => {
    const resetLog = {
      noFaceCount: 0,
      multipleFaceCount: 0,
      cellPhoneCount: 0,
      prohibitedObjectCount: 0,
      examId: examId,
      screenshots: [],
      username: userInfo?.name || '',
      email: userInfo?.email || '',
      prohibitedObjectCount: 0,
      examId: examId,
      username: userInfo?.name || '',
      email: userInfo?.email || '',
    };
    console.log('Reset cheating log:', resetLog); // Debug log
    setCheatingLog(resetLog);
  };

  return (
    <CheatingLogContext.Provider value={{ cheatingLog, updateCheatingLog, resetCheatingLog }}>
      {children}
    </CheatingLogContext.Provider>
  );
};

export const useCheatingLog = () => {
  const context = useContext(CheatingLogContext);
  if (!context) {
    throw new Error('useCheatingLog must be used within a CheatingLogProvider');
  }
  return context;
};
