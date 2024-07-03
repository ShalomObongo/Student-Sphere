import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Card, Title } from 'react-native-paper';
import { PieChart } from "react-native-chart-kit";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const usersData = querySnapshot.docs.map(doc => doc.data());
        const roleCounts = usersData.reduce((acc, user) => {
          acc[user.role] = (acc[user.role] || 0) + 1;
          return acc;
        }, {});

        const filteredRoleCounts = Object.keys(roleCounts)
          .filter(role => roleCounts[role] > 0);

        const chartData = filteredRoleCounts.map((role, index) => ({
          name: role,
          population: roleCounts[role],
          color: colors[index % colors.length],
          legendFontColor: "#7F7F7F",
          legendFontSize: 15
        }));

        setData(chartData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#4c669f', '#3b5998', '#192f6a']} style={styles.container}>
      <Animatable.View animation="fadeIn" duration={1000} style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>User Distribution</Title>
            <Animatable.View animation="fadeIn" duration={1500}>
              <PieChart
                data={data}
                width={screenWidth - 60}
                height={220}
                chartConfig={chartConfig}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute
              />
            </Animatable.View>
            <View style={styles.legendContainer}>
              {data.map((item, index) => (
                <Animatable.View key={index} animation="fadeInUp" delay={index * 100} style={styles.legendItem}>
                  <View style={[styles.colorBox, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{`${item.name} (${item.population})`}</Text>
                </Animatable.View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </Animatable.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: '100%',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  colorBox: {
    width: 16,
    height: 16,
    marginRight: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default Analytics;
