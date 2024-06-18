import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UnitScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Units Screen</Text>
            <Text style={styles.content}>This is the Units screen.</Text>
            <Text style={styles.content}>You can add your own content here.</Text>
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