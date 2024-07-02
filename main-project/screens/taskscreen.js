import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, Button, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import styles from '../styles/taskstyles.js'; // Import the styles

const TaskScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);


    const [newTask, setNewTask] = useState({ title: '', description: '', category: '', deadline: '', priority: '' });
    const [open, setOpen] = useState(false);
    const [priority, setPriority] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTask, setEditTask] = useState({ id: '', title: '', description: '', category: '', deadline: '', priority: '' });
    const [sortOrder, setSortOrder] = useState({ deadline: 'asc', priority: 'asc' });

    const addTask = async () => {

        setIsLoading(true);
        const taskWithId = { ...newTask, priority, id: Date.now().toString(), status: 'incomplete', progress: 0 };
        try {
            const docRef = await addDoc(collection(db, 'Tasks'), {
                ...taskWithId,
                userId: auth.currentUser.uid,
            });
            setTasks([...tasks, { ...taskWithId, docId: docRef.id }]);
            setModalVisible(false);
            setNewTask({ title: '', description: '', category: '', deadline: '', priority: '' });
            setPriority(null);
        } catch (error) {
            console.error("Error adding task: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTasks = async () => {
        setIsLoading(true);
        try {
            const q = query(collection(db, 'Tasks'), where('userId', '==', auth.currentUser.uid));
            const querySnapshot = await getDocs(q);
            const fetchedTasks = querySnapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id }));
            setTasks(fetchedTasks);
        } catch (error) {
            console.error("Error fetching tasks: ", error);
        } finally {
            setIsLoading(false);
        }
    };




    const toggleTaskStatus = async (id) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const updatedTasks = [...tasks];
            const newStatus = updatedTasks[taskIndex].status === 'complete' ? 'incomplete' : 'complete';
            updatedTasks[taskIndex].status = newStatus;
            setTasks(updatedTasks);

            const taskDocId = updatedTasks[taskIndex].docId;
            if (taskDocId) {
                try {
                    const taskDoc = doc(db, 'Tasks', taskDocId);
                    await updateDoc(taskDoc, { status: newStatus });
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

    const updateTaskProgress = async (id, progress) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            const updatedTasks = [...tasks];
            updatedTasks[taskIndex].progress = progress;
            setTasks(updatedTasks);

            const taskDocId = updatedTasks[taskIndex].docId;
            if (taskDocId) {
                try {
                    const taskDoc = doc(db, 'Tasks', taskDocId);
                    await updateDoc(taskDoc, { progress });
                } catch (error) {
                    console.error("Error updating task progress: ", error);
                }
            } else {
                console.error("Error: Task docId is undefined");
            }
        }
    };

    const openEditModal = (task) => {
        setEditTask(task);
        setEditModalVisible(true);
    };

    const updateTask = async () => {
        setIsLoading(true);
        const taskIndex = tasks.findIndex(task => task.id === editTask.id);
        if (taskIndex !== -1) {
            const updatedTasks = [...tasks];
            updatedTasks[taskIndex] = editTask;
            setTasks(updatedTasks);

            const taskDocId = editTask.docId;
            if (taskDocId) {
                try {
                    const taskDoc = doc(db, 'Tasks', taskDocId);
                    await updateDoc(taskDoc, { ...editTask });
                    setEditModalVisible(false);
                } catch (error) {
                    console.error("Error updating task: ", error);
                } finally {
                    setIsLoading(false);
                }
            } else {
                console.error("Error: Task docId is undefined");
                setIsLoading(false);
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

    const sortTasksByDeadline = () => {
        const sortedTasks = [...tasks].sort((a, b) => {
            const dateA = new Date(a.deadline);
            const dateB = new Date(b.deadline);
            return sortOrder.deadline === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setTasks(sortedTasks);
        setSortOrder({ ...sortOrder, deadline: sortOrder.deadline === 'asc' ? 'desc' : 'asc' });
    };

    const sortTasksByPriority = () => {
        const sortedTasks = [...tasks].sort((a, b) => {
            return sortOrder.priority === 'asc' ? a.priority - b.priority : b.priority - a.priority;
        });
        setTasks(sortedTasks);
        setSortOrder({ ...sortOrder, priority: sortOrder.priority === 'asc' ? 'desc' : 'asc' });
    };

    return (
        <View style={styles.container}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#000" />
                </View>
            )}
            <Text style={styles.title}>Tasks</Text>

            <View style={styles.sortButtonsContainer}>
                <TouchableOpacity style={styles.sortButton} onPress={sortTasksByDeadline}>
                    <Text style={styles.sortButtonText}>
                        Sort by Deadline {sortOrder.deadline === 'asc' ? '↑' : '↓'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={sortTasksByPriority}>
                    <Text style={styles.sortButtonText}>
                        Sort by Priority {sortOrder.priority === 'asc' ? '↑' : '↓'}
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={tasks}
                renderItem={({ item }) => (
                    <View style={[styles.taskItem, item.status === 'complete' && styles.taskItemComplete]}>
                        <View style={styles.taskContent}>
                            <Text style={styles.taskTitle}>{item.title}</Text>
                            <Text style={styles.taskDescription}>{item.description}</Text>
                            <Text>Progress: {item.progress}%</Text>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                step={1}
                                value={item.progress}
                                onValueChange={(value) => updateTaskProgress(item.id, value)}
                            />
                        </View>
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.completeButton} onPress={() => toggleTaskStatus(item.id)}>
                                <Text style={styles.buttonText}>{item.status === 'complete' ? 'Incomplete' : 'Complete'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.deleteButton} onPress={() => deleteTask(item.id)}>
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                                <Text style={styles.buttonText}>Edit</Text>
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
                        value={priority}
                        items={[
                            { label: '1', value: '1' },
                            { label: '2', value: '2' },
                            { label: '3', value: '3' },
                            { label: '4', value: '4' },
                            { label: '5', value: '5' },
                        ]}
                        setOpen={setOpen}
                        setValue={setPriority}
                        style={styles.input}
                        placeholder="Priority (1 - Low, 5 - High)"
                        dropDownContainerStyle={styles.dropdownContainerStyle}
                    />
                    <Button title="Add Task" onPress={addTask} />
                    <Button title="Cancel" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>

            <Modal visible={editModalVisible} animationType="slide">
                <View style={styles.modalContainer}>
                    <TextInput
                        placeholder="Title"
                        value={editTask.title}
                        onChangeText={(text) => setEditTask({ ...editTask, title: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Description"
                        value={editTask.description}
                        onChangeText={(text) => setEditTask({ ...editTask, description: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Category"
                        value={editTask.category}
                        onChangeText={(text) => setEditTask({ ...editTask, category: text })}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Deadline (YYYY-MM-DD)"
                        value={editTask.deadline}
                        onChangeText={(text) => setEditTask({ ...editTask, deadline: text })}
                        style={styles.input}
                    />
                    <DropDownPicker
                        open={open}
                        value={editTask.priority}
                        items={[
                            { label: '1', value: '1' },
                            { label: '2', value: '2' },
                            { label: '3', value: '3' },
                            { label: '4', value: '4' },
                            { label: '5', value: '5' },
                        ]}
                        setOpen={setOpen}
                        setValue={(value) => setEditTask({ ...editTask, priority: value })}
                        style={styles.input}
                        placeholder="Priority (1 - Low, 5 - High)"
                        dropDownContainerStyle={styles.dropdownContainerStyle}
                    />
                    <Button title="Update Task" onPress={updateTask} />
                    <Button title="Cancel" onPress={() => setEditModalVisible(false)} />
                </View>
            </Modal>
        </View>
    );
};

export default TaskScreen;