import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UnitScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Tasks Screen</Text>
            <Text style={styles.content}>This is the Tasks screen.</Text>
            <Text style={styles.content}>You can view and add your own tasks here.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    content: {
        fontSize: 16,
        marginBottom: 8,
    },
});

export default UnitScreen;