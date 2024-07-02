import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';

const ViewAnnouncement = () => {
  const route = useRoute();
  const { announcement } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>{announcement.Title}</Text>
        {announcement.Image && (
          <Image source={{ uri: announcement.Image }} style={styles.image} />
        )}
        <Text style={styles.subtitle}>Description</Text>
        <Text style={styles.description}>{announcement.Description}</Text>
        {announcement.URL && (
          <TouchableOpacity onPress={() => Linking.openURL(announcement.URL)}>
            <Text style={styles.url}>Visit URL</Text>
          </TouchableOpacity>
        )}
        <View style={styles.approveDisapproveContainer}>
          <Text style={styles.approveDisapproveText}>Approve: {announcement.Approve}</Text>
          <Text style={styles.approveDisapproveText}>Disapprove: {announcement.Disapprove}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f8f8f8',
  },
  container: {
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'justify',
  },
  url: {
    fontSize: 16,
    color: '#1a73e8',
    marginBottom: 20,
    textDecorationLine: 'underline',
  },
  approveDisapproveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  approveDisapproveText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ViewAnnouncement;
