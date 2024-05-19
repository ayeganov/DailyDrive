import React from 'react';
import Modal from 'react-modal';

interface ChoreModalProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onDelete: () => void;
  choreName: string;
}


const ChoreModal: React.FC<ChoreModalProps> = ({ isOpen, onRequestClose, onDelete, choreName }) => {
  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} contentLabel="Chore Actions" className="modal-content" overlayClassName="chore-actions">
      <h2>Chore: {choreName}</h2>
      <button className="delete" onClick={onDelete}>Delete</button>
      <button className="cancel" onClick={onRequestClose}>Cancel</button>
    </Modal>
  );
};

export default ChoreModal;
