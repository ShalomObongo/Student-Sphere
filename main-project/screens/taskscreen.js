import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Button, View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Modal, ActivityIndicator, Platform, Alert, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Icon } from 'react-native-elements';
import * as Notifications from 'expo-notifications';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

const TaskScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);

    const [newTask, setNewTask] = useState({ title: '', description: '', category: '', deadline: null, priority: '' });
    const [open, setOpen] = useState(false);
    const [priority, setPriority] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editTask, setEditTask] = useState({ id: '', title: '', description: '', category: '', deadline: null, priority: '' });
    const [sortOrder, setSortOrder] = useState({ deadline: 'asc', priority: 'asc' });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showEditDatePicker, setShowEditDatePicker] = useState(false);

    const handleDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowDatePicker(Platform.OS === 'ios');
        setNewTask({ ...newTask, deadline: currentDate.toISOString() });
    };

    const handleEditDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || new Date();
        setShowEditDatePicker(Platform.OS === 'ios');
        setEditTask({ ...editTask, deadline: currentDate.toISOString() });
    };

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
            setNewTask({ title: '', description: '', category: '', deadline: null, priority: '' });
            setPriority(null);
            Alert.alert("Success", "Task added successfully!");
        } catch (error) {
            console.error("Error adding task: ", error);
        } finally {
            setIsLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchTasks();
        }, [])
    );

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
                    Alert.alert("Success", "Task updated successfully!");
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

    const renderGhostTask = () => (
        <View style={[styles.taskItem, styles.ghostTask]}>
            <View style={styles.ghostTitle} />
            <View style={styles.ghostDescription} />
            <View style={styles.ghostProgress} />
            <View style={styles.ghostSlider} />
            <View style={styles.buttonContainer}>
                <View style={[styles.actionButton, styles.ghostButton]} />
                <View style={[styles.actionButton, styles.ghostButton]} />
                <View style={[styles.actionButton, styles.ghostButton]} />
            </View>
        </View>
    );

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            style={styles.container}
        >
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}

            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Tasks</Text>
            </View>

            <View style={styles.sortButtonsContainer}>
                <TouchableOpacity style={styles.sortButton} onPress={sortTasksByDeadline}>
                    <Icon name="sort" type="material" color="#fff" size={18} />
                    <Text style={styles.sortButtonText}>
                        Deadline {sortOrder.deadline === 'asc' ? '↑' : '↓'}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={sortTasksByPriority}>
                    <Icon name="flag" type="material" color="#fff" size={18} />
                    <Text style={styles.sortButtonText}>
                        Priority {sortOrder.priority === 'asc' ? '↑' : '↓'}
                    </Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <FlatList
                    data={[1, 2, 3, 4, 5]} // Render 5 ghost tasks
                    renderItem={renderGhostTask}
                    keyExtractor={(item) => item.toString()}
                    contentContainerStyle={styles.taskList}
                />
            ) : (
                <FlatList
                    data={tasks}
                    renderItem={({ item }) => (
                        <View style={[styles.taskItem, item.status === 'complete' && styles.taskItemComplete]}>
                            <View style={styles.taskContent}>
                                <Text style={styles.taskTitle}>{item.title}</Text>
                                <Text style={styles.taskDescription}>{item.description}</Text>
                                <Text style={styles.taskProgress}>Progress: {item.progress}%</Text>
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={100}
                                    step={1}
                                    value={item.progress}
                                    onValueChange={(value) => updateTaskProgress(item.id, value)}
                                    minimumTrackTintColor="#4c669f"
                                    maximumTrackTintColor="#d3d3d3"
                                    thumbTintColor="#3b5998"
                                />
                            </View>
                            <View style={styles.buttonContainer}>
                                <TouchableOpacity style={styles.actionButton} onPress={() => toggleTaskStatus(item.id)}>
                                    <Icon name={item.status === 'complete' ? 'undo' : 'check'} type="material" color="#fff" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => deleteTask(item.id)}>
                                    <Icon name="delete" type="material" color="#fff" size={20} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
                                    <Icon name="edit" type="material" color="#fff" size={20} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.taskList}
                />
            )}

            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                <Icon name="add" type="material" color="white" size={30} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <ScrollView contentContainerStyle={styles.modalScrollView}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Add New Task</Text>
                            <TextInput
                                placeholder="Title"
                                value={newTask.title}
                                onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                placeholder="Description"
                                value={newTask.description}
                                onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                                style={[styles.input, styles.textArea]}
                                multiline={true}
                                numberOfLines={4}
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                placeholder="Category"
                                value={newTask.category}
                                onChangeText={(text) => setNewTask({ ...newTask, category: text })}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateSelector}>
                                <Text style={styles.dateSelectorText}>
                                    {newTask.deadline ? new Date(newTask.deadline).toLocaleString() : 'Select Deadline'}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={newTask.deadline ? new Date(newTask.deadline) : new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleDateChange}
                                    style={styles.datePicker}
                                />
                            )}
                            <DropDownPicker
                                open={open}
                                value={priority}
                                items={[
                                    { label: '1 - Low', value: '1' },
                                    { label: '2', value: '2' },
                                    { label: '3', value: '3' },
                                    { label: '4', value: '4' },
                                    { label: '5 - High', value: '5' },
                                ]}
                                setOpen={setOpen}
                                setValue={setPriority}
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={styles.dropdownContainerStyle}
                                placeholder="Select Priority"
                                placeholderStyle={styles.dropdownPlaceholder}
                            />
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.addButton]} onPress={addTask}>
                                    <Text style={styles.modalButtonText}>Add Task</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>

            <Modal visible={editModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView 
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <ScrollView contentContainerStyle={styles.modalScrollView}>
                        <View style={styles.modalContainer}>
                            <Text style={styles.modalTitle}>Edit Task</Text>
                            <TextInput
                                placeholder="Title"
                                value={editTask.title}
                                onChangeText={(text) => setEditTask({ ...editTask, title: text })}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                placeholder="Description"
                                value={editTask.description}
                                onChangeText={(text) => setEditTask({ ...editTask, description: text })}
                                style={[styles.input, styles.textArea]}
                                multiline={true}
                                numberOfLines={4}
                                placeholderTextColor="#999"
                            />
                            <TextInput
                                placeholder="Category"
                                value={editTask.category}
                                onChangeText={(text) => setEditTask({ ...editTask, category: text })}
                                style={styles.input}
                                placeholderTextColor="#999"
                            />
                            <TouchableOpacity onPress={() => setShowEditDatePicker(true)} style={styles.dateSelector}>
                                <Text style={styles.dateSelectorText}>
                                    {editTask.deadline ? new Date(editTask.deadline).toLocaleString() : 'Select Deadline'}
                                </Text>
                            </TouchableOpacity>
                            {showEditDatePicker && (
                                <DateTimePicker
                                    value={editTask.deadline ? new Date(editTask.deadline) : new Date()}
                                    mode="datetime"
                                    display="default"
                                    onChange={handleEditDateChange}
                                    style={styles.datePicker}
                                />
                            )}
                            <DropDownPicker
                                open={open}
                                value={editTask.priority}
                                items={[
                                    { label: '1 - Low', value: '1' },
                                    { label: '2', value: '2' },
                                    { label: '3', value: '3' },
                                    { label: '4', value: '4' },
                                    { label: '5 - High', value: '5' },
                                ]}
                                setOpen={setOpen}
                                setValue={(callback) => {
                                    const value = callback(editTask.priority);
                                    setEditTask({ ...editTask, priority: value });
                                }}
                                style={styles.dropdownStyle}
                                dropDownContainerStyle={styles.dropdownContainerStyle}
                                placeholder="Select Priority"
                                placeholderStyle={styles.dropdownPlaceholder}
                            />
                            <View style={styles.modalButtonContainer}>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.addButton]} onPress={updateTask}>
                                    <Text style={styles.modalButtonText}>Update Task</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sortButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    sortButtonText: {
        color: '#fff',
        marginLeft: 5,
    },
    taskList: {
        paddingBottom: 100,
    },
    taskItem: {
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    taskItemComplete: {
        opacity: 0.7,
    },
    taskContent: {
        marginBottom: 10,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    taskDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    taskProgress: {
        fontSize: 12,
        color: '#888',
        marginBottom: 5,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b5998',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
    },
    addButton: {
        position: 'absolute',
        right: 30,
        bottom: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#4c669f',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalScrollView: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4c669f',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#333',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
        paddingTop: 15,
    },
    dateSelector: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
        paddingHorizontal: 15,
        justifyContent: 'center',
    },
    dateSelectorText: {
        fontSize: 16,
        color: '#333',
    },
    dropdownStyle: {
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 15,
    },
    dropdownContainerStyle: {
        borderColor: '#ddd',
        borderRadius: 10,
    },
    dropdownPlaceholder: {
        color: '#999',
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ddd',
    },
    addButton: {
        backgroundColor: '#4c669f',
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    ghostTask: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    ghostTitle: {
        width: '70%',
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 4,
        marginBottom: 10,
    },
    ghostDescription: {
        width: '90%',
        height: 15,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: 10,
    },
    ghostProgress: {
        width: '40%',
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 4,
        marginBottom: 5,
    },
    ghostSlider: {
        width: '100%',
        height: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        marginBottom: 10,
    },
    ghostButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
});

export default TaskScreen;