import { useState } from 'react';
import { ProfessoraIAFloatingButton } from './ProfessoraIAFloatingButton';
import { ProfessoraIA } from './ProfessoraIA';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

export const GlobalProfessoraButton = () => {
  const [showProfessora, setShowProfessora] = useState(false);
  const { isDesktop } = useDeviceDetection();

  return (
    <>
      <ProfessoraIAFloatingButton onOpen={() => setShowProfessora(true)} />
      
      <ProfessoraIA 
        isOpen={showProfessora}
        onClose={() => setShowProfessora(false)}
      />
    </>
  );
};