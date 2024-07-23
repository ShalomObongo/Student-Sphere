import React, { useState, useCallback } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Button, Modal, Portal } from 'react-native-paper';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import debounce from 'lodash.debounce';

const AddAnnouncement = ({ onClose, onAnnouncementAdded }) => {
  const [Title, setTitle] = useState('');
  const [Description, setDescription] = useState('');

  const debouncedSetDescription = useCallback(
    debounce((text) => setDescription(text), 300),
    []
  );

  const handleAddAnnouncement = async () => {
    try {
      await addDoc(collection(db, 'Announcements'), {
        Title,
        Description,
        Type: 'General',
        timestamp: serverTimestamp(),
      });
      onAnnouncementAdded();
    } catch (error) {
      console.error('Error adding announcement: ', error);
    }
  };

  return (
    <Portal>
      <Modal visible={true} onDismiss={onClose} contentContainerStyle={styles.modalContainer}>
        <TextInput
          style={styles.input}
          placeholder="Title"
          value={Title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.multilineInput]}
          placeholder="Description"
          defaultValue={Description}
          onChangeText={debouncedSetDescription}
          multiline
        />
        <View style={styles.buttonContainer}>
          <Button mode="contained" onPress={handleAddAnnouncement}>Add</Button>
          <Button mode="outlined" onPress={onClose}>Cancel</Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 10,
  },
  input: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});

export default AddAnnouncement;