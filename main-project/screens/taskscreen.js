import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, Button } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../firebase'; // Import Firestore and Auth
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'; // Import Firestore functions
import DropDownPicker from 'react-native-dropdown-picker'; // Import DropDownPicker

const TaskScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', category: '', deadline: '', weight: '' });
    const [open, setOpen] = useState(false);
    const [weight, setWeight] = useState(null);

    const addTask = async () => {
        const taskWithId = { ...newTask, weight, id: Date.now().toString(), status: 'incomplete', progress: 0 };
        try {
            const docRef = await addDoc(collection(db, 'Tasks'), {
                ...taskWithId,
                userId: auth.currentUser.uid, 
            });
            setTasks([...tasks, { ...taskWithId, docId: docRef.id }]);
            setModalVisible(false);
            setNewTask({ title: '', description: '', category: '', deadline: '', weight: '' });
            setWeight(null);
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    };

    const fetchTasks = async () => {
        const q = query(collection(db, 'Tasks'), where('userId', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedTasks = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
        setTasks(fetchedTasks);
    };

    const completeTask = async (id) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const updatedTasks = [...tasks];
            updatedTasks[taskIndex].status = 'complete';
            setTasks(updatedTasks);

            const taskDocId = updatedTasks[taskIndex].docId;
            if (taskDocId) {
                try {
                    const taskDoc = doc(db, 'Tasks', taskDocId);
                    await updateDoc(taskDoc, { status: 'complete' });
                } catch (error) {
                    console.error("Error updating task: ", error);
                }
            } else {
                console.error("Error: Task docId is undefined");
            }
        }
    };

    const deleteTask = async (id) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);

            try {
                const taskDoc = doc(db, 'Tasks', tasks[taskIndex].docId);
                await deleteDoc(taskDoc);
            } catch (error) {
                console.error("Error deleting task: ", error);
            }
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    useEffect(() => {
        const scheduleNotifications = () => {
            tasks.forEach(task => {
                const deadline = new Date(task.deadline);
                const now = new Date();
                const timeDiff = deadline - now;

                if (timeDiff > 0) {
                    Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Task Reminder",
                            body: `Your task "${task.title}" is due soon!`,
                        },
                        trigger: {
                            seconds: timeDiff / 1000,
                        },
                    });
                }
            });
        };

        scheduleNotifications();
    }, [tasks]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tasks</Text>
            <Button title="Sort by Deadline" onPress={() => setTasks(filterTasksByDeadline())} />
            <Button title="Sort by Weight" onPress={() => setTasks(sortTasksByWeight())} />
            <FlatList
                data={tasks}
                renderItem={({ item }) => (
                    <View style={[styles.taskItem, item.status === 'complete' && styles.taskItemComplete]}>
                        <View style={styles.taskContent}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <Text style={styles.taskDescription}>{item.description}</Text>
                            <Text>Progress: {item.progress}%</Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.completeButton} onPress={() => completeTask(item.id)}>
                                <Text style={styles.buttonText}>Complete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.taskList}
            />
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Icon name="plus" type="material-community" color="white" />
                <Text style={styles.addButtonText}>Add Task</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <TextInput
                        placeholder="Title"
                        value={newTask.title}
                        onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Description"
                        value={newTask.description}
                        onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Category"
                        value={newTask.category}
                        onChangeText={(text) => setNewTask({ ...newTask, category: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Deadline (YYYY-MM-DD)"
                        value={newTask.deadline}
                        onChangeText={(text) => setNewTask({ ...newTask, deadline: text })}
                        style={styles.input}
                    />
                    <DropDownPicker
                        open={open}
                        value={weight}
                        items={[
                            { label: '1', value: '1' },
                            { label: '2', value: '2' },
                            { label: '3', value: '3' },
                            { label: '4', value: '4' },
                            { label: '5', value: '5' },
                        ]}
                        setOpen={setOpen}
                        setValue={setWeight}
                        style={styles.input}
                        placeholder="Weight (1 - Low, 5 - High)"
                        dropDownContainerStyle={styles.dropdownContainerStyle}
                    />
                    <Button title="Add Task" onPress={addTask} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    taskList: {
        paddingBottom: 80,
    },
    taskItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    taskItemComplete: {
        backgroundColor: 'lightgreen',
    },
    taskContent: {
        flex: 1,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    buttonContainer: {
        justifyContent: 'space-between',
    },
    completeButton: {
        backgroundColor: 'green',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
    },
    deleteButton: {
        backgroundColor: 'red',
        padding: 8,
        borderRadius: 4,
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
    },
    addButton: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: '#2EE49B',
        borderRadius: 50,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        marginLeft: 8,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    input: {
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        marginBottom: 16,
    },
    dropdownContainerStyle: {
        width: '100%',
    },
});

export default TaskScreen;