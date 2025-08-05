import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../../redux/reduxHooks';
import { RootState } from '../../../redux/store';
import { removeDriver, clearDrivers } from '../../../redux/driverSlice';
import { DriverData } from '../../../redux/driverSlice';

interface DriverListProps {
  onDriverSelect?: (driver: DriverData) => void;
}

export const DriverList: React.FC<DriverListProps> = ({ onDriverSelect }) => {
  const dispatch = useAppDispatch();
  const drivers = useAppSelector((state: RootState) => state.driver.drivers);
  const lastUpdated = useAppSelector((state: RootState) => state.driver.lastUpdated);

  const handleDriverPress = (driver: DriverData) => {
    if (onDriverSelect) {
      onDriverSelect(driver);
    }
  };

  const handleRemoveDriver = (driverId: string) => {
    dispatch(removeDriver(driverId));
  };

  const handleClearAll = () => {
    dispatch(clearDrivers());
  };

  const renderDriver = ({ item }: { item: DriverData }) => (
    <TouchableOpacity 
      style={styles.driverCard}
      onPress={() => handleDriverPress(item)}
    >
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.driverName}</Text>
        <Text style={styles.vehicleInfo}>
          {item.vehicleName} - {item.vehicleModel}
        </Text>
        <Text style={styles.ratingInfo}>
          Driver: {item.driverRating}⭐ | Vehicle: {item.vehicleRating}⭐
        </Text>
        <Text style={styles.priceInfo}>
          {item.price} {item.currency}
        </Text>
        {item.estimatedTime && (
          <Text style={styles.timeInfo}>
            ETA: {item.estimatedTime}
          </Text>
        )}
      </View>
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={() => handleRemoveDriver(item.id)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Drivers ({drivers.length})</Text>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Text>
        )}
        {drivers.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {drivers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No drivers available</Text>
          <Text style={styles.emptySubtext}>
            Drivers will appear here when they apply for your ride
          </Text>
        </View>
      ) : (
        <FlatList
          data={drivers}
          renderItem={renderDriver}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lastUpdated: {
    fontSize: 12,
    color: '#666',
  },
  clearButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  driverCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vehicleInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingInfo: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  priceInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  timeInfo: {
    fontSize: 12,
    color: '#2196F3',
  },
  removeButton: {
    width: 30,
    height: 30,
    backgroundColor: '#f44336',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default DriverList; 