import { StyleSheet } from 'react-native';

export default StyleSheet.create({
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
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: 'lightgray',
        padding: 8,
        borderRadius: 4,
        marginBottom: 8,
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
    sortButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sortButton: {
        backgroundColor: '#2EE49B',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginHorizontal: 5,
    },
    sortButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
    loadingOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    slider: {
        width: '90%',
        height: 40,
    },
    // New styles for the deadline selector
    deadlineSelector: {
        width: '100%',
        padding: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        textAlign: 'center',
    },
    datePicker: {
        width: '100%',
        marginTop: 16,
        marginBottom: 16,
    },
});