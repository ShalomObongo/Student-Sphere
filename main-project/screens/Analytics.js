import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { Card, Title, Paragraph } from 'react-native-paper';
import { PieChart, LineChart, BarChart } from "react-native-chart-kit";
import { db } from "../firebase";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { Icon } from 'react-native-elements';

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "transparent",
  backgroundGradientFrom: "transparent",
  backgroundGradientTo: "transparent",
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false
};

const colors = ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [userDistribution, setUserDistribution] = useState([]);
  const [taskCompletion, setTaskCompletion] = useState([]);
  const [unitEnrollments, setUnitEnrollments] = useState([]);
  const [announcementEngagement, setAnnouncementEngagement] = useState([]);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUserDistribution(),
        fetchTaskCompletion(),
        fetchUnitEnrollments(),
        fetchAnnouncementEngagement(),
        fetchActiveUsers(),
      ]);
    } catch (error) {
      console.error("Error fetching analytics data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDistribution = async () => {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersData = usersSnapshot.docs.map(doc => doc.data());
    const roleCounts = usersData.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(roleCounts).map((role, index) => ({
      name: role,
      population: roleCounts[role],
      color: colors[index % colors.length],
      legendFontColor: "#7F7F7F",
      legendFontSize: 15
    }));

    setUserDistribution(chartData);
  };

  const fetchTaskCompletion = async () => {
    const tasksSnapshot = await getDocs(collection(db, "Tasks"));
    const tasksData = tasksSnapshot.docs.map(doc => doc.data());
    const completedTasks = tasksData.filter(task => task.status === 'complete').length;
    const incompleteTasks = tasksData.length - completedTasks;

    setTaskCompletion([
      { name: 'Completed', count: completedTasks, color: '#4BC0C0' },
      { name: 'Incomplete', count: incompleteTasks, color: '#FF6384' }
    ]);
  };

  const fetchUnitEnrollments = async () => {
    const unitsSnapshot = await getDocs(collection(db, "units"));
    const unitsData = unitsSnapshot.docs.map(doc => doc.data());
    const enrollmentsSnapshot = await getDocs(collection(db, "enrollments"));
    const enrollmentsData = enrollmentsSnapshot.docs.map(doc => doc.data());

    const enrollmentCounts = unitsData.map(unit => ({
      unitName: unit.name,
      enrollments: enrollmentsData.filter(enrollment => enrollment.unitId === unit.unitID).length
    }));

    setUnitEnrollments(enrollmentCounts.sort((a, b) => b.enrollments - a.enrollments).slice(0, 5));
  };

  const fetchAnnouncementEngagement = async () => {
    const announcementsSnapshot = await getDocs(collection(db, "Announcements"));
    const announcementsData = announcementsSnapshot.docs.map(doc => doc.data());

    const engagementData = announcementsData.map(announcement => ({
      title: announcement.Title,
      views: announcement.views || 0,
      likes: announcement.likes || 0
    }));

    setAnnouncementEngagement(engagementData.sort((a, b) => b.views + b.likes - (a.views + a.likes)).slice(0, 5));
  };

  const fetchActiveUsers = async () => {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeUsersQuery = query(
      collection(db, "userActivity"),
      where("lastActive", ">=", last7Days),
      orderBy("lastActive", "desc")
    );
    const activeUsersSnapshot = await getDocs(activeUsersQuery);
    const activeUsersData = activeUsersSnapshot.docs.map(doc => doc.data());

    const dailyActiveCounts = Array(7).fill(0);
    activeUsersData.forEach(user => {
      const dayIndex = 6 - Math.floor((Date.now() - user.lastActive.toDate()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0) dailyActiveCounts[dayIndex]++;
    });

    setActiveUsers(dailyActiveCounts);
  };

  if (loading) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animatable.View animation="fadeIn" duration={1000} style={styles.header}>
          <Icon name="analytics" type="material" color="#fff" size={40} />
          <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={200} style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>User Distribution</Title>
            <PieChart
              data={userDistribution}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </Card.Content>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={400} style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Task Completion</Title>
            <PieChart
              data={taskCompletion}
              width={screenWidth - 60}
              height={220}
              chartConfig={chartConfig}
              accessor={"count"}
              backgroundColor={"transparent"}
              paddingLeft={"15"}
              center={[10, 0]}
              absolute
            />
          </Card.Content>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={600} style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Top 5 Unit Enrollments</Title>
            <BarChart
              data={{
                labels: unitEnrollments.map(unit => unit.unitName),
                datasets: [{
                  data: unitEnrollments.map(unit => unit.enrollments)
                }]
              }}
              width={screenWidth - 60}
              height={220}
              yAxisLabel=""
              chartConfig={chartConfig}
              verticalLabelRotation={30}
            />
          </Card.Content>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={800} style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Top 5 Announcement Engagement</Title>
            {announcementEngagement.map((announcement, index) => (
              <View key={index} style={styles.engagementItem}>
                <Paragraph style={styles.engagementTitle}>{announcement.title}</Paragraph>
                <View style={styles.engagementStats}>
                  <Text style={styles.engagementText}>Views: {announcement.views}</Text>
                  <Text style={styles.engagementText}>Likes: {announcement.likes}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" delay={1000} style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Active Users (Last 7 Days)</Title>
            <LineChart
              data={{
                labels: ["6 days ago", "5 days ago", "4 days ago", "3 days ago", "2 days ago", "Yesterday", "Today"],
                datasets: [{
                  data: activeUsers
                }]
              }}
              width={screenWidth - 60}
              height={220}
              yAxisLabel=""
              chartConfig={chartConfig}
              bezier
            />
          </Card.Content>
        </Animatable.View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchAnalyticsData}>
          <Icon name="refresh" type="material" color="#fff" size={24} />
          <Text style={styles.refreshButtonText}>Refresh Data</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  engagementItem: {
    marginBottom: 10,
  },
  engagementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  engagementStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  engagementText: {
    fontSize: 14,
    color: '#ffffff',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#ffffff',
    marginLeft: 10,
    fontSize: 16,
  },
});

export default Analytics;